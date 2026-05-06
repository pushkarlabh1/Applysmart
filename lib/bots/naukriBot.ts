import puppeteer from "puppeteer";
import { calculateSemanticMatch } from "@/lib/jobMatcher";
import path from "path";
import fs from "fs";
import { connectDB } from "@/lib/mongodb";
import Application from "@/models/Application";

export async function runNaukriBot({
  email,
  password,
  keywords,
  location,
  limit,
  prioritizeEasyApply = true,
  userResume
}: any) {
  const applied: any[] = [];
  const skipped: string[] = [];
  const externalJobsQueue: any[] = [];

  // Helper function to handle the complex apply logic (Naukri modal OR external site)
  async function processApply(jobPage: any, applyBtn: any, role: string, company: string, jobHref: string, matchScore: number) {
    const urlBefore = jobPage.url();
    const domainBefore = new URL(urlBefore).hostname;

    // Naukri often opens third-party links in a NEW tab. We must catch it.
    const newPagePromise = new Promise<any>(x => browser.once('targetcreated', async target => {
      const newPage = await target.page();
      if (newPage) {
        await newPage.bringToFront();
        x(newPage);
      } else {
        x(null);
      }
    }));

    await applyBtn.click();

    // Wait up to 5 seconds to see if a new tab opened
    const newlyOpenedTab = await Promise.race([
      newPagePromise,
      new Promise<null>(r => setTimeout(() => r(null), 5000))
    ]);

    // The active page we should interact with is either the new tab, or the original tab if it navigated in-place
    let activePage = newlyOpenedTab || jobPage;

    // Wait a moment for the new page to load its DOM
    await new Promise((r) => setTimeout(r, 4000));

    // ── Step 4: Detect success & Handle External Forms ───────────────────
    let submitted = false;
    const urlAfter = activePage.url();
    const domainAfter = new URL(urlAfter).hostname;

    // Check if we were redirected to a third-party company website
    if (domainAfter !== domainBefore && !domainAfter.includes("naukri.com")) {
      console.log(`[Naukri] Redirected to external site: ${domainAfter}. Starting Universal Autofill...`);

      try {
        // 1. Autofill Text Fields
        await activePage.evaluate((resumeData) => {
          const inputs = document.querySelectorAll("input, textarea");
          inputs.forEach((el: any) => {
            const name = (el.name || el.id || el.placeholder || "").toLowerCase();
            const type = el.type ? el.type.toLowerCase() : "text";

            if (type === "hidden" || type === "submit" || type === "button" || el.disabled || el.readOnly) return;

            // Name
            if ((name.includes("name") || name.includes("first")) && !el.value && resumeData.name) {
              el.value = resumeData.name;
            }
            // Email
            if ((name.includes("email") || type === "email") && !el.value && resumeData.email) {
              el.value = resumeData.email;
            }
            // Phone
            if ((name.includes("phone") || name.includes("mobile") || type === "tel") && !el.value && resumeData.phone) {
              el.value = resumeData.phone;
            }
            // LinkedIn
            if (name.includes("linkedin") && !el.value && resumeData.linkedin) {
              el.value = resumeData.linkedin;
            }
            // GitHub
            if (name.includes("github") && !el.value && resumeData.github) {
              el.value = resumeData.github;
            }

            // Dispatch events to trigger React/Angular state updates
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
          });
        }, userResume.parsedData || {});

        console.log(`[Naukri] Text fields autofilled.`);

        // 2. Upload Resume PDF
        const safeUserId = userResume.userId || "anonymous";
        const absoluteFilePath = userResume.filePath || path.join(process.cwd(), "public", "uploads", `${safeUserId}_resume.pdf`);

        if (fs.existsSync(absoluteFilePath)) {
          // Wait for file input to appear (some sites load it asynchronously)
          const fileInput = await activePage.waitForSelector("input[type='file']", { timeout: 5000 }).catch(() => null);
          if (fileInput) {
            console.log(`[Naukri] Found file input. Uploading physical resume PDF from: ${absoluteFilePath}`);
            await fileInput.uploadFile(absoluteFilePath);
          } else {
            console.log(`[Naukri] No file input found on this external site to upload resume.`);
          }
        } else {
          console.log(`[Naukri] No physical resume PDF found on server at path: ${absoluteFilePath}`);
        }

        // 3. Enter 60-second Manual Check Loop
        console.log(`[Naukri] External form partially filled. Waiting 60 seconds for user to complete and submit...`);
        let userFinished = false;

        for (let w = 0; w < 60; w++) {
          await new Promise((r) => setTimeout(r, 1000));

          // We check if the user submitted and the URL changed to a "thank you" or if they closed the tab
          if (activePage.isClosed()) {
            console.log("[Naukri] User closed the external tab, assuming submitted.");
            submitted = true;
            userFinished = true;
            break;
          }

          const currentUrl = activePage.url();
          const pageText = await activePage.evaluate(() => document.body.innerText.toLowerCase()).catch(() => "");

          const hasSuccessText = [
            "successfully applied", "application submitted", "thank you for applying", "application received"
          ].some(phrase => pageText.includes(phrase));

          if (hasSuccessText || currentUrl.includes("success") || currentUrl.includes("thank-you")) {
            console.log("[Naukri] Detected external submission success.");
            submitted = true;
            userFinished = true;
            break;
          }
        }

        if (!userFinished) {
          console.log("[Naukri] 60 seconds elapsed on external site without confirmed submission.");
        }

      } catch (err) {
        console.log("[Naukri] Error during external autofill:", err);
      }

      if (newlyOpenedTab) await newlyOpenedTab.close().catch(() => { });

    } else {
      // Native Naukri Application flow
      const isConfirmationPage = urlAfter !== urlBefore || urlAfter.includes("apply") || urlAfter.includes("jobapply");

      // Method 2: Check for ANY success-like text on the page
      const pageText = await activePage.evaluate(() => document.body.innerText.toLowerCase());
      const hasSuccessText = [
        "successfully applied",
        "application submitted",
        "thank you for applying",
        "you have applied",
        "application received"
      ].some(phrase => pageText.includes(phrase));

      if (hasSuccessText) {
        submitted = true;
        console.log(`✅ Submitted (text confirmation): ${role} @ ${company}`);
      } else if (isConfirmationPage) {
        // It navigated somewhere — might be a chatbot/questions page
        // Try to find and click Next/Submit for up to 10 steps
        for (let step = 0; step < 10; step++) {
          const stepPageText = await activePage.evaluate(() => document.body.innerText.toLowerCase());

          if (["successfully applied", "application submitted", "thank you for applying", "you have applied"].some(p => stepPageText.includes(p))) {
            submitted = true;
            console.log(`✅ Submitted (chatbot flow, step ${step + 1}): ${role} @ ${company}`);
            break;
          }

          // Look for errors that need user input
          const hasError = await activePage.$(".err-msg, .error, [class*='error']");
          if (hasError) {
            console.log("Form requires manual input. Waiting up to 60 seconds...");
            let resolved = false;
            for (let w = 0; w < 60; w++) {
              await new Promise((r) => setTimeout(r, 1000));
              const stillError = await activePage.$(".err-msg, .error, [class*='error']");
              if (!stillError) { resolved = true; break; }
            }
            if (!resolved) { console.log("60s elapsed. Skipping."); break; }
          }

          // Click any Next/Save/Submit buttons in the form
          const nextBtn = await activePage.$(
            "button[type='submit'], button.submit-btn, button.next-btn, button.chatbot-button, button.bot-send"
          );
          if (nextBtn) {
            await nextBtn.click();
            await new Promise((r) => setTimeout(r, 2000));
          } else {
            break; // No more buttons to click
          }
        }
      }

      if (newlyOpenedTab) await newlyOpenedTab.close().catch(() => { });
    }

    await jobPage.close();

    if (!submitted) {
      skipped.push(`${role} @ ${company} (complex form / timeout)`);
      return false;
    }

    // ── Step 5: Save to DB ────
    const savedApp = { company, role, status: "Applied", jobUrl: jobHref, atsScore: matchScore, platform: "Naukri", appliedDate: new Date() };
    applied.push(savedApp);

    try {
      await connectDB();
      await Application.create({
        ...savedApp,
        userId: userResume?.userId || "anonymous",
      });
      console.log(`[Naukri] DB Save Success: ${role} @ ${company}`);
    } catch (dbErr: any) {
      console.warn("DB save failed:", dbErr?.message || dbErr);
    }

    return true;
  }

  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 60,
    defaultViewport: null,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();

  try {
    // ── Step 1: Login ──────────────────────────────────────────────
    console.log("Opening Naukri login...");
    await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "networkidle2", timeout: 60000 });

    const currentUrl = page.url();
    const alreadyLoggedIn = currentUrl.includes("/homepage") || currentUrl.includes("mnjuser");

    if (!alreadyLoggedIn) {
      try {
        await page.waitForSelector("#usernameField", { visible: true, timeout: 15000 });
      } catch {
        await browser.close();
        throw new Error("Naukri login page did not load.");
      }

      await page.click("#usernameField");
      await page.type("#usernameField", email, { delay: 50 });
      const usernameVal = await page.$eval("#usernameField", (el: any) => el.value);
      if (!usernameVal) {
        await page.evaluate((val: string) => { (document.querySelector("#usernameField") as HTMLInputElement).value = val; }, email);
      }

      await page.click("#passwordField");
      await page.type("#passwordField", password, { delay: 50 });
      const passVal = await page.$eval("#passwordField", (el: any) => el.value);
      if (!passVal) {
        await page.evaluate((val: string) => { (document.querySelector("#passwordField") as HTMLInputElement).value = val; }, password);
      }

      const submitBtnSelector = "button[type='submit'], button.blue-btn";
      await page.waitForSelector(submitBtnSelector, { timeout: 5000 });
      await page.click(submitBtnSelector);

      try {
        // Wait for successful login (usually redirects to homepage or dashboard)
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });
        console.log("Login successful");
      } catch {
        // If navigation timeout fails, maybe it didn't redirect but logged in
        const stillOnLogin = await page.$("#usernameField");
        if (stillOnLogin) {
          await browser.close();
          throw new Error("Naukri login failed. Check credentials or CAPTCHA.");
        }
      }
    }

    // ── Step 2: Navigate to Jobs ────────────────
    const formattedKeywords = keywords.trim().replace(/\s+/g, '-').toLowerCase();
    const formattedLocation = location.trim().replace(/\s+/g, '-').toLowerCase();
    const jobUrl = `https://www.naukri.com/${formattedKeywords}-jobs-in-${formattedLocation}`;

    console.log("Opening jobs page:", jobUrl);
    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));

    try {
      // Look for job cards (Naukri changes these classes, standard ones are .srp-jobtuple-wrapper or .jobTuple)
      await page.waitForSelector(".srp-jobtuple-wrapper, .jobTuple", { timeout: 30000 });
    } catch {
      await browser.close();
      return { applied, skipped, message: "No jobs found for your search on Naukri." };
    }

    // ── Step 2.5: Apply 'Consultant Jobs' Filter ────────────────
    try {
      console.log("[Naukri] Searching for 'Posted by' -> 'Consultant Jobs' filter...");
      const filterClicked = await page.evaluate(() => {
        const labels = Array.from(document.querySelectorAll("label, span, div.chkBox, a"));
        let clicked = false;
        for (const el of labels) {
          const text = el.textContent?.toLowerCase().trim() || "";
          if (text === "consultant jobs" || text === "consultancy") {
            (el as HTMLElement).click();
            clicked = true;
          }
        }
        return clicked;
      });
      if (filterClicked) {
        console.log("[Naukri] Clicked 'Consultant Jobs' filter. Waiting for results to reload...");
        await new Promise((r) => setTimeout(r, 4000));
      } else {
        console.log("[Naukri] Could not find the Company Jobs / Consultant Jobs filter checkboxes.");
      }
    } catch (err) {
      console.log("[Naukri] Error applying filter:", err);
    }

    // ── Step 3: Loop through jobs (Dynamic limit) ──────────────────
    let i = 0;
    while (applied.length < limit) {
      // Re-fetch jobs on every iteration in case DOM changed
      const jobs = await page.$$(".srp-jobtuple-wrapper, .jobTuple");
      if (i >= jobs.length) {
        console.log("No more jobs on this page.");
        break; // Out of jobs on current page
      }

      try {
        console.log(`\n--- Processing Naukri job ${i + 1} (Applied so far: ${applied.length}/${limit}) ---`);

        // Instead of clicking and dealing with Naukri's aggressive new-tab popups, 
        // we'll extract the URL and open it in a managed tab
        const jobLink = await jobs[i].$("a.title");
        if (!jobLink) {
          i++;
          continue;
        }

        const jobHref = await page.evaluate((el: HTMLAnchorElement) => el.href, jobLink);

        const role = await page.evaluate((el: HTMLAnchorElement) => el.textContent?.trim() || "Unknown Role", jobLink);

        const compLink = await jobs[i].$("a.comp-name");
        const company = compLink ? await page.evaluate((el: HTMLAnchorElement) => el.textContent?.trim() || "Unknown Company", compLink) : "Unknown Company";

        console.log(`Job: ${role} @ ${company}`);

        // Open job in a new tab
        const jobPage = await browser.newPage();
        await jobPage.goto(jobHref, { waitUntil: "domcontentloaded", timeout: 45000 });
        await new Promise((r) => setTimeout(r, 3000));

        let jobDesc = "";
        try {
          await new Promise((r) => setTimeout(r, 2000)); // Extra wait for dynamic content

          jobDesc = await jobPage.evaluate(() => {
            // Naukri changes class names often — try all known selectors
            const selectors = [
              "#job_description",
              ".dang-inner-html",
              ".styles_JDC__dang-inner-html__wyc9M",
              ".job-desc",
              ".jd-desc",
              "section.job-desc-container",
              ".description"
            ];

            for (const sel of selectors) {
              const el = document.querySelector(sel);
              if (el && el.textContent && el.textContent.trim().length > 50) {
                return el.textContent.trim();
              }
            }

            // Ultimate fallback: grab all visible text from the page body
            return document.body.innerText || "";
          });

          console.log(`[Naukri] JD scraped: ${jobDesc.length} chars | First 100: "${jobDesc.slice(0, 100)}"`);
        } catch (e) {
          console.log("Could not extract job description:", e);
        }

        const skills = userResume.parsedData?.skills || [];
        const matchScore = await calculateSemanticMatch(skills, jobDesc);
        console.log(`[Naukri] ATS Score for "${role}": ${matchScore}% (JD chars: ${jobDesc.length}, Resume skills: ${skills.length})`);

        if (matchScore < 60) {
          skipped.push(`${role} @ ${company} (ATS: ${matchScore}%)`);
          await jobPage.close();
          i++;
          continue;
        }

        // Find Apply button — Use text content instead of brittle CSS classes
        const applyBtnHandle = await jobPage.evaluateHandle(() => {
          const elements = Array.from(document.querySelectorAll("button, a, div[role='button']"));
          for (const el of elements) {
            const text = el.textContent?.toLowerCase().trim() || "";
            // Match "apply", "apply on company site", "apply on company website"
            if ((text === "apply" || text.includes("apply on company") || text === "apply now") && el.clientHeight > 0) {
              return el;
            }
          }
          return null;
        });

        const applyBtn = applyBtnHandle.asElement();

        if (!applyBtn) {
          // Log what buttons exist so we can debug
          const allBtns = await jobPage.evaluate(() =>
            Array.from(document.querySelectorAll("button, a"))
              .filter(el => el.textContent?.toLowerCase().includes("apply"))
              .map(el => ({ tag: el.tagName, text: el.textContent?.trim(), className: el.className }))
              .slice(0, 5)
          );
          console.log(`[Naukri] No apply button found. Visible apply-like elements:`, JSON.stringify(allBtns));
          skipped.push(`${role} @ ${company} (No Apply button found)`);
          await jobPage.close();
          i++;
          continue;
        }

        const btnText = await jobPage.evaluate((el: any) => el.textContent?.trim().toLowerCase(), applyBtn);
        console.log(`[Naukri] Found apply button: "${btnText}"`);

        if (btnText?.includes("applied")) {
          skipped.push(`${role} @ ${company} (Already applied)`);
          await jobPage.close();
          i++;
          continue;
        }

        const isExternal = btnText?.includes("company") || btnText?.includes("website");

        if (prioritizeEasyApply && isExternal) {
          console.log(`[Naukri] Skipping external job for now to prioritize easy apply...`);
          externalJobsQueue.push({ role, company, jobHref, matchScore });
          skipped.push(`${role} @ ${company} (Saved for later - External)`);
          await jobPage.close();
          i++;

          if (externalJobsQueue.length >= 10) {
            console.log(`[Naukri] Reached 10 skipped external jobs. Breaking out of internal search to process them.`);
            break;
          }

          continue;
        }

        await processApply(jobPage, applyBtn, role, company, jobHref, matchScore);

        await new Promise((r) => setTimeout(r, 2000));
        i++;
      } catch (jobError) {
        console.error("Error processing job:", jobError);
        i++;
      }
    }

    // ── Phase 2: Process External Jobs Queue ───────────────────
    if (applied.length < limit && externalJobsQueue.length > 0) {
      console.log(`\n--- Processing ${externalJobsQueue.length} skipped external jobs to reach limit (${limit - applied.length} needed) ---`);

      for (const extJob of externalJobsQueue) {
        if (applied.length >= limit) break;
        try {
          const { role, company, jobHref, matchScore } = extJob;
          console.log(`\nFallback External Job: ${role} @ ${company}`);

          const jobPage = await browser.newPage();
          await jobPage.goto(jobHref, { waitUntil: "domcontentloaded", timeout: 45000 });
          await new Promise((r) => setTimeout(r, 3000));

          const applyBtnHandle = await jobPage.evaluateHandle(() => {
            const elements = Array.from(document.querySelectorAll("button, a, div[role='button']"));
            for (const el of elements) {
              const text = el.textContent?.toLowerCase().trim() || "";
              if ((text === "apply" || text.includes("apply on company") || text === "apply now") && el.clientHeight > 0) {
                return el;
              }
            }
            return null;
          });

          const applyBtn = applyBtnHandle.asElement();
          if (!applyBtn) {
            console.log(`[Naukri] Could not find apply button again for external job.`);
            await jobPage.close();
            continue;
          }

          // Remove the "(Saved for later - External)" from skipped list since we are trying it now
          const skipIndex = skipped.findIndex(s => s.includes(`${role} @ ${company}`) && s.includes("Saved for later"));
          if (skipIndex !== -1) skipped.splice(skipIndex, 1);

          await processApply(jobPage, applyBtn, role, company, jobHref, matchScore);
          await new Promise((r) => setTimeout(r, 2000));

        } catch (jobError) {
          console.error("Error processing fallback external job:", jobError);
        }
      }
    }

    await browser.close();
    return { applied, skipped, message: `Auto apply completed. Applied to ${applied.length} jobs, skipped ${skipped.length}.` };

  } catch (error: any) {
    if (browser) await browser.close();
    throw error;
  }
}

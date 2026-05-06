import puppeteer from "puppeteer";
import { calculateSemanticMatch } from "@/lib/jobMatcher";

export async function runLinkedinBot({
  email,
  password,
  keywords,
  location,
  limit,
  userResume
}: any) {
  const applied: any[] = [];
  const skipped: string[] = [];

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
    console.log("Opening LinkedIn login...");
    await page.goto("https://www.linkedin.com/login", { waitUntil: "networkidle2", timeout: 60000 });

    const currentUrl = page.url();
    const alreadyLoggedIn = !currentUrl.includes("/login") && !currentUrl.includes("/checkpoint");

    if (!alreadyLoggedIn) {
      try {
        await page.waitForSelector("#username", { visible: true, timeout: 15000 });
      } catch {
        await browser.close();
        throw new Error("LinkedIn login page did not load.");
      }

      await page.click("#username");
      await page.type("#username", email, { delay: 50 });
      const usernameVal = await page.$eval("#username", (el: any) => el.value);
      if (!usernameVal) {
        await page.evaluate((val: string) => { (document.querySelector("#username") as HTMLInputElement).value = val; }, email);
      }

      await page.click("#password");
      await page.type("#password", password, { delay: 50 });
      const passVal = await page.$eval("#password", (el: any) => el.value);
      if (!passVal) {
        await page.evaluate((val: string) => { (document.querySelector("#password") as HTMLInputElement).value = val; }, password);
      }

      await page.click("button[type='submit']");

      try {
        await page.waitForSelector("input[placeholder='Search']", { timeout: 30000 });
        console.log("Login successful");
      } catch {
        await browser.close();
        throw new Error("LinkedIn login failed. Check credentials or CAPTCHA.");
      }
    }

    // ── Step 2: Navigate to Jobs ────────────────
    const encodedKeywords = encodeURIComponent(keywords);
    const encodedLocation = encodeURIComponent(location);
    const jobUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedKeywords}&location=${encodedLocation}&f_AL=true`;

    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));

    try {
      await page.waitForSelector(".job-card-container", { timeout: 30000 });
    } catch {
      await browser.close();
      return { applied, skipped, message: "No Easy Apply jobs found." };
    }

    const jobs = await page.$$(".job-card-container");

    // ── Step 3: Loop through jobs (Dynamic limit) ──────────────────
    let i = 0;
    while (applied.length < limit && i < jobs.length) {
      try {
        console.log(`\n--- Processing job ${i + 1} (Applied so far: ${applied.length}/${limit}) ---`);

        await jobs[i].click();
        await new Promise((r) => setTimeout(r, 3000));

        const jobUrl = page.url();

        const role = await page.$eval(
          ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title",
          (el) => el.textContent?.trim() || "Unknown Role"
        ).catch(() => "Unknown Role");

        const company = await page.$eval(
          ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name",
          (el) => el.textContent?.trim() || "Unknown Company"
        ).catch(() => "Unknown Company");

        let jobDesc = "";
        try {
          await page.waitForSelector("#job-details, .jobs-description-content__text", { timeout: 5000 });
          jobDesc = await page.evaluate(() => {
            const el = document.querySelector("#job-details") || document.querySelector(".jobs-description-content__text");
            return el ? el.textContent || "" : "";
          });
        } catch {
          // ignore
        }

        const skills = userResume.parsedData?.skills || [];
        const matchScore = await calculateSemanticMatch(skills, jobDesc);

        if (matchScore < 60) {
          skipped.push(`${role} @ ${company} (ATS: ${matchScore}%)`);
          i++;
          continue;
        }

        const easyApplyBtn = await page.$("button.jobs-apply-button");
        if (!easyApplyBtn) {
          skipped.push(`${role} @ ${company} (No Easy Apply)`);
          i++;
          continue;
        }

        await easyApplyBtn.click();
        await new Promise((r) => setTimeout(r, 3000));

        // ── Step 4: Handle Modal ───────────────────
        let submitted = false;
        let failedOrSkipped = false;

        for (let step = 0; step < 15; step++) {
          const submitBtn = await page.$("button[aria-label='Submit application']");
          if (submitBtn) {
            await submitBtn.click();
            await new Promise((r) => setTimeout(r, 2000));
            
            const errors = await page.$(".artdeco-inline-feedback--error");
            if (!errors) {
              submitted = true;
              break;
            }
          } else {
            const nextBtn = await page.$("button[aria-label='Continue to next step'], button[aria-label='Review your application']");
            if (nextBtn) {
              await nextBtn.click();
              await new Promise((r) => setTimeout(r, 1500));
            } else {
               failedOrSkipped = true;
               break;
            }
          }

          const hasError = await page.$(".artdeco-inline-feedback--error");
          if (hasError) {
             let resolved = false;
             for (let w = 0; w < 60; w++) {
               await new Promise((r) => setTimeout(r, 1000));
               const stillHasErrors = await page.$(".artdeco-inline-feedback--error");
               if (!stillHasErrors) {
                 resolved = true;
                 break;
               }
             }

             if (!resolved) {
               failedOrSkipped = true;
               break;
             }
          }
        }

        if (!submitted) {
          const dismissBtn = await page.$("button[aria-label='Dismiss']");
          if (dismissBtn) {
            await dismissBtn.click();
            await new Promise((r) => setTimeout(r, 1000));
            const discardBtn = await page.$("button[data-control-name='discard_application_confirm_btn']");
            if (discardBtn) await discardBtn.click();
          }
          skipped.push(`${role} @ ${company} (complex form / timeout)`);
          i++;
          continue;
        }

        const savedApp = { company, role, status: "Applied", jobUrl, atsScore: matchScore, platform: "LinkedIn" };
        applied.push(savedApp);

        try {
          await fetch("http://localhost:3000/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(savedApp),
          });
        } catch (dbErr) {
          console.warn("DB save failed:", dbErr);
        }

        await new Promise((r) => setTimeout(r, 2000));
        i++;
      } catch (jobError) {
        console.error("Error processing job:", jobError);
      }
    }

    await browser.close();
    return { applied, skipped, message: `Auto apply completed. Applied to ${applied.length} jobs, skipped ${skipped.length}.` };

  } catch (error: any) {
    if (browser) await browser.close();
    throw error;
  }
}

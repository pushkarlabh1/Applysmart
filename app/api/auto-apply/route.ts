import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { calculateSemanticMatch } from "@/lib/jobMatcher";

export async function POST(req: NextRequest) {
  try {
    console.log("Auto apply started");

    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ message: "Missing LinkedIn credentials" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const keywords = body.keywords || "frontend developer";
    const location = body.location || "Remote";
    const limit = Math.min(body.limit || 3, 10); // max 10 per run
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const userResume = await Resume.findOne({ userId });
    
    if (!userResume || !userResume.rawText) {
      return NextResponse.json({ message: "NO_RESUME" }, { status: 400 });
    }
    
    console.log("Resume found for user. Proceeding with ATS matching.");

    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 60,
      defaultViewport: null,
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ── Step 1: Login ──────────────────────────────────────────────
    console.log("Opening LinkedIn login...");
    await page.goto("https://www.linkedin.com/login", { waitUntil: "networkidle2", timeout: 60000 });

    // Check if already logged in (LinkedIn redirects to feed if session is active)
    const currentUrl = page.url();
    const alreadyLoggedIn = !currentUrl.includes("/login") && !currentUrl.includes("/checkpoint");

    if (!alreadyLoggedIn) {
      // Wait for the login form to fully render
      try {
        await page.waitForSelector("#username", { visible: true, timeout: 15000 });
      } catch {
        await browser.close();
        return NextResponse.json({ message: "LinkedIn login page did not load. Try again." }, { status: 500 });
      }

      // Robust Login: Explicitly focus and type, with fallback injection
      await page.click("#username");
      await page.type("#username", email, { delay: 50 });
      const usernameVal = await page.$eval("#username", (el: any) => el.value);
      if (!usernameVal) {
        await page.evaluate((val) => { (document.querySelector("#username") as HTMLInputElement).value = val; }, email);
      }

      await page.click("#password");
      await page.type("#password", password, { delay: 50 });
      const passVal = await page.$eval("#password", (el: any) => el.value);
      if (!passVal) {
        await page.evaluate((val) => { (document.querySelector("#password") as HTMLInputElement).value = val; }, password);
      }

      await page.click("button[type='submit']");

      // Wait for redirect to feed after login
      try {
        await page.waitForSelector("input[placeholder='Search']", { timeout: 30000 });
        console.log("Login successful");
      } catch {
        await browser.close();
        return NextResponse.json({ message: "LinkedIn login failed. Check your credentials or solve the CAPTCHA manually." }, { status: 401 });
      }
    } else {
      console.log("Already logged in to LinkedIn — skipping login step");
    }

    // ── Step 2: Navigate to Easy Apply job listings ────────────────
    const encodedKeywords = encodeURIComponent(keywords);
    const encodedLocation = encodeURIComponent(location);
    const jobUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodedKeywords}&location=${encodedLocation}&f_AL=true`;

    console.log("Opening jobs page:", jobUrl);
    await page.goto(jobUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 5000));

    try {
      await page.waitForSelector(".job-card-container", { timeout: 30000 });
    } catch {
      await browser.close();
      return NextResponse.json({ message: "No Easy Apply jobs found for your search." }, { status: 200 });
    }

    const jobs = await page.$$(".job-card-container");
    console.log(`Found ${jobs.length} jobs. Will attempt up to ${limit}.`);

    const applied: { company: string; role: string; status: string; jobUrl: string }[] = [];
    const skipped: string[] = [];

    // ── Step 3: Loop through jobs (Dynamic limit) ──────────────────
    let i = 0;
    while (applied.length < limit && i < jobs.length) {
      try {
        console.log(`\n--- Processing job ${i + 1} (Applied so far: ${applied.length}/${limit}) ---`);

        await jobs[i].click();
        await new Promise((r) => setTimeout(r, 3000));

        // Capture the current URL — LinkedIn updates the URL when a job card is clicked
        const jobUrl = page.url();

        // Extract real job title and company name from the detail panel
        const role = await page.$eval(
          ".job-details-jobs-unified-top-card__job-title, .jobs-unified-top-card__job-title",
          (el) => el.textContent?.trim() || "Unknown Role"
        ).catch(() => "Unknown Role");

        const company = await page.$eval(
          ".job-details-jobs-unified-top-card__company-name, .jobs-unified-top-card__company-name",
          (el) => el.textContent?.trim() || "Unknown Company"
        ).catch(() => "Unknown Company");

        console.log(`Job: ${role} @ ${company}`);

        // Scrape Job Description
        let jobDesc = "";
        try {
          // Wait for the job details container to load
          await page.waitForSelector("#job-details, .jobs-description-content__text", { timeout: 5000 });
          
          jobDesc = await page.evaluate(() => {
            const el = document.querySelector("#job-details") || document.querySelector(".jobs-description-content__text");
            return el ? el.textContent || "" : "";
          });
        } catch {
          console.log("Could not extract job description (selector not found)");
        }

        console.log(`Extracted Job Description Length: ${jobDesc.length} characters`);
        console.log(`User Resume Length: ${userResume.rawText.length} characters`);

        // Keyword ATS Matching
        const skills = userResume.parsedData?.skills || [];
        const matchScore = await calculateSemanticMatch(skills, jobDesc);
        console.log(`ATS Match Score: ${matchScore}%`);

        if (matchScore < 60) {
          console.log(`Skipping — ATS score too low (${matchScore}%)`);
          skipped.push(`${role} @ ${company} (ATS: ${matchScore}%)`);
          i++;
          continue;
        }

        // Find the Easy Apply button
        const easyApplyBtn = await page.$("button.jobs-apply-button");
        if (!easyApplyBtn) {
          console.log("No Easy Apply button — skipping");
          skipped.push(`${role} @ ${company} (No Easy Apply)`);
          i++;
          continue;
        }

        await easyApplyBtn.click();
        await new Promise((r) => setTimeout(r, 3000));

        // ── Step 4: Handle the Easy Apply modal ───────────────────
        let submitted = false;
        let failedOrSkipped = false;

        for (let step = 0; step < 15; step++) {
          // Check for the final Submit button
          const submitBtn = await page.$("button[aria-label='Submit application']");
          if (submitBtn) {
            await submitBtn.click();
            await new Promise((r) => setTimeout(r, 2000));
            
            // Check if submission actually succeeded (no errors popped up)
            const errors = await page.$(".artdeco-inline-feedback--error");
            if (!errors) {
              submitted = true;
              console.log(`✅ Submitted: ${role} @ ${company}`);
              break;
            }
          } else {
            // Check for Next/Review button to advance through steps
            const nextBtn = await page.$(
              "button[aria-label='Continue to next step'], button[aria-label='Review your application']"
            );
            if (nextBtn) {
              await nextBtn.click();
              await new Promise((r) => setTimeout(r, 1500));
            } else {
               // No submit, no next... might be a very weird form. Break.
               console.log("No navigable buttons found.");
               failedOrSkipped = true;
               break;
            }
          }

          // Check for errors (meaning required fields are missing)
          const hasError = await page.$(".artdeco-inline-feedback--error");
          if (hasError) {
             console.log("Form requires manual input. Waiting up to 60 seconds for user to fill data...");
             let resolved = false;
             
             // Passive 60-second waiting loop. We do NOT click anything to avoid stealing focus/scrolling.
             for (let w = 0; w < 60; w++) {
               await new Promise((r) => setTimeout(r, 1000));
               
               // LinkedIn automatically removes the error element from the DOM when the field is correctly filled
               const stillHasErrors = await page.$(".artdeco-inline-feedback--error");
               if (!stillHasErrors) {
                 console.log("Data filled successfully! Resuming automation...");
                 resolved = true;
                 break;
               }
             }

             if (!resolved) {
               console.log("60 seconds elapsed. Skipping job.");
               failedOrSkipped = true;
               break;
             }
             // If resolved, the loop continues and it will click "Next" or "Submit" again on the next iteration!
          }
        }

        // Close the modal if it's still open (failed mid-way or timeout)
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

        // ── Step 5: Save to DB only after successful submission ────
        const savedApp = { company, role, status: "Applied", jobUrl, atsScore: matchScore };
        applied.push(savedApp);

        try {
          await fetch("http://localhost:3000/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(savedApp),
          });
        } catch (dbErr) {
          console.warn("DB save failed for:", role, dbErr);
        }

        await new Promise((r) => setTimeout(r, 2000));
        
        i++; // Increment i only at the very end of a loop iteration
      } catch (jobError) {
        console.error(`Error processing job ${i + 1}:`, jobError);
      }
    }

    await browser.close();

    return NextResponse.json({
      message: `Auto apply completed. Applied to ${applied.length} jobs, skipped ${skipped.length}.`,
      applied,
      skipped,
    });

  } catch (error) {
    console.error("AUTO APPLY ERROR:", error);
    return NextResponse.json({ message: "Auto apply failed", error: String(error) }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  try {
    console.log("Auto apply started");

    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json({ message: "Missing LinkedIn credentials" }, { status: 400 });
    }

    // Accept configurable params from request body
    const body = await req.json().catch(() => ({}));
    const keywords = body.keywords || "frontend developer";
    const location = body.location || "Remote";
    const limit = Math.min(body.limit || 3, 10); // max 10 per run

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

    await page.type("#username", email, { delay: 50 });
    await page.type("#password", password, { delay: 50 });
    await page.click("button[type='submit']");

    // Wait for either the search bar (success) or an error alert
    try {
      await page.waitForSelector("input[placeholder='Search']", { timeout: 30000 });
      console.log("Login successful");
    } catch {
      await browser.close();
      return NextResponse.json({ message: "LinkedIn login failed. Check your credentials." }, { status: 401 });
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

    // ── Step 3: Loop through jobs ──────────────────────────────────
    for (let i = 0; i < Math.min(jobs.length, limit); i++) {
      try {
        console.log(`\n--- Processing job ${i + 1} ---`);

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

        // Find the Easy Apply button
        const easyApplyBtn = await page.$("button.jobs-apply-button");
        if (!easyApplyBtn) {
          console.log("No Easy Apply button — skipping");
          skipped.push(`${role} @ ${company}`);
          continue;
        }

        await easyApplyBtn.click();
        await new Promise((r) => setTimeout(r, 3000));

        // ── Step 4: Handle the Easy Apply modal ───────────────────
        // Attempt to navigate through multi-step form (up to 10 steps)
        let submitted = false;
        for (let step = 0; step < 10; step++) {
          // Check for the final Submit button
          const submitBtn = await page.$("button[aria-label='Submit application']");
          if (submitBtn) {
            await submitBtn.click();
            await new Promise((r) => setTimeout(r, 2000));
            submitted = true;
            console.log(`✅ Submitted: ${role} @ ${company}`);
            break;
          }

          // Check for Next/Review button to advance through steps
          const nextBtn = await page.$(
            "button[aria-label='Continue to next step'], button[aria-label='Review your application']"
          );
          if (nextBtn) {
            await nextBtn.click();
            await new Promise((r) => setTimeout(r, 2500));
            continue;
          }

          // No next or submit — modal might be complex (e.g. requires phone/resume upload)
          console.log(`Step ${step + 1}: No navigable button found — skipping this job`);
          break;
        }

        // Close the modal if it's still open (failed mid-way)
        const dismissBtn = await page.$("button[aria-label='Dismiss']");
        if (dismissBtn) await dismissBtn.click();

        if (!submitted) {
          skipped.push(`${role} @ ${company} (complex form)`);
          continue;
        }

        // ── Step 5: Save to DB only after successful submission ────
        const savedApp = { company, role, status: "Applied", jobUrl };
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


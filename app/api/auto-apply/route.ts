import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST() {
try {

console.log("Auto apply started");

const email = process.env.LINKEDIN_EMAIL;
const password = process.env.LINKEDIN_PASSWORD;

if (!email || !password) {
  return NextResponse.json({
    message: "Missing LinkedIn credentials"
  });
}

const browser = await puppeteer.launch({
  headless: false,
  slowMo: 80,
  defaultViewport: null,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});

const page = await browser.newPage();

console.log("Opening LinkedIn login...");

await page.goto("https://www.linkedin.com/login", {
  waitUntil: "networkidle2",
  timeout: 60000
});

await page.type("#username", email);
await page.type("#password", password);

await page.click("button[type='submit']");

console.log("Waiting for login...");

await page.waitForSelector("input[placeholder='Search']", {
  timeout: 60000
});

console.log("Login successful");

const jobUrl =
  "https://www.linkedin.com/jobs/search/?keywords=frontend%20developer&location=Remote&f_AL=true";

console.log("Opening jobs page...");

await page.goto(jobUrl, {
  waitUntil: "domcontentloaded",
  timeout: 60000
});

await new Promise(resolve => setTimeout(resolve, 6000));

await page.waitForSelector(".job-card-container", {
  timeout: 60000
});

console.log("Jobs page loaded");

const jobs = await page.$$(".job-card-container");

console.log("Jobs found:", jobs.length);

for (let i = 0; i < Math.min(jobs.length, 3); i++) {

  try {

    console.log("Opening job", i + 1);

    await jobs[i].click();

    await new Promise(resolve => setTimeout(resolve, 3000));

    const easyApply = await page.$("button.jobs-apply-button");

    if (!easyApply) {
      console.log("No Easy Apply button");
      continue;
    }
// Save job to database
await fetch("http://localhost:3000/api/applications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    company: "LinkedIn Job",
    role: "Auto Applied Role",
    status: "Applied"
  })
});

    await easyApply.click();

    await new Promise(resolve => setTimeout(resolve, 3000));

    const submitButton = await page.$(
      "button[aria-label='Submit application']"
    );

    if (submitButton) {

      await submitButton.click();

      console.log("Application submitted");

    } else {

      console.log("Multi-step application detected, skipping");

    }

  } catch (jobError) {

    console.log("Job apply error:", jobError);

  }

}

await browser.close();

return NextResponse.json({
  message: "Auto apply completed successfully"
});

} catch (error) {

console.error("AUTO APPLY ERROR:", error);

return NextResponse.json({
  message: "Auto apply failed",
  error: String(error)
});
}
}

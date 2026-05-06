import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { runLinkedinBot } from "@/lib/bots/linkedinBot";
import { runIndeedBot } from "@/lib/bots/indeedBot";
import { runNaukriBot } from "@/lib/bots/naukriBot";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const platform = body.platform || "LinkedIn";
    const keywords = body.keywords || "frontend developer";
    const location = body.location || "Remote";
    const limit = Math.min(body.limit || 3, 10);
    const prioritizeEasyApply = body.prioritizeEasyApply !== undefined ? body.prioritizeEasyApply : true;
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    await connectDB();
    const userResume = await Resume.findOne({ userId });
    
    if (!userResume || !userResume.rawText) {
      return NextResponse.json({ message: "NO_RESUME" }, { status: 400 });
    }

    let result;

    switch (platform) {
      case "LinkedIn":
        const lnEmail = process.env.LINKEDIN_EMAIL;
        const lnPassword = process.env.LINKEDIN_PASSWORD;
        if (!lnEmail || !lnPassword) return NextResponse.json({ message: "Missing LinkedIn credentials in .env.local" }, { status: 400 });
        
        result = await runLinkedinBot({ email: lnEmail, password: lnPassword, keywords, location, limit, userResume });
        break;

      case "Indeed":
        const inEmail = process.env.INDEED_EMAIL;
        const inPassword = process.env.INDEED_PASSWORD;
        if (!inEmail || !inPassword) return NextResponse.json({ message: "Missing Indeed credentials in .env.local. Please add them first!" }, { status: 400 });
        
        result = await runIndeedBot({ email: inEmail, password: inPassword, keywords, location, limit, userResume });
        break;

      case "Naukri":
        const nkEmail = process.env.NAUKRI_EMAIL;
        const nkPassword = process.env.NAUKRI_PASSWORD;
        if (!nkEmail || !nkPassword) return NextResponse.json({ message: "Missing Naukri credentials in .env.local. Please add them first!" }, { status: 400 });
        
        result = await runNaukriBot({ email: nkEmail, password: nkPassword, keywords, location, limit, prioritizeEasyApply, userResume });
        break;

      default:
        return NextResponse.json({ message: "Invalid platform selected" }, { status: 400 });
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("AUTO APPLY ERROR:", error);
    return NextResponse.json({ message: error.message || "Auto apply failed" }, { status: 500 });
  }
}

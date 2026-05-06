import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { TECH_KEYWORDS, SOFT_SKILLS } from "@/lib/jobMatcher";

// ── Regex-based resume parser ──────────────────────────────────────────
function parseResume(text: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Name: First non-empty line that looks like a name (no @, no digits heavy)
  const nameLine = lines.find(
    (l) => l.length > 2 && l.length < 60 && !/[@\d|•]/.test(l) && /^[A-Za-z\s.'-]+$/.test(l)
  );
  const name = nameLine || "";

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : "";

  // Phone
  const phoneMatch = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  const phone = phoneMatch ? phoneMatch[0].trim() : "";

  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9\-_%]+/i);
  const linkedin = linkedinMatch ? `https://${linkedinMatch[0]}` : "";

  // GitHub
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9\-_%]+/i);
  const github = githubMatch ? `https://${githubMatch[0]}` : "";

  // Section extractor helper
  const extractSection = (sectionKeywords: string[]): string[] => {
    const sectionRegex = new RegExp(
      `(?:^|\\n)(${sectionKeywords.join("|")})[:\\s]*\\n([\\s\\S]*?)(?=\\n[A-Z][A-Z\\s]{3,}:|$)`,
      "im"
    );
    const match = text.match(sectionRegex);
    if (!match) return [];
    return match[2]
      .split("\n")
      .map((l) => l.replace(/^[\s•\-*–]+/, "").trim())
      .filter((l) => l.length > 2)
      .slice(0, 15);
  };

  // Skills: also extract comma/pipe-separated values from a skills section
  const skillsSection = extractSection(["skills", "technical skills", "key skills", "core competencies"]);
  const skillsParsed = skillsSection.flatMap((line) =>
    line.split(/[,|•\/]/).map((s) => s.trim()).filter((s) => s.length > 1 && s.length < 40)
  );

  // Deep Scan: Find all TECH_KEYWORDS anywhere in the entire resume
  const textLower = text.toLowerCase();
  const globalTechSkills = new Set<string>();
  TECH_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/\+/g, "\\+")}\\b`, "i");
    if (regex.test(textLower)) {
      globalTechSkills.add(keyword);
    }
  });

  // Deep Scan: Find all SOFT_SKILLS anywhere in the entire resume
  const globalSoftSkills = new Set<string>();
  SOFT_SKILLS.forEach(skill => {
    const regex = new RegExp(`\\b${skill}\\b`, "i");
    if (regex.test(textLower)) {
      globalSoftSkills.add(skill);
    }
  });

  // Combine explicitly parsed skills with the globally found tech and soft keywords
  const combinedSkillsSet = new Set([
    ...skillsParsed.map(s => s.toLowerCase()),
    ...globalTechSkills,
    ...globalSoftSkills
  ]);
  const finalSkills = Array.from(combinedSkillsSet).map(s => s.charAt(0).toUpperCase() + s.slice(1));

  const education = extractSection(["education", "academic background", "qualifications"]);
  const experience = extractSection(["experience", "work experience", "employment", "professional experience"]);
  const projects = extractSection(["projects", "personal projects", "key projects", "notable projects"]);
  const certifications = extractSection(["certifications", "certificates", "courses", "achievements"]);

  return { name, email, phone, linkedin, github, skills: finalSkills, education, experience, projects, certifications };
}

// ── POST /api/resume/upload ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    const userId = formData.get("userId") as string | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    if (!file.name.endsWith(".pdf")) {
      return NextResponse.json({ message: "Only PDF files are supported" }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Import the inner module directly to avoid pdf-parse's index.js test-file bug
    // @ts-ignore — pdf-parse/lib/pdf-parse.js is not typed
    const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return NextResponse.json({ message: "Could not extract text from PDF. Please use a text-based PDF." }, { status: 400 });
    }

    // Parse the extracted text
    const parsedData = parseResume(rawText);

    // Upsert: one resume per user (replace if already exists)
    const saved = await Resume.findOneAndUpdate(
      { userId: userId || "anonymous" },
      {
        userId: userId || "anonymous",
        fileName: file.name,
        rawText,
        parsedData,
      },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      message: "Resume parsed and saved successfully",
      resume: saved,
    });
  } catch (error) {
    console.error("RESUME UPLOAD ERROR:", error);
    return NextResponse.json({ message: "Failed to process resume", error: String(error) }, { status: 500 });
  }
}

// ── GET /api/resume/upload?userId=xxx ─────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) return NextResponse.json({ message: "userId required" }, { status: 400 });

    const resume = await Resume.findOne({ userId });
    if (!resume) return NextResponse.json({ resume: null });

    return NextResponse.json({ resume });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch resume", error: String(error) }, { status: 500 });
  }
}

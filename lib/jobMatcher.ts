export const TECH_KEYWORDS = [
  "react", "reactjs", "react.js", "node", "nodejs", "node.js", "typescript", "javascript", "js", "ts",
  "python", "java", "c++", "c#", "ruby", "php", "go", "golang", "rust", "swift", "kotlin",
  "html", "css", "tailwind", "bootstrap", "sass", "less",
  "mongodb", "sql", "mysql", "postgresql", "postgres", "redis", "firebase", "supabase", "oracle",
  "aws", "azure", "gcp", "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "github actions", "terraform",
  "graphql", "rest", "api", "express", "nestjs", "django", "flask", "spring", "spring boot", "laravel",
  "angular", "vue", "vuejs", "vue.js", "svelte", "nextjs", "next.js", "nuxtjs", "nuxt",
  "machine learning", "ml", "ai", "artificial intelligence", "data science", "pandas", "numpy", "pytorch", "tensorflow",
  "figma", "ui/ux", "agile", "scrum", "jira", "git", "github", "gitlab", "bitbucket",
  "linux", "unix", "bash", "shell", "powershell", "nginx", "apache",
  "redux", "zustand", "context api", "mobx", "jest", "cypress", "mocha", "chai", "vitest", "playwright"
];

export const SOFT_SKILLS = [
  "communication", "public speaking", "presentation", "writing", "verbal",
  "leadership", "management", "mentorship", "mentoring", "teamwork", "collaboration",
  "problem solving", "critical thinking", "analytical", "troubleshooting",
  "event management", "organization", "time management", "planning", "scheduling",
  "passionate", "motivated", "driven", "fast learner", "adaptability", "flexibility",
  "creativity", "innovation", "attention to detail", "empathy", "customer service",
  "negotiation", "conflict resolution", "decision making", "strategic thinking"
];

export async function calculateSemanticMatch(resumeSkills: string[], jobDescription: string): Promise<number> {
  if (!jobDescription || typeof jobDescription !== "string") return 0;

  const jdLower = jobDescription.toLowerCase();
  
  const ALL_KEYWORDS = [...TECH_KEYWORDS, ...SOFT_SKILLS];

  // 1. Find which standard skills (tech + soft) are mentioned in the Job Description
  const requiredSkillsInJd = new Set<string>();
  ALL_KEYWORDS.forEach((keyword) => {
    // Look for whole word matches to avoid "go" matching "good"
    const regex = new RegExp(`\\b${keyword.replace(/\+/g, "\\+")}\\b`, "i");
    if (regex.test(jdLower)) {
      requiredSkillsInJd.add(keyword);
    }
  });

  if (requiredSkillsInJd.size === 0) {
    // If we can't find any standard tech keywords in the JD, it might be a non-tech job.
    // Fallback: check how many of the user's specific skills are mentioned in the JD.
    if (!resumeSkills || resumeSkills.length === 0) return 0;
    let fallbackMatches = 0;
    resumeSkills.forEach((skill) => {
      if (jdLower.includes(skill.toLowerCase())) fallbackMatches++;
    });
    return Math.min(100, Math.round((fallbackMatches / Math.max(resumeSkills.length, 5)) * 100));
  }

  // 2. Check how many of the JD's required skills exist in the User's Resume Skills
  let matched = 0;
  
  // Create a fast lookup string of user skills
  const userSkillsString = resumeSkills.join(" ").toLowerCase();

  requiredSkillsInJd.forEach((reqSkill) => {
    // We check if the required skill string is anywhere in the user's skills
    // We can also check if it's in their raw text if they didn't get parsed perfectly
    if (userSkillsString.includes(reqSkill)) {
      matched++;
    }
  });

  // 3. Calculate Score: (Matched Skills / Required Skills) * 100
  const score = Math.round((matched / requiredSkillsInJd.size) * 100);
  return score;
}

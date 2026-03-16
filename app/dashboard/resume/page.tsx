"use client";

import { useState } from "react";

const STOP_WORDS = ["and", "the", "for", "with", "a", "to", "in", "of", "on"];

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [score, setScore] = useState<number | null>(null);
  const [matchedSkills, setMatchedSkills] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);

  const cleanText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .split(" ")
      .filter((word) => word.length > 2 && !STOP_WORDS.includes(word));

  const analyzeResume = () => {
    const resumeWords = new Set(cleanText(resumeText));
    const jobWords = new Set(cleanText(jobDesc));

    let matched: string[] = [];
    let missing: string[] = [];

    jobWords.forEach((word) => {
      if (resumeWords.has(word)) {
        matched.push(word);
      } else {
        missing.push(word);
      }
    });

    const weightedScore =
      jobWords.size === 0
        ? 0
        : Math.floor((matched.length / jobWords.size) * 100);

    setScore(weightedScore);
    setMatchedSkills(matched.slice(0, 10));
    setMissingSkills(missing.slice(0, 10));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Resume Analyzer</h1>

      <textarea
        placeholder="Paste your Resume text here..."
        className="w-full border p-4 rounded h-40"
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <textarea
        placeholder="Paste Job Description here..."
        className="w-full border p-4 rounded h-40"
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      <button
        onClick={analyzeResume}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Analyze Resume
      </button>

      {score !== null && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <h2 className="text-xl font-semibold">ATS Analysis Result</h2>

          <div className="text-lg">
            Match Score: <strong>{score}%</strong>
          </div>

          <div>
            <p className="font-medium text-green-600">Matched Skills:</p>
            <ul className="list-disc list-inside">
              {matchedSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-medium text-red-600">Missing Skills:</p>
            <ul className="list-disc list-inside">
              {missingSkills.map((skill, i) => (
                <li key={i}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

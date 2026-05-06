"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  UploadCloud, FileText, User, Mail, Phone, Linkedin, Github,
  Briefcase, BookOpen, Code2, Award, CheckCircle2, Loader2, RefreshCw
} from "lucide-react";

interface ParsedData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  skills: string[];
  education: string[];
  experience: string[];
  projects: string[];
  certifications: string[];
}

interface ResumeData {
  _id: string;
  fileName: string;
  parsedData: ParsedData;
  createdAt: string;
}

export default function ResumePage() {
  const { user } = useUser();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.id) fetchResume();
  }, [user]);

  const fetchResume = async () => {
    try {
      const res = await fetch(`/api/resume/upload?userId=${user?.id}`);
      const data = await res.json();
      if (data.resume) setResume(data.resume);
    } catch {
      console.error("Failed to fetch resume");
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".pdf")) {
      setError("Only PDF files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setError("");
    setSuccess("");
    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("userId", user?.id || "anonymous");

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 15, 85));
      }, 400);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgress(100);

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Upload failed");
      } else {
        setSuccess("Resume parsed and saved successfully!");
        setResume(data.resume);
      }
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [user]);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const p = resume?.parsedData;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resume Parser</h1>
        <p className="text-gray-500 mt-1">Upload your PDF resume. We'll extract and structure all the data automatically.</p>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          dragging
            ? "border-indigo-500 bg-indigo-50 scale-[1.01]"
            : "border-gray-300 bg-white hover:border-indigo-400 hover:bg-indigo-50/30"
        }`}
      >
        <input
          id="resume-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileInput}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="mx-auto text-indigo-600 animate-spin" size={40} />
            <p className="text-gray-600 font-medium">Parsing your resume...</p>
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-400">{progress}%</p>
          </div>
        ) : (
          <label htmlFor="resume-input" className="cursor-pointer block">
            <UploadCloud className="mx-auto text-indigo-400 mb-4" size={48} />
            <p className="text-lg font-semibold text-gray-700">
              {dragging ? "Drop your PDF here" : "Drag & drop your resume PDF"}
            </p>
            <p className="text-sm text-gray-400 mt-1">or click to browse • Max 5MB</p>
            <span className="mt-4 inline-block bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-indigo-700 transition">
              {resume ? "Re-upload Resume" : "Choose File"}
            </span>
          </label>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          <span>⚠️ {error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          <CheckCircle2 size={16} /> <span>{success}</span>
        </div>
      )}

      {/* Parsed Resume Preview */}
      {resume && p && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-indigo-600" size={22} />
              <div>
                <p className="font-semibold text-gray-800">{resume.fileName}</p>
                <p className="text-xs text-gray-400">Uploaded & parsed successfully</p>
              </div>
            </div>
            <label htmlFor="resume-input" className="flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium">
              <RefreshCw size={14} /> Re-upload
            </label>
          </div>

          {/* Contact Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <User size={18} className="text-indigo-500" /> Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={<User size={14} />} label="Name" value={p.name} />
              <InfoRow icon={<Mail size={14} />} label="Email" value={p.email} />
              <InfoRow icon={<Phone size={14} />} label="Phone" value={p.phone} />
              <InfoRow icon={<Linkedin size={14} />} label="LinkedIn" value={p.linkedin} link />
              <InfoRow icon={<Github size={14} />} label="GitHub" value={p.github} link />
            </div>
          </div>

          {/* Skills */}
          {p.skills.length > 0 && (
            <Section title="Skills" icon={<Code2 size={18} className="text-indigo-500" />}>
              <div className="flex flex-wrap gap-2 mt-2">
                {p.skills.map((skill, i) => (
                  <span key={i} className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full border border-indigo-100">
                    {skill}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Experience */}
          {p.experience.length > 0 && (
            <Section title="Work Experience" icon={<Briefcase size={18} className="text-indigo-500" />}>
              <BulletList items={p.experience} />
            </Section>
          )}

          {/* Education */}
          {p.education.length > 0 && (
            <Section title="Education" icon={<BookOpen size={18} className="text-indigo-500" />}>
              <BulletList items={p.education} />
            </Section>
          )}

          {/* Projects */}
          {p.projects.length > 0 && (
            <Section title="Projects" icon={<Code2 size={18} className="text-indigo-500" />}>
              <BulletList items={p.projects} />
            </Section>
          )}

          {/* Certifications */}
          {p.certifications.length > 0 && (
            <Section title="Certifications" icon={<Award size={18} className="text-indigo-500" />}>
              <BulletList items={p.certifications} />
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        {icon} {title}
      </h2>
      {children}
    </div>
  );
}

function InfoRow({ icon, label, value, link }: { icon: React.ReactNode; label: string; value: string; link?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        {link ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline break-all">
            {value}
          </a>
        ) : (
          <p className="text-gray-800 font-medium">{value}</p>
        )}
      </div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 mt-1">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="text-indigo-400 mt-1">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

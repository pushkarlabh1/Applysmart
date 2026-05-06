"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  UploadCloud, FileText, User, Mail, Phone, Linkedin, Github,
  Briefcase, BookOpen, Code2, Award, CheckCircle2, Loader2, RefreshCw, ChevronRight, Zap
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
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Analyzer</h1>
          <p className="text-zinc-500 mt-1">Our AI parses your PDF and extracts core data for your applications.</p>
        </div>
        {resume && (
           <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 text-sm">
             <FileText size={16} className="text-teal-400" />
             <span className="font-medium truncate max-w-[150px]">{resume.fileName}</span>
           </div>
        )}
      </div>

      {/* Upload Zone */}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative border-2 border-dashed rounded-3xl p-16 text-center transition-all group overflow-hidden ${
          dragging
            ? "border-teal-500 bg-teal-500/5 scale-[1.01]"
            : "border-white/10 bg-zinc-900/40 hover:border-teal-500/40 hover:bg-zinc-800/40 shadow-xl shadow-zinc-950/50"
        }`}
      >
        {/* Decorative background orb */}
        <div className={`absolute -bottom-20 -right-20 w-64 h-64 rounded-full bg-teal-500/10 blur-[100px] transition-opacity duration-1000 ${dragging ? 'opacity-100' : 'opacity-40'}`} />
        
        <input
          id="resume-input"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={onFileInput}
          disabled={uploading}
        />

        {uploading ? (
          <div className="relative z-10 space-y-6">
            <div className="relative inline-flex items-center justify-center">
               <Loader2 className="text-teal-500 animate-spin" size={60} strokeWidth={1.5} />
               <Zap className="absolute text-teal-400 animate-pulse" size={24} />
            </div>
            <div className="space-y-2">
               <p className="text-white font-bold text-lg tracking-tight">Analyzing Your Profile...</p>
               <p className="text-zinc-500 text-sm italic">Scanning experience, skills, and match patterns.</p>
            </div>
            <div className="w-full max-w-sm mx-auto space-y-2">
               <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(20,184,166,0.5)]"
                    style={{ width: `${progress}%` }}
                  />
               </div>
               <p className="text-xs font-extrabold text-zinc-600 uppercase tracking-widest">{progress}% Complete</p>
            </div>
          </div>
        ) : (
          <label htmlFor="resume-input" className="relative z-10 cursor-pointer block">
            <div className="w-20 h-20 rounded-full bg-zinc-950 border border-white/5 flex items-center justify-center mx-auto mb-8 shadow-2xl group-hover:scale-110 group-hover:border-teal-500/30 transition-all duration-500">
               <UploadCloud className="text-zinc-500 group-hover:text-teal-400 transition-colors" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight mb-2">
              {dragging ? "Drop to Scan" : "Drag & Drop Resume PDF"}
            </h3>
            <p className="text-zinc-500 text-sm mb-8">AI-powered parsing for higher match scores • Max 5MB</p>
            <span className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-bold px-8 py-3.5 rounded-2xl hover:from-teal-500 hover:to-cyan-500 transition-all shadow-xl shadow-teal-900/20 active:scale-95">
               {resume ? "Update Profile" : "Upload Resume"} <ChevronRight size={16} />
            </span>
          </label>
        )}
      </div>

      {/* Feedback Alerts */}
      {(error || success) && (
        <div className={`flex items-center gap-3 p-5 rounded-2xl border text-sm font-medium animate-in slide-in-from-top-2 duration-300 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {error ? <span>⚠️ {error}</span> : <div className="flex items-center gap-3"><CheckCircle2 size={18} /> <span>{success}</span></div>}
        </div>
      )}

      {/* Parsed Resume Preview */}
      {resume && p && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1 space-y-8">
             {/* Profile Summary Card */}
             <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
                <div className="flex flex-col items-center text-center mb-8">
                   <div className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-teal-500/10 p-1 mb-4">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-zinc-900 font-bold text-3xl">
                         {p.name[0]}
                      </div>
                   </div>
                   <h2 className="text-2xl font-bold text-white tracking-tight">{p.name}</h2>
                   <p className="text-zinc-500 text-sm font-medium mt-1 uppercase tracking-widest">{p.experience.length > 0 ? "Experienced Professional" : "New Talent"}</p>
                </div>
                
                <div className="space-y-4 pt-6 border-t border-white/5">
                   <InfoLink icon={<Mail size={14} />} value={p.email} label="Email" />
                   <InfoLink icon={<Phone size={14} />} value={p.phone} label="Phone" />
                   <InfoLink icon={<Linkedin size={14} />} value={p.linkedin} label="LinkedIn" isLink />
                   <InfoLink icon={<Github size={14} />} value={p.github} label="GitHub" isLink />
                </div>
             </div>

             {/* Skills Grid */}
             <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      <Code2 size={18} className="text-teal-400" /> Key Skills
                   </h2>
                   <span className="text-xs font-bold text-zinc-600 bg-zinc-950 px-2 py-0.5 rounded-full">{p.skills.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                   {p.skills.map((skill, i) => (
                      <span key={i} className="bg-white/5 text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/5 hover:border-teal-500/20 transition-all cursor-default">
                         {skill}
                      </span>
                   ))}
                </div>
             </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
             {/* Content Sections */}
             <ContentSection title="Professional Experience" icon={<Briefcase size={20} className="text-teal-400" />}>
                <HistoryList items={p.experience} />
             </ContentSection>

             <ContentSection title="Education" icon={<BookOpen size={20} className="text-teal-400" />}>
                <HistoryList items={p.education} />
             </ContentSection>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {p.projects.length > 0 && (
                  <ContentSection title="Projects" icon={<Zap size={20} className="text-teal-400" />}>
                     <HistoryList items={p.projects} />
                  </ContentSection>
                )}
                {p.certifications.length > 0 && (
                  <ContentSection title="Certifications" icon={<Award size={20} className="text-teal-400" />}>
                     <HistoryList items={p.certifications} />
                  </ContentSection>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function ContentSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
      <h2 className="text-xl font-bold text-white tracking-tight mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-white/5 flex items-center justify-center">
           {icon}
        </div>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InfoLink({ icon, label, value, isLink }: any) {
  if (!value) return null;
  return (
    <div className="group flex items-start gap-4">
      <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-teal-400 transition-colors">
         {icon}
      </div>
      <div className="overflow-hidden">
        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-zinc-300 hover:text-teal-400 break-all transition-colors line-clamp-1">
            {value.replace(/^https?:\/\//, '')}
          </a>
        ) : (
          <p className="text-sm font-medium text-white line-clamp-1">{value}</p>
        )}
      </div>
    </div>
  );
}

function HistoryList({ items }: { items: string[] }) {
  return (
    <div className="relative space-y-8 pl-8">
       {/* Vertical Line */}
       <div className="absolute left-3 top-2 bottom-2 w-px bg-gradient-to-b from-teal-500/40 via-white/5 to-white/5" />
       
       {items.map((item, i) => (
          <div key={i} className="relative group">
             {/* Dot */}
             <div className="absolute -left-[25px] top-1.5 w-2 h-2 rounded-full bg-zinc-900 border border-teal-500 group-hover:bg-teal-500 transition-all shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
             <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 group-hover:border-white/10 group-hover:bg-white/[0.04] transition-all">
                <p className="text-sm leading-relaxed text-zinc-400 group-hover:text-zinc-200 transition-colors">{item}</p>
             </div>
          </div>
       ))}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Briefcase, Target, ExternalLink, Plus, Filter, Search, Trash2 } from "lucide-react";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  jobUrl?: string;
  atsScore?: number;
  platform?: string;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  Applied: { bg: "bg-teal-500/10", text: "text-teal-400", dot: "bg-teal-400" },
  Interview: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  Offer: { bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  Rejected: { bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
};

const PLATFORM_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  LinkedIn: { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/20" },
  Naukri: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  Indeed: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [jobUrl, setJobUrl] = useState("");
  const [atsScore, setAtsScore] = useState<number | "">("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        console.error("API Error:", data);
        setApplications([]);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company, role, status, jobUrl, atsScore: atsScore || 0 }),
      });
      setCompany("");
      setRole("");
      setStatus("Applied");
      setJobUrl("");
      setAtsScore("");
      fetchApplications();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  const filteredApps = applications.filter(app => 
    app.company.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Job Applications</h1>
            <p className="text-zinc-500 mt-1">Track every application, platform, and ATS score in one place.</p>
         </div>
         <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all shadow-xl"
            />
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        
        {/* Add Form */}
        <div className="lg:col-span-1 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-8">
             <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-teal-400" />
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight">New Record</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Company</label>
              <input
                className="w-full bg-zinc-950 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Google, Meta, etc."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Job Role</label>
              <input
                className="w-full bg-zinc-950 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">ATS Match (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                className="w-full bg-zinc-950 border border-white/5 p-4 rounded-2xl text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm"
                value={atsScore}
                onChange={(e) => setAtsScore(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Match Score"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Status</label>
              <select
                className="w-full bg-zinc-950 border border-white/5 p-4 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all text-sm appearance-none"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-4 rounded-2xl font-bold text-sm hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg shadow-teal-900/20"
            >
              Add Application
            </button>
          </form>
        </div>

        {/* Applications List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-2">
             <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               History <span className="text-xs font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-full">{filteredApps.length}</span>
             </h2>
             <button className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                <Filter size={14} /> Filter Platform
             </button>
          </div>

          {filteredApps.length === 0 ? (
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-16 text-center shadow-xl">
               <Briefcase size={48} className="mx-auto text-zinc-800 mb-4" />
               <p className="text-zinc-500 font-medium">No applications found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div
                  key={app._id}
                  className="group bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-white/10 hover:bg-zinc-800/40 transition-all shadow-xl"
                >
                  {/* Left: Company + Role */}
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 font-bold text-2xl group-hover:text-teal-400 transition-colors">
                       {app.company[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white text-xl tracking-tight mb-0.5">{app.company}</p>
                      <p className="text-base text-zinc-500 font-medium">{app.role}</p>
                    </div>
                  </div>

                  {/* Right: Platform + ATS + View + Status */}
                  <div className="w-full md:w-auto flex flex-wrap items-center gap-4 md:shrink-0 pt-4 md:pt-0 border-t border-white/5 md:border-0 h-full">
                    {/* Platform Badge */}
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${PLATFORM_CONFIG[app.platform || "LinkedIn"]?.bg} ${PLATFORM_CONFIG[app.platform || "LinkedIn"]?.text} ${PLATFORM_CONFIG[app.platform || "LinkedIn"]?.border}`}>
                       {app.platform || "LinkedIn"}
                    </span>

                    {/* ATS Score */}
                    <div className="flex flex-col items-center px-3 py-1.5 rounded-2xl bg-white/5 border border-white/5 min-w-[80px]">
                       <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-0.5">ATS Match</span>
                       <span className={`text-lg font-black ${app.atsScore && app.atsScore > 75 ? "text-emerald-400" : "text-teal-400"}`}>
                         {app.atsScore !== undefined ? `${app.atsScore}%` : "N/A"}
                       </span>
                    </div>

                    {app.jobUrl && (
                      <a
                        href={app.jobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-zinc-950 border border-white/5 text-zinc-500 hover:text-white hover:border-white/20 transition-all"
                        title="View Job Post"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                    
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-widest border transition-all ${STATUS_CONFIG[app.status]?.bg} ${STATUS_CONFIG[app.status]?.text} border-transparent group-hover:border-current/10`}>
                      <span className={`w-1.2 h-1.2 rounded-full ${STATUS_CONFIG[app.status]?.dot} animate-pulse`} />
                      {app.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
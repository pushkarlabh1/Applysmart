"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Award, XCircle, X, Zap, ChevronRight, CheckCircle2, History } from "lucide-react";
import ApplicationChart from "@/components/ApplicationChart";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { user } = useUser();

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingAutoApply, setLoadingAutoApply] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ applied: any[]; skipped: string[]; message: string } | null>(null);

  // Auto-apply config
  const [keywords, setKeywords] = useState("frontend developer");
  const [location, setLocation] = useState("Remote");
  const [limit, setLimit] = useState(3);
  const [platform, setPlatform] = useState("LinkedIn");
  const [prioritizeEasyApply, setPrioritizeEasyApply] = useState(true);

  const [total, setTotal] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [offers, setOffers] = useState(0);
  const [rejected, setRejected] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (Array.isArray(data)) {
        setApplications(data);
        setTotal(data.length);
        setInterviews(data.filter((a: any) => a.status === "Interview").length);
        setOffers(data.filter((a: any) => a.status === "Offer").length);
        setRejected(data.filter((a: any) => a.status === "Rejected").length);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startAutoApply = async () => {
    setShowModal(false);
    setResult(null);
    try {
      setLoadingAutoApply(true);
      const res = await fetch("/api/auto-apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, keywords, location, limit, prioritizeEasyApply, userId: user?.id }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        if (data.message === "NO_RESUME") {
          alert("Please Upload the Resume first");
          setResult({ message: "Auto apply cancelled. Please upload your resume in the Resume Parser.", applied: [], skipped: [] });
          return;
        }
        throw new Error(data.message || "Failed");
      }

      setResult(data);
      fetchApplications(); // refresh stats
    } catch (err: any) {
      setResult({ message: err.message || "Auto apply failed. Check the server logs.", applied: [], skipped: [] });
    } finally {
      setLoadingAutoApply(false);
    }
  };

  const interviewRate = total ? Math.round((interviews / total) * 100) : 0;
  const offerRate = total ? Math.round((offers / total) * 100) : 0;
  const rejectionRate = total ? Math.round((rejected / total) * 100) : 0;

  const chartData = [
    { status: "Applied", count: total },
    { status: "Interview", count: interviews },
    { status: "Offer", count: offers },
    { status: "Rejected", count: rejected },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">

      {/* Auto Apply Banner */}
      <div className="relative overflow-hidden group rounded-3xl border border-teal-500/20 bg-zinc-900/40 p-1 backdrop-blur-sm shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex flex-col md:flex-row justify-between items-center p-8 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-900/40">
              <Zap className="w-8 h-8 text-zinc-900" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">AI Auto-Apply Bot</h2>
              <p className="text-zinc-400 mt-1 max-w-md">Automatically apply to high-match jobs on LinkedIn, Indeed, and Naukri while you sleep.</p>
            </div>
          </div>
          <button
            onClick={() => { setShowModal(true); setResult(null); }}
            disabled={loadingAutoApply}
            className="w-full md:w-auto px-8 py-4 rounded-2xl font-bold text-zinc-900 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 transition-all hover:scale-105 shadow-xl shadow-teal-900/20 disabled:opacity-50"
          >
            {loadingAutoApply ? (
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 animate-pulse" /> Running...
              </span>
            ) : (
              "Launch Engine"
            )}
          </button>
        </div>
      </div>

      {/* Result Summary */}
      {result && (
        <div className={`relative overflow-hidden rounded-3xl border ${result.applied?.length > 0 ? "border-emerald-500/20 bg-emerald-500/5" : "border-amber-500/20 bg-amber-500/5"} p-8 backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-500`}>
          <div className="flex items-start gap-4">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${result.applied?.length > 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
               {result.applied?.length > 0 ? <CheckCircle2 size={20} /> : <Zap size={20} />}
             </div>
             <div className="flex-1">
                <p className="font-bold text-white text-lg mb-4">{result.message}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {result.applied?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">✅ Successful Applications</p>
                      <ul className="space-y-2">
                        {result.applied.map((j, i) => (
                          <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-zinc-300 text-sm">
                             <Briefcase size={14} className="text-emerald-400" />
                             <span className="font-medium text-white">{j.role}</span> @ {j.company}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.skipped?.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-amber-400 uppercase tracking-wider">⏭ Processing Queue</p>
                      <ul className="space-y-2">
                        {result.skipped.map((s, i) => (
                          <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-zinc-500 text-sm italic">
                             <History size={14} className="text-amber-400" />
                             {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          href="/dashboard/applications"
          label="Total Applications"
          value={total}
          icon={Briefcase}
          color="teal"
          subtext="Submissions"
        />
        <StatCard 
          label="Interviews"
          value={interviews}
          icon={CalendarCheck}
          color="amber"
          subtext={`${interviewRate}% Success`}
        />
        <StatCard 
          label="Offers"
          value={offers}
          icon={Award}
          color="emerald"
          subtext={`${offerRate}% Conversion`}
        />
        <StatCard 
          label="Rejections"
          value={rejected}
          icon={XCircle}
          color="rose"
          subtext={`${rejectionRate}% Rate`}
        />
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-bold text-white tracking-tight">Status Analytics</h2>
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" /> Real-time tracking
             </div>
          </div>
          <div className="h-[300px]">
            <ApplicationChart data={chartData} />
          </div>
        </div>

        <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 shadow-xl flex flex-col justify-between">
           <div>
              <h2 className="text-xl font-bold text-white tracking-tight mb-2">Job Match Strength</h2>
              <p className="text-zinc-500 text-sm leading-relaxed mb-6">Our AI ensures you only apply to jobs where your match score is above 60%.</p>
           </div>
           <div className="space-y-6">
              <MatchMetric label="Semantic Analysis" progress={85} />
              <MatchMetric label="Keyword Match" progress={72} />
              <MatchMetric label="ATS Compliance" progress={94} />
           </div>
           <Link href="/dashboard/resume" className="mt-8 flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-zinc-300 font-medium transition-all group">
              Optimize Resume <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
           </Link>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-teal-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white tracking-tight">Configure Engine</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Target Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {["LinkedIn", "Indeed", "Naukri"].map((p) => (
                    <label key={p} className={`flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all ${platform === p ? "bg-teal-500/10 border-teal-500/40 text-teal-300" : "bg-white/5 border-white/5 text-zinc-500 hover:border-white/10"}`}>
                      <input type="radio" name="platform" value={p} checked={platform === p} onChange={(e) => setPlatform(e.target.value)} className="hidden" /> 
                      <span className="text-sm font-bold">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Job Keywords</label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
                    placeholder="e.g. frontend developer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/40 transition-all"
                    placeholder="e.g. Remote"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                   <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest">Applications Limit</label>
                   <span className="text-xs font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">{limit} Jobs</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full accent-teal-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
                />
              </div>

              {platform === "Naukri" && (
                <label className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${prioritizeEasyApply ? "bg-teal-500 border-teal-500 text-zinc-900" : "border-white/20"}`}>
                    <input
                      type="checkbox"
                      checked={prioritizeEasyApply}
                      onChange={(e) => setPrioritizeEasyApply(e.target.checked)}
                      className="hidden"
                    />
                    {prioritizeEasyApply && <CheckCircle2 size={14} />}
                  </div>
                  <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">Prioritize Naukri Easy Apply</span>
                </label>
              )}

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-200/70 leading-relaxed italic">
                 ⚠️ The bot will automatically handle forms, resume uploads, and semantic matching for you.
              </div>
            </div>

            <div className="p-8 bg-zinc-950/50 border-t border-white/5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-4 rounded-2xl border border-white/10 text-zinc-400 font-bold text-sm hover:bg-white/5 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={startAutoApply}
                className="flex-1 px-4 py-4 rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold text-sm hover:from-teal-500 hover:to-cyan-500 transition-all shadow-lg shadow-teal-900/20"
              >
                Confirm & Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, subtext, href }: any) {
  const colors: any = {
    teal: "text-teal-400 bg-teal-500/10 border-teal-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  const Content = (
    <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-8 rounded-3xl group hover:border-white/10 hover:bg-zinc-800/40 transition-all cursor-pointer">
      <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${colors[color]} border transition-transform group-hover:scale-110 duration-300`}>
          <Icon size={24} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">{subtext}</span>
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-1">{label}</h3>
        <p className="text-4xl font-extrabold text-white tracking-tighter">{value}</p>
      </div>
    </div>
  );

  return href ? <Link href={href}>{Content}</Link> : Content;
}

function MatchMetric({ label, progress }: any) {
  return (
    <div>
      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest mb-2.5">
        <span className="text-zinc-500">{label}</span>
        <span className="text-teal-400">{progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

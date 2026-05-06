import Link from "next/link";
import { Target, BrainCircuit, FileCheck, Sparkles, ArrowRight, CheckCircle, Star, ChevronRight, Rocket, Github } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{background: "radial-gradient(ellipse at 15% 15%, rgba(20,184,166,0.15) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{background: "radial-gradient(ellipse at 85% 75%, rgba(6,182,212,0.12) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{background: "radial-gradient(ellipse at 50% 100%, rgba(52,211,153,0.08) 0%, transparent 50%)"}} className="absolute inset-0" />
        {/* Grid overlay */}
        <div style={{backgroundImage: "linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px"}} className="absolute inset-0" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/[0.06] backdrop-blur-md bg-zinc-950/70">
        <div className="flex items-center gap-3">
          {/* Logo: Crosshair target */}
          <div className="relative w-11 h-11">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 blur-md" />
            <div className="relative w-11 h-11 rounded-xl bg-zinc-900 border border-teal-500/40 flex items-center justify-center shadow-lg">
              <Target className="w-6 h-6 text-teal-400" />
            </div>
          </div>
          <span className="text-2xl font-bold tracking-tight">
            Apply<span className="text-teal-400">Smart</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-base font-medium text-zinc-400">
          <a href="#features" className="hover:text-teal-300 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-teal-300 transition-colors">How it Works</a>
          <a href="#platforms" className="hover:text-teal-300 transition-colors">Platforms</a>
        </div>

        <div className="flex items-center gap-3">
          {/* LinkedIn icon */}
          <a
            href="https://www.linkedin.com/in/pushkarlabh/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="w-11 h-11 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10 transition-all hover:scale-110"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          {/* GitHub icon */}
          <a
            href="https://github.com/pushkarlabh1/Applysmart"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="w-11 h-11 rounded-lg border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all hover:scale-110"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Get Started */}
          <Link
            href="/sign-in"
            className="flex items-center gap-2 text-base font-semibold px-5 py-2.5 rounded-lg border border-teal-500/50 bg-teal-500/10 text-teal-300 hover:bg-teal-500/20 hover:border-teal-400/70 transition-all shadow-lg shadow-teal-900/20 hover:scale-105"
          >
            Get Started <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative z-10 pt-24 pb-28 px-6 md:px-16 text-center max-w-6xl mx-auto">

        {/* Pill badge */}
        <div className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2 rounded-full border border-teal-500/30 bg-teal-500/[0.08] text-teal-300 mb-8">
          <Sparkles className="w-4 h-4 text-teal-400" />
          AI-Powered · LinkedIn · Naukri · Indeed
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6">
          Land Your Dream Job <br />
          <span style={{backgroundImage: "linear-gradient(135deg, #2dd4bf, #22d3ee, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
            On Autopilot.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ApplySmart is your AI job-hunt co-pilot. It scans job boards, matches your resume to the best roles using ATS scoring, and applies for you — automatically, every day.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-in"
            className="group flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-950 shadow-2xl shadow-teal-700/30 hover:shadow-teal-500/40 transition-all hover:scale-105"
          >
            Start Automating
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base text-zinc-400 border border-white/10 hover:bg-white/[0.04] hover:text-white transition-all"
          >
            See how it works
          </a>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 divide-x divide-white/[0.08] border border-white/[0.08] rounded-2xl overflow-hidden bg-white/[0.02] backdrop-blur-sm max-w-2xl mx-auto">
          {[
            { value: "3 Platforms", label: "Fully Automated" },
            { value: "60%+ ATS", label: "Minimum Match Score" },
            { value: "24 / 7", label: "Runs While You Sleep" },
          ].map((stat) => (
            <div key={stat.label} className="py-5 px-4 text-center">
              <div className="text-xl md:text-2xl font-bold text-teal-300">{stat.value}</div>
              <div className="text-xs text-zinc-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORMS ── */}
      <section id="platforms" className="relative z-10 py-10 border-y border-white/[0.05] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-700 mb-6">Automates applications on</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            {[
              { name: "LinkedIn", color: "hover:text-sky-400" },
              { name: "Naukri", color: "hover:text-teal-400" },
              { name: "Indeed", color: "hover:text-cyan-400" },
            ].map((p) => (
              <span key={p.name} className={`text-2xl font-bold text-zinc-600 ${p.color} transition-colors cursor-default`}>
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="relative z-10 py-28 px-6 md:px-16 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-teal-400 tracking-widest uppercase mb-3">Core Features</p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your unfair advantage</h2>
          <p className="text-zinc-500 mt-4 max-w-xl mx-auto">Every feature built to maximize applications and minimize your effort.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              icon: BrainCircuit,
              gradient: "from-teal-500 to-emerald-500",
              glow: "shadow-teal-500/25",
              border: "hover:border-teal-500/30",
              title: "Smart ATS Matching",
              desc: "Semantically compares your resume with every job description. Only applies when your match score clears 60% — ensuring quality over quantity.",
            },
            {
              icon: Rocket,
              gradient: "from-cyan-500 to-sky-500",
              glow: "shadow-cyan-500/25",
              border: "hover:border-cyan-500/30",
              title: "Multi-Platform Bot",
              desc: "Launches automated bots on LinkedIn, Naukri, and Indeed in one click. Set your keywords, location, and daily limit — the engine handles the rest.",
            },
            {
              icon: FileCheck,
              gradient: "from-emerald-500 to-teal-400",
              glow: "shadow-emerald-500/25",
              border: "hover:border-emerald-500/30",
              title: "Smart Form Autofill",
              desc: "Auto-fills your name, email, phone, LinkedIn, and GitHub on any external company portal. Uploads your physical PDF resume to the job form automatically.",
            },
          ].map((f) => (
            <div key={f.title} className={`group relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-7 ${f.border} hover:bg-white/[0.06] transition-all duration-300 overflow-hidden`}>
              {/* card glow top-left */}
              <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 shadow-xl ${f.glow} group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Feature pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {[
            "Easy Apply Priority Mode",
            "External Site Fallback",
            "Real-time Application Tracker",
            "Human-in-the-Loop Fallback",
            "Consultant Jobs Filter",
            "60s Manual Override Window",
          ].map((pill) => (
            <span key={pill} className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-400">
              <CheckCircle className="w-3 h-3 text-teal-400 flex-shrink-0" />
              {pill}
            </span>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative z-10 py-28 px-6 md:px-16 bg-white/[0.01] border-y border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-cyan-400 tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Up and running in 3 steps</h2>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute left-[22px] top-8 bottom-8 w-px bg-gradient-to-b from-teal-500/60 via-cyan-500/40 to-emerald-500/20" />

            <div className="flex flex-col gap-12">
              {[
                {
                  num: "01",
                  color: "from-teal-500 to-emerald-500",
                  glow: "shadow-teal-500/30",
                  title: "Upload Your Resume & Profile",
                  desc: "Head to the Resume Analyser and upload your CV. ApplySmart parses your skills, experience, and contact info — stored securely to power every application.",
                },
                {
                  num: "02",
                  color: "from-cyan-500 to-sky-500",
                  glow: "shadow-cyan-500/30",
                  title: "Set Platform, Keywords & Daily Limit",
                  desc: "Choose LinkedIn, Naukri, or Indeed. Enter your target role and location. Set how many applications to fire today (up to 10). Enable Easy Apply Priority. Hit start.",
                },
                {
                  num: "03",
                  color: "from-emerald-500 to-teal-400",
                  glow: "shadow-emerald-500/30",
                  title: "Track Results & Receive Interview Calls",
                  desc: "Watch your Applications dashboard populate in real-time — company, role, ATS score, platform badge, and a direct link to every job post you've been submitted to.",
                },
              ].map((s) => (
                <div key={s.num} className="flex gap-6 items-start group">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0 text-xs font-extrabold text-zinc-900 shadow-xl ${s.glow} z-10 group-hover:scale-110 transition-transform`}>
                    {s.num}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-teal-300 transition-colors">{s.title}</h3>
                    <p className="text-zinc-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative z-10 py-32 px-6 text-center overflow-hidden">
        {/* glow blob */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[300px] rounded-full" style={{background: "radial-gradient(ellipse, rgba(20,184,166,0.12) 0%, transparent 70%)"}} />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-center gap-0.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
            Your next job is one{" "}
            <span style={{backgroundImage: "linear-gradient(135deg, #2dd4bf, #22d3ee, #34d399)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text"}}>
              click away.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg mb-10">Stop spending hours manually applying. Let ApplySmart's AI engine work around the clock — so you don't have to.</p>
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-zinc-950 shadow-2xl shadow-teal-700/30 hover:shadow-teal-500/40 transition-all hover:scale-105"
          >
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-700">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-zinc-900 border border-teal-500/30 flex items-center justify-center">
            <Target className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <span className="font-semibold text-zinc-500">Apply<span className="text-teal-400">Smart</span></span>
        </div>
        <p>© {new Date().getFullYear()} ApplySmart AI. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="/sign-in" className="hover:text-teal-400 transition-colors">Sign In</a>
          <a href="/dashboard" className="hover:text-teal-400 transition-colors">Dashboard</a>
        </div>
      </footer>

    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, Target } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  const navItem = (href: string, label: string, icon: any) => {
    const Icon = icon;
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
        ${
          active
            ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-900/20"
            : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        }`}
      >
        <Icon size={20} className={active ? "text-white" : "text-zinc-500 group-hover:text-teal-400 transition-colors"} />
        <span className="font-medium">{label}</span>
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      
      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{background: "radial-gradient(ellipse at 15% 15%, rgba(20,184,166,0.08) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{background: "radial-gradient(ellipse at 85% 75%, rgba(6,182,212,0.06) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{backgroundImage: "linear-gradient(rgba(20,184,166,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.02) 1px, transparent 1px)", backgroundSize: "48px 48px"}} className="absolute inset-0" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-72 bg-zinc-900/50 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <div className="flex items-center gap-3 mb-12 px-2">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 opacity-20 blur-md" />
              <div className="relative w-9 h-9 rounded-xl bg-zinc-900 border border-teal-500/40 flex items-center justify-center">
                <Target className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight">
              Apply<span className="text-teal-400">Smart</span>
            </span>
          </div>

          <nav className="space-y-2">
            {navItem("/dashboard", "Overview", LayoutDashboard)}
            {navItem("/dashboard/applications", "Applications", Briefcase)}
            {navItem("/dashboard/resume", "Resume Analyzer", FileText)}
          </nav>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 px-2 opacity-50">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">ApplySmart AI v1.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-10 bg-zinc-950/40 backdrop-blur-md border-b border-white/5">
          <h2 className="text-lg font-semibold text-zinc-300">
            {pathname === "/dashboard" && "Dashboard Overview"}
            {pathname === "/dashboard/applications" && "Job Applications"}
            {pathname === "/dashboard/resume" && "Resume Analyzer"}
          </h2>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Account</span>
                <span className="text-xs font-bold text-teal-400">{user?.fullName || "User"}</span>
             </div>
             <div className="h-8 w-px bg-white/10" />
             <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}

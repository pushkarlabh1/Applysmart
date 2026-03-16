"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItem = (href: string, label: string, icon: any) => {
    const Icon = icon;
    const active = pathname === href;

    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        ${
          active
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon size={20} />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 flex flex-col justify-between">

        <div>
          <h2 className="text-2xl font-bold mb-10 tracking-wide">
            Applysmart ✨
          </h2>

          <nav className="space-y-3">
            {navItem("/dashboard", "Dashboard", LayoutDashboard)}
            {navItem("/dashboard/applications", "Applications", Briefcase)}
            {navItem("/dashboard/resume", "Resume Analyzer", FileText)}
          </nav>
        </div>

        <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500 hover:bg-red-600 transition">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 bg-gradient-to-br from-gray-100 to-gray-200">
        {children}
      </main>
    </div>
  );
}

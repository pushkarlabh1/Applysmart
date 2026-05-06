"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Briefcase, FileText } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

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
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-gradient-to-br from-gray-100 to-gray-200">
        {/* Header with UserButton */}
        <header className="flex justify-end items-center p-6 bg-white shadow-sm border-b border-gray-200">
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10 border-2 border-indigo-100"
              }
            }}
          />
        </header>
        
        {/* Page Content */}
        <div className="flex-1 p-10">
          {children}
        </div>
      </main>
    </div>
  );
}

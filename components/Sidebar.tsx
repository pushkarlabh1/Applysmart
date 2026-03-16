"use client";

import Link from "next/link";
import { LayoutDashboard, Briefcase, FileText, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between p-6">

      {/* Logo */}
      <div>
        <h1 className="text-2xl font-bold mb-10 text-blue-600">
          ApplySmart
        </h1>

        {/* Navigation */}
        <nav className="space-y-4">

          <Link
            href="/dashboard"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/dashboard/applications"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <Briefcase size={18} />
            Applications
          </Link>

          <Link
            href="/dashboard/resume"
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100"
          >
            <FileText size={18} />
            Resume Analyzer
          </Link>

        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 text-red-500 hover:text-red-700"
      >
        <LogOut size={18} />
        Logout
      </button>

    </div>
  );
}
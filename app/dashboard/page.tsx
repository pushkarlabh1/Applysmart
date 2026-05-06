"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Award, XCircle, X } from "lucide-react";
import ApplicationChart from "@/components/ApplicationChart";
import Link from "next/link";

export default function DashboardPage() {

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingAutoApply, setLoadingAutoApply] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{ applied: any[]; skipped: string[]; message: string } | null>(null);

  // Auto-apply config
  const [keywords, setKeywords] = useState("frontend developer");
  const [location, setLocation] = useState("Remote");
  const [limit, setLimit] = useState(3);

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
        body: JSON.stringify({ keywords, location, limit }),
      });
      const data = await res.json();
      setResult(data);
      fetchApplications(); // refresh stats
    } catch {
      setResult({ message: "Auto apply failed. Check the server logs.", applied: [], skipped: [] });
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
    <div className="max-w-6xl mx-auto space-y-10">

      {/* Auto Apply Banner */}
      <div className="bg-indigo-600 text-white p-6 rounded-xl flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">LinkedIn Auto Apply</h2>
          <p className="text-indigo-200 text-sm mt-1">Automatically apply to Easy Apply jobs on LinkedIn</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setResult(null); }}
          disabled={loadingAutoApply}
          className="bg-white text-indigo-700 px-5 py-2 rounded-lg font-semibold disabled:opacity-60"
        >
          {loadingAutoApply ? "Running... (do not close)" : "Start Auto Apply"}
        </button>
      </div>

      {/* Result Summary */}
      {result && (
        <div className={`p-5 rounded-xl border ${result.applied?.length > 0 ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
          <p className="font-semibold text-gray-800 mb-2">{result.message}</p>
          {result.applied?.length > 0 && (
            <div className="mb-2">
              <p className="text-sm font-medium text-green-700 mb-1">✅ Applied to:</p>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {result.applied.map((j, i) => <li key={i}>{j.role} @ {j.company}</li>)}
              </ul>
            </div>
          )}
          {result.skipped?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-yellow-700 mb-1">⏭ Skipped:</p>
              <ul className="list-disc list-inside text-sm text-gray-500 space-y-1">
                {result.skipped.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/dashboard/applications">
          <div className="bg-blue-600 text-white p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p>Total Applications</p>
              <h2 className="text-3xl font-bold">{total}</h2>
            </div>
            <Briefcase size={32} />
          </div>
        </Link>
        <div className="bg-yellow-500 text-white p-6 rounded-2xl flex justify-between items-center">
          <div>
            <p>Interviews</p>
            <h2 className="text-3xl font-bold">{interviews}</h2>
            <p className="text-sm">{interviewRate}% rate</p>
          </div>
          <CalendarCheck size={32} />
        </div>
        <div className="bg-green-600 text-white p-6 rounded-2xl flex justify-between items-center">
          <div>
            <p>Offers</p>
            <h2 className="text-3xl font-bold">{offers}</h2>
            <p className="text-sm">{offerRate}% conversion</p>
          </div>
          <Award size={32} />
        </div>
        <div className="bg-red-600 text-white p-6 rounded-2xl flex justify-between items-center">
          <div>
            <p>Rejections</p>
            <h2 className="text-3xl font-bold">{rejected}</h2>
            <p className="text-sm">{rejectionRate}% rejection</p>
          </div>
          <XCircle size={32} />
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-8 rounded-3xl shadow-xl">
        <h2 className="text-xl font-semibold mb-6">Application Status Analytics</h2>
        <ApplicationChart data={chartData} />
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Configure Auto Apply</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Keywords</label>
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. frontend developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Remote, India"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Applications <span className="text-gray-400">(max 10)</span>
                </label>
                <input
                  type="number"
                  value={limit}
                  min={1}
                  max={10}
                  onChange={(e) => setLimit(Math.min(10, Math.max(1, Number(e.target.value))))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-5 text-sm text-yellow-800">
              ⚠️ This will open Chrome and automatically apply to up to <strong>{limit}</strong> Easy Apply jobs for "<strong>{keywords}</strong>" in <strong>{location}</strong>. Only fully automated forms will be submitted.
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={startAutoApply}
                className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

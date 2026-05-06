"use client";

import { useEffect, useState } from "react";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
  jobUrl?: string;
}

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-blue-100 text-blue-700",
  Interview: "bg-yellow-100 text-yellow-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700",
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [jobUrl, setJobUrl] = useState("");

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
        body: JSON.stringify({ company, role, status, jobUrl }),
      });
      setCompany("");
      setRole("");
      setStatus("Applied");
      setJobUrl("");
      fetchApplications();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold text-gray-900">Applications</h1>

      {/* Add Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Add Application Manually</h2>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Company</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Role</label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Enter job role"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Job URL <span className="text-gray-400">(optional)</span></label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            placeholder="https://linkedin.com/jobs/..."
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full border border-gray-300 p-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Applied</option>
            <option>Interview</option>
            <option>Offer</option>
            <option>Rejected</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 font-medium transition"
        >
          Add Application
        </button>
      </form>

      {/* Applications List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Your Applications</h2>

        {applications.length === 0 ? (
          <p className="text-gray-500">No applications yet.</p>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li
                key={app._id}
                className="border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:shadow-sm transition"
              >
                {/* Left: Company + Role */}
                <div className="space-y-0.5">
                  <p className="font-semibold text-gray-900">{app.company}</p>
                  <p className="text-sm text-gray-500">{app.role}</p>
                </div>

                {/* Right: View button + Status badge */}
                <div className="flex items-center gap-3 shrink-0">
                  {app.jobUrl ? (
                    <a
                      href={app.jobUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                    >
                      View
                    </a>
                  ) : null}
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[app.status] || "bg-gray-100 text-gray-600"}`}>
                    {app.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

interface Application {
  _id: string;
  company: string;
  role: string;
  status: string;
  appliedDate: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

    const token = localStorage.getItem("token");

    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company,
          role,
          status,
        }),
      });

      setCompany("");
      setRole("");
      setStatus("Applied");

      fetchApplications();
    } catch (err) {
      console.error("Submit Error:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <h1 className="text-3xl font-bold">Applications</h1>

      {/* Add Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow space-y-4"
      >
        <div>
          <label className="block mb-1">Company</label>
          <input
            className="w-full border p-2 rounded"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name"
          />
        </div>

        <div>
          <label className="block mb-1">Role</label>
          <input
            className="w-full border p-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Enter job role"
          />
        </div>

        <div>
          <label className="block mb-1">Status</label>
          <select
            className="w-full border p-2 rounded"
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
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Add Application
        </button>
      </form>

      {/* Applications List */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Your Applications</h2>

        {applications.length === 0 ? (
          <p>No applications yet.</p>
        ) : (
          <ul className="space-y-3">
            {applications.map((app) => (
              <li
                key={app._id}
                className="border p-3 rounded flex justify-between"
              >
                <div>
                  <p className="font-semibold">{app.company}</p>
                  <p className="text-sm text-gray-500">{app.role}</p>
                </div>

                <span className="text-sm font-medium">
                  {app.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Briefcase, CalendarCheck, Award, XCircle } from "lucide-react";
import ApplicationChart from "@/components/ApplicationChart";
import Link from "next/link";

export default function DashboardPage() {

const [applications, setApplications] = useState<any[]>([]);
const [loadingAutoApply, setLoadingAutoApply] = useState(false);

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
    setInterviews(data.filter((a:any)=>a.status==="Interview").length);
    setOffers(data.filter((a:any)=>a.status==="Offer").length);
    setRejected(data.filter((a:any)=>a.status==="Rejected").length);

  }

} catch (err) {
  console.error(err);
}

};

const startAutoApply = async () => {

try {

  setLoadingAutoApply(true);

  const res = await fetch("/api/auto-apply", {
    method:"POST"
  });

  const data = await res.json();

  alert(data.message);

} catch (err) {

  alert("Auto apply failed");

} finally {

  setLoadingAutoApply(false);

}

};

const interviewRate = total ? Math.round((interviews/total)*100) : 0;
const offerRate = total ? Math.round((offers/total)*100) : 0;
const rejectionRate = total ? Math.round((rejected/total)*100) : 0;

const chartData = [
{ status:"Applied",count:total },
{ status:"Interview",count:interviews },
{ status:"Offer",count:offers },
{ status:"Rejected",count:rejected }
];

return (

<div className="max-w-6xl mx-auto space-y-10">

  <div className="bg-indigo-600 text-white p-6 rounded-xl flex justify-between items-center">

    <h2 className="text-xl font-semibold">
      LinkedIn Auto Apply
    </h2>

    <button
      onClick={startAutoApply}
      className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-semibold"
    >
      {loadingAutoApply ? "Running..." : "Start"}
    </button>

  </div>


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


  <div className="bg-white p-8 rounded-3xl shadow-xl">

    <h2 className="text-xl font-semibold mb-6">
      Application Status Analytics
    </h2>

    <ApplicationChart data={chartData} />

  </div>

</div>

);
}

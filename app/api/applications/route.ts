import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Application from "@/models/Application";
import mongoose from "mongoose";

// GET applications
export async function GET() {
try {
await connectDB();
const applications = await Application.find().sort({ appliedDate: -1 });

return NextResponse.json(applications);


} catch (error) {
console.error("GET Applications Error:", error);
return NextResponse.json(
  { message: "Failed to fetch applications" },
  { status: 500 }
);

}
}

// POST application
export async function POST(req: Request) {
try {
await connectDB();

const body = await req.json();

const newApplication = new Application({
  userId: new mongoose.Types.ObjectId(),   // required ObjectId
  company: body.company || "LinkedIn Job",
  role: body.role || "Auto Applied Role",
  status: body.status || "Applied",
  appliedDate: new Date(),
});
await newApplication.save();

return NextResponse.json(newApplication);

} catch (error) {
console.error("POST Application Error:", error);

return NextResponse.json(
  { message: "Failed to create application" },
  { status: 500 }
);

}
}

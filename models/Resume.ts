import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: "",
    },
    filePath: {
      type: String,
      default: "",
    },
    rawText: {
      type: String,
      default: "",
    },
    parsedData: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      skills: { type: [String], default: [] },
      education: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Resume ||
  mongoose.model("Resume", ResumeSchema);

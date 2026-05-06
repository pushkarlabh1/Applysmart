import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Applied",
    },
    jobUrl: {
      type: String,
      default: "",
    },
    platform: {
      type: String,
      default: "LinkedIn",
    },
    atsScore: {
      type: Number,
      default: 0,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Application ||
  mongoose.model("Application", ApplicationSchema);
import { Doctor } from "@/lib/types";
import mongoose, { Schema, Model } from "mongoose";

export interface DoctorLeave {
  _id?: string;
  doctor: mongoose.Types.ObjectId | Doctor; // Doctor ObjectId
  fromDate: Date;
  toDate: Date;
  type: "FULL_DAY" | "PARTIAL_SLOTS" | "TIME_RANGE";
  slots?: string[];
  startTime?: string; // "10:00"
  endTime?: string; // "14:00"
  reason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const doctorLeaveSchema = new Schema<DoctorLeave>(
  {
    doctor: {
      type: mongoose.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ["FULL_DAY", "PARTIAL_SLOTS", "TIME_RANGE"],
      default: "FULL_DAY",
      required: true,
    },
    slots: {
      type: [String], // e.g., ["10:00", "10:20"]
    },
    startTime: { type: String }, // "10:00"
    endTime: { type: String }, // "14:00"
    reason: { type: String },
  },
  { timestamps: true }
);

const DoctorLeave: Model<DoctorLeave> =
  mongoose.models.DoctorLeave ||
  mongoose.model<DoctorLeave>("DoctorLeave", doctorLeaveSchema);

export default DoctorLeave;

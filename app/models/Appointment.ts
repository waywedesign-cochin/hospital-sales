import { Doctor } from "@/lib/types";
import mongoose, { Model, Schema } from "mongoose";
import { IEnquiry } from "./Enquiry";

export interface IAppointment {
  _id: string;
  organizationId: mongoose.Types.ObjectId;
  bookingId: string;
  enquiryId: mongoose.Types.ObjectId | IEnquiry;
  patientId?: mongoose.Types.ObjectId | any;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  isNewPatient?: boolean;
  doctor: mongoose.Types.ObjectId | Doctor;
  treatmentCategory: string;
  date: Date;
  startTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    bookingId: { type: String, required: true },
    enquiryId: {
      type: mongoose.Types.ObjectId,
      ref: "Enquiry",
    },
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
    },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    patientEmail: { type: String },
    isNewPatient: { type: Boolean, default: false },
    doctor: { type: mongoose.Types.ObjectId, ref: "Doctor", required: true },
    treatmentCategory: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"],
      default: "SCHEDULED",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const Appointment: Model<IAppointment> =
  mongoose.models.Appointment ||
  mongoose.model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;

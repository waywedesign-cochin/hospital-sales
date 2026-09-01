import mongoose, { Model, Schema } from "mongoose";

export interface IMedicalNote {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  doctorId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  type: "CONSULTATION" | "DIAGNOSIS" | "PRESCRIPTION" | "LAB_RESULT" | "FOLLOW_UP" | "GENERAL";
  title: string;
  content: string;
  createdBy: mongoose.Types.ObjectId; // staff/admin who entered it
  createdAt?: Date;
  updatedAt?: Date;
}

const medicalNoteSchema = new Schema<IMedicalNote>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    type: {
      type: String,
      enum: ["CONSULTATION", "DIAGNOSIS", "PRESCRIPTION", "LAB_RESULT", "FOLLOW_UP", "GENERAL"],
      default: "GENERAL",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const MedicalNote: Model<IMedicalNote> =
  mongoose.models.MedicalNote || mongoose.model<IMedicalNote>("MedicalNote", medicalNoteSchema);

export default MedicalNote;

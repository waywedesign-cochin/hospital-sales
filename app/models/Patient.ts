import mongoose, { Model, Schema } from "mongoose";

export interface IPatient {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  bloodGroup?: string;
  address?: string;
  medicalHistory?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, sparse: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["MALE", "FEMALE", "OTHER"] },
    bloodGroup: { type: String },
    address: { type: String },
    medicalHistory: { type: String },
  },
  { timestamps: true }
);

const Patient: Model<IPatient> =
  mongoose.models.Patient || mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;

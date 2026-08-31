import mongoose, { Model, Schema } from "mongoose";

export interface Doctor {
  _id?: string;
  organizationId?: mongoose.Types.ObjectId;
  prefix: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  address: string;
  qualification: string;
  specialization: string[];
  education: string;
  experience: string;
  registrationNumber: string;
  avatar?: string;
  status: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  createdAt?: Date;
  updatedAt?: Date;
}

const doctorSchema = new Schema<Doctor>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    prefix: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    contactNumber: { type: String },
    address: { type: String },
    qualification: { type: String },
    specialization: { type: [String] },
    education: { type: String },
    experience: { type: String },
    registrationNumber: { type: String },
    avatar: { type: String },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true },
);

// Same doctor email can exist in different clinics
doctorSchema.index({ email: 1, organizationId: 1 }, { unique: true, sparse: true });

const Doctor: Model<Doctor> =
  mongoose.models.Doctor || mongoose.model<Doctor>("Doctor", doctorSchema);

export default Doctor;

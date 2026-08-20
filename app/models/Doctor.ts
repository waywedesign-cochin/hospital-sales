import mongoose, { Model, Schema } from "mongoose";

export interface Doctor {
  _id?: string;
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

// const doctorSchema = new Schema<Doctor>(
//   {
//     prefix: { type: String, required: true },
//     firstName: { type: String, required: true },
//     lastName: { type: String },
//     email: { type: String, required: true, unique: true },
//     contactNumber: { type: String, required: true },
//     address: { type: String, required: true },
//     qualification: { type: String, required: true },
//     specialization: { type: [String], required: true },
//     education: { type: String, required: true },
//     experience: { type: String, required: true },
//     registrationNumber: { type: String, required: true },
//     avatar: { type: String },
//     status: {
//       type: String,
//       enum: ["ACTIVE", "INACTIVE", "ON_LEAVE"],
//       default: "ACTIVE",
//     },
//   },
//   { timestamps: true }
// );
const doctorSchema = new Schema<Doctor>(
  {
    prefix: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String, unique: true },
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

const Doctor: Model<Doctor> =
  mongoose.models.Doctor || mongoose.model<Doctor>("Doctor", doctorSchema);

export default Doctor;

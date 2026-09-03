import mongoose, { Model, Schema } from "mongoose";
import "./User";
import "./Patient";
import { IUser } from "./User";

export interface IEnquiry {
  _id: string;
  organizationId: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  treatmentCategory: string;
  message: string;
  status: "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";
  patientId?: mongoose.Types.ObjectId | any;
  handledBy?: mongoose.Types.ObjectId | IUser;
  source: "WEBSITE" | "PHONE" | "WHATSAPP" | "OTHER";
  staffNotes?: string;
  createdAt?: Date;
}

const enquirySchema = new Schema<IEnquiry>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    treatmentCategory: {
      type: String,
      required: true,
    },

    message: { type: String, required: true },

    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "FOLLOW_UP", "APPOINTMENT_BOOKED"],
      default: "NEW",
    },

    handledBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    patientId: {
      type: mongoose.Types.ObjectId,
      ref: "Patient",
    },
    source: {
      type: String,
      enum: ["WEBSITE", "PHONE", "WHATSAPP", "OTHER"],
      required: true,
    },

    staffNotes: { type: String },
  },
  { timestamps: true },
);

const Enquiry: Model<IEnquiry> =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>("Enquiry", enquirySchema);

export default Enquiry;

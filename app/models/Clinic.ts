import mongoose, { Model, Schema } from "mongoose";

export interface IClinic {
  _id?: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  logo?: string;

  // Subscription
  plan: "FREE_TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";
  trialEndsAt?: Date;
  subscriptionStatus: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

  // Plan Limits
  maxDoctors: number;
  maxStaff: number;

  // Clinic-specific config
  departments: string[];
  workingHours?: { day: string; open: string; close: string }[];

  // Ownership
  ownerId: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const clinicSchema = new Schema<IClinic>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    logo: { type: String },

    plan: {
      type: String,
      enum: ["FREE_TRIAL", "BASIC", "PRO", "ENTERPRISE"],
      default: "FREE_TRIAL",
    },
    trialEndsAt: { type: Date },
    subscriptionStatus: {
      type: String,
      enum: ["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "TRIAL",
    },

    maxDoctors: { type: Number, default: 2 },
    maxStaff: { type: Number, default: 3 },

    departments: {
      type: [String],
      default: ["General Medicine"],
    },
    workingHours: [
      {
        day: { type: String },
        open: { type: String },
        close: { type: String },
      },
    ],

    ownerId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Clinic: Model<IClinic> =
  mongoose.models.Clinic || mongoose.model<IClinic>("Clinic", clinicSchema);

export default Clinic;

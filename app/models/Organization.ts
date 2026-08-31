import mongoose, { Schema, model, models, Document, Types } from "mongoose";

export type OrgType =
  | "hospital"
  | "clinic"
  | "dermatology_centre"
  | "diagnostic_centre"
  | "other";

export type Plan = "free" | "pro" | "enterprise";

export interface IOrganization extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  type: OrgType;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  logo?: string;

  // Subscription & Plan
  plan: Plan;
  trialEndsAt?: Date;
  subscriptionStatus: "TRIAL" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  isActive: boolean;

  // Plan Limits
  maxDoctors: number;
  maxStaff: number;

  // Org-specific config
  departments: string[];
  workingHours?: { day: string; open: string; close: string }[];

  // Ownership
  ownerId: mongoose.Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

const organizationSchema = new Schema<IOrganization>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: [
        "hospital",
        "clinic",
        "dermatology_centre",
        "diagnostic_centre",
        "other",
      ],
      default: "other",
    },
    email: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    logo: { type: String },

    plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
    trialEndsAt: { type: Date },
    subscriptionStatus: {
      type: String,
      enum: ["TRIAL", "ACTIVE", "EXPIRED", "CANCELLED"],
      default: "TRIAL",
    },
    isActive: { type: Boolean, default: true },

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

export default models.Organization ||
  model<IOrganization>("Organization", organizationSchema);

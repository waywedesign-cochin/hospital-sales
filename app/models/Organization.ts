import { Schema, model, models, Document, Types } from "mongoose";

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
  plan: Plan;
  isActive: boolean;
  createdAt: Date;
}

const organizationSchema = new Schema<IOrganization>({
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
  plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default models.Organization ||
  model<IOrganization>("Organization", organizationSchema);

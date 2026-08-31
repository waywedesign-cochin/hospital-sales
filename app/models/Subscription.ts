import mongoose, { Model, Schema } from "mongoose";

export interface ISubscription {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  amount: number;
  currency: string;
  paymentId?: string;
  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  startsAt: Date;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    plan: {
      type: String,
      enum: ["BASIC", "PRO", "ENTERPRISE"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    paymentId: { type: String },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED"],
      default: "PENDING",
    },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;

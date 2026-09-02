import mongoose, { Model, Schema } from "mongoose";

export interface ISubscription {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  plan: "BASIC" | "PRO" | "ENTERPRISE";
  billingCycle: "MONTHLY" | "YEARLY";
  amount: number;
  currency: string;

  // Payment tracking (mock for now, Razorpay-ready)
  paymentId?: string; // Will be razorpayPaymentId later
  orderId?: string; // Will be razorpayOrderId later
  paymentMethod?: string; // "MOCK" | "RAZORPAY" | "STRIPE"
  invoiceNumber?: string;

  status: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "CANCELLED";
  startsAt: Date;
  expiresAt: Date;
  cancelledAt?: Date;
  autoRenew: boolean;

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
    billingCycle: {
      type: String,
      enum: ["MONTHLY", "YEARLY"],
      default: "MONTHLY",
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    paymentId: { type: String },
    orderId: { type: String },
    paymentMethod: { type: String, default: "MOCK" },
    invoiceNumber: { type: String },

    status: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED", "REFUNDED", "CANCELLED"],
      default: "PENDING",
    },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    cancelledAt: { type: Date },
    autoRenew: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Auto-generate invoice number before save
subscriptionSchema.pre("save", async function () {
  if (!this.invoiceNumber && this.status === "PAID") {
    const count = await mongoose.models.Subscription.countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(6, "0")}`;
  }
});

const Subscription: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);

export default Subscription;

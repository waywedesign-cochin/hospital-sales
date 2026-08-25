import mongoose, { Model, Schema } from "mongoose";

export interface IMessageLog {
  _id?: string;
  clinicId: mongoose.Types.ObjectId;
  recipientPhone: string;
  patientId?: mongoose.Types.ObjectId;
  messageType: "REMINDER" | "BOOKING_CONFIRMATION" | "CAMPAIGN" | "MANUAL";
  content: string;
  status: "PENDING" | "SENT" | "FAILED" | "DELIVERED" | "READ";
  sentAt?: Date;
  metaMessageId?: string; // ID returned by WhatsApp API
  errorDetails?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const messageLogSchema = new Schema<IMessageLog>(
  {
    clinicId: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    recipientPhone: { type: String, required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    messageType: {
      type: String,
      enum: ["REMINDER", "BOOKING_CONFIRMATION", "CAMPAIGN", "MANUAL"],
      required: true,
    },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED", "DELIVERED", "READ"],
      default: "PENDING",
    },
    sentAt: { type: Date },
    metaMessageId: { type: String },
    errorDetails: { type: String },
  },
  { timestamps: true }
);

const MessageLog: Model<IMessageLog> =
  mongoose.models.MessageLog || mongoose.model<IMessageLog>("MessageLog", messageLogSchema);

export default MessageLog;

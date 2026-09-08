import mongoose, { Schema, Document } from "mongoose";

export interface IMessageQueue extends Document {
  organizationId: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  recipientPhone: string;
  templateName?: string;
  templateParams?: string[];
  messageContent?: string;
  messageType: "REMINDER" | "BOOKING_CONFIRMATION" | "CAMPAIGN" | "MANUAL";
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  errorDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageQueueSchema = new Schema<IMessageQueue>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
    recipientPhone: { type: String, required: true },
    templateName: { type: String },
    templateParams: { type: [String] },
    messageContent: { type: String },
    messageType: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"], 
      default: "PENDING" 
    },
    errorDetails: { type: String },
  },
  { timestamps: true }
);

// Optimize queries for finding pending messages by organization
MessageQueueSchema.index({ organizationId: 1, status: 1, createdAt: 1 });

export default mongoose.models.MessageQueue || mongoose.model<IMessageQueue>("MessageQueue", MessageQueueSchema);

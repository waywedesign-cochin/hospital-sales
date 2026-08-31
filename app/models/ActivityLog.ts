import mongoose, { Model, Schema } from "mongoose";

export interface IActivityLog {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Staff or Admin ID
  action: string; // e.g., "CREATED_APPOINTMENT", "SENT_MESSAGE"
  resourceType: string; // e.g., "Appointment", "Patient", "MessageLog"
  resourceId?: mongoose.Types.ObjectId; // ID of the created/modified record
  details?: string; // JSON string or text explaining the action
  createdAt?: Date;
  updatedAt?: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    resourceType: { type: String, required: true },
    resourceId: { type: Schema.Types.ObjectId },
    details: { type: String },
  },
  { timestamps: true }
);

const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);

export default ActivityLog;

import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
  _id?: string;
  organizationId: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  assignedDoctors?: mongoose.Types.ObjectId[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  inviteToken?: string;
  inviteExpiresAt?: Date;
  lastLoginAt?: Date;
  // Presence: lastSeenAt is refreshed by a heartbeat while a dashboard tab is
  // open, so a session that ends by closing the browser goes stale on its own
  // rather than staying "online" forever. isOnline is the explicit
  // login/logout flag; both must agree for a user to count as active.
  lastSeenAt?: Date;
  isOnline?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    organizationId: {
      type: mongoose.Types.ObjectId,
      ref: "Organization",
      required: function (this: IUser) {
        return this.role !== "PLATFORM_ADMIN";
      },
      index: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["PLATFORM_ADMIN", "ADMIN", "STAFF", "DOCTOR", "GUEST"],
      default: "GUEST",
    },
    // Doctors this staff member is scoped to. Only meaningful when role === "STAFF";
    // empty/omitted means they see the whole clinic.
    assignedDoctors: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Doctor",
      },
    ],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    inviteToken: { type: String },
    inviteExpiresAt: { type: Date },
    lastLoginAt: { type: Date },
    lastSeenAt: { type: Date },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Same email can exist in different clinics, but must be unique within a clinic
userSchema.index({ email: 1, organizationId: 1 }, { unique: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
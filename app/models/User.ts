import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
  _id?: string;
  clinicId: mongoose.Types.ObjectId;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  inviteToken?: string;
  inviteExpiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    clinicId: {
      type: mongoose.Types.ObjectId,
      ref: "Clinic",
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
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    inviteToken: { type: String },
    inviteExpiresAt: { type: Date },
  },
  { timestamps: true }
);

// Same email can exist in different clinics, but must be unique within a clinic
userSchema.index({ email: 1, clinicId: 1 }, { unique: true });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

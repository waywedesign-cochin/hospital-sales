import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role: "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["ADMIN", "STAFF", "DOCTOR", "GUEST"],
      default: "GUEST",
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;

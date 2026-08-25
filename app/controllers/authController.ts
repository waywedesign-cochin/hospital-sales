import { cookies } from "next/headers";
import { signJwt } from "../lib/jwt";
import User from "../models/User";
import Clinic from "../models/Clinic";
import { sendResponse } from "../utils/responseHandler";
import bcrypt from "bcrypt";
import { sendApiResponse } from "../utils/nextResponseHandler";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../utils/sendPasswordResetMail";
// ================= SIGN UP =================
export const signUp = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  clinicId?: string;
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    const userExists = await User.findOne({ email: lowercasedEmail, clinicId: data.clinicId });
    if (userExists) {
      return sendResponse(false, "User already exists in this clinic");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      ...data,
      email: lowercasedEmail,
      password: hashedPassword,
    });

    return sendResponse(true, "User created successfully");
  } catch (error) {
    console.error("Signup Error:", error);
    return sendResponse(false, "Something went wrong during signup");
  }
};

// ================= REGISTER CLINIC =================
export const registerClinic = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  clinicName: string;
  clinicPhone?: string;
  clinicAddress?: string;
  departments?: string[];
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    // 1. Generate unique slug for clinic
    let baseSlug = data.clinicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Clinic.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 2. Create the Clinic
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30-day trial

    const newClinic = await Clinic.create({
      name: data.clinicName,
      slug,
      email: lowercasedEmail,
      phone: data.clinicPhone,
      address: data.clinicAddress,
      departments: data.departments?.length ? data.departments : ["General Medicine"],
      plan: "FREE_TRIAL",
      trialEndsAt,
      subscriptionStatus: "TRIAL",
      maxDoctors: 2,
      maxStaff: 5,
    });

    // 3. Create the Admin User
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newAdmin = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: lowercasedEmail,
      password: hashedPassword,
      role: "ADMIN",
      clinicId: newClinic._id,
    });

    // 4. Update Clinic Owner ID
    await Clinic.findByIdAndUpdate(newClinic._id, { ownerId: newAdmin._id });

    // 5. Auto login
    const token = signJwt({ _id: newAdmin._id, role: newAdmin.role, clinicId: newClinic._id }, "7d");
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return sendResponse(true, "Clinic registered successfully", {
      _id: newAdmin._id.toString(),
      firstName: newAdmin.firstName,
      lastName: newAdmin.lastName,
      email: newAdmin.email,
      role: newAdmin.role,
      clinicId: newClinic._id.toString(),
    });

  } catch (error: any) {
    console.error("Clinic Registration Error:", error);
    if (error.code === 11000) {
      return sendResponse(false, "This email is already registered");
    }
    return sendResponse(false, "Something went wrong during clinic registration");
  }
};

// ================= SIGN IN =================
export const signIn = async (data: { email: string; password: string }) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    const user = await User.findOne({ email: lowercasedEmail });
    if (!user) {
      return sendResponse(false, "User not found");
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return sendResponse(false, "Invalid credentials");
    }

    if (user.role === "GUEST") {
      return sendResponse(false, "Access denied. Contact admin.");
    }

    // ✅ Sign JWT with clinicId
    const token = signJwt({ _id: user._id, role: user.role, clinicId: user.clinicId }, "7d");
    const cookieStore = await cookies();

    // ✅ Set JWT in HttpOnly cookie
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return sendResponse(true, "Login successful", {
      _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId?.toString() || null,
    });
  } catch (error) {
    console.error("Signin Error:", error);
    return sendResponse(false, "Something went wrong during login");
  }
};

//logout
export const logout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");

    return sendResponse(true, "Logged out successfully");
  } catch (error) {
    return sendResponse(false, "Logout failed");
  }
};

export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
) => {
  const user = await User.findById({ _id: id });
  if (!user) {
    return sendApiResponse(false, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return sendApiResponse(false, "Invalid credentials");
  }
  const isSame = await bcrypt.compare(newPassword, user.password);
  if (isSame) {
    return sendApiResponse(
      false,
      "New password cannot be same as old password"
    );
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await User.findOneAndUpdate({ _id: id }, { password: hashedPassword });
  return sendApiResponse(true, "Password changed successfully");
};

//forgot password
export const forgotPassword = async (email: string) => {
  const lowercasedEmail = email.toLowerCase();
  const user = await User.findOne({ email: lowercasedEmail });
  console.log(user);

  if (!user) {
    return sendApiResponse(
      true,
      "If an account exists, a password reset link has been sent"
    );
  }
  const resetToken = crypto.randomBytes(20).toString("hex");
  const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);
  await User.findOneAndUpdate(
    { email: lowercasedEmail },
    { resetPasswordToken: resetToken, resetPasswordExpires: resetTokenExpiry },
    { new: true }
  );
  const resetLink = `${process.env.NEXTAUTH_URL}/auth/forgot-password?token=${resetToken}`;
  if (resetLink) {
    await sendPasswordResetEmail(user, resetLink);
  }
  return sendApiResponse(
    true,
    "If an account exists, a password reset link has been sent"
  );
};

//reset password
export const resetPassword = async (token: string, password: string) => {
  const user = await User.findOne({ resetPasswordToken: token });
  if (user) {
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return sendApiResponse(false, "Token has expired");
    }
  }
  if (!user) {
    return sendApiResponse(false, "Invalid or expired token");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await User.findOneAndUpdate(
    { _id: user._id },
    {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    }
  );
  return sendApiResponse(true, "Password reset successful");
};

import { cookies } from "next/headers";
import { signJwt } from "../lib/jwt";
import User from "../models/User";
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
  role?: "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
}) => {
  try {
    const lowercasedEmail = data.email.toLowerCase();

    const userExists = await User.findOne({ email: lowercasedEmail });
    if (userExists) {
      return sendResponse(false, "User already exists");
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

    // ✅ Sign JWT
    const token = signJwt({ _id: user._id, role: user.role }, "7d");
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

import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import UserModel from "@/app/models/User";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import bcrypt from "bcrypt";
import { signJwt } from "@/app/lib/jwt";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return sendApiResponse(false, "Token and password are required", null);
    }

    // Find the user with this token
    const user = await UserModel.findOne({
      inviteToken: token,
      inviteExpiresAt: { $gt: new Date() }, // Ensure token hasn't expired
    });

    if (!user) {
      return sendApiResponse(false, "Invalid or expired invite token", null);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user
    user.password = hashedPassword;
    user.inviteToken = undefined;
    user.inviteExpiresAt = undefined;
    await user.save();

    // Generate JWT and log them in immediately
    const jwtToken = signJwt({
      _id: user._id.toString(),
      email: user.email,
      role: user.role,
      clinicId: user.clinicId.toString(),
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("token", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return sendApiResponse(true, "Password set successfully. Logging you in...", {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        clinicId: user.clinicId,
      }
    });
    } catch (error: any) {
    console.error("Setup Password Error:", error);
    return sendApiResponse(false, error.message || "Internal server error", null);
  }
}

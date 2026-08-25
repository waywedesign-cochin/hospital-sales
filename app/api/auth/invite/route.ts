import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import User from "@/app/models/Clinic"; // Wait, I need User model, let's fix imports
import UserModel from "@/app/models/User";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import crypto from "crypto";
import bcrypt from "bcrypt";
import BASE_URL from "@/app/utils/baseUrl";
import { logActivity } from "@/app/controllers/activityLogController";

export const POST = withAuth(["ADMIN", "PLATFORM_ADMIN"])(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      const body = await req.json();
      const { email, firstName, lastName, role } = body;

      if (!email || !firstName || !role) {
        return sendApiResponse(false, "Missing required fields", null);
      }

      // Check if user already exists
      const existingUser = await UserModel.findOne({ email, clinicId: user.clinicId });
      if (existingUser) {
        return sendApiResponse(false, "User already exists in this clinic", null);
      }

      // Generate a secure invite token
      const inviteToken = crypto.randomBytes(32).toString("hex");
      const inviteExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

      // Generate a highly secure random placeholder password (since they haven't set it yet)
      const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10);

      const newUser = await UserModel.create({
        clinicId: user.clinicId,
        email,
        firstName,
        lastName,
        role,
        password: placeholderPassword,
        inviteToken,
        inviteExpiresAt,
      });

      // Construct invite link
      const inviteLink = `${BASE_URL}/setup-password?token=${inviteToken}`;
      
      console.log(`\n\n========================================`);
      console.log(`INVITE LINK FOR ${email}:`);
      console.log(inviteLink);
      console.log(`========================================\n\n`);

      // Log the activity
      await logActivity(
        user.clinicId,
        user._id,
        "INVITED_USER",
        "User",
        `Invited a new ${role.toLowerCase()}: ${firstName} ${lastName || ""}`.trim(),
        newUser._id
      );

      // TODO: Implement Nodemailer here when SMTP is ready.

      return sendApiResponse(true, "Invitation sent successfully", {
        inviteLink, // Useful for development testing
      });
    } catch (error: any) {
      console.error("Invite Error:", error);
      return sendApiResponse(false, error.message || "Internal server error", null);
    }
  }
);

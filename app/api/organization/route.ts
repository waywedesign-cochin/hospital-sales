import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";

export const GET = withAuth(["PLATFORM_ADMIN", "ADMIN", "STAFF", "DOCTOR"])(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      
      const clinic = await Organization.findById(user.organizationId);
      if (!clinic) {
        return sendApiResponse(false, "Organization not found", null);
      }

      return sendApiResponse(true, "Organization fetched successfully", clinic);
    } catch (error) {
      let message = "Server error";
      if (error instanceof Error) {
        message = error.message;
      }
      return sendApiResponse(false, message, null);
    }
  }
);

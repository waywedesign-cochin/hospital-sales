import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Clinic from "@/app/models/Clinic";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";

export const GET = withAuth(["PLATFORM_ADMIN", "ADMIN", "STAFF", "DOCTOR"])(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      
      const clinic = await Clinic.findById(user.clinicId);
      if (!clinic) {
        return sendApiResponse(false, "Clinic not found", null);
      }

      return sendApiResponse(true, "Clinic fetched successfully", clinic);
    } catch (error) {
      let message = "Server error";
      if (error instanceof Error) {
        message = error.message;
      }
      return sendApiResponse(false, message, null);
    }
  }
);

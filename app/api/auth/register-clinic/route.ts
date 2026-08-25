import { NextRequest } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { registerClinic } from "@/app/controllers/authController";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();
    const data = await req.json();

    if (!data.clinicName || !data.email || !data.password || !data.firstName) {
      return sendApiResponse(false, "Missing required fields", null);
    }

    const result = await registerClinic(data);
    return sendApiResponse(result.success, result.message, result.data);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

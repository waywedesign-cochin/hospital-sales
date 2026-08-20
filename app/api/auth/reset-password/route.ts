import { resetPassword } from "@/app/controllers/authController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { resetPasswordSchema } from "@/app/validations/authSchemas";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(resetPasswordSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await resetPassword(token, data.password);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

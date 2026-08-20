import { changePassword } from "@/app/controllers/authController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { changePasswordSchema } from "@/app/validations/authSchemas";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(changePasswordSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await changePassword(id, data.currentPassword, data.newPassword);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

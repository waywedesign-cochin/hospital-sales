import { forgotPassword } from "@/app/controllers/authController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { forgotPasswordSchema } from "@/app/validations/authSchemas";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();

    const rawBody = await req
      .clone()
      .json()
      .catch(() => ({}));
    const organizationId = rawBody?.organizationId as string | undefined;

    const [data, errorResponse] = await validate(forgotPasswordSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await forgotPassword(data.email, organizationId);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

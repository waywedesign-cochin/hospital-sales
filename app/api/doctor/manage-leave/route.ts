import {
  createLeave,
  deleteLeave,
  updateLeave,
} from "@/app/controllers/doctorLeaveController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { doctorLeaveSchema } from "@/app/validations/doctorSchema";
import { NextRequest } from "next/server";

export const POST = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest) => {
  try {
    await dbConnect();

    const [data, errorResponse] = await validate(doctorLeaveSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await createLeave(data);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const PUT = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(doctorLeaveSchema, req);

    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }

    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }

    return await updateLeave(id, data);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const DELETE = withAuth(["ADMIN"])(async (req: NextRequest) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await deleteLeave(id);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});
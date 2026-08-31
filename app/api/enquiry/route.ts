import {
  createEnquiry,
  deleteEnquiry,
  updateEnquiryStatus,
} from "@/app/controllers/enquiryController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import {
  enquirySchema,
  updateEnquiryStatusSchema,
} from "@/app/validations/enquirySchemas";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();
    const [data, errorResponse] = await validate(enquirySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    if (!data.organizationId) {
      return sendApiResponse(false, "Clinic ID is required", null);
    }
    return await createEnquiry(data);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

// Only admin and staff can update
export const PATCH = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(
      updateEnquiryStatusSchema,
      req
    );
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await updateEnquiryStatus(
      user.organizationId,
      id,
      user._id,
      data.status,
      data.handledBy,
      data.staffNotes
    );
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const DELETE = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await deleteEnquiry(user.organizationId, id, user._id);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

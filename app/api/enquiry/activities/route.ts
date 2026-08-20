import {
  addEnquiryActivity,
  deleteEnquiryActivity,
  updateEnquiryActivity,
} from "@/app/controllers/enquiryActivityController";
import { createEnquiry } from "@/app/controllers/enquiryController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { enquiryActivitySchema } from "@/app/validations/enquirySchemas";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    await dbConnect();
    const [data, errorResponse] = await validate(enquiryActivitySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await addEnquiryActivity(data);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

export const PUT = async (req: NextRequest) => {
  try {
    await dbConnect();
    const activityId = req.nextUrl.searchParams.get("activityId");
    if (!activityId) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(enquiryActivitySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await updateEnquiryActivity(activityId, data);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await deleteEnquiryActivity(id);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
};

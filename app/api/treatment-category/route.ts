import {
  addTreatmentCategory,
  deleteTreatmentCategory,
  getTreatmentCategories,
  updateTreatmentCategory,
} from "@/app/controllers/treatmentCategoryController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { treatmentCategorySchema } from "@/app/validations/treatmentCategoryValidations";
import { NextRequest, NextResponse } from "next/server"; // <-- add NextResponse

export const GET = withAuth(["ADMIN", "STAFF"])(async (
  req: NextRequest,
  user,
) => {
  try {
    await dbConnect();
    const result = await getTreatmentCategories(user.organizationId);
    return NextResponse.json(result);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const POST = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const [data, errorResponse] = await validate(treatmentCategorySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await addTreatmentCategory({
      ...data,
      organizationId: user.organizationId,
    });
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const PUT = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(treatmentCategorySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await updateTreatmentCategory(
      user.organizationId,
      id,
      user._id,
      data,
    );
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const DELETE = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await deleteTreatmentCategory(user.organizationId, id, user._id);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

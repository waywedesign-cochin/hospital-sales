import { addTreatmentCategory } from "@/app/controllers/treatmentCategoryController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { treatmentCategorySchema } from "@/app/validations/treatmentCategoryValidations";
import { NextRequest } from "next/server";

export const POST = withAuth(["ADMIN"])(async (req: NextRequest) => {
  try {
    await dbConnect();
    const [data, errorResponse] = await validate(treatmentCategorySchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await addTreatmentCategory(data);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

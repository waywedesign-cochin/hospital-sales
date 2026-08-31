import {
  createAppointment,
  deleteAppointment,
  getBookedSlots,
  updateAppointment,
} from "@/app/controllers/appoinmentController";
import { dbConnect } from "@/app/lib/dbConnect";
import { validate } from "@/app/middlewares/validate";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { appointmentSchema } from "@/app/validations/appointmentSchemas";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const doctor = searchParams.get("doctor") ?? "";
    const date = searchParams.get("date") ?? "";
    const organizationId = searchParams.get("organizationId");
    if (!organizationId) throw new Error("Clinic ID is required");
  
    const result = await getBookedSlots(organizationId, date, doctor);

    // If controller already returned a NextResponse, just return it.
    if (result instanceof NextResponse) return result;

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Server error",
        data: null,
      },
      { status: 500 }
    );
  }
}

export const POST = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const [data, errorResponse] = await validate(appointmentSchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await createAppointment({
      ...data,
      organizationId: user.organizationId,
      userId: user._id,
      enquiryId: data.enquiryId ?? undefined,
    });
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

export const PUT = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const id = req.nextUrl.searchParams.get("id");
    if (!id) {
      return sendApiResponse(false, "Invalid request", null);
    }
    const [data, errorResponse] = await validate(appointmentSchema, req);
    if (errorResponse) {
      return sendApiResponse(false, "Validation failed", null);
    }
    if (!data) {
      return sendApiResponse(false, "Invalid request", null);
    }
    return await updateAppointment(user.organizationId, id, user._id, data);
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
    return await deleteAppointment(user.organizationId, id, user._id);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});

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
import User from "@/app/models/User";
import type { RequestingUser } from "@/app/utils/DoctorScope";
import { NextRequest, NextResponse } from "next/server";

// withAuth's decoded user ({ _id, role, organizationId }) doesn't include
// assignedDoctors — STAFF users need one extra DB lookup, same as the
// server actions in appointmentActions.ts.
const buildRequestingUser = async (decoded: {
  _id: string;
  role: string;
}): Promise<RequestingUser> => {
  if (decoded.role !== "STAFF") {
    return { _id: decoded._id, role: decoded.role as RequestingUser["role"] };
  }

  const userDoc = await User.findById(decoded._id).select("assignedDoctors");
  return {
    _id: decoded._id,
    role: "STAFF",
    assignedDoctors:
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [],
  };
};

export const GET = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const doctor = searchParams.get("doctor") ?? "";
    const date = searchParams.get("date") ?? "";
    const organizationId = searchParams.get("organizationId") ?? user.organizationId;
    const categoryId = searchParams.get("categoryId") ?? undefined;
    if (!organizationId) throw new Error("Clinic ID is required");

    const requestingUser = await buildRequestingUser(user);
    const result = await getBookedSlots(organizationId, date, doctor, categoryId, requestingUser);

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
});

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
    const requestingUser = await buildRequestingUser(user);
    return await createAppointment(
      {
        ...data,
        organizationId: user.organizationId,
        userId: user._id,
        enquiryId: data.enquiryId ?? undefined,
      },
      requestingUser,
    );
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
    const requestingUser = await buildRequestingUser(user);
    return await updateAppointment(
      user.organizationId,
      id,
      user._id,
      data,
      requestingUser,
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
    const requestingUser = await buildRequestingUser(user);
    return await deleteAppointment(user.organizationId, id, user._id, requestingUser);
  } catch (error) {
    let message = "Server error";

    if (error instanceof Error) {
      message = error.message;
    }
    return sendApiResponse(false, message, null);
  }
});
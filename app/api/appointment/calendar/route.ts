import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { getAllAppointments } from "@/app/controllers/appoinmentController";
import { withAuth } from "@/app/middlewares/withAuth";
import User from "@/app/models/User";
import type { RequestingUser } from "@/app/utils/DoctorScope";

// Same helper used in appointmentActions.ts and the other appointment route —
// withAuth's decoded user doesn't include assignedDoctors, so STAFF users
// need one extra DB lookup.
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

export const GET = withAuth(["ADMIN", "STAFF", "DOCTOR"])(async (
  req: NextRequest,
  user,
) => {
  try {
    await dbConnect();

    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const doctor = searchParams.get("doctor") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const year = searchParams.get("year") ?? undefined;
    const month = searchParams.get("month") ?? undefined;

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 1000;

    const requestingUser = await buildRequestingUser(user);

    // Signature: (organizationId, requestingUser, page, limit, doctor, search, status, startDate, endDate, year, month)
    const result = await getAllAppointments(
      user.organizationId,
      requestingUser,
      page,
      limit,
      doctor,
      search,
      status as any,
      startDate,
      endDate,
      year,
      month,
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 },
    );
  }
});

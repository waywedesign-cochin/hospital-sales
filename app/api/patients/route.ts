import { NextRequest, NextResponse } from "next/server";
import { getPatients } from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";
import User from "@/app/models/User";
import type { RequestingUser } from "@/app/utils/DoctorScope";

import { withAuth } from "@/app/middlewares/withAuth";

export const GET = withAuth(["ADMIN", "STAFF", "DOCTOR"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    // withAuth only gives us the decoded JWT ({ _id, role, organizationId }) —
    // assignedDoctors isn't in the token, so STAFF needs one extra DB lookup.
    const requestingUser: RequestingUser = { _id: user._id, role: user.role as RequestingUser["role"] };
    if (user.role === "STAFF") {
      const userDoc = await User.findById(user._id).select("assignedDoctors");
      requestingUser.assignedDoctors = userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
    }

    const response = await getPatients(user.organizationId, requestingUser, page, limit, search);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});
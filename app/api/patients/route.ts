import { NextRequest, NextResponse } from "next/server";
import { getPatients } from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";

import { withAuth } from "@/app/middlewares/withAuth";

export const GET = withAuth(["ADMIN", "STAFF", "DOCTOR"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    const response = await getPatients(user.organizationId, page, limit, search);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

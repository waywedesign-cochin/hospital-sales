import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs } from "@/app/controllers/activityLogController";
import { dbConnect } from "@/app/lib/dbConnect";

import { withAuth } from "@/app/middlewares/withAuth";

export const GET = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const response = await getActivityLogs(user.organizationId, page, limit);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

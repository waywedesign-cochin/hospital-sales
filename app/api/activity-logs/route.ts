import { NextRequest, NextResponse } from "next/server";
import { getActivityLogs } from "@/app/controllers/activityLogController";
import { dbConnect } from "@/app/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const response = await getActivityLogs(page, limit);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

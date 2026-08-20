import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { getAllAppointments } from "@/app/controllers/appoinmentController";

export const GET = async (req: NextRequest) => {
  try {
    await dbConnect();

    // Extract query params
    const searchParams = req.nextUrl.searchParams;
    const startDate = searchParams.get("startDate") ?? undefined;
    const endDate = searchParams.get("endDate") ?? undefined;
    const doctor = searchParams.get("doctor") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    // Defaults
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 1000;

    // Controller call (matches your function signature)
    const result = await getAllAppointments(
      page,
      limit,
      doctor,
      search,
      status as any,
      startDate,
      endDate
    );

    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
};

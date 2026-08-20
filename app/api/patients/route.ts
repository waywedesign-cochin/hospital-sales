import { NextRequest, NextResponse } from "next/server";
import { getPatients } from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;

    const response = await getPatients(page, limit, search);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

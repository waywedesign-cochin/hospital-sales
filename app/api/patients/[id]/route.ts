import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const response = await getPatientById(id);
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

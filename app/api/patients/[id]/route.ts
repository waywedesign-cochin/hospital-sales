import { NextRequest, NextResponse } from "next/server";
import { getPatientById } from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";
import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";

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

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const user = verifyJwt<{ clinicId: string }>(token);
    if (!user || !user.clinicId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const response = await getPatientById(user.clinicId, id);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

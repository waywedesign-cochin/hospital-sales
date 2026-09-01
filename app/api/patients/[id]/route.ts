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
    const user = verifyJwt<{ organizationId: string }>(token);
    if (!user || !user.organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const response = await getPatientById(user.organizationId, id);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const body = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const user = verifyJwt<{ organizationId: string }>(token);
    if (!user || !user.organizationId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { updatePatient } = await import("@/app/controllers/patientController");
    const response = await updatePatient(user.organizationId, id, body);
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

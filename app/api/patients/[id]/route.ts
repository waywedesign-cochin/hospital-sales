import { NextRequest, NextResponse } from "next/server";
import {
  getPatientById,
  updatePatient,
} from "@/app/controllers/patientController";
import { dbConnect } from "@/app/lib/dbConnect";
import { cookies } from "next/headers";
import { verifyJwt } from "@/app/lib/jwt";
import User from "@/app/models/User";
import type { RequestingUser } from "@/app/utils/DoctorScope";

interface DecodedToken {
  _id: string;
  role: string;
  organizationId: string;
}

// Was previously typed as just { organizationId: string } — broadened so we
// can also resolve doctor scope, which needs _id and role too.
async function getAuthedRequestingUser(): Promise<{
  organizationId: string;
  requestingUser: RequestingUser;
} | null> {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const decoded = verifyJwt<DecodedToken>(token);
  if (!decoded || !decoded.organizationId) return null;

  const requestingUser: RequestingUser = {
    _id: decoded._id,
    role: decoded.role as RequestingUser["role"],
  };
  if (decoded.role === "STAFF") {
    const userDoc = await User.findById(decoded._id).select("assignedDoctors");
    requestingUser.assignedDoctors =
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
  }

  return { organizationId: decoded.organizationId, requestingUser };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const id = (await params).id;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    const auth = await getAuthedRequestingUser();
    if (!auth)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    const response = await getPatientById(
      auth.organizationId,
      auth.requestingUser,
      id,
    );
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await dbConnect();
    const id = (await params).id;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID is required" },
        { status: 400 },
      );
    }

    const auth = await getAuthedRequestingUser();
    if (!auth)
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );

    const response = await updatePatient(
      auth.organizationId,
      auth.requestingUser,
      id,
      body,
    );
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}

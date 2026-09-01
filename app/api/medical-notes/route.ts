import { NextRequest, NextResponse } from "next/server";
import { createMedicalNote, getMedicalNotes, deleteMedicalNote } from "@/app/controllers/medicalNoteController";
import { dbConnect } from "@/app/lib/dbConnect";
import { withAuth } from "@/app/middlewares/withAuth";

export const GET = withAuth(["ADMIN", "STAFF", "DOCTOR"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const patientId = req.nextUrl.searchParams.get("patientId");
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "20");

    if (!patientId) {
      return NextResponse.json({ success: false, message: "Patient ID is required" }, { status: 400 });
    }

    return await getMedicalNotes(user.organizationId, patientId, page, limit);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

export const POST = withAuth(["ADMIN", "STAFF", "DOCTOR"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const body = await req.json();

    if (!body.patientId || !body.title || !body.content || !body.type) {
      return NextResponse.json(
        { success: false, message: "patientId, type, title, and content are required" },
        { status: 400 }
      );
    }

    return await createMedicalNote({
      organizationId: user.organizationId,
      patientId: body.patientId,
      doctorId: body.doctorId || undefined,
      appointmentId: body.appointmentId || undefined,
      type: body.type,
      title: body.title,
      content: body.content,
      createdBy: user._id,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

export const DELETE = withAuth(["ADMIN"])(async (req: NextRequest, user) => {
  try {
    await dbConnect();
    const noteId = req.nextUrl.searchParams.get("id");
    if (!noteId) {
      return NextResponse.json({ success: false, message: "Note ID is required" }, { status: 400 });
    }
    return await deleteMedicalNote(user.organizationId, noteId, user._id);
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
});

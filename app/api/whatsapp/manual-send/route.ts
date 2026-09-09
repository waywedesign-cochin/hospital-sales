import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { sendWhatsAppText } from "@/app/utils/whatsappService";

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();

    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const body = await req.json();
    const { patientId, phone, message } = body;

    if (!phone || !message?.trim()) {
      return NextResponse.json({ success: false, message: "phone and message are required" }, { status: 400 });
    }

    await sendWhatsAppText(
      user.organizationId,
      phone,
      message.trim(),
      patientId || undefined,
      "MANUAL"
    );

    return NextResponse.json({ success: true, message: "Message sent successfully" });
  } catch (error: any) {
    console.error("Manual Send Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST", "STAFF", "NURSE"])(postHandler as any);

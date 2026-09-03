import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Patient from "@/app/models/Patient";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { sendWhatsAppText, sendWhatsAppTemplate } from "@/app/utils/whatsappService";

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const { messageContent, audienceType, patientId, templateName, templateParams } = await req.json();

    if (!user.organizationId) {
       return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const organizationId = user.organizationId;

    let recipients = [];

    if (audienceType === "specific") {
      if (!patientId) {
        return NextResponse.json({ success: false, message: "Patient ID is required for specific audience" }, { status: 400 });
      }
      const patient = await Patient.findOne({ _id: patientId, organizationId });
      if (!patient) {
        return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
      }
      recipients.push({ patientId: patient._id.toString(), phone: patient.phone });
    } else {
      // Broadcast to all
      const allPatients = await Patient.find({ organizationId });
      recipients = allPatients.map(p => ({ patientId: p._id.toString(), phone: p.phone }));
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, message: "No recipients found" }, { status: 400 });
    }

    const results = [];
    for (const recipient of recipients) {
      try {
        if (!recipient.phone) continue;

        let res;
        if (templateName) {
           res = await sendWhatsAppTemplate(
              organizationId,
              recipient.phone,
              templateName,
              templateParams || [],
              recipient.patientId
           );
        } else if (messageContent) {
           res = await sendWhatsAppText(
              organizationId,
              recipient.phone,
              messageContent,
              recipient.patientId
           );
        } else {
           throw new Error("Either templateName or messageContent must be provided");
        }
        
        results.push({ patientId: recipient.patientId, success: true, metaMessageId: res?.messages?.[0]?.id });
      } catch (e: any) {
         results.push({ patientId: recipient.patientId, success: false, error: e.message });
      }
    }

    const failedCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: failedCount === 0,
      message: `Processed ${recipients.length} recipients. Failed: ${failedCount}`,
      data: results
    });
  } catch (error: any) {
    console.error("WhatsApp Send Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST"])(postHandler as any);

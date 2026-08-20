import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageLog from "@/app/models/MessageLog";
import Patient from "@/app/models/Patient";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { messageContent, audienceType, patientId, messageType } = await req.json();

    if (!messageContent) {
      return NextResponse.json({ success: false, message: "Message content is required" }, { status: 400 });
    }

    let recipients = [];

    if (audienceType === "specific") {
      if (!patientId) {
        return NextResponse.json({ success: false, message: "Patient ID is required for specific audience" }, { status: 400 });
      }
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
      }
      recipients.push({ patientId: patient._id, phone: patient.phone });
    } else {
      // Broadcast to all
      const allPatients = await Patient.find({});
      recipients = allPatients.map(p => ({ patientId: p._id, phone: p.phone }));
    }

    // Mock WhatsApp dispatch and log to DB
    const logs = [];
    for (const recipient of recipients) {
      const log = await MessageLog.create({
        patientId: recipient.patientId,
        recipientPhone: recipient.phone || "0000000000",
        messageType: messageType || "CAMPAIGN",
        content: messageContent,
        status: "DELIVERED",
        sentAt: new Date(),
        metaMessageId: `mock_${Math.random().toString(36).substring(7)}`
      });
      logs.push(log);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully dispatched to ${recipients.length} recipients.`,
      data: logs
    });
  } catch (error: any) {
    console.error("WhatsApp Send Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

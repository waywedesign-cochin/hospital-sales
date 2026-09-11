import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/app/lib/dbConnect";
import Patient from "@/app/models/Patient";
import Organization from "@/app/models/Organization";
import MessageQueue from "@/app/models/MessageQueue";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const { messageContent, audienceType, patientId, templateName, templateParams, messageType } = await req.json();

    if (!user.organizationId) {
       return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const organizationId = user.organizationId;
    const org = await Organization.findById(organizationId).lean();
    const hospitalName = org?.name || "The Clinic";

    let recipients: { patientId: string; phone: string; firstName?: string }[] = [];

    if (audienceType === "specific") {
      if (!patientId) {
        return NextResponse.json({ success: false, message: "Patient ID is required for specific audience" }, { status: 400 });
      }
      const patient = await Patient.findOne({ _id: patientId, organizationId });
      if (!patient) {
        return NextResponse.json({ success: false, message: "Patient not found" }, { status: 404 });
      }
      recipients.push({ patientId: patient._id.toString(), phone: patient.phone, firstName: patient.firstName });
    } else if (audienceType === "birthday") {
      // Patients whose birthday is today (any birth year). Re-resolved here
      // rather than trusting a client-supplied list, and firstName is left
      // out on purpose — the "firstName || 'Patient'" fallback below then
      // keeps the message generic, as intended for a same-day mass wish.
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const birthdayPatients = await Patient.find({
        organizationId,
        dateOfBirth: { $exists: true, $ne: null },
        $expr: {
          $and: [
            { $eq: [{ $month: "$dateOfBirth" }, month] },
            { $eq: [{ $dayOfMonth: "$dateOfBirth" }, day] },
          ],
        },
      });
      recipients = birthdayPatients.map(p => ({ patientId: p._id.toString(), phone: p.phone }));
    } else {
      // Broadcast to all
      const allPatients = await Patient.find({ organizationId });
      recipients = allPatients.map(p => ({ patientId: p._id.toString(), phone: p.phone, firstName: p.firstName }));
    }

    if (recipients.length === 0) {
      return NextResponse.json({ success: false, message: "No recipients found" }, { status: 400 });
    }

    const batchId = crypto.randomUUID();

    // Build the queue documents
    const queueDocs = recipients.map(recipient => {
      const firstName = recipient.firstName || "Patient";
      const dynamicParams = [
        firstName,
        messageContent || "",
        hospitalName
      ];

      return {
        organizationId,
        patientId: recipient.patientId,
        recipientPhone: recipient.phone,
        templateName: templateName || undefined,
        templateParams: templateName ? (templateParams || dynamicParams) : undefined,
        // Kept even for template sends so the worker can log the actual composed
        // text instead of just the template's name (see sendWhatsAppTemplate's
        // displayContent param).
        messageContent: messageContent || undefined,
        messageType: messageType || "CAMPAIGN",
        status: "PENDING",
        batchId
      };
    });

    // Insert all into the queue instantly
    await MessageQueue.insertMany(queueDocs);

    // Fire-and-forget: Trigger the worker in the background
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = `${protocol}://${host}`;
    
    fetch(`${baseUrl}/api/whatsapp/worker`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    }).catch(err => console.error("Failed to trigger background worker:", err));

    return NextResponse.json({
      success: true,
      message: `Successfully queued ${recipients.length} messages for background dispatch.`,
      data: { queuedCount: recipients.length }
    });
  } catch (error: any) {
    console.error("WhatsApp Send Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST", "STAFF", "NURSE"])(postHandler as any);

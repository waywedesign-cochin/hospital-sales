import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageLog from "@/app/models/MessageLog";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import mongoose from "mongoose";

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();

    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const orgId = new mongoose.Types.ObjectId(user.organizationId);
    const sp    = req.nextUrl.searchParams;

    const batchId   = sp.get("batchId");
    const groupKey  = sp.get("groupKey");   // fuzzy key for old logs without batchId
    const patientId = sp.get("patientId");
    const phone     = sp.get("phone");

    // ── GROUP: by batchId ────────────────────────────────────────────────
    if (batchId) {
      const messages = await MessageLog.find({
        organizationId: orgId,
        batchId,
      })
        .populate("patientId", "firstName lastName phone")
        .sort({ createdAt: 1 })
        .lean();
      return NextResponse.json({ success: true, data: messages, mode: "group" });
    }

    // ── GROUP: by fuzzy groupKey (minute + type + content) ───────────────
    if (groupKey) {
      // groupKey format: "2026-09-08T17:10|CAMPAIGN|Template: appointment_reminder"
      const [minuteBucket, messageType, ...contentParts] = groupKey.split("|");
      const content = contentParts.join("|"); // rejoin in case content had pipes

      // find all messages in that minute window + matching type + content
      const bucketStart = new Date(minuteBucket + ":00.000Z");
      const bucketEnd   = new Date(bucketStart.getTime() + 60_000); // +1 minute

      const messages = await MessageLog.find({
        organizationId: orgId,
        messageType: messageType as "REMINDER" | "BOOKING_CONFIRMATION" | "CAMPAIGN" | "MANUAL",
        content,
        $or: [
          { sentAt:    { $gte: bucketStart, $lt: bucketEnd } },
          { createdAt: { $gte: bucketStart, $lt: bucketEnd } },
        ],
      })
        .populate("patientId", "firstName lastName phone")
        .sort({ createdAt: 1 })
        .lean();

      return NextResponse.json({ success: true, data: messages, mode: messages.length > 1 ? "group" : "individual" });
    }

    // ── INDIVIDUAL: by patientId or phone ────────────────────────────────
    const matchQuery: any = { organizationId: orgId };

    if (patientId)      matchQuery.patientId      = new mongoose.Types.ObjectId(patientId);
    else if (phone)     matchQuery.recipientPhone = phone;
    else return NextResponse.json({ success: false, message: "batchId, groupKey, patientId or phone is required" }, { status: 400 });

    const messages = await MessageLog.find(matchQuery)
      .sort({ createdAt: 1 })
      .limit(200)
      .lean();

    return NextResponse.json({ success: true, data: messages, mode: "individual" });
  } catch (error: any) {
    console.error("Fetch Chat History Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST", "STAFF", "NURSE"])(getHandler as any);

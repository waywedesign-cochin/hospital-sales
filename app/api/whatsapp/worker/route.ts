import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageQueue from "@/app/models/MessageQueue";
import { sendWhatsAppText, sendWhatsAppTemplate } from "@/app/utils/whatsappService";

// Prevent Vercel from caching this route or timing it out too quickly if possible
export const maxDuration = 60; // 60 seconds is max for hobby, adjust if on Pro
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // 1. Fetch up to 50 pending messages
    // We limit to 50 to ensure we don't hit the Vercel function timeout
    const pendingMessages = await MessageQueue.find({ status: "PENDING" }).limit(50);
    
    if (pendingMessages.length === 0) {
      return NextResponse.json({ success: true, message: "Queue is empty" });
    }

    // 2. Mark them as PROCESSING immediately so another worker doesn't pick them up
    const messageIds = pendingMessages.map(m => m._id);
    await MessageQueue.updateMany(
      { _id: { $in: messageIds } },
      { $set: { status: "PROCESSING" } }
    );

    // 3. Process them concurrently
    // We use Promise.allSettled to ensure one failure doesn't stop the rest
    const results = await Promise.allSettled(
      pendingMessages.map(async (msg) => {
        try {
          if (msg.templateName) {
            await sendWhatsAppTemplate(
              msg.organizationId.toString(),
              msg.recipientPhone,
              msg.templateName,
              msg.templateParams || [],
              msg.patientId?.toString(),
              msg.messageType as any
            );
          } else if (msg.messageContent) {
            await sendWhatsAppText(
              msg.organizationId.toString(),
              msg.recipientPhone,
              msg.messageContent,
              msg.patientId?.toString(),
              msg.messageType as any
            );
          } else {
            throw new Error("Missing templateName and messageContent");
          }

          // Mark as completed
          await MessageQueue.findByIdAndUpdate(msg._id, { status: "COMPLETED" });
          return { id: msg._id, status: 'success' };
        } catch (error: any) {
          // Mark as failed and log error
          const errorMsg = error.message || "Unknown error";
          await MessageQueue.findByIdAndUpdate(msg._id, { 
            status: "FAILED",
            errorDetails: errorMsg 
          });
          return { id: msg._id, status: 'failed', error: errorMsg };
        }
      })
    );

    // 4. Check if there are more pending messages
    const morePendingCount = await MessageQueue.countDocuments({ status: "PENDING" });
    
    if (morePendingCount > 0) {
      // Fire-and-forget to trigger the next batch
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      const host = req.headers.get("host");
      const baseUrl = `${protocol}://${host}`;
      
      fetch(`${baseUrl}/api/whatsapp/worker`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      }).catch(err => console.error("Failed to trigger next worker batch:", err));
    }

    return NextResponse.json({
      success: true,
      processedCount: pendingMessages.length,
      morePending: morePendingCount > 0
    });
  } catch (error: any) {
    console.error("WhatsApp Worker Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

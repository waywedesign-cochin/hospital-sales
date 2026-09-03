import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageLog from "@/app/models/MessageLog";
import Organization from "@/app/models/Organization";
import { verifyWebhookSignature } from "@/app/utils/whatsappService";

export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("WhatsApp Webhook Verified!");
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Read raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
       console.error("Invalid Webhook Signature");
       return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.object !== "whatsapp_business_account") {
      return NextResponse.json({ success: false }, { status: 404 });
    }

    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.value && change.value.statuses) {
          const phoneNumberId = change.value.metadata.phone_number_id;
          
          // Find which organization this belongs to
          const org = await Organization.findOne({ "whatsapp.phoneNumberId": phoneNumberId }).lean();
          
          if (!org) {
             console.warn(`Webhook received for unknown phoneNumberId: ${phoneNumberId}`);
             continue;
          }

          for (const status of change.value.statuses) {
            const metaMessageId = status.id;
            const deliveryStatus = status.status; // 'sent', 'delivered', 'read', 'failed'
            
            let mappedStatus = 'PENDING';
            if (deliveryStatus === 'sent') mappedStatus = 'SENT';
            else if (deliveryStatus === 'delivered') mappedStatus = 'DELIVERED';
            else if (deliveryStatus === 'read') mappedStatus = 'READ';
            else if (deliveryStatus === 'failed') mappedStatus = 'FAILED';

            await MessageLog.findOneAndUpdate(
              { metaMessageId, organizationId: org._id },
              { 
                $set: { 
                  status: mappedStatus,
                  errorDetails: status.errors ? JSON.stringify(status.errors) : undefined
                } 
              }
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("WhatsApp Webhook Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { submitTemplate, getTemplateStatus } from "@/app/utils/whatsappService";

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const { organizationId, templateName, templatePayload } = await req.json();

    if (!organizationId || !templateName || !templatePayload) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const org = await Organization.findById(organizationId);
    if (!org || !org.whatsapp) {
      return NextResponse.json({ success: false, message: "Organization or WhatsApp config not found" }, { status: 404 });
    }

    const result = await submitTemplate(organizationId, templatePayload);

    org.whatsapp.templateName = templateName;
    org.whatsapp.templateStatus = 'PENDING';
    await org.save();

    return NextResponse.json({ success: true, message: "Template submitted successfully", data: result });
  } catch (error: any) {
    console.error("Submit Template Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const organizationId = req.nextUrl.searchParams.get("organizationId");
    const templateName = req.nextUrl.searchParams.get("templateName");

    if (!organizationId || !templateName) {
      return NextResponse.json({ success: false, message: "Organization ID and templateName are required" }, { status: 400 });
    }

    const org = await Organization.findById(organizationId);
    if (!org || !org.whatsapp) {
      return NextResponse.json({ success: false, message: "Organization or WhatsApp config not found" }, { status: 404 });
    }

    const result = await getTemplateStatus(organizationId, templateName);
    
    // Determine status from Meta's response
    const metaStatus = result.data?.[0]?.status; // Meta returns 'APPROVED', 'REJECTED', 'PENDING' etc.

    if (metaStatus && (metaStatus === 'APPROVED' || metaStatus === 'REJECTED' || metaStatus === 'PENDING')) {
       org.whatsapp.templateStatus = metaStatus;
       await org.save();
    }

    return NextResponse.json({
      success: true,
      data: result,
      currentStatus: org.whatsapp.templateStatus
    });
  } catch (error: any) {
    console.error("Get Template Status Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["PLATFORM_ADMIN"])(postHandler as any);
export const GET = withAuth(["PLATFORM_ADMIN"])(getHandler as any);

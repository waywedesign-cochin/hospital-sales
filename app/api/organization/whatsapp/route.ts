import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { encrypt } from "@/app/utils/crypto";

async function postHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    let { organizationId, accessToken, wabaId, phoneNumberId, verifyToken } = await req.json();
    organizationId = organizationId || user.organizationId;

    if (!organizationId || !accessToken || !wabaId || !phoneNumberId) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    if (user.role !== "PLATFORM_ADMIN" && user.organizationId !== organizationId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
    }

    const encryptedToken = encrypt(accessToken);

    org.whatsapp = {
      accessToken: encryptedToken,
      wabaId,
      phoneNumberId,
      verifyToken: verifyToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
      isActive: true,
      connectedAt: new Date(),
    };

    await org.save();

    return NextResponse.json({ success: true, message: "WhatsApp credentials saved successfully" });
  } catch (error: any) {
    console.error("Save WhatsApp Config Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const organizationId = req.nextUrl.searchParams.get("organizationId") || user.organizationId;

    if (!organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is required" }, { status: 400 });
    }

    if (user.role !== "PLATFORM_ADMIN" && user.organizationId !== organizationId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const org = await Organization.findById(organizationId).lean();
    if (!org) {
      return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
    }

    if (!org.whatsapp) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        wabaId: org.whatsapp.wabaId,
        phoneNumberId: org.whatsapp.phoneNumberId,
        isActive: org.whatsapp.isActive,
        templateStatus: org.whatsapp.templateStatus,
        templateName: org.whatsapp.templateName,
        connectedAt: org.whatsapp.connectedAt,
      },
    });
  } catch (error: any) {
    console.error("Get WhatsApp Config Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

async function deleteHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    const organizationId = req.nextUrl.searchParams.get("organizationId") || user.organizationId;

    if (!organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is required" }, { status: 400 });
    }

    if (user.role !== "PLATFORM_ADMIN" && user.organizationId !== organizationId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const org = await Organization.findById(organizationId);
    if (!org) {
      return NextResponse.json({ success: false, message: "Organization not found" }, { status: 404 });
    }

    org.whatsapp = undefined;
    await org.save();

    return NextResponse.json({ success: true, message: "WhatsApp credentials removed successfully" });
  } catch (error: any) {
    console.error("Delete WhatsApp Config Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const POST = withAuth(["PLATFORM_ADMIN", "ADMIN"])(postHandler as any);
export const GET = withAuth(["PLATFORM_ADMIN", "ADMIN"])(getHandler as any);
export const DELETE = withAuth(["PLATFORM_ADMIN", "ADMIN"])(deleteHandler as any);

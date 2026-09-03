import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageLog from "@/app/models/MessageLog";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();

    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const organizationId = user.organizationId;
    
    // Optional pagination via searchParams
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const logs = await MessageLog.find({ organizationId })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstName lastName phone")
      .lean();

    const totalCount = await MessageLog.countDocuments({ organizationId });

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit)
        }
      }
    });
  } catch (error: any) {
    console.error("Fetch WhatsApp Logs Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST"])(getHandler as any);

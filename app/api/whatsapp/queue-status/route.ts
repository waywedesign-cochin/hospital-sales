import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import Patient from "@/app/models/Patient";
import MessageQueue from "@/app/models/MessageQueue";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";

export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    
    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const pendingCount = await MessageQueue.countDocuments({
      organizationId: user.organizationId,
      status: { $in: ["PENDING", "PROCESSING"] }
    });

    const completedCount = await MessageQueue.countDocuments({
      organizationId: user.organizationId,
      status: "COMPLETED"
    });

    const failedCount = await MessageQueue.countDocuments({
      organizationId: user.organizationId,
      status: "FAILED"
    });

    return NextResponse.json({
      success: true,
      data: {
        pendingCount,
        completedCount,
        failedCount
      }
    });
  } catch (error: any) {
    console.error("Queue Status Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST"])(getHandler as any);

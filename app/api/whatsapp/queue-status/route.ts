import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import Patient from "@/app/models/Patient";
import MessageQueue from "@/app/models/MessageQueue";
import User from "@/app/models/User";
import Appointment from "@/app/models/Appointment";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { resolveDoctorScope, RequestingUser } from "@/app/utils/DoctorScope";

export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();
    
    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const requestingUser: RequestingUser = { _id: user._id, role: user.role as RequestingUser["role"] };
    if (user.role === "STAFF") {
      const userDoc = await User.findById(user._id).select("assignedDoctors");
      requestingUser.assignedDoctors = userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
    }

    const doctorScope = await resolveDoctorScope(user.organizationId, requestingUser);

    if (doctorScope && doctorScope.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          pendingCount: 0,
          completedCount: 0,
          failedCount: 0
        }
      });
    }

    const matchQuery: any = { organizationId: user.organizationId };

    if (doctorScope) {
      const patientIds = await Appointment.distinct("patientId", {
        organizationId: user.organizationId,
        doctor: { $in: doctorScope },
      });
      matchQuery.patientId = { $in: patientIds };
    }

    const pendingCount = await MessageQueue.countDocuments({
      ...matchQuery,
      organizationId: user.organizationId,
      status: { $in: ["PENDING", "PROCESSING"] }
    });

    const completedCount = await MessageQueue.countDocuments({
      ...matchQuery,
      status: "COMPLETED"
    });

    const failedCount = await MessageQueue.countDocuments({
      ...matchQuery,
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

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST", "STAFF", "NURSE"])(getHandler as any);

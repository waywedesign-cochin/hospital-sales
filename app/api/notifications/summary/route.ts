import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/app/lib/dbConnect";
import Enquiry from "@/app/models/Enquiry";
import MessageLog from "@/app/models/MessageLog";
import Appointment from "@/app/models/Appointment";
import User from "@/app/models/User";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { resolveDoctorScope, RequestingUser } from "@/app/utils/DoctorScope";

const ITEM_LIMIT = 5;

// What each role is allowed to see mirrors the existing sidebar/nav rules
// (Leads is hidden for DOCTOR and scoped STAFF; WhatsApp management is
// admin-only) rather than inventing new exposure just for this widget.
async function getHandler(_req: NextRequest, user: AuthUser) {
  await dbConnect();

  if (!user.organizationId) {
    return NextResponse.json(
      { success: false, message: "Organization ID is missing" },
      { status: 400 },
    );
  }

  const orgId = new mongoose.Types.ObjectId(user.organizationId);

  const requestingUser: RequestingUser = {
    _id: user._id,
    role: user.role as RequestingUser["role"],
  };
  if (user.role === "STAFF") {
    const userDoc = await User.findById(user._id).select("assignedDoctors");
    requestingUser.assignedDoctors =
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
  }

  const isScopedStaff =
    user.role === "STAFF" && (requestingUser.assignedDoctors?.length ?? 0) > 0;
  const canSeeEnquiries =
    user.role === "ADMIN" || (user.role === "STAFF" && !isScopedStaff);
  const canSeeMessageFailures = user.role === "ADMIN";

  const doctorScope = await resolveDoctorScope(user.organizationId, requestingUser);

  const [
    newEnquiryItems,
    newEnquiryCount,
    failedMessageItems,
    failedMessageCount,
    todaysAppointmentsCount,
  ] = await Promise.all([
    canSeeEnquiries
      ? Enquiry.find({ organizationId: orgId, status: "NEW" })
          .sort({ createdAt: -1 })
          .limit(ITEM_LIMIT)
          .select("firstName lastName treatmentCategory createdAt")
          .lean()
      : Promise.resolve([]),
    canSeeEnquiries
      ? Enquiry.countDocuments({ organizationId: orgId, status: "NEW" })
      : Promise.resolve(0),

    canSeeMessageFailures
      ? MessageLog.find({ organizationId: orgId, status: "FAILED" })
          .sort({ createdAt: -1 })
          .limit(ITEM_LIMIT)
          .select("recipientPhone content createdAt")
          .lean()
      : Promise.resolve([]),
    canSeeMessageFailures
      ? MessageLog.countDocuments({ organizationId: orgId, status: "FAILED" })
      : Promise.resolve(0),

    (async () => {
      if (doctorScope && doctorScope.length === 0) return 0;

      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const filter: any = {
        organizationId: user.organizationId,
        date: { $gte: start, $lte: end },
        status: { $ne: "CANCELLED" },
      };
      if (doctorScope) filter.doctor = { $in: doctorScope };

      return Appointment.countDocuments(filter);
    })(),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      newEnquiries: { count: newEnquiryCount, items: newEnquiryItems },
      failedMessages: { count: failedMessageCount, items: failedMessageItems },
      todaysAppointments: { count: todaysAppointmentsCount },
    },
  });
}

export const GET = withAuth(["ADMIN", "DOCTOR", "STAFF", "NURSE"])(
  getHandler as any,
);

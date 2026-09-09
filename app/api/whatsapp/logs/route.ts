import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import MessageLog from "@/app/models/MessageLog";
import User from "@/app/models/User";
import Appointment from "@/app/models/Appointment";
import { withAuth, AuthUser } from "@/app/middlewares/withAuth";
import { resolveDoctorScope, RequestingUser } from "@/app/utils/DoctorScope";
import mongoose from "mongoose";

async function getHandler(req: NextRequest, user: AuthUser) {
  try {
    await dbConnect();

    if (!user.organizationId) {
      return NextResponse.json({ success: false, message: "Organization ID is missing" }, { status: 400 });
    }

    const orgId = new mongoose.Types.ObjectId(user.organizationId);
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page  = parseInt(searchParams.get("page")  || "1");

    let requestingUser: RequestingUser = { _id: user._id, role: user.role as RequestingUser["role"] };
    if (user.role === "STAFF") {
      const userDoc = await User.findById(user._id).select("assignedDoctors");
      requestingUser.assignedDoctors = userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
    }

    const doctorScope = await resolveDoctorScope(user.organizationId, requestingUser);
    
    if (doctorScope && doctorScope.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          logs: [],
          pagination: { totalCount: 0, page, limit, totalPages: 0 },
        },
      });
    }

    const matchStage: any = { organizationId: orgId };

    if (doctorScope) {
      const patientIds = await Appointment.distinct("patientId", {
        organizationId: user.organizationId,
        doctor: { $in: doctorScope },
      });
      matchStage.patientId = { $in: patientIds };
    }

    /**
     * Grouping strategy: one row per patient (or per phone, for legacy logs
     * with no patientId), like a conversations inbox — not one row per send
     * event. Sorting newest-first before $group lets $first pull each
     * patient's most recent message for the row; totalMessages/failedCount
     * are summed across their entire history, not just this one send.
     */
    const pipeline: any[] = [
      { $match: matchStage },
      { $sort: { createdAt: -1 } },
      {
        $addFields: {
          conversationKey: {
            $cond: {
              if: { $ne: ["$patientId", null] },
              then: { $concat: ["patient:", { $toString: "$patientId" }] },
              else: { $concat: ["phone:", "$recipientPhone"] },
            },
          },
        },
      },
      {
        $group: {
          _id:              "$conversationKey",
          patientId:        { $first: "$patientId" },
          recipientPhone:   { $first: "$recipientPhone" },
          lastMessageType:  { $first: "$messageType" },
          lastContent:      { $first: "$content" },
          lastStatus:       { $first: "$status" },
          lastErrorDetails: { $first: "$errorDetails" },
          lastSentAt:       { $first: { $ifNull: ["$sentAt", "$createdAt"] } },
          lastCreatedAt:    { $first: "$createdAt" },
          totalMessages:    { $sum: 1 },
          failedCount:      { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
        },
      },
      { $sort: { lastSentAt: -1, lastCreatedAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "patients",
                localField: "patientId",
                foreignField: "_id",
                as: "patientDetails",
              },
            },
            {
              $unwind: { path: "$patientDetails", preserveNullAndEmptyArrays: true },
            },
          ],
        },
      },
    ];

    const result    = await MessageLog.aggregate(pipeline);
    const logs      = result[0]?.data ?? [];
    const totalCount = result[0]?.metadata?.[0]?.total ?? 0;

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: { totalCount, page, limit, totalPages: Math.ceil(totalCount / limit) },
      },
    });
  } catch (error: any) {
    console.error("Fetch WhatsApp Logs Error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST", "STAFF", "NURSE"])(getHandler as any);

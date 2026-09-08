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
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "50");
    const page  = parseInt(searchParams.get("page")  || "1");

    /**
     * Grouping strategy:
     *  1. If a message has a batchId  → group by batchId  (exact campaign)
     *  2. If no batchId               → fuzzy-group by (minute-bucket + messageType + content)
     *     Messages sent within the same minute with the same template/content are
     *     assumed to be from the same manual or automated broadcast.
     */
    const pipeline: any[] = [
      { $match: { organizationId: orgId } },
      {
        $addFields: {
          // minute-level bucket: "2026-09-08T17:10"
          minuteBucket: {
            $dateToString: {
              format: "%Y-%m-%dT%H:%M",
              date: { $ifNull: ["$sentAt", "$createdAt"] },
            },
          },
        },
      },
      {
        $addFields: {
          // groupKey = batchId if present, else minuteBucket + messageType + content
          groupKey: {
            $cond: {
              if: { $and: [{ $ne: ["$batchId", null] }, { $ne: ["$batchId", ""] }, { $gt: ["$batchId", null] }] },
              then: "$batchId",
              else: { $concat: ["$minuteBucket", "|", "$messageType", "|", "$content"] },
            },
          },
        },
      },
      {
        $group: {
          _id:         "$groupKey",
          batchId:     { $first: "$batchId" },
          groupKey:    { $first: "$groupKey" },
          createdAt:   { $max: "$createdAt" },
          sentAt:      { $max: "$sentAt" },
          messageType: { $first: "$messageType" },
          content:     { $first: "$content" },
          totalCount:  { $sum: 1 },
          failedCount: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
          sentCount:   { $sum: { $cond: [{ $in: ["$status", ["SENT", "DELIVERED", "READ"]] }, 1, 0] } },
          allPatientIds:   { $push: "$patientId" },
          firstPatientId:      { $first: "$patientId" },
          firstRecipientPhone: { $first: "$recipientPhone" },
          firstErrorDetails:   { $first: "$errorDetails" },
          firstStatus:         { $first: "$status" },
        },
      },
      { $sort: { sentAt: -1, createdAt: -1 } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $lookup: {
                from: "patients",
                localField: "firstPatientId",
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

export const GET = withAuth(["ADMIN", "DOCTOR", "RECEPTIONIST"])(getHandler as any);

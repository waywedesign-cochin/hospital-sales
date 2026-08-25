import ActivityLog from "../models/ActivityLog";
import { sendApiResponse } from "../utils/nextResponseHandler";
import mongoose from "mongoose";

export const logActivity = async (
  clinicId: string | mongoose.Types.ObjectId,
  userId: string | mongoose.Types.ObjectId,
  action: string,
  resourceType: string,
  details: string,
  resourceId?: string | mongoose.Types.ObjectId
) => {
  try {
    await ActivityLog.create({
      clinicId,
      userId,
      action,
      resourceType,
      details,
      resourceId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

export const getActivityLogs = async (
  clinicId: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const totalCount = await ActivityLog.countDocuments({ clinicId });
  const logs = await ActivityLog.find({ clinicId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "firstName lastName role")
    .lean();

  return sendApiResponse(true, "Logs fetched successfully", {
    logs,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

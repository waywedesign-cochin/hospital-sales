import ActivityLog from "../models/ActivityLog";
import { sendApiResponse } from "../utils/nextResponseHandler";

export const getActivityLogs = async (
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const totalCount = await ActivityLog.countDocuments();
  const logs = await ActivityLog.find()
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

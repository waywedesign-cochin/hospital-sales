import ActivityLog from "../models/ActivityLog";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import mongoose from "mongoose";

export const logActivity = async (
  organizationId: string | mongoose.Types.ObjectId,
  userId: string | mongoose.Types.ObjectId,
  action: string,
  resourceType: string,
  details: string,
  resourceId?: string | mongoose.Types.ObjectId
) => {
  try {
    await ActivityLog.create({
      organizationId,
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
  organizationId: string,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  // Build the match query
  let matchQuery: any = { organizationId: new mongoose.Types.ObjectId(organizationId) };

  if (search) {
    const searchRegex = { $regex: search, $options: "i" };
    
    // Find users matching the search query to include in the $or clause
    const mongoose = require("mongoose");
    const User = mongoose.model("User");
    const matchingUsers = await User.find({
      organizationId,
      $or: [
        { firstName: searchRegex },
        { lastName: searchRegex },
      ],
    }).select("_id");
    
    const userIds = matchingUsers.map((u: any) => u._id);

    matchQuery.$or = [
      { action: searchRegex },
      { resourceType: searchRegex },
      { details: searchRegex },
      { userId: { $in: userIds } },
    ];
  }

  const totalCount = await ActivityLog.countDocuments(matchQuery);
  const logs = await ActivityLog.find(matchQuery)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "firstName lastName role")
    .lean();

  return sendResponse(true, "Logs fetched successfully", {
    logs,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

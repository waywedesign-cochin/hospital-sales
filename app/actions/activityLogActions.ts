"use server";

import { getActivityLogs } from "../controllers/activityLogController";
import { requireAuth } from "../lib/auth";
import { dbConnect } from "../lib/dbConnect";

export const getActivityLogsAction = async (page: number = 1, limit: number = 20, search?: string) => {
  try {
    await dbConnect();
    const user = await requireAuth();
    if (user.role !== "ADMIN" && user.role !== "PLATFORM_ADMIN") {
      throw new Error("Unauthorized");
    }
    const response = await getActivityLogs(user.organizationId, page, limit, search);
    return JSON.parse(JSON.stringify(response));
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

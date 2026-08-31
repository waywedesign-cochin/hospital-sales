"use server";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import {
  getPlatformOverview,
  getAllOrganizations,
  getAllPlatformUsers,
} from "../controllers/platformController";
import { sendResponse } from "../utils/responseHandler";

export const getPlatformOverviewAction = async () => {
  try {
    await dbConnect();
    const user = await requireAuth("PLATFORM_ADMIN");
    return await getPlatformOverview();
  } catch (error: any) {
    return sendResponse(false, error.message || "Failed to fetch overview");
  }
};

export const getAllOrganizationsAction = async (page: number, limit: number, search: string = "") => {
  try {
    await dbConnect();
    const user = await requireAuth("PLATFORM_ADMIN");
    return await getAllOrganizations(page, limit, search);
  } catch (error: any) {
    return sendResponse(false, error.message || "Failed to fetch organizations");
  }
};

export const getAllPlatformUsersAction = async (page: number, limit: number, search: string = "", role: string = "") => {
  try {
    await dbConnect();
    const user = await requireAuth("PLATFORM_ADMIN");
    return await getAllPlatformUsers(page, limit, search, role);
  } catch (error: any) {
    return sendResponse(false, error.message || "Failed to fetch users");
  }
};

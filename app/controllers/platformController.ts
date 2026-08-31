import Organization from "../models/Organization";
import User from "../models/User";
import { sendResponse } from "../utils/responseHandler";

export const getPlatformOverview = async () => {
  const totalOrganizations = await Organization.countDocuments();
  const totalUsers = await User.countDocuments();
  
  // Free Trial active subscriptions + explicitly ACTIVE
  const activeOrganizations = await Organization.countDocuments({
    subscriptionStatus: { $in: ["ACTIVE", "TRIAL"] }
  });
  
  const recentOrganizations = await Organization.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();
  
  return sendResponse(true, "Platform overview retrieved", {
    totalOrganizations,
    totalUsers,
    activeOrganizations,
    recentOrganizations,
  });
};

export const getAllOrganizations = async (page: number, limit: number, search: string = "") => {
  const query: any = {};
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }
  
  const skip = (page - 1) * limit;
  const organizations = await Organization.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const totalCount = await Organization.countDocuments(query);
  
  return sendResponse(true, "Organizations retrieved", {
    organizations,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

export const getAllPlatformUsers = async (page: number, limit: number, search: string = "", role: string = "") => {
  const query: any = {};
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role && role !== "ALL") {
    query.role = role;
  }
  
  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .populate("organizationId", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const totalCount = await User.countDocuments(query);
  
  return sendResponse(true, "Users retrieved", {
    users,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
};

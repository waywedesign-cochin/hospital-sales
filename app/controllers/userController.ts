// app/controllers/userController.ts
import { cookies } from "next/headers";
import User from "../models/User";
import { sendApiResponse } from "../utils/nextResponseHandler";
import { sendResponse } from "../utils/responseHandler";
import { logActivity } from "./activityLogController";
import { verifyJwt } from "../lib/jwt";

interface DecodedToken {
  _id: string;
}

// ================= GET CURRENT USER =================
export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return sendResponse(false, "No token provided", null);
    }

    let decoded: DecodedToken;

    try {
      decoded = verifyJwt(token) as DecodedToken;
    } catch {
      return sendResponse(false, "Invalid or expired token", null);
    }

    const userDoc = await User.findById(decoded._id).select("-password");

    if (!userDoc) {
      return sendResponse(false, "User not found", null);
    }

    //  Convert Mongo document to frontend-safe User object
    const user = {
      _id: userDoc._id.toString(),
      clinicId: userDoc.clinicId?.toString() || null,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      role: userDoc.role,
    };

    return sendResponse(true, "User fetched successfully", user);
  } catch (error) {
    console.error("Get Current User Error:", error);
    return sendResponse(false, "Server error", null);
  }
};

// ================= GET USERS =================
export const getUsers = async (
  clinicId: string,
  page: number,
  limit: number,
  role?: string,
  search?: string
) => {
  try {
    const skip = (page - 1) * limit;
    let whereClause: any = { clinicId };
    if (role) {
      whereClause.role = role;
    }
    if (search) {
      whereClause.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const totalCount = await User.countDocuments(whereClause);
    const users = await User.find(whereClause)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Convert Mongo documents to frontend-safe User objects
    const userList = users.map((userDoc) => ({
      _id: userDoc._id.toString(),
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    }));

    return sendResponse(true, "Users fetched successfully", {
      users: userList,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    return sendResponse(false, "Server error", null);
  }
};

// ================= GET USER BY ID =================
export const getUserById = async (clinicId: string, id: string) => {
  try {

    const userDoc = await User.findOne({ _id: id, clinicId }).select("-password");

    if (!userDoc) {
      return sendResponse(false, "User not found", null);
    }

    // Convert Mongo document to frontend-safe User object
    const user = {
      _id: userDoc._id.toString(),
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };

    return sendResponse(true, "User fetched successfully", user);
  } catch (error) {
    console.error("Get User by ID Error:", error);
    return sendResponse(false, "Server error", null);
  }
};

// ================= UPDATE USER =================
export const updateUser = async (
  clinicId: string,
  id: string,
  userId: string,
  data: { firstName?: string; lastName?: string; email?: string; role?: string }
) => {
  try {
    const user = await User.findOne({ _id: id, clinicId });
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

    if (userId) {
      await logActivity(
        clinicId,
        userId,
        "UPDATED_USER",
        "User",
        `Updated user profile for ${updatedUser?.firstName} ${updatedUser?.lastName || ""}`.trim(),
        id
      );
    }

    return sendResponse(true, "User updated successfully", updatedUser);
  } catch (err) {
    console.error("Update User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

// ================= DELETE USER =================
export const deleteUser = async (clinicId: string, id: string, userId: string) => {
  try {
    const user = await User.findOne({ _id: id, clinicId });
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    await User.findByIdAndDelete(id);

    if (userId) {
      await logActivity(
        clinicId,
        userId,
        "DELETED_USER",
        "User",
        `Deleted user profile for ${user.firstName} ${user.lastName || ""}`.trim(),
        id
      );
    }

    return sendResponse(true, "User deleted successfully", null);
  } catch (err) {
    console.error("Delete User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

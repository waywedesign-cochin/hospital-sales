// app/controllers/userController.ts
import { cookies } from "next/headers";
import User from "@/app/models/User";
import { sendResponse } from "@/app/utils/responseHandler";
import { dbConnect } from "@/app/lib/dbConnect";
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
  page: number,
  limit: number,
  role?: string,
  search?: string
) => {
  try {
    const skip = (page - 1) * limit;
    let whereClause: any = {};
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
export const getUserById = async (id: string) => {
  try {

    const userDoc = await User.findById({ _id: id }).select("-password");

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
  id: string,
  data: { firstName?: string; lastName?: string; email?: string; role?: string }
) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });

    return sendResponse(true, "User updated successfully", updatedUser);
  } catch (err) {
    console.error("Update User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

// ================= DELETE USER =================
export const deleteUser = async (id: string) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    await User.findByIdAndDelete(id);

    return sendResponse(true, "User deleted successfully", null);
  } catch (err) {
    console.error("Delete User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

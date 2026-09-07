// app/controllers/userController.ts
import { cookies } from "next/headers";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User, { IUser } from "../models/User";
import Doctor from "../models/Doctor";
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
      organizationId: userDoc.organizationId?.toString() || null,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      role: userDoc.role,
      assignedDoctors:
        userDoc.assignedDoctors?.map((id) => id.toString()) || [],
    };

    return sendResponse(true, "User fetched successfully", user);
  } catch (error) {
    console.error("Get Current User Error:", error);
    return sendResponse(false, "Server error", null);
  }
};

// ================= CREATE USER (Admin adds staff directly) =================
export const createUser = async (
  organizationId: string,
  adminUserId: string,
  data: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    role?: string;
    assignedDoctors?: string[];
    doctorProfileId?: string;
  },
) => {
  try {
    if (!data.firstName || !data.email || !data.password) {
      return sendResponse(
        false,
        "First name, email and password are required",
        null,
      );
    }

    const existing = await User.findOne({
      email: data.email,
      organizationId,
    });

    if (existing) {
      return sendResponse(false, "A user with this email already exists", null);
    }

    const allowedRoles: IUser["role"][] = [
      "PLATFORM_ADMIN",
      "ADMIN",
      "STAFF",
      "DOCTOR",
      "GUEST",
    ];
    const role: IUser["role"] = allowedRoles.includes(
      data.role as IUser["role"],
    )
      ? (data.role as IUser["role"])
      : "STAFF";

    // Only STAFF accounts carry doctor assignments; validate they belong to this org.
    let assignedDoctors: mongoose.Types.ObjectId[] = [];
    if (role === "STAFF" && data.assignedDoctors?.length) {
      const validDoctors = await Doctor.find({
        _id: { $in: data.assignedDoctors },
        organizationId,
      }).select("_id");

      if (validDoctors.length !== data.assignedDoctors.length) {
        return sendResponse(
          false,
          "One or more selected doctors are invalid",
          null,
        );
      }

      assignedDoctors = validDoctors.map(
        (d) => d._id as unknown as mongoose.Types.ObjectId,
      );
    }

    // If this is a DOCTOR account being linked to an existing Doctor profile,
    // make sure that profile exists, belongs to this org, and isn't already linked.
    if (role === "DOCTOR" && data.doctorProfileId) {
      const doctorProfile = await Doctor.findOne({
        _id: data.doctorProfileId,
        organizationId,
      });

      if (!doctorProfile) {
        return sendResponse(false, "Selected doctor profile not found", null);
      }

      if (doctorProfile.userId) {
        return sendResponse(
          false,
          "That doctor profile is already linked to a login",
          null,
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newUser = await User.create({
      organizationId: new mongoose.Types.ObjectId(organizationId),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role,
      assignedDoctors: assignedDoctors.length ? assignedDoctors : undefined,
    });

    if (role === "DOCTOR" && data.doctorProfileId) {
      await Doctor.findByIdAndUpdate(data.doctorProfileId, {
        userId: newUser._id,
      });
    }

    if (adminUserId) {
      await logActivity(
        organizationId,
        adminUserId,
        "CREATED_USER",
        "User",
        `Added new user ${newUser.firstName} ${newUser.lastName || ""}`.trim(),
        newUser._id.toString(),
      );
    }

    const user = {
      _id: newUser._id.toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      assignedDoctors:
        newUser.assignedDoctors?.map((id) => id.toString()) || [],
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return sendResponse(true, "User created successfully", user);
  } catch (error: any) {
    if (error?.code === 11000) {
      return sendResponse(false, "A user with this email already exists", null);
    }
    console.error("Create User Error:", error);
    return sendResponse(false, "Server error", null);
  }
};

// ================= GET USERS =================
export const getUsers = async (
  organizationId: string,
  page: number,
  limit: number,
  role?: string,
  search?: string,
) => {
  try {
    const skip = (page - 1) * limit;
    let whereClause: any = { organizationId };
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
      assignedDoctors:
        userDoc.assignedDoctors?.map((id: any) => id.toString()) || [],
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
export const getUserById = async (organizationId: string, id: string) => {
  try {
    const userDoc = await User.findOne({ _id: id, organizationId }).select(
      "-password",
    );

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
      assignedDoctors:
        userDoc.assignedDoctors?.map((id) => id.toString()) || [],
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
  organizationId: string,
  id: string,
  userId: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    assignedDoctors?: string[];
  },
) => {
  try {
    const user = await User.findOne({ _id: id, organizationId });
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    const updatePayload: any = { ...data };

    // Only STAFF carries doctor assignments; validate against this org same as createUser.
    if (data.assignedDoctors) {
      const effectiveRole = data.role || user.role;
      if (effectiveRole === "STAFF" && data.assignedDoctors.length) {
        const validDoctors = await Doctor.find({
          _id: { $in: data.assignedDoctors },
          organizationId,
        }).select("_id");

        if (validDoctors.length !== data.assignedDoctors.length) {
          return sendResponse(
            false,
            "One or more selected doctors are invalid",
            null,
          );
        }
        updatePayload.assignedDoctors = validDoctors.map((d) => d._id);
      } else {
        updatePayload.assignedDoctors = [];
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updatePayload, {
      new: true,
    });

    if (userId) {
      await logActivity(
        organizationId,
        userId,
        "UPDATED_USER",
        "User",
        `Updated user profile for ${updatedUser?.firstName} ${updatedUser?.lastName || ""}`.trim(),
        id,
      );
    }

    return sendResponse(true, "User updated successfully", updatedUser);
  } catch (err) {
    console.error("Update User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

// ================= DELETE USER =================
export const deleteUser = async (
  organizationId: string,
  id: string,
  userId: string,
) => {
  try {
    const user = await User.findOne({ _id: id, organizationId });
    if (!user) {
      return sendResponse(false, "User not found", null);
    }

    await User.findByIdAndDelete(id);

    if (userId) {
      await logActivity(
        organizationId,
        userId,
        "DELETED_USER",
        "User",
        `Deleted user profile for ${user.firstName} ${user.lastName || ""}`.trim(),
        id,
      );
    }

    return sendResponse(true, "User deleted successfully", null);
  } catch (err) {
    console.error("Delete User Error:", err);
    return sendResponse(false, "Server error", null);
  }
};

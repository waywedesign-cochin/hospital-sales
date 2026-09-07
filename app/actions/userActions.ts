"use server";

import {
  createUser,
  getCurrentUser,
  getUserById,
  getUsers,
} from "@/app/controllers/userController";
import Doctor from "@/app/models/Doctor";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

// ================= GET CURRENT USER ACTION =================
export const getCurrentUserAction = async () => {
  await dbConnect();
  return await getCurrentUser();
};

//get users action
export const getUsersAction = async (
  page: number,
  limit: number,
  role?: string,
  search?: string,
) => {
  await dbConnect();

  //role based access
  const user = await requireAuth(["ADMIN", "STAFF"]);
  return await getUsers(user.organizationId, page, limit, role, search);
};

//user by id action
export const getUserByIdAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getUserById(user.organizationId, id);
};

//create user action (admin adds staff directly)
export const createUserAction = async (data: {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  role?: string;
  assignedDoctors?: string[];
  doctorProfileId?: string;
}) => {
  await dbConnect();

  //role based access - only admins can add users
  const admin = await requireAuth(["ADMIN"]);
  return await createUser(admin.organizationId, admin._id, data);
};

//lightweight doctor list for the Add User form's assignment picker
export const getDoctorsForAssignmentAction = async () => {
  await dbConnect();
  const admin = await requireAuth(["ADMIN"]);

  const doctors = await Doctor.find({ organizationId: admin.organizationId })
    .select("_id prefix firstName lastName specialization userId")
    .sort({ firstName: 1 })
    .lean();

  return doctors.map((d) => ({
    _id: d._id!.toString(),
    name: `${d.prefix || "Dr."} ${d.firstName} ${d.lastName || ""}`.trim(),
    specialization: d.specialization || [],
    hasLogin: Boolean(d.userId),
  }));
};

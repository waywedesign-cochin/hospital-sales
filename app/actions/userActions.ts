"use server";

import {
  getCurrentUser,
  getUserById,
  getUsers,
} from "@/app/controllers/userController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

// ================= GET CURRENT USER ACTION =================
export const getCurrentUserAction = async () => {
  await dbConnect();
  return await getCurrentUser();
};

//get users action
export const getUsersAction = async (page: number, limit: number, role?: string, search?: string) => {
  await dbConnect();

  //role based access
  const user = await requireAuth(["ADMIN", "STAFF"]);
  return await getUsers(user.clinicId, page, limit, role, search);
};

//user by id action
export const getUserByIdAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getUserById(user.clinicId, id);
};

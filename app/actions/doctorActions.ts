"use server";

import { getAllDoctors, getDoctorById } from "../controllers/doctorController";
import { getLeaves } from "../controllers/doctorLeaveController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getDoctorsAction = async (
  page: number,
  limit: number,
  search?: string,
  specialization?: string
) => {
  await dbConnect();
  const user = await requireAuth();
  return await getAllDoctors(user.organizationId, page, limit, search, specialization);
};

export const getDoctorByIdAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getDoctorById(user.organizationId, id);
};

export const getDoctorsLeavesAction = async (id?: string,page: number = 1, limit: number = 10, search?: string, doctor?: string, month?: string, year?: string, type?: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getLeaves(user.organizationId, id, page, limit, search, doctor, month, year, type);
};

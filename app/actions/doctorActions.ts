"use server";

import { getAllDoctors, getDoctorById } from "../controllers/doctorController";
import { getLeaves } from "../controllers/doctorLeaveController";
import { dbConnect } from "../lib/dbConnect";

export const getDoctorsAction = async (
  page: number,
  limit: number,
  search?: string,
  specialization?: string
) => {
  await dbConnect();
  return await getAllDoctors(page, limit, search, specialization);
};

export const getDoctorByIdAction = async (id: string) => {
  await dbConnect();
  return await getDoctorById(id);
};

export const getDoctorsLeavesAction = async (id?: string,page: number = 1, limit: number = 10, search?: string, doctor?: string, month?: string, year?: string, type?: string) => {
  await dbConnect();
  return await getLeaves(id,page, limit, search, doctor, month, year, type);
};

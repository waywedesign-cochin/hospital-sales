"use server";

import { getAllAppointments, getAppointmentById, getMonthWiseReport } from "../controllers/appoinmentController";
import { dbConnect } from "../lib/dbConnect";

export const  getAppointmentsAction = async (
  page: number,
  limit: number,
  doctor?: string,
  search?: string,
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  year?: string,
  month?: string
) => {
  await dbConnect();
  return await getAllAppointments(page, limit, doctor, search, status,undefined, undefined, year, month);
};

export const getAppointmentByIdAction = async (id: string) => {
  await dbConnect();
  return await getAppointmentById(id);
};

export const getMonthWiseReportAction = async (year?: string, doctorId?: string) => {
  await dbConnect();
  return await getMonthWiseReport(year, doctorId);
};
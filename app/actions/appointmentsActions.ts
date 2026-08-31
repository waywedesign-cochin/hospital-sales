"use server";

import { getAllAppointments, getAppointmentById, getMonthWiseReport } from "../controllers/appoinmentController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

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
  const user = await requireAuth();
  return await getAllAppointments(user.organizationId, page, limit, doctor, search, status,undefined, undefined, year, month);
};

export const getAppointmentByIdAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getAppointmentById(user.organizationId, id);
};

export const getMonthWiseReportAction = async (year?: string, doctorId?: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getMonthWiseReport(user.organizationId, year, doctorId);
};
"use server";

import {
  getAllAppointments,
  getAppointmentById,
  getMonthWiseReport,
  getTodaysAgenda,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appoinmentController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import User from "../models/User";
import type { RequestingUser } from "../utils/DoctorScope";
import { buildRequestingUser } from "../utils/buildRequestingUser";



export const getAppointmentsAction = async (
  page: number,
  limit: number,
  doctor?: string,
  search?: string,
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
  year?: string,
  month?: string,
) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await getAllAppointments(
    user.organizationId,
    requestingUser,
    page,
    limit,
    doctor,
    search,
    status,
    undefined,
    undefined,
    year,
    month,
  );
};

export const getTodaysAgendaAction = async (doctorId: string, dateStr: string) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await getTodaysAgenda(user.organizationId, requestingUser, doctorId, dateStr);
};

export const getAppointmentByIdAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await getAppointmentById(user.organizationId, id, requestingUser);
};

export const updateAppointmentAction = async (
  id: string,
  data: {
    firstName: string;
    lastName?: string;
    patientPhone: string;
    patientEmail?: string;
    dateOfBirth?: string;
    isNewPatient?: boolean;
    doctor: string;
    treatmentCategory: string;
    date: string;
    startTime: string;
    status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
    notes?: string;
  },
) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await updateAppointment(
    user.organizationId,
    id,
    user._id,
    data,
    requestingUser,
  );
};

export const deleteAppointmentAction = async (id: string) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await deleteAppointment(
    user.organizationId,
    id,
    user._id,
    requestingUser,
  );
};

export const getMonthWiseReportAction = async (
  year?: string,
  doctorId?: string,
) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await getMonthWiseReport(
    user.organizationId,
    year,
    doctorId,
    requestingUser,
  );
};

"use server";

import {
  dashboardtotalSummaries,
  doctorsAppointmentsSummary,
  getQuickOverviewSummary,
} from "../controllers/overviewController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getDashboardSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await dashboardtotalSummaries(user.clinicId, year);
};

export const getDoctorsAppointmentsSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await doctorsAppointmentsSummary(user.clinicId, year);
};

export const getQuickOverviewSummaryAction=async(date:string)=>{
  await dbConnect();
  const user = await requireAuth();
  return await getQuickOverviewSummary(user.clinicId, date);
}
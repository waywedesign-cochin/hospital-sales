"use server";

import {
  dashboardtotalSummaries,
  doctorsAppointmentsSummary,
  getQuickOverviewSummary,
  getSetupStatus,
} from "../controllers/overviewController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getDashboardSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await dashboardtotalSummaries(user.organizationId, year);
};

export const getDoctorsAppointmentsSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await doctorsAppointmentsSummary(user.organizationId, year);
};

export const getQuickOverviewSummaryAction=async(date:string, range: string = "daily")=>{
  await dbConnect();
  const user = await requireAuth();
  return await getQuickOverviewSummary(user.organizationId, date, range as any);
}

export const getSetupStatusAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  return await getSetupStatus(user.organizationId);
};
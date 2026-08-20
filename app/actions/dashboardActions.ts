"use server";

import {
  dashboardtotalSummaries,
  doctorsAppointmentsSummary,
  getQuickOverviewSummary,
} from "../controllers/overviewController";
import { dbConnect } from "../lib/dbConnect";

export const getDashboardSummaryAction = async (year: string) => {
  await dbConnect();
  return await dashboardtotalSummaries(year);
};

export const getDoctorsAppointmentsSummaryAction = async (year: string) => {
  await dbConnect();
  return await doctorsAppointmentsSummary(year);
};

export const getQuickOverviewSummaryAction=async(date:string)=>{
  await dbConnect()
  return await getQuickOverviewSummary(date)
}
"use server";

import {
  dashboardtotalSummaries,
  doctorsAppointmentsSummary,
  getQuickOverviewSummary,
  getSetupStatus,
} from "../controllers/overviewController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import { buildRequestingUser } from "../utils/buildRequestingUser";

export const getDashboardSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await dashboardtotalSummaries(
    user.organizationId,
    year,
    requestingUser,
  );
};

export const getDoctorsAppointmentsSummaryAction = async (year: string) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await doctorsAppointmentsSummary(
    user.organizationId,
    year,
    requestingUser,
  );
};

export const getQuickOverviewSummaryAction = async (
  date: string,
  range: string = "daily",
) => {
  await dbConnect();
  const user = await requireAuth();
  const requestingUser = await buildRequestingUser(user);
  return await getQuickOverviewSummary(
    user.organizationId,
    date,
    range as any,
    requestingUser,
  );
};

export const getSetupStatusAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  // getSetupStatus is org-wide (just checks whether categories/doctors
  // exist at all), not per-doctor, so it doesn't need requestingUser.
  return await getSetupStatus(user.organizationId);
};

"use server";

import {
  getEnquiries,
  getEnquiryReport,
  getEnquirySummary,
} from "../controllers/enquiryController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getEnquiriesAction = async (
  page: number,
  limit: number,
  search?: string,
  treatmentCategory?: string,
  status?: string,
  source?: string,
  fromDate?: string,
  toDate?: string
) => {
  await dbConnect();
  const user = await requireAuth();
  return await getEnquiries(
    user.organizationId,
    page,
    limit,
    search,
    treatmentCategory,
    status,
    source,
    fromDate,
    toDate
  );
};

export const getEnquiryReportAction = async (year?: string) => {
  await dbConnect();
  const user = await requireAuth();
  return await getEnquiryReport(user.organizationId, year);
};

export const getEnquirySummaryAction = async (
  fromDate?: string,
  toDate?: string
) => {
  await dbConnect();
  const user = await requireAuth();
  return await getEnquirySummary(user.organizationId, fromDate, toDate);
};

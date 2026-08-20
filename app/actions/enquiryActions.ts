"use server";

import {
  getEnquiries,
  getEnquiryReport,
  getEnquirySummary,
} from "../controllers/enquiryController";
import { dbConnect } from "../lib/dbConnect";

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
  return await getEnquiries(
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
  return await getEnquiryReport(year);
};

export const getEnquirySummaryAction = async (
  fromDate?: string,
  toDate?: string
) => {
  await dbConnect();
  return await getEnquirySummary(fromDate, toDate);
};

import { getEnquiriesForExport } from "@/app/controllers/enquiryController";
import { dbConnect } from "@/app/lib/dbConnect";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";
import { NextRequest } from "next/server";
import "@/app/models/User";

export const GET = withAuth(["ADMIN", "STAFF"])(async (req: NextRequest) => {
  try {
    await dbConnect();

    const { searchParams } = req.nextUrl;

    const filters = {
      search: searchParams.get("search") ?? "",
      status: searchParams.get("status") ?? "",
      treatmentCategory: searchParams.get("treatmentCategory") ?? "",
      source: searchParams.get("source") ?? "",
      fromDate: searchParams.get("fromDate") ?? "",
      toDate: searchParams.get("toDate") ?? "",
    };

    const data = await getEnquiriesForExport(filters);
    return sendApiResponse(true, "Exported successfully", data);
  } catch (error) {
    let message = "Server error";
    if (error instanceof Error) message = error.message;
    return sendApiResponse(false, message, null);
  }
});

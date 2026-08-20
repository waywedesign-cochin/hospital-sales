import { getEnquiryActivities } from "../controllers/enquiryActivityController";
import { dbConnect } from "../lib/dbConnect";

export const getEnquiriesAction = async (
  enquiryId: string,
  page: number,
  limit: number,
) => {
  await dbConnect();
  return await getEnquiryActivities(enquiryId, page, limit);
};

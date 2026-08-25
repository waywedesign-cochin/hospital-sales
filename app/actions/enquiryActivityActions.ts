import { getEnquiryActivities } from "../controllers/enquiryActivityController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getEnquiriesAction = async (
  enquiryId: string,
  page: number,
  limit: number,
) => {
  await dbConnect();
  const user = await requireAuth();
  return await getEnquiryActivities(user.clinicId, enquiryId, page, limit);
};

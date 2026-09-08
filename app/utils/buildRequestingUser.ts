import User from "../models/User";
import type { RequestingUser } from "./DoctorScope";
// requireAuth() only returns the decoded JWT ({ _id, role, organizationId }) —
// assignedDoctors isn't in the token, so STAFF users need one extra DB lookup.
export const buildRequestingUser = async (decoded: {
  _id: string;
  role: string;
}): Promise<RequestingUser> => {
  if (decoded.role !== "STAFF") {
    return { _id: decoded._id, role: decoded.role as RequestingUser["role"] };
  }

  const userDoc = await User.findById(decoded._id).select("assignedDoctors");
  return {
    _id: decoded._id,
    role: "STAFF",
    assignedDoctors:
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [],
  };
};

import { cache } from "react";
import User from "../models/User";
import type { RequestingUser } from "./DoctorScope";

// A single page render (e.g. the dashboard) calls buildRequestingUser once
// per server action it fetches in parallel — often 10+ times per load, all
// for the same logged-in user. cache() dedupes this DB lookup to one call
// per request instead of one per action, keyed by the primitive userId so
// it dedupes regardless of which action's `decoded` object triggered it.
const getAssignedDoctorIds = cache(async (userId: string): Promise<string[]> => {
  const userDoc = await User.findById(userId).select("assignedDoctors");
  return userDoc?.assignedDoctors?.map((id) => id.toString()) || [];
});

// requireAuth() only returns the decoded JWT ({ _id, role, organizationId }) —
// assignedDoctors isn't in the token, so STAFF users need one extra DB lookup.
export const buildRequestingUser = async (decoded: {
  _id: string;
  role: string;
}): Promise<RequestingUser> => {
  if (decoded.role !== "STAFF") {
    return { _id: decoded._id, role: decoded.role as RequestingUser["role"] };
  }

  const assignedDoctors = await getAssignedDoctorIds(decoded._id);
  return { _id: decoded._id, role: "STAFF", assignedDoctors };
};

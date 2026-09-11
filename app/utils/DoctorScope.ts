import { cache } from "react";
import mongoose from "mongoose";
import Doctor from "../models/Doctor";

export interface RequestingUser {
  _id: string;
  role: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  assignedDoctors?: string[];
}

// A single page render fans out to many actions in parallel (the dashboard
// alone calls this from ~7 of them), each independently re-resolving the
// same logged-in doctor's own profile id. cache() dedupes that lookup to one
// DB call per request, keyed by primitives so it's independent of which
// action's `user` object triggered it.
const findOwnDoctorId = cache(
  async (organizationId: string, userId: string) => {
    const myProfile = await Doctor.findOne({
      userId,
      organizationId,
    }).select("_id");
    return myProfile ? (myProfile._id as unknown as mongoose.Types.ObjectId) : null;
  },
);

/**
 * Resolves what doctor(s) a requesting user's appointment/patient access
 * should be scoped to.
 *
 * Returns:
 *  - null       -> unrestricted (ADMIN, PLATFORM_ADMIN, GUEST, or a STAFF
 *                  user with no doctors assigned — sees the whole clinic)
 *  - ObjectId[] -> restrict queries to these doctor(s). Can be an empty
 *                  array (e.g. a DOCTOR account not linked to a profile yet),
 *                  which callers should treat as "sees nothing", not "sees everything".
 */
export const resolveDoctorScope = async (
  organizationId: string,
  user: RequestingUser
): Promise<mongoose.Types.ObjectId[] | null> => {
  if (user.role === "STAFF") {
    if (!user.assignedDoctors?.length) return null;
    return user.assignedDoctors.map((id) => new mongoose.Types.ObjectId(id));
  }

  if (user.role === "DOCTOR") {
    const doctorId = await findOwnDoctorId(organizationId, user._id);
    return doctorId ? [doctorId] : [];
  }

  return null;
};
import mongoose from "mongoose";
import Doctor from "../models/Doctor";

export interface RequestingUser {
  _id: string;
  role: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  assignedDoctors?: string[];
}

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
    const myProfile = await Doctor.findOne({
      userId: user._id,
      organizationId,
    }).select("_id");
    return myProfile ? [myProfile._id as unknown as mongoose.Types.ObjectId] : [];
  }

  return null;
};
"use server";

import {
  getPatients,
  getPatientById,
  getBirthdayPatients,
} from "../controllers/patientController";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import User from "../models/User";
import type { RequestingUser } from "../utils/DoctorScope";

async function resolveRequestingUser() {
  const user = await requireAuth();
  const requestingUser: RequestingUser = {
    _id: user._id,
    role: user.role as RequestingUser["role"],
  };
  if (user.role === "STAFF") {
    const userDoc = await User.findById(user._id).select("assignedDoctors");
    requestingUser.assignedDoctors =
      userDoc?.assignedDoctors?.map((id: any) => id.toString()) || [];
  }
  return { user, requestingUser };
}

export const getPatientsAction = async (
  page: number,
  limit: number,
  search?: string,
  sortBy?: string,
) => {
  await dbConnect();
  const { user, requestingUser } = await resolveRequestingUser();
  const response = await getPatients(
    user.organizationId,
    requestingUser,
    page,
    limit,
    search,
    sortBy,
  );
  return await response.json();
};

export const getBirthdayPatientsAction = async () => {
  await dbConnect();
  const { user, requestingUser } = await resolveRequestingUser();
  const response = await getBirthdayPatients(user.organizationId, requestingUser);
  return await response.json();
};

export const getPatientByIdAction = async (id: string) => {
  await dbConnect();
  const { user, requestingUser } = await resolveRequestingUser();
  const response = await getPatientById(user.organizationId, requestingUser, id);
  return await response.json();
};

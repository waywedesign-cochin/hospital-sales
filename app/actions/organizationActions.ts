"use server";

import Organization from "../models/Organization";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";

export const getOrganizationPlanAction = async (): Promise<string> => {
  await dbConnect();
  const user = await requireAuth();
  const org = await Organization.findById(user.organizationId)
    .select("plan")
    .lean<{ plan?: string }>();
  return org?.plan || "free";
};

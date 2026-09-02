"use server";

import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import {
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getOrgBillingSummary,
  getPlatformBillingSummary,
  extendTrial,
  adminChangePlan,
} from "@/app/controllers/subscriptionController";

// ============ ORG ADMIN ACTIONS ============

export const createSubscriptionAction = async (
  plan: "BASIC" | "PRO" | "ENTERPRISE",
  billingCycle: "MONTHLY" | "YEARLY"
) => {
  await dbConnect();
  const user = await requireAuth();
  return await createSubscription(user.organizationId, plan, billingCycle);
};

export const getCurrentSubscriptionAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  return await getCurrentSubscription(user.organizationId);
};

export const getSubscriptionHistoryAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  return await getSubscriptionHistory(user.organizationId);
};

export const cancelSubscriptionAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  return await cancelSubscription(user.organizationId);
};

export const getOrgBillingSummaryAction = async () => {
  await dbConnect();
  const user = await requireAuth();
  return await getOrgBillingSummary(user.organizationId);
};

// ============ PLATFORM ADMIN ACTIONS ============

export const getPlatformBillingSummaryAction = async () => {
  await dbConnect();
  await requireAuth();
  return await getPlatformBillingSummary();
};

export const extendTrialAction = async (orgId: string, days: number) => {
  await dbConnect();
  await requireAuth();
  return await extendTrial(orgId, days);
};

export const adminChangePlanAction = async (
  orgId: string,
  plan: "BASIC" | "PRO" | "ENTERPRISE",
  billingCycle: "MONTHLY" | "YEARLY"
) => {
  await dbConnect();
  await requireAuth();
  return await adminChangePlan(orgId, plan, billingCycle);
};

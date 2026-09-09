"use server";

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { dbConnect } from "../lib/dbConnect";
import { requireAuth } from "../lib/auth";
import {
  createSubscription,
  getCurrentSubscription,
  getSubscriptionHistory,
  cancelSubscription,
  getOrgBillingSummary,
  getInvoiceData,
  getPlatformBillingSummary,
  extendTrial,
  adminChangePlan,
} from "@/app/controllers/subscriptionController";
import { SubscriptionInvoiceDocument } from "@/components/dashboard/Invoices/SubscriptionInvoiceDocument";
import {
  renderToBuffer as renderToBuffer2,
  DocumentProps,
} from "@react-pdf/renderer";
// ============ ORG ADMIN ACTIONS ============

export const createSubscriptionAction = async (
  plan: "BASIC" | "PRO",
  billingCycle: "MONTHLY" | "YEARLY",
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

/**
 * Render a subscription's invoice as a PDF and return it base64-encoded
 * so the client can trigger a browser download.
 */
export const downloadInvoiceAction = async (subscriptionId: string) => {
  await dbConnect();
  const user = await requireAuth();

  const res = await getInvoiceData(user.organizationId, subscriptionId);
  if (!res.success || !res.data?.subscription) {
    return { success: false, message: res.message || "Invoice not found" };
  }

  const { subscription, organization } = res.data;

  try {
    const buffer = await renderToBuffer2(
      React.createElement(SubscriptionInvoiceDocument, {
        subscription,
        organization: organization || { name: "—" },
      }) as unknown as React.ReactElement<DocumentProps>,
    );

    const invoiceNumber =
      subscription.invoiceNumber ||
      `INV-${String(subscription._id).slice(-8).toUpperCase()}`;

    return {
      success: true,
      data: buffer.toString("base64"),
      filename: `${invoiceNumber}.pdf`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Failed to generate invoice",
    };
  }
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
  plan: "BASIC" | "PRO",
  billingCycle: "MONTHLY" | "YEARLY",
) => {
  await dbConnect();
  await requireAuth();
  return await adminChangePlan(orgId, plan, billingCycle);
};

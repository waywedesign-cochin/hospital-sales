import Subscription from "../models/Subscription";
import Organization from "../models/Organization";
import { success, error } from "../utils/responseHandler";

// ============ PLAN PRICING ============

const PLAN_PRICING: Record<string, { monthly: number; yearly: number; maxDoctors: number; maxStaff: number }> = {
  BASIC: { monthly: 999, yearly: 9990, maxDoctors: 2, maxStaff: 5 },
  PRO: { monthly: 2999, yearly: 29990, maxDoctors: 999, maxStaff: 999 },
  ENTERPRISE: { monthly: 9999, yearly: 99990, maxDoctors: 999, maxStaff: 999 },
};

// ============ MOCK PAYMENT ============

function generateMockPaymentId() {
  return `mock_pay_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateMockOrderId() {
  return `mock_order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// ============ ORG ACTIONS ============

/**
 * Create a new subscription (mock payment — instantly marks as PAID)
 */
export const createSubscription = async (
  organizationId: string,
  plan: "BASIC" | "PRO" | "ENTERPRISE",
  billingCycle: "MONTHLY" | "YEARLY"
) => {
  try {
    const pricing = PLAN_PRICING[plan];
    if (!pricing) return error("Invalid plan selected", 400);

    const amount = billingCycle === "YEARLY" ? pricing.yearly : pricing.monthly;
    const now = new Date();
    const expiresAt = new Date(now);
    if (billingCycle === "YEARLY") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Cancel any existing active subscription
    await Subscription.updateMany(
      { organizationId, status: "PAID" },
      { status: "CANCELLED", cancelledAt: new Date() }
    );

    // Create new subscription with mock payment
    const subscription = await Subscription.create({
      organizationId,
      plan,
      billingCycle,
      amount,
      currency: "INR",
      paymentId: generateMockPaymentId(),
      orderId: generateMockOrderId(),
      paymentMethod: "MOCK",
      status: "PAID",
      startsAt: now,
      expiresAt,
      autoRenew: true,
    });

    // Update organization plan + limits
    await Organization.findByIdAndUpdate(organizationId, {
      plan: plan.toLowerCase(),
      subscriptionStatus: "ACTIVE",
      maxDoctors: pricing.maxDoctors,
      maxStaff: pricing.maxStaff,
    });

    return success(subscription, "Subscription activated successfully");
  } catch (err: any) {
    return error(err.message || "Failed to create subscription", 500);
  }
};

/**
 * Get current active subscription for an organization
 */
export const getCurrentSubscription = async (organizationId: string) => {
  try {
    const subscription = await Subscription.findOne({
      organizationId,
      status: "PAID",
      expiresAt: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    const org = await Organization.findById(organizationId).select(
      "plan subscriptionStatus trialEndsAt maxDoctors maxStaff name"
    );

    return success({
      subscription: subscription ? JSON.parse(JSON.stringify(subscription)) : null,
      organization: org ? JSON.parse(JSON.stringify(org)) : null,
    });
  } catch (err: any) {
    return error(err.message, 500);
  }
};

/**
 * Get subscription history for an organization
 */
export const getSubscriptionHistory = async (organizationId: string) => {
  try {
    const subscriptions = await Subscription.find({ organizationId })
      .sort({ createdAt: -1 })
      .lean();

    return success(JSON.parse(JSON.stringify(subscriptions)));
  } catch (err: any) {
    return error(err.message, 500);
  }
};

/**
 * Cancel current subscription
 */
export const cancelSubscription = async (organizationId: string) => {
  try {
    const subscription = await Subscription.findOne({
      organizationId,
      status: "PAID",
    }).sort({ createdAt: -1 });

    if (!subscription) return error("No active subscription found", 404);

    subscription.status = "CANCELLED";
    subscription.cancelledAt = new Date();
    subscription.autoRenew = false;
    await subscription.save();

    // Revert org to free plan (will still have access until expiresAt)
    await Organization.findByIdAndUpdate(organizationId, {
      plan: "free",
      subscriptionStatus: "CANCELLED",
    });

    return success(null, "Subscription cancelled. Access continues until the current billing period ends.");
  } catch (err: any) {
    return error(err.message, 500);
  }
};

/**
 * Get billing summary for org admin page
 */
export const getOrgBillingSummary = async (organizationId: string) => {
  try {
    const org = await Organization.findById(organizationId).lean();
    if (!org) return error("Organization not found", 404);

    const currentSub = await Subscription.findOne({
      organizationId,
      status: "PAID",
      expiresAt: { $gte: new Date() },
    }).sort({ createdAt: -1 }).lean();

    const totalSpent = await Subscription.aggregate([
      { $match: { organizationId: org._id, status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const history = await Subscription.find({ organizationId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Calculate trial days remaining
    let trialDaysRemaining = 0;
    if (org.subscriptionStatus === "TRIAL" && org.trialEndsAt) {
      trialDaysRemaining = Math.max(
        0,
        Math.ceil((new Date(org.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      );
    }

    return success(JSON.parse(JSON.stringify({
      organization: {
        name: org.name,
        plan: org.plan,
        subscriptionStatus: org.subscriptionStatus,
        trialEndsAt: org.trialEndsAt,
        trialDaysRemaining,
        maxDoctors: org.maxDoctors,
        maxStaff: org.maxStaff,
      },
      currentSubscription: currentSub,
      totalSpent: totalSpent[0]?.total || 0,
      history,
    })));
  } catch (err: any) {
    return error(err.message, 500);
  }
};

// ============ PLATFORM ADMIN ACTIONS ============

/**
 * Get platform-wide billing summary
 */
export const getPlatformBillingSummary = async () => {
  try {
    const totalRevenue = await Subscription.aggregate([
      { $match: { status: "PAID" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const activeSubscriptions = await Subscription.countDocuments({
      status: "PAID",
      expiresAt: { $gte: new Date() },
    });

    const trialOrgs = await Organization.countDocuments({ subscriptionStatus: "TRIAL" });
    const activeOrgs = await Organization.countDocuments({ subscriptionStatus: "ACTIVE" });
    const expiredOrgs = await Organization.countDocuments({ subscriptionStatus: "EXPIRED" });
    const cancelledOrgs = await Organization.countDocuments({ subscriptionStatus: "CANCELLED" });

    // Plan distribution
    const planDistribution = await Organization.aggregate([
      { $group: { _id: "$plan", count: { $sum: 1 } } },
    ]);

    // Recent subscriptions with org info
    const recentSubscriptions = await Subscription.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("organizationId", "name slug plan subscriptionStatus")
      .lean();

    // Monthly recurring revenue (current month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const mrr = await Subscription.aggregate([
      {
        $match: {
          status: "PAID",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    return success(JSON.parse(JSON.stringify({
      totalRevenue: totalRevenue[0]?.total || 0,
      mrr: mrr[0]?.total || 0,
      activeSubscriptions,
      trialOrgs,
      activeOrgs,
      expiredOrgs,
      cancelledOrgs,
      planDistribution,
      recentSubscriptions,
    })));
  } catch (err: any) {
    return error(err.message, 500);
  }
};

/**
 * Platform admin: Extend trial for an organization
 */
export const extendTrial = async (orgId: string, days: number) => {
  try {
    const org = await Organization.findById(orgId);
    if (!org) return error("Organization not found", 404);

    const currentTrialEnd = org.trialEndsAt ? new Date(org.trialEndsAt) : new Date();
    currentTrialEnd.setDate(currentTrialEnd.getDate() + days);

    org.trialEndsAt = currentTrialEnd;
    org.subscriptionStatus = "TRIAL";
    org.isActive = true;
    await org.save();

    return success(null, `Trial extended by ${days} days`);
  } catch (err: any) {
    return error(err.message, 500);
  }
};

/**
 * Platform admin: Manually change plan for an organization
 */
export const adminChangePlan = async (
  orgId: string,
  plan: "BASIC" | "PRO" | "ENTERPRISE",
  billingCycle: "MONTHLY" | "YEARLY"
) => {
  try {
    // Reuse the createSubscription logic but with admin context
    return await createSubscription(orgId, plan, billingCycle);
  } catch (err: any) {
    return error(err.message, 500);
  }
};

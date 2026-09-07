import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/dbConnect";
import Organization from "@/app/models/Organization";
import Subscription from "@/app/models/Subscription";
import { withAuth } from "@/app/middlewares/withAuth";
import { sendApiResponse } from "@/app/utils/nextResponseHandler";

const PLAN_PRICING: any = {
  BASIC: { monthly: 999, yearly: 9990 },
  PRO: { monthly: 2999, yearly: 29990 },
};

const PLAN_LIMITS: any = {
  BASIC: { maxDoctors: 2, maxStaff: 5 },
  PRO: { maxDoctors: 999, maxStaff: 999 },
};

export const POST = withAuth(["PLATFORM_ADMIN", "ADMIN"])(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      const body = await req.json();
      const { plan, billingCycle } = body; // plan: "BASIC", billingCycle: "MONTHLY"

      if (!plan || !billingCycle || !PLAN_PRICING[plan]) {
        return sendApiResponse(false, "Invalid plan or billing cycle", null);
      }

      const organization = await Organization.findById(user.organizationId);
      if (!organization) {
        return sendApiResponse(false, "Organization not found", null);
      }

      const amount = PLAN_PRICING[plan][billingCycle.toLowerCase()];
      const startsAt = new Date();
      const expiresAt = new Date();
      if (billingCycle === "MONTHLY") {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      } else {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      }

      // Mark any existing active subscriptions as cancelled
      await Subscription.updateMany(
        { organizationId: user.organizationId, status: "PAID" },
        { $set: { status: "CANCELLED", cancelledAt: new Date() } }
      );

      // Create new subscription (Mock Payment)
      const subscription = await Subscription.create({
        organizationId: user.organizationId,
        plan: plan,
        billingCycle: billingCycle,
        amount: amount,
        currency: "INR",
        status: "PAID",
        paymentMethod: "MOCK",
        startsAt,
        expiresAt,
      });

      // Update Organization
      organization.plan = plan.toLowerCase() as any;
      organization.subscriptionStatus = "ACTIVE";
      organization.maxDoctors = PLAN_LIMITS[plan].maxDoctors;
      organization.maxStaff = PLAN_LIMITS[plan].maxStaff;
      
      await organization.save();

      return sendApiResponse(true, "Successfully upgraded plan", { subscription });
    } catch (error: any) {
      console.error("Subscription Error:", error);
      return sendApiResponse(false, "Server error processing payment", null);
    }
  }
);

export const DELETE = withAuth(["PLATFORM_ADMIN", "ADMIN"])(
  async (req: NextRequest, user) => {
    try {
      await dbConnect();
      
      const organization = await Organization.findById(user.organizationId);
      if (!organization) {
        return sendApiResponse(false, "Organization not found", null);
      }

      // Find active subscription
      const activeSubscription = await Subscription.findOne({
        organizationId: user.organizationId,
        status: "PAID"
      });

      if (activeSubscription) {
        activeSubscription.status = "CANCELLED";
        activeSubscription.cancelledAt = new Date();
        activeSubscription.autoRenew = false;
        await activeSubscription.save();
      }

      // Downgrade organization to free
      organization.plan = "free";
      organization.subscriptionStatus = "CANCELLED";
      organization.maxDoctors = 1;
      organization.maxStaff = 1;
      await organization.save();

      return sendApiResponse(true, "Subscription cancelled successfully", null);
    } catch (error: any) {
      return sendApiResponse(false, "Server error cancelling subscription", null);
    }
  }
);

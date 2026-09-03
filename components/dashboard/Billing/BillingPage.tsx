"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  CreditCard,
  Crown,
  Zap,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Clock,
  IndianRupee,
  TrendingUp,
  Receipt,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/shared/Breadcrumb";
import axios from "axios";
import toast from "react-hot-toast";

const PLAN_PRICING = {
  BASIC: { monthly: 999, yearly: 9990, name: "Basic", icon: Zap, color: "blue" },
  PRO: { monthly: 2999, yearly: 29990, name: "Pro", icon: Crown, color: "indigo" },
  ENTERPRISE: { monthly: 9999, yearly: 99990, name: "Enterprise", icon: Sparkles, color: "purple" },
};

interface BillingData {
  organization: {
    name: string;
    plan: string;
    subscriptionStatus: string;
    trialEndsAt: string | null;
    trialDaysRemaining: number;
    maxDoctors: number;
    maxStaff: number;
  };
  currentSubscription: any;
  totalSpent: number;
  history: any[];
}

export default function BillingPage({ data }: { data: BillingData | null }) {
  const router = useRouter();
  const { slug } = useParams() as { slug: string };
  const [upgrading, setUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "YEARLY">("MONTHLY");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Unable to load billing information.</p>
      </div>
    );
  }

  const { organization, currentSubscription, totalSpent, history } = data;
  const isTrial = organization.subscriptionStatus === "TRIAL";
  const isActive = organization.subscriptionStatus === "ACTIVE";
  const isExpired = organization.subscriptionStatus === "EXPIRED";

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true);
    setSelectedPlan(plan);
    try {
      const res = await axios.post("/api/subscription", { plan, billingCycle });
      if (res.data.success) {
        toast.success(`Upgraded to ${plan} plan!`);
        router.refresh();
      } else {
        toast.error(res.data.message || "Upgrade failed");
      }
    } catch {
      toast.error("Failed to process payment");
    } finally {
      setUpgrading(false);
      setSelectedPlan(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    try {
      const res = await axios.delete("/api/subscription");
      if (res.data.success) {
        toast.success("Subscription cancelled");
        router.refresh();
      }
    } catch {
      toast.error("Failed to cancel");
    }
  };

  return (
    <div className="space-y-6 p-2">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2.5 rounded-lg hover:bg-[#00236F] hover:text-white transition-all duration-150 font-medium text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-slate-300" />
        <Breadcrumb
          items={[
            { label: "Dashboard", href: `/${slug}/dashboard` },
            { label: "Billing & Plans", current: true },
          ]}
        />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="relative flex items-center gap-4 p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
          <div className="bg-indigo-600 p-4 rounded-xl shadow-lg shadow-indigo-500/30">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-linear-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
              Billing & Plans
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Manage your subscription and view payment history
            </p>
          </div>
        </div>
      </div>

      {/* Trial Banner */}
      {isTrial && (
        <div className={`rounded-2xl p-5 border ${organization.trialDaysRemaining <= 7 ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${organization.trialDaysRemaining <= 7 ? "text-red-500" : "text-amber-500"}`} />
            <div>
              <h3 className="font-bold text-slate-800">
                {organization.trialDaysRemaining > 0
                  ? `${organization.trialDaysRemaining} days remaining in your free trial`
                  : "Your free trial has expired"}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Upgrade to a paid plan to continue using all features without interruption.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Crown className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Current Plan</span>
          </div>
          <p className="text-2xl font-bold text-slate-800 capitalize">{organization.plan}</p>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-2 inline-block ${
            isActive ? "bg-green-100 text-green-700" :
            isTrial ? "bg-amber-100 text-amber-700" :
            "bg-red-100 text-red-700"
          }`}>
            {organization.subscriptionStatus}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">Total Spent</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">₹{totalSpent.toLocaleString("en-IN")}</p>
          <span className="text-xs text-slate-400 mt-1 block">Lifetime payments</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-slate-500">
              {isTrial ? "Trial Ends" : "Next Billing"}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {isTrial && organization.trialEndsAt
              ? new Date(organization.trialEndsAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              : currentSubscription?.expiresAt
                ? new Date(currentSubscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "—"}
          </p>
          <span className="text-xs text-slate-400 mt-1 block">
            {currentSubscription?.billingCycle || "N/A"}
          </span>
        </div>
      </div>

      {/* Upgrade Plans */}
      {(isTrial || isExpired || organization.plan === "free") && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-2">Upgrade Your Plan</h2>
          <p className="text-sm text-slate-500 mb-4">Choose a plan to unlock full access.</p>

          {/* Billing Toggle */}
          <div className="flex items-center gap-3 mb-6">
            <span className={`text-sm font-medium ${billingCycle === "MONTHLY" ? "text-slate-800" : "text-slate-400"}`}>Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "MONTHLY" ? "YEARLY" : "MONTHLY")}
              className={`relative w-12 h-6 rounded-full transition-colors ${billingCycle === "YEARLY" ? "bg-indigo-600" : "bg-slate-200"}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${billingCycle === "YEARLY" ? "translate-x-6" : ""}`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "YEARLY" ? "text-slate-800" : "text-slate-400"}`}>
              Yearly <span className="text-xs text-emerald-600 font-semibold">Save 17%</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLAN_PRICING).map(([key, plan]) => {
              const price = billingCycle === "YEARLY" ? plan.yearly : plan.monthly;
              const Icon = plan.icon;
              const isCurrentPlan = organization.plan === key.toLowerCase() && isActive;
              return (
                <div key={key} className={`rounded-2xl border-2 p-5 transition-all ${isCurrentPlan ? "border-green-300 bg-green-50" : "border-slate-100 hover:border-indigo-200 hover:shadow-md"}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-slate-800">{plan.name}</h3>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-slate-800">₹{price.toLocaleString("en-IN")}</span>
                    <span className="text-sm text-slate-500">/{billingCycle === "YEARLY" ? "year" : "month"}</span>
                  </div>
                  {isCurrentPlan ? (
                    <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Current Plan
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleUpgrade(key)}
                      disabled={upgrading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                    >
                      {upgrading && selectedPlan === key ? "Processing..." : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Subscription - Cancel */}
      {isActive && currentSubscription && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Active Subscription</h3>
              <p className="text-sm text-slate-500">
                {currentSubscription.plan} · {currentSubscription.billingCycle} · Expires{" "}
                {new Date(currentSubscription.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" /> Cancel Subscription
            </Button>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Payment History</h2>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No payments yet</p>
            <p className="text-sm mt-1">Your payment history will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Invoice</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Plan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item: any) => (
                  <tr key={item._id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-sm font-mono text-slate-600">{item.invoiceNumber || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-slate-700">{item.plan}</span>
                      <span className="text-xs text-slate-400 ml-1">({item.billingCycle})</span>
                    </td>
                    <td className="py-3 px-4 text-sm font-semibold text-slate-800">₹{item.amount?.toLocaleString("en-IN")}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        item.status === "PAID" ? "bg-green-100 text-green-700" :
                        item.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

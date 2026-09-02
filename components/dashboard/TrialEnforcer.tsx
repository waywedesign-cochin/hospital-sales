"use client";

import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, CreditCard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import toast from "react-hot-toast";

export default function TrialEnforcer({
  children,
  subscriptionStatus,
  trialEndsAt,
}: {
  children: React.ReactNode;
  subscriptionStatus: string;
  trialEndsAt: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const signout = useAuthStore((state) => state.signout);
  
  const isBillingPage = pathname.includes("/billing");

  const isExpired = () => {
    if (subscriptionStatus === "EXPIRED" || subscriptionStatus === "CANCELLED") return true;
    if (subscriptionStatus === "TRIAL" && trialEndsAt) {
      return new Date(trialEndsAt) < new Date();
    }
    return false;
  };

  const handleLogout = async () => {
    await signout();
    toast.success("Logged out successfully");
    router.push("/auth");
  };

  if (isExpired() && !isBillingPage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-red-500/10 border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Subscription Expired</h2>
          <p className="text-slate-600 mb-8">
            Your free trial has ended. To continue using HealthcareCRM and regain access to all features, please upgrade to a paid plan.
          </p>
          <div className="space-y-3">
            <Button 
              onClick={() => {
                const slug = pathname.split("/")[1];
                router.push(`/${slug}/billing`);
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg rounded-xl"
            >
              <CreditCard className="w-5 h-5 mr-2" /> Upgrade Now
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full text-slate-600 border-slate-200 py-6 rounded-xl"
            >
              <LogOut className="w-5 h-5 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

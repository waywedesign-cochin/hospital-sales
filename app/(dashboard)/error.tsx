"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error boundary:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F4F7FB] p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-red-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-500">
          This part of the dashboard failed to load. You can try again, and if
          the problem persists, contact support.
        </p>
        <Button
          onClick={() => reset()}
          className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
        >
          <RotateCw className="w-4 h-4 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlatformAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Platform admin error boundary:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950 p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-md">
        <div className="h-14 w-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Something went wrong
        </h2>
        <p className="text-sm text-slate-400">
          This part of the platform console failed to load. You can try
          again, and if the problem persists, contact support.
        </p>
        <Button
          onClick={() => reset()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
        >
          <RotateCw className="w-4 h-4 mr-2" /> Try again
        </Button>
      </div>
    </div>
  );
}

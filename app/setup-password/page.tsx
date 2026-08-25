"use client";

import { Suspense } from "react";
import SetupPasswordForm from "@/components/auth/SetupPasswordForm";

export default function SetupPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SetupPasswordForm />
    </Suspense>
  );
}

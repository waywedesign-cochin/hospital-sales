import ResetPassword from "@/components/auth/forgot-password/ChangePasswordForm";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense fallback={null}>
      <ResetPassword />
    </Suspense>
  );
};

export default page;

import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "Sign In",
  description: "Login Here to Access the dashboard",
};

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <>{children}</>;
};

export default layout;

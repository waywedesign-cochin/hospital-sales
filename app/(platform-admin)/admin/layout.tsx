import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/app/lib/jwt";

import { PlatformSidebar } from "@/components/shared/PlatformSidebar";
import { SidebarProvider } from "@/components/provider/SidebarContext";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Platform Admin Console",
  description: "Majestic platform dashboard",
};

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  let payload: any;
  try {
    payload = verifyJwt(token);
  } catch {
    redirect("/auth");
  }

  // Ensure ONLY Platform Admins can access
  if (payload?.role !== "PLATFORM_ADMIN") {
    redirect(payload?.organizationSlug ? `/${payload.organizationSlug}/dashboard` : "/auth"); // Redirect normal users back to their dashboard
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-200 font-sans relative">
        {/* Luminous Organic Abstract Background for Dark Mode */}
        <div className="absolute inset-0 bg-slate-950 z-0 pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[150px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-purple-900/10 rounded-full blur-[150px] z-0 pointer-events-none"></div>
        
        <div className="flex z-10 w-full h-full">
          <PlatformSidebar />
          <div className="flex flex-1 flex-col overflow-hidden relative">
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 modern-scrollbar-dark">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

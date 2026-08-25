import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/app/lib/jwt";

import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { SidebarProvider } from "@/components/provider/SidebarContext";
import "../globals.css";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Secure user dashboard",
};

// ✅ MUST be async
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ Proper cookie extraction
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    redirect("/auth");
  }

  try {
    verifyJwt(token);
  } catch {
    redirect("/auth");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-linear-to-br from-[#F0FDF4] via-[#F4F7FB] to-[#E0F2FE] text-[#00236F] font-sans relative">
        {/* Luminous Organic Abstract Background */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[100px] z-0 pointer-events-none"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-200/40 rounded-full blur-[120px] z-0 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[150px] z-0 pointer-events-none"></div>
        
        <div className="flex z-10 w-full h-full">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden relative">
            <Header />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 modern-scrollbar">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}



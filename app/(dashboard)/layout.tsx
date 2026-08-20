import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/app/lib/jwt";

import { Sidebar } from "@/components/shared/Sidebar";
import { Header } from "@/components/shared/Header";
import { SidebarProvider } from "@/components/provider/SidebarContext";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <div className="flex h-screen overflow-hidden bg-[#F4F7FB] text-[#1E293B] font-sans">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden relative">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-6 modern-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

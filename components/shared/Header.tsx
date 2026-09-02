"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Calendar } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../provider/SidebarContext";
import { useAuthStore } from "@/providers/AuthStoreProvider";

export function Header() {
  const router = useRouter();
  const user = useAuthStore((state: any) => state.user);
  const fetchClinic = useAuthStore((state: any) => state.fetchClinic);
  const clinic = useAuthStore((state: any) => state.clinic);
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  useEffect(() => {
    if (user) {
      fetchClinic();
    }
  }, [user, fetchClinic]);

  const getPageTitle = (path: string) => {
    const pathParts = path.split("/").filter(Boolean);
    // Ignore the first part if it's the organization slug (assuming standard dashboard paths have 2+ parts like /slug/dashboard)
    const activePath = pathParts.length > 1 ? pathParts.slice(1).join("/") : pathParts[0] || "";

    if (!activePath) return "Dashboard";
    if (activePath.startsWith("dashboard")) return "Dashboard Overview";
    if (activePath.startsWith("doctors")) return "Medical Staff";
    if (activePath.startsWith("appointments")) return "Appointment Manager";
    if (activePath.startsWith("users")) return "User Settings";

    return activePath.charAt(0).toUpperCase() + activePath.split("/")[0].slice(1);
  };

  const title = getPageTitle(pathname);
  const [today, setToday] = useState<string>("");

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    );
  }, []);

  // Extract slug for profile routing
  const slug = pathname.split("/").filter(Boolean)[0] || "";
  const profileUrl = slug ? `/${slug}/profile` : "/profile";

  return (
    <header className="shrink-0 overflow-hidden sticky top-0 z-10 border-b border-white/40 h-16 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-[-2] bg-cover bg-center opacity-40 mix-blend-multiply"
        style={{ backgroundImage: "url('/sidebar-bg.jpg')" }}
      />
      {/* Glass Effect Overlay */}
      <div className="absolute inset-0 z-[-1] bg-white/50 backdrop-blur-xl" />

      {/* LEFT: Mobile Menu & Dynamic Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all duration-200 lg:hidden border border-transparent"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm sm:text-lg font-bold text-[#00236F] tracking-tight leading-tight truncate max-w-[160px] sm:max-w-xs md:max-w-md">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
            {clinic?.name || "Workspace"}
          </p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Date Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm hover:border-blue-200 transition-all duration-200 group">
          <Calendar className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-blue-700">{today || "..."}</span>
        </div>

        {/* Vertical Separator */}
        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Mini Avatar (Right side) */}
        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-none">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium pt-1 uppercase tracking-wider">
              {user?.role}
            </p>
          </div>
          <div
            onClick={() => router.push(profileUrl)}
            className="w-9 h-9 cursor-pointer rounded-full bg-white p-0.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-full h-full rounded-full bg-linear-to-br from-[#00236F] to-[#003fb3] flex items-center justify-center text-white text-xs font-bold shadow-inner">
              {user?.firstName?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
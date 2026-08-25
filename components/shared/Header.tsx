"use client";

import { Bell, Menu, Calendar } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../provider/SidebarContext";
import { useAuthStore } from "@/providers/AuthStoreProvider";

export function Header() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { toggleSidebar } = useSidebar();
  const pathname = usePathname();

  const getPageTitle = (path: string) => {
    const cleanPath = path.substring(1);

    if (!cleanPath) return "Dashboard";
    if (cleanPath.startsWith("dashboard")) return "Dashboard Overview";
    if (cleanPath.startsWith("doctors")) return "Medical Staff";
    if (cleanPath.startsWith("appointments")) return "Appointment Manager";
    if (cleanPath.startsWith("users")) return "User Settings";

    return cleanPath.charAt(0).toUpperCase() + cleanPath.slice(1);
  };

  const title = getPageTitle(pathname);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="bg-white/40 backdrop-blur-2xl sticky top-0 z-10 border-b border-white/30 h-16 px-6 flex items-center justify-between shadow-sm">
      {/* LEFT: Mobile Menu & Dynamic Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-all duration-200 lg:hidden border border-transparent"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm sm:text-lg font-bold text-[#00236F] tracking-tight leading-tight">
            {title}
          </h2>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
            Elite Health Systems
          </p>
        </div>
      </div>

      {/* RIGHT: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Date Badge (Desktop) */}
        <div className="hidden md:flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 shadow-sm hover:border-blue-200 transition-all duration-200 group">
          <Calendar className="w-3.5 h-3.5 text-blue-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-blue-700">{today}</span>
        </div>

        {/* Notifications */}
        {/* <button className="relative p-2 hover:bg-slate-800/50 rounded-full transition-all duration-200 text-slate-400 hover:text-slate-200 border border-transparent hover:border-slate-700/50 group">
          <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-linear-to-br from-red-400 to-red-600 border-2 border-slate-950 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
        </button> */}

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
            onClick={() => router.push("/profile")}
            className="w-9 h-9 cursor-pointer rounded-full bg-white p-0.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 group"
          >
            <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center border border-blue-200">
              <span className="text-blue-primary font-bold text-sm group-hover:scale-110 transition-transform">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
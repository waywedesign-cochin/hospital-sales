"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  ShieldAlert,
  BookOpen,
  CreditCard,
} from "lucide-react";
import { useSidebar } from "../provider/SidebarContext";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import toast from "react-hot-toast";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

export function PlatformSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.signout);
  const pathname = usePathname();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    router.push("/auth");
  };

  const menuItems = [
    {
      id: "admin",
      label: "Platform Overview",
      icon: LayoutDashboard,
      href: "/admin",
    },
    {
      id: "admin/organizations",
      label: "Organizations",
      icon: Building2,
      href: "/admin/organizations",
    },
    {
      id: "admin/users",
      label: "Global Users",
      icon: Users,
      href: "/admin/users",
    },
    {
      id: "admin/billing",
      label: "Billing & Revenue",
      icon: CreditCard,
      href: "/admin/billing",
    },
    {
      id: "admin/architecture",
      label: "Architecture Guide",
      icon: BookOpen,
      href: "/admin/architecture",
    },
  ];

  return (
    <>
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 sm:hidden bg-slate-900 shadow-sm border border-slate-700 rounded-xl p-2.5 text-slate-200"
        >
          <Menu size={16} />
        </button>
      )}

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 sm:hidden"
        />
      )}

      {/* OUTER SIDEBAR - DARK & MAJESTIC THEME */}
      <aside
        className={`
          fixed sm:relative h-screen w-64
          border-r border-slate-800 shadow-[4px_0_24px_rgba(0,0,0,0.2)]
          flex flex-col z-40 bg-slate-950 text-slate-200
          transition-[width,transform] duration-300
          ${isCollapsed ? "sm:w-20" : "sm:w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Subtle mesh background */}
        <div className="absolute inset-0 z-[-1] bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950" />
        
        {/* TOGGLE */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 bg-slate-800 border border-slate-700 shadow-sm rounded-full p-1.5 text-slate-400 hover:text-indigo-400 hidden sm:block z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO */}
        <div
          className={`h-20 flex items-center ${
            isCollapsed ? "justify-center" : "px-6"
          } border-b border-slate-800`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-tr from-indigo-600 to-purple-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30 relative z-10">
               <ShieldAlert size={24} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap relative z-10">
                <span className="text-[17px] font-bold text-white tracking-tight leading-tight">Master Admin</span>
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Platform Operations</span>
              </div>
            )}
          </div>
        </div>

        {/* MENU SECTION */}
        <nav className="flex-1 bg-transparent py-6 px-3 overflow-y-auto modern-scrollbar-dark">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.id}>
                  <div
                    onClick={() => router.push(item.href)}
                    className={`
                      flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-3"} py-3 rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02]
                      relative z-10
                      ${
                        isActive
                          ? "bg-indigo-600/10 text-indigo-400 shadow-sm ring-1 ring-indigo-500/50 font-bold"
                          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 font-medium"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-300"}`} />
                      {!isCollapsed && (
                        <span className="text-sm">
                          {item.label}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        <div className="border-t border-slate-800 bg-transparent px-4 py-4 relative z-10">
          <div
            className={`flex items-center justify-between ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 shadow-sm"
              >
                <span className="text-xs font-bold text-indigo-400">
                  {user?.firstName?.charAt(0) || "P"}
                  {user?.lastName?.charAt(0) || "A"}
                </span>
              </div>

              {!isCollapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-slate-500">
                    PLATFORM ADMIN
                  </p>
                </div>
              )}
            </div>

            {/* LOGOUT */}
            {!isCollapsed && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800">
                    <LogOut size={18} />
                  </button>
                </DialogTrigger>

                <DialogContent className="bg-slate-900 border-slate-800 text-slate-200">
                  <DialogHeader>
                    <DialogTitle>Log out</DialogTitle>
                    <DialogDescription className="text-slate-400">
                      Are you sure you want to log out of the platform console?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" className="border-slate-700 hover:bg-slate-800">Cancel</Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      Log out
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

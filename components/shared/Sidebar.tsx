"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  LogOut,
  MessageSquare,
  Menu,
  UsersRound,
  MessageCircle,
  Activity,
  UserSquare, BriefcaseMedical,
  BookOpen,
  Settings,
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
import Image from "next/image";

export function Sidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();
  const user = useAuthStore((state) => state.user);
  const clinic = useAuthStore((state: any) => state.clinic);
  const logout = useAuthStore((state) => state.signout);
  const pathname = usePathname();
  const router = useRouter();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [expandedItems, setExpandedItems] = useState<string[]>([
    "appointments",
  ]);
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

  const toggleExpand = (item: string) => {
    if (isCollapsed && window.innerWidth >= 640) toggleSidebar();
    setExpandedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      subItems: [],
    },
    ...(user?.role === "ADMIN" || user?.role === "STAFF"
      ? [
          {
            id: "enquiries",
            label: "Leads",
            icon: MessageSquare,
            subItems: [],
          },
        ]
      : []),
    {
      id: "patients",
      label: "Patients",
      icon: UserSquare, BriefcaseMedical,
      href: "/patients",
      subItems: [],
    },
    {
      id: "messaging",
      label: "Messaging",
      icon: MessageCircle,
      href: "/messaging",
      subItems: [],
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: Calendar,
      subItems:
        user?.role === "DOCTOR"
          ? [
              {
                label: "All Appointments",
                href: `/appointments?year=${currentYear}&month=${currentMonth}`,
              },
              { label: "Calendar", href: "/appointments/calendar" },
            ]
          : [
              {
                label: "All Appointments",
                href: `/appointments?year=${currentYear}&month=${currentMonth}`,
              },
              {
                label: "Create Appointment",
                href: "/appointments/create-appointment",
              },
              { label: "Calendar", href: "/appointments/calendar" },
            ],
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            id: "doctors",
            label: "Doctors",
            icon: Stethoscope,
            subItems: [
              { label: "Doctors List", href: "/doctors" },
              { label: "Add Doctor", href: "/doctors/add-doctor" },
              {
                label: "Doctors Leave List",
                href: `/doctors/leave/leaves-list?year=${currentYear}&month=${currentMonth}`,
              },
              { label: "Create Leave", href: "/doctors/leave/create-leave" },
            ],
          },
        ]
      : []),

    ...(user?.role === "ADMIN"
      ? [
          {
            id: "users",
            label: "Staff Users",
            icon: Users,
            href: "/users",
            subItems: [],
          },
          {
            id: "activity-logs",
            label: "Activity Log",
            icon: Activity,
            href: "/activity-logs",
            subItems: [],
          },
        ]
      : []),
    ...(user?.role === "ADMIN"
      ? [
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            subItems: [
              { label: "Treatment Categories", href: "/settings/treatment-category" }
            ],
          },
        ]
      : []),
    {
      id: "architecture",
      label: "Architecture Guide",
      icon: BookOpen,
      href: "/architecture",
      subItems: [],
    },
  ];

  return (
    <>
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 sm:hidden bg-white shadow-sm border border-slate-200 rounded-xl p-2.5 text-slate-700"
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

      {/* OUTER SIDEBAR */}
      <aside
        className={`
          fixed sm:relative h-screen w-64
          border-r border-white/40 shadow-[4px_0_24px_rgba(0,35,111,0.03)]
          flex flex-col z-40
          transition-[width,transform] duration-300
          ${isCollapsed ? "sm:w-20" : "sm:w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-[-2] bg-cover bg-center opacity-60 mix-blend-multiply"
          style={{ backgroundImage: "url('/sidebar-bg.jpg')" }}
        />
        {/* Glass Effect Overlay */}
        <div className="absolute inset-0 z-[-1] bg-white/50 backdrop-blur-xl" />
        {/* TOGGLE */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 bg-white border border-slate-200 shadow-sm rounded-full p-1.5 text-slate-500 hover:text-blue-primary hidden sm:block z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO */}
        <div
          className={`h-20 flex items-center ${
            isCollapsed ? "justify-center" : "px-6"
          } border-b border-white/30`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#00236F] text-white p-2 rounded-xl shadow-md shadow-[#00236F]/20 relative z-10">
               <BriefcaseMedical size={24} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap relative z-10">
                <span className="text-[17px] font-bold text-[#00236F] tracking-tight leading-tight truncate w-36" title={clinic?.name || "Healthcare CRM"}>
                  {clinic?.name || "Healthcare CRM"}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-600 tracking-wider truncate w-36">
                  Workspace
                </span>
              </div>
            )}
          </div>
        </div>

        {/* LIGHT MENU SECTION */}
        <nav className="flex-1 bg-transparent py-6 px-3 overflow-y-auto modern-scrollbar">
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubItems = item.subItems.length > 0;
              const isExpanded = expandedItems.includes(item.id);
              const isActive = pathname.startsWith(item.href || `/${item.id}`);

              return (
                <li key={item.id}>
                  <div
                    onClick={() =>
                      hasSubItems
                        ? toggleExpand(item.id)
                        : router.push(item.href || `/${item.id}`)
                    }
                    className={`
                      flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-3"} py-3 rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02]
                      relative z-10
                      ${
                        isActive
                          ? "bg-white/80 text-[#00236F] shadow-sm ring-1 ring-white/50 font-bold"
                          : "text-[#00236F]/80 hover:bg-white/60 hover:text-[#00236F] font-medium"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#2DD4BF]" : "text-[#00236F]/60 group-hover:text-[#2DD4BF]"}`} />
                      {!isCollapsed && (
                        <span className="text-sm">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {hasSubItems && !isCollapsed && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? "rotate-180 text-[#2DD4BF]" : "text-[#00236F]/40"
                        }`}
                      />
                    )}
                  </div>

                  {hasSubItems && isExpanded && !isCollapsed && (
                    <ul className="mt-1.5 ml-9 space-y-1 border-l-2 border-white/40 pl-3 relative z-10">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href.split("?")[0];
                        return (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              className={`block px-3 py-2 rounded-lg text-sm transition-all hover:scale-[1.02] ${
                                isSubActive
                                  ? "bg-white/70 text-[#00236F] font-bold"
                                  : "text-[#00236F]/70 hover:bg-white/50 hover:text-[#00236F] font-medium"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* FOOTER */}
        {/* FOOTER – SaaS STYLE */}
        <div className="border-t border-white/40 bg-transparent px-4 py-4 relative z-10">
          <div
            className={`flex items-center justify-between ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div
                onClick={() => router.push("/profile")}
                className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center cursor-pointer border border-blue-200 shadow-sm hover:shadow-md transition-all"
              >
                <span className="text-xs font-bold text-blue-primary">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>

              {/* Name & Role */}
              {!isCollapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-slate-600">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>

            {/* LOGOUT */}
            {!isCollapsed && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-slate-500 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-white/50">
                    <LogOut size={18} />
                  </button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log out</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to log out?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
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




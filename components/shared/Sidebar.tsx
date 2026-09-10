"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useParams } from "next/navigation";
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
  X,
  MessageCircle,
  Activity,
  UserSquare,
  BriefcaseMedical,
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
  DialogClose,
} from "@/components/ui/dialog";

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

  const params = useParams();
  const slug = params.slug as string;
  const baseUrl = slug ? `/${slug}` : "";

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      href: `${baseUrl}/dashboard`,
      subItems: [],
    },
    ...(user?.role === "ADMIN" ||
    (user?.role === "STAFF" && !user?.assignedDoctors?.length)
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
      icon: UserSquare,
      href: `${baseUrl}/patients`,
      subItems: [],
    },
    {
      id: "messaging",
      label: "Messaging",
      icon: MessageCircle,
      href: `${baseUrl}/messaging`,
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
                href: `${baseUrl}/appointments?year=${currentYear}&month=${currentMonth}`,
              },
              { label: "Calendar", href: `${baseUrl}/appointments/calendar` },
            ]
          : [
              {
                label: "All Appointments",
                href: `${baseUrl}/appointments?year=${currentYear}&month=${currentMonth}`,
              },
              {
                label: "Create Appointment",
                href: `${baseUrl}/appointments/create-appointment`,
              },
              { label: "Calendar", href: `${baseUrl}/appointments/calendar` },
            ],
    },
    ...(user?.role === "ADMIN"
      ? [
          {
            id: "doctors",
            label: "Doctors",
            icon: Stethoscope,
            subItems: [
              { label: "Doctors List", href: `${baseUrl}/doctors` },
              { label: "Add Doctor", href: `${baseUrl}/doctors/add-doctor` },
              {
                label: "Doctors Leave List",
                href: `${baseUrl}/doctors/leave/leaves-list?year=${currentYear}&month=${currentMonth}`,
              },
              {
                label: "Create Leave",
                href: `${baseUrl}/doctors/leave/create-leave`,
              },
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
            href: `${baseUrl}/users`,
            subItems: [],
          },
          {
            id: "activity-logs",
            label: "Activity Log",
            icon: Activity,
            href: `${baseUrl}/activity-logs`,
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
              {
                label: "Treatment Categories",
                href: `${baseUrl}/settings/treatment-category`,
              },
              { label: "Billing & Plans", href: `${baseUrl}/billing` },
              {
                label: "Website Integration",
                href: `${baseUrl}/settings/integrations`,
              },
            ],
          },
        ]
      : []),
    {
      id: "architecture",
      label: "Architecture Guide",
      icon: BookOpen,
      href: `${baseUrl}/architecture`,
      subItems: [],
    },
  ];

  return (
    <div>
      {!isMobileMenuOpen && (
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed top-4 left-4 z-50 sm:hidden bg-[#0D1117] text-slate-200 shadow-lg rounded-xl p-2.5"
        >
          <Menu size={16} />
        </button>
      )}

      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 sm:hidden"
        />
      )}

      {/* OUTER SIDEBAR */}
      <aside
        className={`
          fixed sm:relative h-dvh w-64 bg-[#0D1117]
          flex flex-col z-40
          transition-[width,transform] duration-300
          ${isCollapsed ? "sm:w-[76px]" : "sm:w-64"}
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"}
        `}
      >
        {/* Close button (mobile) */}
        {isMobileMenuOpen && (
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 sm:hidden"
          >
            <X size={18} />
          </button>
        )}

        {/* TOGGLE (desktop) */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-9 bg-[#161B22] border border-[#1F2630] shadow-md rounded-full p-1.5 text-slate-400 hover:text-[#34D399] hidden sm:flex items-center justify-center z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* LOGO */}
        <div
          className={`h-20 flex items-center ${
            isCollapsed ? "justify-center" : "px-6"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="bg-[#10B981] text-[#0D1117] p-2 rounded-lg">
              <BriefcaseMedical size={22} />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <span
                  className="text-[15px] font-semibold text-slate-100 tracking-tight leading-tight truncate w-36"
                  title={clinic?.name || "Healthcare CRM"}
                >
                  {clinic?.name || "Healthcare CRM"}
                </span>
                <span className="text-[10px] uppercase font-medium text-slate-500 tracking-widest truncate w-36">
                  Workspace
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mx-4 h-px bg-[#1F2630]" />

        {/* MENU SECTION */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto modern-scrollbar">
          <ul className="space-y-0.5">
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
                    title={isCollapsed ? item.label : undefined}
                    className={`
                      relative flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-3"} py-2.5 rounded-lg cursor-pointer transition-colors duration-150 group
                      ${
                        isActive
                          ? "bg-[#161B22] text-slate-100"
                          : "text-slate-400 hover:bg-[#141A21] hover:text-slate-200"
                      }
                    `}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#34D399]" />
                    )}
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-[18px] h-[18px] transition-colors ${
                          isActive
                            ? "text-[#34D399]"
                            : "text-slate-500 group-hover:text-[#34D399]"
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="text-[13.5px] font-medium">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {hasSubItems && !isCollapsed && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded
                            ? "rotate-180 text-[#34D399]"
                            : "text-slate-600"
                        }`}
                      />
                    )}
                  </div>

                  {hasSubItems && isExpanded && !isCollapsed && (
                    <ul className="mt-1 ml-[22px] space-y-0.5 border-l border-[#1F2630] pl-4">
                      {item.subItems.map((sub) => {
                        const isSubActive = pathname === sub.href.split("?")[0];
                        return (
                          <li key={sub.label}>
                            <Link
                              href={sub.href}
                              className={`block px-3 py-1.5 rounded-md text-[13px] transition-colors ${
                                isSubActive
                                  ? "text-[#34D399] font-medium"
                                  : "text-slate-500 hover:text-slate-200"
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
        <div className="mx-4 h-px bg-[#1F2630]" />
        <div className="px-4 py-4">
          <div
            className={`flex items-center justify-between ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            {/* USER INFO */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => router.push("/profile")}
                className="w-9 h-9 rounded-full bg-[#161B22] flex items-center justify-center cursor-pointer border border-[#1F2630] hover:border-[#34D399]/50 transition-colors"
              >
                <span className="text-xs font-semibold text-[#34D399]">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </span>
              </div>

              {!isCollapsed && (
                <div className="leading-tight">
                  <p className="text-sm font-medium text-slate-200">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-[11px] font-medium tracking-wide text-slate-500">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>

            {/* LOGOUT */}
            {!isCollapsed && (
              <Dialog>
                <DialogTrigger asChild>
                  <button className="text-slate-500 hover:text-[#F87171] transition-colors p-1.5 rounded-lg hover:bg-[#161B22]">
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
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
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
    </div>
  );
}

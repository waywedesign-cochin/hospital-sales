"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
  Cell,
  LabelList,
} from "recharts";
import { Doctor } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Mail,
  CalendarDays,
  ArrowRight,
  Users,
  Search,
} from "lucide-react";
import SummaryCard from "./SummaryCard";
import DoctorAppointmentSummary from "./DoctorAppointmentSummary";
import QuickOverview from "./QuickOverview";
import TodayOverviewCard from "./TodayOverviewCard";
import MiniCalendar from "./MiniCalendar";
import AppointmentRequests from "./AppointmentRequests";
import RecentAppointmentsTable from "./RecentAppointmentsTable";
import TodaysAgenda, { AgendaAppointment } from "./TodaysAgenda";
import MiniSparkline from "./MiniSparkline";
import Image from "next/image";

const EnhancedPieChart = dynamic(() => import("./DashboardPieChart"), {
  ssr: false,
});

export type AppointmentStatus =
  | "SCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface MonthWiseStatusSummary {
  SCHEDULED: number;
  COMPLETED: number;
  CANCELLED: number;
  NO_SHOW: number;
}
export interface DashboardTotalSummary {
  totalAppointments: number;
  totalEnquiries: number;
  completedAppointments: number;
  cancelledAppointments: number;
}
export interface DoctorAppointmentSummaryItem {
  doctorId: string; // Mongo ObjectId as string
  name: string; // "Dr. First Last"
  status?: "ACTIVE" | "INACTIVE" | "ON_LEAVE";
  hasLoginAccount?: boolean;
  hasEverLoggedIn?: boolean;
  isOnline?: boolean;
  lastActiveAt?: string | Date | null;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionPercentage: number; // 0–100
}
export interface QuickOverviewData {
  todayAppointments: {
    total: number;
    completed: number;
    pending: number;
  };
  consultationBreakdown: Record<string, number>;
  tomorrowAppointments: number;
}

export interface MonthWiseReportItem {
  month: number;
  monthName: string;
  totalAppointments: number;
  growth: string | null;
  statusSummary: MonthWiseStatusSummary;
}

interface EnquiryReport {
  month: number;
  monthName: string;
  totalEnquiries: number;
  appointmentsBooked: string | null;
}

export type MonthWiseReport = MonthWiseReportItem[];

// Reuses the exact colors the stat cards above already assign per metric
// (Appointments=sky, Completed=green, Cancelled=red) so the donut reads as
// part of the same system instead of an unrelated palette. NO_SHOW gets its
// own violet since nothing above it represents that state.
const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "#0EA5E9",
  COMPLETED: "#22C55E",
  CANCELLED: "#EF4444",
  NO_SHOW: "#A78BFA",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[white] px-4 py-3 rounded-xl shadow-lg border">
      <p className="font-semibold text-gray-900">
        {payload[0].payload.monthName}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-bold text-sky-600">{payload[0].value}</span>{" "}
        appointments
      </p>
    </div>
  );
};

// Floating value bubble on hover, similar to a "250 Male" style tooltip.
const AreaBubbleTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-slate-900/95 text-white px-3 py-2 rounded-xl shadow-xl flex flex-col gap-1">
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center gap-2 text-xs font-semibold whitespace-nowrap"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span>{p.value}</span>
          <span className="text-slate-300 font-normal">{p.name}</span>
        </div>
      ))}
    </div>
  );
};
// Bar color intensity based on value — uses the same sky-blue the
// "Appointments" stat card already uses, so this chart reads as its
// detail view rather than an unrelated color.
function getBarColor(value: number, max: number) {
  const base = { r: 14, g: 165, b: 233 }; // #0EA5E9

  if (!max || max <= 0) return "rgb(210, 235, 250)"; // fallback

  const ratio = Math.min(Math.max(value / max, 0), 1); // clamp 0–1

  const r = Math.round(base.r + (255 - base.r) * (1 - ratio));
  const g = Math.round(base.g + (255 - base.g) * (1 - ratio));
  const b = Math.round(base.b + (255 - base.b) * (1 - ratio));

  return `rgb(${r}, ${g}, ${b})`;
}

interface RecentAppointmentItem {
  _id: string;
  bookingId: string;
  firstName: string;
  lastName?: string;
  doctor?: { _id?: string; firstName?: string; lastName?: string } | null;
  treatmentCategory?: string;
  date: string | Date;
  startTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

interface NewEnquiryItem {
  _id: string;
  firstName: string;
  lastName?: string;
  treatmentCategory?: string;
  createdAt?: string | Date;
}

interface RecentPatientItem {
  _id: string;
  firstName: string;
  lastName?: string;
  createdAt?: string | Date;
}

const DashboardHome = ({
  slug,
  appointmentData,
  doctors,
  enquiryData,
  totalSummary,
  doctorsAppointmentSummary,
  quickOverview,
  setupStatus,
  recentAppointments = [],
  newEnquiries = [],
  totalPatients = 0,
  todaysAgenda = [],
  recentPatients = [],
}: {
  slug: string;
  appointmentData: MonthWiseReport;
  doctors: Doctor[];
  enquiryData: EnquiryReport[];
  totalSummary: DashboardTotalSummary;
  doctorsAppointmentSummary: DoctorAppointmentSummaryItem[];
  quickOverview: QuickOverviewData;
  setupStatus?: { hasTreatmentCategories: boolean; hasDoctors: boolean };
  recentAppointments?: RecentAppointmentItem[];
  newEnquiries?: NewEnquiryItem[];
  totalPatients?: number;
  todaysAgenda?: AgendaAppointment[];
  recentPatients?: RecentPatientItem[];
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [initializing, setInitializing] = useState(true);
  const maxAppointments = Math.max(
    ...appointmentData.map((d) => d.totalAppointments ?? 0),
  );

  const initialYear =
    searchParams.get("year") || new Date().getFullYear().toString();
  const [year, setYear] = useState(initialYear);
  const [patientQuery, setPatientQuery] = useState("");

  const submitPatientSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = patientQuery.trim();
    if (q) router.push(`/${slug}/patients?search=${encodeURIComponent(q)}`);
  };

  const logginedDoctor =
    user?.role === "DOCTOR"
      ? doctors.find((d) => d.email === user.email)
      : null;

  const updateYearFilter = (newYear: string) => {
    setYear(newYear);
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Combined into a single effect/navigation: fixing up the "year" and
  // "doctor" params separately (two effects, each calling router.replace)
  // meant the second replace could clobber the first since both read the
  // same pre-navigation searchParams snapshot, and it forced doctors through
  // two sequential server round-trips on first load instead of one.
  useEffect(() => {
    const yearMissing = !searchParams.get("year");
    const doctorNeedsFix =
      !!logginedDoctor &&
      searchParams.get("doctor") !== logginedDoctor._id.toString();

    if (!doctorNeedsFix) {
      // Non-doctor roles (or a doctor already correctly scoped) never blocked
      // on the year fix-up before, so keep that instant, non-blocking UX —
      // patch the URL in the background only if needed.
      setInitializing(false);
      if (yearMissing) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("year", initialYear);
        router.replace(`${pathname}?${params.toString()}`);
      }
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (yearMissing) params.set("year", initialYear);
    params.set("doctor", logginedDoctor!._id.toString());
    setInitializing(true);
    router.replace(`${pathname}?${params.toString()}`);
  }, [logginedDoctor, searchParams, pathname, router, initialYear]);

  const totalAppointments = appointmentData.reduce(
    (sum, i) => sum + i.totalAppointments,
    0,
  );

  const completionRate =
    totalSummary.totalAppointments > 0
      ? Math.round(
          (totalSummary.completedAppointments /
            totalSummary.totalAppointments) *
            100,
        )
      : 0;

  const normalizedAgenda = todaysAgenda.map((a) => ({
    _id: a._id,
    firstName: a.firstName,
    lastName: a.lastName,
    startTime: a.startTimeLabel,
    status: a.status,
  }));
  const normalizedRecent = recentAppointments.map((a) => ({
    _id: a._id,
    firstName: a.firstName,
    lastName: a.lastName,
    startTime: a.startTime,
    status: a.status,
  }));

  const allAppointments = [...normalizedAgenda, ...normalizedRecent];
  const uniqueAppointments = allAppointments.filter(
    (a, i, self) => i === self.findIndex((t) => t._id === a._id),
  );

  const upcomingList = uniqueAppointments
    .filter((a) => a.status === "SCHEDULED" || a.status === "IN_PROGRESS")
    .slice(0, 3);

  const completedList = uniqueAppointments
    .filter((a) => a.status === "COMPLETED")
    .slice(0, 3);

  const statusSummary = appointmentData.reduce(
    (acc, item) => {
      Object.entries(item.statusSummary || {}).forEach(([k, v]) => {
        acc[k] = (acc[k] || 0) + (v as number);
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const pieData = Object.entries(statusSummary).map(([key, value]) => ({
    name: key.replace("_", " "),
    value,
    color: STATUS_COLORS[key as AppointmentStatus],
  }));

  // STAFF users with assigned doctors should not see enquiry data for doctors they are not assigned to.
  const hasAssignedDoctors =
    user?.role === "STAFF" && (user?.assignedDoctors?.length ?? 0) > 0;

  // Only hide enquiry data for STAFF who are scoped to specific doctors.
  // STAFF with no assignments, and all other roles, see it as normal.
  const hideEnquiryData = hasAssignedDoctors;

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Here is the latest update for your clinic today.
          </p>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {logginedDoctor && (
            <form
              role="search"
              onSubmit={submitPatientSearch}
              className="relative w-full md:w-[300px]"
            >
              <input
                type="search"
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                placeholder="Search by name or phone…"
                aria-label="Search patients"
                className="peer h-11 w-full rounded-2xl border border-slate-200/80 bg-white pl-12 pr-12 text-sm font-medium text-[#00236F] placeholder:text-slate-400 shadow-[0_4px_20px_-6px_rgba(0,35,111,0.12)] transition-all duration-200 hover:border-[#2DD4BF]/50 focus:outline-none focus:border-[#2DD4BF] focus:ring-4 focus:ring-[#2DD4BF]/15 [&::-webkit-search-cancel-button]:hidden"
              />
              {/* after the input so peer-focus works and it paints above the input */}
              <span className="pointer-events-none absolute left-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#2DD4BF]/10 text-[#0D9488] transition-colors duration-200 peer-focus:bg-[#2DD4BF] peer-focus:text-white">
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </span>
              {patientQuery.trim() && (
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-xl bg-[#00236F] text-white shadow-md shadow-[#00236F]/20 transition-all hover:bg-[#0D9488] active:scale-95"
                >
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
              )}
            </form>
          )}

          <Select value={year} onValueChange={updateYearFilter}>
            <SelectTrigger
              className="
                w-full md:w-[130px]
                bg-white/80 backdrop-blur-xl
                text-[#00236F] font-bold
                border border-white/60
                rounded-xl
                shadow-sm shadow-[#00236F]/5
                hover:bg-white
                transition-all
                flex justify-between items-center
                h-11
              "
            >
              <SelectValue placeholder="Year" />
            </SelectTrigger>

            <SelectContent
              className="
                bg-white/90 backdrop-blur-2xl
                border border-white/60
                rounded-xl
                shadow-xl shadow-[#00236F]/10
              "
            >
              {[...Array(5)].map((_, i) => {
                const y = new Date().getFullYear() - 2 + i;
                return (
                  <SelectItem
                    key={y}
                    value={y.toString()}
                    className="font-medium text-[#00236F]"
                  >
                    {y}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Onboarding Setup Banner */}
      {setupStatus &&
        (!setupStatus.hasTreatmentCategories || !setupStatus.hasDoctors) &&
        user?.role === "ADMIN" && (
          <div className="bg-linear-to-r from-[#0D1117] to-emerald-800 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <ClipboardList className="w-7 h-7 text-emerald-300" />
                Welcome to your Workspace! Let's get you set up.
              </h2>
              <p className="text-slate-300 mt-2 font-medium">
                {!setupStatus.hasTreatmentCategories
                  ? "You must create at least one Treatment Category before you can add Patients or Enquiries."
                  : "You should add your first Doctor to start scheduling appointments."}
              </p>
            </div>
            <div>
              {!setupStatus.hasTreatmentCategories ? (
                <button
                  onClick={() => router.push("/settings/treatment-category")}
                  className="bg-emerald-400 text-[#0D1117] px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-emerald-300 transition-all shadow-sm flex items-center gap-2"
                >
                  Create Category <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => router.push("/doctors")}
                  className="bg-emerald-400 text-[#0D1117] px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-emerald-300 transition-all shadow-sm flex items-center gap-2"
                >
                  Add Doctor <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

      {/* Today's Overview: headline stat cards + calendar, at-a-glance */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#00236F]">Today's Overview</h2>

        {logginedDoctor ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <TodayOverviewCard
                title="Total Patients"
                value={totalPatients}
                percent={100}
                color="#2DD4BF"
                icon={<Users className="w-5 h-5" />}
                footer={
                  recentPatients.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Recently Added
                      </p>
                      {recentPatients.slice(0, 3).map((p) => (
                        <div key={p._id} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[#2DD4BF]/10 text-[#0F9C8A] text-[10px] font-bold flex items-center justify-center shrink-0">
                            {p.firstName?.[0]}
                            {p.lastName?.[0] ?? ""}
                          </span>
                          <span className="text-xs font-medium text-[#00236F] truncate">
                            {p.firstName} {p.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : undefined
                }
              />
              <TodayOverviewCard
                title="Today's Appointments"
                value={quickOverview.todayAppointments.total}
                percent={
                  quickOverview.todayAppointments.total > 0
                    ? Math.round(
                        (quickOverview.todayAppointments.completed /
                          quickOverview.todayAppointments.total) *
                          100,
                      )
                    : 0
                }
                color="#0EA5E9"
                icon={<CalendarDays className="w-5 h-5" />}
                footer={
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Tomorrow's Outlook
                    </p>
                    <p className="text-xs font-bold text-[#00236F]">
                      {quickOverview.tomorrowAppointments} appointments
                      scheduled
                    </p>
                  </div>
                }
              />
              <TodayOverviewCard
                title="Completed Today"
                value={quickOverview.todayAppointments.completed}
                percent={
                  quickOverview.todayAppointments.total > 0
                    ? Math.round(
                        (quickOverview.todayAppointments.completed /
                          quickOverview.todayAppointments.total) *
                          100,
                      )
                    : 0
                }
                color="#22C55E"
                icon={<CheckCircle2 className="w-5 h-5" />}
                footer={
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Pending Today
                    </p>
                    <p className="text-xs font-bold text-[#F59E0B]">
                      {quickOverview.todayAppointments.pending} remaining
                    </p>
                  </div>
                }
              />
            </div>
            <div className="mt-5">
              <TodaysAgenda appointments={todaysAgenda} />
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <TodayOverviewCard
                title="Total Patients"
                value={totalPatients}
                percent={100}
                color="#10B981"
                icon={<Users className="w-5 h-5" />}
                footer={
                  recentPatients.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Recently Added
                      </p>
                      {recentPatients.slice(0, 3).map((p) => (
                        <div key={p._id} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {p.firstName?.[0]}
                            {p.lastName?.[0] ?? ""}
                          </span>
                          <span className="text-xs font-medium text-slate-900 truncate">
                            {p.firstName} {p.lastName}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : undefined
                }
              />
              <TodayOverviewCard
                title="Appointments"
                value={totalSummary.totalAppointments}
                percent={completionRate}
                color="#0EA5E9"
                icon={<CalendarDays className="w-5 h-5" />}
                footer={
                  upcomingList.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Up Next
                      </p>
                      {upcomingList.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {a.firstName?.[0]}
                              {a.lastName?.[0] ?? ""}
                            </span>
                            <span className="text-xs font-medium text-slate-900 truncate">
                              {a.firstName} {a.lastName}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {String(a.startTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Up Next
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        No upcoming appointments
                      </p>
                    </div>
                  )
                }
              />
              <TodayOverviewCard
                title="Completed"
                value={totalSummary.completedAppointments}
                percent={completionRate}
                color="#22C55E"
                icon={<CheckCircle2 className="w-5 h-5" />}
                footer={
                  completedList.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Recently Completed
                      </p>
                      {completedList.map((a) => (
                        <div
                          key={a._id}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-6 h-6 rounded-full bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold flex items-center justify-center shrink-0">
                              {a.firstName?.[0]}
                              {a.lastName?.[0] ?? ""}
                            </span>
                            <span className="text-xs font-medium text-slate-900 truncate">
                              {a.firstName} {a.lastName}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0">
                            {String(a.startTime)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Recently Completed
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        No recent completions
                      </p>
                    </div>
                  )
                }
              />
            </div>
            <MiniCalendar />
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {!hideEnquiryData && (
            <SummaryCard
              title="Enquiries"
              value={totalSummary.totalEnquiries}
              subtitle=""
              accentColor="#64748B"
              icon={<Mail className="w-6 h-6" />}
            />
          )}

          <SummaryCard
            title="Cancelled"
            value={totalSummary.cancelledAppointments}
            subtitle=""
            accentColor="#EF4444"
            icon={<XCircle className="w-6 h-6" />}
          />
        </div>
      </section>

      {/* New Enquiries + Recent Appointments, mirroring the requests/patient-list pairing */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AppointmentRequests enquiries={newEnquiries} slug={slug} />
        <RecentAppointmentsTable
          appointments={recentAppointments}
          slug={slug}
        />
      </section>

      {!logginedDoctor && (
        <section className="mt-6">
          <div className="w-full">
            <DoctorAppointmentSummary doctors={doctorsAppointmentSummary} />
          </div>
        </section>
      )}

      {/* Quick Overview */}
      <div className="mt-8">
        <QuickOverview data={quickOverview} />
      </div>

      {/* Enquiry Analytics */}
      {!logginedDoctor && !hideEnquiryData && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Enquiry Analytics
            </h2>
          </div>

          <div className="bg-white rounded-3xl border-t-4 border-t-emerald-500 border-x border-b border-slate-200 shadow-sm p-5 transition-all duration-300 hover:shadow-md">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm md:text-lg text-nowrap font-semibold text-slate-900">
                Enquiries vs Appointments
              </h3>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={enquiryData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient
                      id="colorEnquiries"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorAppointments"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0EA5E9"
                        stopOpacity={0.35}
                      />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#94A3B8", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    content={<AreaBubbleTooltip />}
                    cursor={{ stroke: "#CBD5E1", strokeDasharray: "3 3" }}
                  />

                  {/* Enquiries – same slate used by the Enquiries stat card */}
                  <Area
                    type="monotone"
                    dataKey="totalEnquiries"
                    name="Enquiries"
                    stroke="#64748B"
                    strokeWidth={2.5}
                    fill="url(#colorEnquiries)"
                    dot={{ r: 4, fill: "#64748B", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Appointments – same sky-blue used by the Appointments stat card */}
                  <Area
                    type="monotone"
                    dataKey="appointmentsBooked"
                    name="Appointments"
                    stroke="#0EA5E9"
                    strokeWidth={2.5}
                    fill="url(#colorAppointments)"
                    dot={{ r: 4, fill: "#0EA5E9", strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{
                      paddingTop: "16px",
                      fontSize: "13px",
                      fontWeight: 600,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Appointment Analytics */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Appointment Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border-t-4 border-t-[#0EA5E9] border-x border-b border-slate-200 shadow-sm p-5 transition-all duration-300 hover:shadow-md">
            <p className="font-semibold mb-4 text-slate-900">
              Monthly Appointments
            </p>
            <div className="h-[340px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appointmentData}
                  barSize={34}
                  margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="monthName"
                    interval={0}
                    padding={{ left: 40, right: 40 }}
                    tick={{ fill: "#94A3B8", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Bar dataKey="totalAppointments" radius={[8, 8, 8, 8]}>
                    {appointmentData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getBarColor(
                          entry.totalAppointments ?? 0,
                          maxAppointments,
                        )}
                      />
                    ))}

                    <LabelList
                      dataKey="totalAppointments"
                      position="center"
                      fill="#0D1117"
                      fontSize={13}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white rounded-3xl border-t-4 border-t-[#A78BFA] border-x border-b border-slate-200 shadow-sm p-5 flex flex-col items-center transition-all duration-300 hover:shadow-md">
            <p className="font-semibold text-slate-900">Status Distribution</p>
            <div className="w-full h-full">
              <EnhancedPieChart pieData={pieData} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;

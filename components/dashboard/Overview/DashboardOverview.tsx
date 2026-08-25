"use client";

import React, { useEffect, useState } from "react";
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
  LineChart,
  Line,
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
import EnhancedPieChart from "./DashboardPieChart";
import {
  ClipboardList,
  CalendarCheck,
  CheckCircle2,
  XCircle, Mail, CalendarDays,
} from "lucide-react";
import SummaryCard from "./SummaryCard";
import DoctorAppointmentSummary from "./DoctorAppointmentSummary";
import QuickOverview from "./QuickOverview";
import Image from "next/image";

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

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  SCHEDULED: "#F8D66D",
  COMPLETED: "#62D99E",
  CANCELLED: "#FF6B6B",
  NO_SHOW: "#C084FC",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[white] px-4 py-3 rounded-xl shadow-lg border">
      <p className="font-semibold text-gray-900">
        {payload[0].payload.monthName}
      </p>
      <p className="text-sm text-gray-600">
        <span className="font-bold text-blue-600">{payload[0].value}</span>{" "}
        appointments
      </p>
    </div>
  );
};
//bar color intensity based on value
function getBarColor(value: number, max: number) {
  const base = { r: 41, g: 172, b: 106 }; // #29AC6A

  if (!max || max <= 0) return "rgb(200, 230, 215)"; // fallback

  const ratio = Math.min(Math.max(value / max, 0), 1); // clamp 0–1

  const r = Math.round(base.r + (255 - base.r) * (1 - ratio));
  const g = Math.round(base.g + (255 - base.g) * (1 - ratio));
  const b = Math.round(base.b + (255 - base.b) * (1 - ratio));

  return `rgb(${r}, ${g}, ${b})`;
}

const DashboardHome = ({
  appointmentData,
  doctors,
  enquiryData,
  totalSummary,
  doctorsAppointmentSummary,
  quickOverview,
}: {
  appointmentData: MonthWiseReport;
  doctors: Doctor[];
  enquiryData: EnquiryReport[];
  totalSummary: DashboardTotalSummary;
  doctorsAppointmentSummary: DoctorAppointmentSummaryItem[];
  quickOverview: QuickOverviewData;
}) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [initializing, setInitializing] = useState(true);
  const maxAppointments = Math.max(
    ...appointmentData.map((d) => d.totalAppointments ?? 0)
  );

  const initialYear =
    searchParams.get("year") || new Date().getFullYear().toString();
  const [year, setYear] = useState(initialYear);

  const logginedDoctor =
    user?.role === "DOCTOR"
      ? doctors.find((d) => d.email === user.email)
      : null;

  useEffect(() => {
    if (!searchParams.get("year")) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("year", initialYear);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, []);

  const updateYearFilter = (newYear: string) => {
    setYear(newYear);
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", newYear);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!logginedDoctor) {
      setInitializing(false);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (params.get("doctor") !== logginedDoctor._id.toString()) {
      params.set("doctor", logginedDoctor._id.toString());
      setInitializing(true);
      router.replace(`${pathname}?${params.toString()}`);
      return;
    }

    setInitializing(false);
  }, [logginedDoctor, searchParams, pathname, router]);

  const totalAppointments = appointmentData.reduce(
    (sum, i) => sum + i.totalAppointments,
    0
  );

  const statusSummary = appointmentData.reduce(
    (acc, item) => {
      Object.entries(item.statusSummary || {}).forEach(([k, v]) => {
        acc[k] = (acc[k] || 0) + (v as number);
      });
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(statusSummary).map(([key, value]) => ({
    name: key.replace("_", " "),
    value,
    color: STATUS_COLORS[key as AppointmentStatus],
  }));

  if (initializing) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#00236F] tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-2">
            Here is the latest update for your clinic today.
          </p>
        </div>

        {/* Right */}
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
                <SelectItem key={y} value={y.toString()} className="font-medium text-[#00236F]">
                  {y}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <section className="grid grid-cols-1 gap-6 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <SummaryCard
            title="Enquiries"
            value={totalSummary.totalEnquiries}
            subtitle=""
            accentColor="#64748B"
            icon={<Mail className="w-6 h-6" />}
          />

          <SummaryCard
            title="Appointments"
            value={totalSummary.totalAppointments}
            subtitle=""
            accentColor="#2DD4BF"
            icon={<CalendarDays className="w-6 h-6" />}
          />

          <SummaryCard
            title="Completed"
            value={totalSummary.completedAppointments}
            subtitle=""
            accentColor="#0EA5E9"
            icon={<CheckCircle2 className="w-6 h-6" />}
          />

          <SummaryCard
            title="Cancelled"
            value={totalSummary.cancelledAppointments}
            subtitle=""
            accentColor="#EF4444"
            icon={<XCircle className="w-6 h-6" />}
          />
        </div>
      </section>

      <section className="mt-6">
        <div className="w-full">
          <DoctorAppointmentSummary doctors={doctorsAppointmentSummary} />
        </div>
      </section>

      {/* Quick Overview */}
      <div className="mt-8">
        <QuickOverview data={quickOverview} />
      </div>

      {/* Enquiry Analytics */}
      {!logginedDoctor && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#00236F]">
              Enquiry Analytics
            </h2>
          </div>

          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,35,111,0.08)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-sm md:text-lg text-nowrap font-semibold text-[#00236F]">
                Enquiries vs Appointments
              </h3>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={enquiryData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />

                  <XAxis
                    dataKey="monthName"
                    tick={{ fill: "#2563eb", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "#2563eb", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.96)",
                      border: "1px solid #E5E7EB",
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ stroke: "#E5E7EB", strokeDasharray: "3 3" }}
                  />

                  <Legend
                    verticalAlign="top"
                    align="left"
                    iconType="square"
                    wrapperStyle={{
                      paddingBottom: "16px",
                      fontSize: "13px",
                    }}
                  />

                  {/* Enquiries – Green */}
                  <Line
                    type="monotone"
                    dataKey="totalEnquiries"
                    name="Enquiries"
                    stroke="#22C55E"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#22C55E" }}
                    activeDot={{ r: 6 }}
                  />

                  {/* Appointments – Blue */}
                  <Line
                    type="monotone"
                    dataKey="appointmentsBooked"
                    name="Appointments"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#3B82F6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>
      )}

      {/* Appointment Analytics */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#00236F]">
          Appointment Analytics
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Appointment chart */}
          <div className="lg:col-span-2 bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,35,111,0.08)]">
            <p className="font-semibold mb-4 text-[#00236F]">
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
                    tick={{ fill: "#2E7D4F", fontSize: 13 }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip />

                  <Bar dataKey="totalAppointments" radius={[8, 8, 8, 8]}>
                    {appointmentData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={getBarColor(
                          entry.totalAppointments ?? 0,
                          maxAppointments
                        )}
                      />
                    ))}

                    <LabelList
                      dataKey="totalAppointments"
                      position="center"
                      fill="#0F3D2E"
                      fontSize={13}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col items-center transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,35,111,0.08)]">
            <p className="font-semibold text-[#00236F]">Status Distribution</p>
            <div className="w-full h-full">
              <EnhancedPieChart pieData={pieData} />
            </div>
            {/* <p className="text-4xl font-bold mt-4">{totalAppointments}</p>
            <span className="text-sm text-gray-500">Total appointments</span> */}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardHome;



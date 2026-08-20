"use client";

import { CalendarCheck, Users, CalendarDays } from "lucide-react";
import { QuickOverviewData } from "./DashboardOverview";
import Image from "next/image";

interface QuickOverviewProps {
  data: QuickOverviewData;
}

export default function QuickOverview({ data }: QuickOverviewProps) {
  const { todayAppointments, consultationBreakdown, tomorrowAppointments } =
    data;

  return (
    <section className="space-y-4">
      <h3 className="text-sm font-semibold text-green-700">Quick Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* ---------------- Today Appointments ---------------- */}
        <div className="bg-white rounded-3xl border border-[#0D4209] p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {todayAppointments.total}
              </p>
              <p className="text-sm font-medium text-gray-800">
                Today’s Appointments
              </p>
            </div>

            <Image src={"/admin/dashboard-overview/total-appointments2.png"} alt="Total Appointments" width={30} height={30} className="w-6 h-6"/>
          </div>

          <div className="flex gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium border border-[#ADF5D3]">
              {todayAppointments.completed} Completed
            </span>

            <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium border border-[#FF9F9F]">
              {todayAppointments.pending} Pending
            </span>
          </div>
        </div>

        {/* ---------------- Consultation Breakdown ---------------- */}
        <div className="bg-white rounded-2xl border border-[#0D4209] p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {Object.values(consultationBreakdown).reduce(
                  (a, b) => a + b,
                  0
                )}
              </p>
              <p className="text-sm font-medium text-gray-800">
                Today’s Consultation Breakdown
              </p>
            </div>

            <Image src={"/admin/dashboard-overview/consultation1.png"} alt="Consultation" width={30} height={30} className="w-6 h-6"/>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-medium border border-[#FFC9A7]">
              Skin:{consultationBreakdown.skin ?? 0}
            </span>

            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium border border-[#C1B3FF]">
              Hair:{consultationBreakdown.hair ?? 0}
            </span>

            <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium border border-[#FFEEA6]">
              Body:{consultationBreakdown.body ?? 0}
            </span>
          </div>
        </div>

        {/* ---------------- Tomorrow Schedule ---------------- */}
        <div className="bg-white rounded-2xl border border-[#0D4209] p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-3xl font-semibold text-gray-900">
                {tomorrowAppointments}
              </p>
              <p className="text-sm font-medium text-gray-800">
                Tomorrow’s schedule
              </p>
            </div>

            <Image src={"/admin/dashboard-overview/icon-tommorrow.png"} alt="Schedule" width={30} height={30} className="w-6 h-6"/>
          </div>

          <span className="inline-block text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-medium border border-[#88ABFF]">
            {tomorrowAppointments} Appointments
          </span>
        </div>
      </div>
    </section>
  );
}

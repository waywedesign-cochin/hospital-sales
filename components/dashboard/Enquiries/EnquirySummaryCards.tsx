"use client";

import React from "react";
import Image from "next/image";

/* ---------------- Types ---------------- */

export interface EnquirySummaryCardsData {
  // Today snapshot
  newEnquiries: number;
  contacted: number;
  appointmentsBooked: number;
  followUps: number;

  // Monthly overview
  totalEnquiries: number;
  conversionRate: number;
  topCategory: string;
}

interface Props {
  data: EnquirySummaryCardsData;
}

/* ---------------- Component ---------------- */

export default function EnquirySummaryCards({ data }: Props) {
  return (
    <section className="space-y-10">
      {/* ================= Today Snapshot ================= */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-green-700">
          Today’s Enquiry Snapshot
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <SummaryCard
            title="New Enquiries"
            value={data.newEnquiries}
            subtitle="Received Today"
            topColor="bg-blue-500"
            icon={
              <Image
                src="/admin/enquiry/new-enquiries.png"
                alt="New Enquiries"
                width={20}
                height={20}
              />
            }
          />

          <SummaryCard
            title="Contacted Enquiries"
            value={data.contacted}
            subtitle="Contacted Today"
            topColor="bg-blue-500"
            icon={
              <Image
                src="/admin/enquiry/contacted.png"
                alt="Contacted Enquiries"
                width={20}
                height={20}
              />
            }
          />

          <SummaryCard
            title="Appointments Fixed"
            value={data.appointmentsBooked}
            subtitle="Booked visits"
            topColor="bg-blue-500"
            icon={
              <Image
                src="/admin/enquiry/apppointment-fixed.png"
                alt="Appointments Fixed"
                width={20}
                height={20}
              />
            }
          />

          <SummaryCard
            title="Follow-ups Required"
            value={data.followUps}
            subtitle="Needs Follow-up"
            topColor="bg-blue-500"
            icon={
              <Image
                src="/admin/enquiry/follow-ups.png"
                alt="Follow-ups"
                width={20}
                height={20}
              />
            }
          />
        </div>
      </div>

      {/* ================= Monthly Overview ================= */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-green-700">
          Monthly Enquiry Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Enquiries"
            value={data.totalEnquiries}
            subtitle="This Month"
            topColor="bg-green-500"
            icon={
              <Image
                src="/admin/enquiry/top-enquired.png"
                alt="Total Enquiries"
                width={20}
                height={20}
              />
            }
          />

          <SummaryCard
            title="Conversion Rate"
            value={`${data.conversionRate}%`}
            subtitle="Appointments Confirmed"
            topColor="bg-green-500"
            icon={
              <Image
                src="/admin/enquiry/conversion-rate.png"
                alt="Conversion Rate"
                width={20}
                height={20}
              />
            }
          />

          <SummaryCard
            title="Top Interested Category"
            value={data.topCategory}
            subtitle="Most requested service"
            topColor="bg-green-500"
            icon={
              <Image
                src="/admin/enquiry/top-enquired.png"
                alt="Top Interested Category"
                width={20}
                height={20}
              />
            }
          />
        </div>
      </div>
    </section>
  );
}

/* ---------------- Card ---------------- */

function SummaryCard({
  title,
  value,
  subtitle,
  topColor,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  topColor: string;
  icon: React.ReactNode;
}) {
  const accentColor = "#22C55E"; // Green accent
  return (
    <div
      className="
        bg-white/70 backdrop-blur-2xl
        rounded-2xl
        border border-white/60
        shadow-[0_4px_20px_rgba(0,35,111,0.03)]
        p-3 md:p-4
        flex items-center justify-between
        transition-all duration-300
        hover:shadow-[0_6px_25px_rgba(0,35,111,0.06)]
        hover:scale-[1.02]
      "
    >
      <div className="flex flex-col gap-1 overflow-hidden mr-2">
        <p className="text-[9px] font-bold tracking-widest text-[#00236F]/60 uppercase whitespace-nowrap truncate">
          {title}
        </p>
        <p className="text-xl font-black text-[#00236F]">
          {value}
        </p>
        {subtitle && (
          <p className="text-[10px] font-medium text-[#00236F]/60 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {icon && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm shrink-0"
          style={{
            backgroundColor: `${accentColor}15`,
            color: accentColor,
            border: `1px solid ${accentColor}30`
          }}
        >
          <div className="scale-75 flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
    </div>
  );
}

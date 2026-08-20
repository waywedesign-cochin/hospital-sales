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
  topCategory: "SKIN" | "HAIR" | "BODY";
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
  return (
    <div className="relative bg-white border-2 border-t-0 border-black rounded-2xl overflow-hidden">
      {/* TOP SOLID COLOR STRIP */}
      <div className={`absolute top-0 left-0 w-full h-2 ${topColor}`} />

      <div className="relative p-6">
        <p className="text-sm font-medium text-gray-800">{title}</p>

        <p className="mt-4 text-5xl font-bold text-black">{value}</p>

        <p className="mt-3 text-sm text-gray-600">{subtitle}</p>

        {/* Icon */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { DoctorAppointmentSummaryItem } from "./DashboardOverview";
import { User } from "lucide-react";

interface DoctorAppointmentSummaryProps {
  doctors: DoctorAppointmentSummaryItem[];
}

function getProgressColor(percentage: number) {
  const base = { r: 41, g: 172, b: 106 };
  const value = Math.min(Math.max(percentage, 0), 100);
  const alpha = 0.35 + (value / 100) * 0.65;
  return `rgba(${base.r}, ${base.g}, ${base.b}, ${alpha})`;
}

export default function DoctorAppointmentSummary({
  doctors,
}: DoctorAppointmentSummaryProps) {
  const [animate, setAnimate] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate ONCE, when doctors data is ready
    if (!hasAnimated.current && doctors.length > 0) {
      requestAnimationFrame(() => {
        setAnimate(true);
        hasAnimated.current = true;
      });
    }
  }, [doctors]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5 h-[360px] w-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-5">
        Doctor Appointment Summary
      </h3>

      <div className="flex-1 overflow-y-auto pr-2 space-y-5 green-scrollbar">
        {doctors.map((doctor) => {
          const completed = doctor.completedAppointments;
          const total = doctor.totalAppointments || 1;
          const percentage = Math.round((completed / total) * 100);

          return (
            <div key={doctor.doctorId} className="space-y-2">
              {/* Header */}
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span className="font-medium flex gap-1">
                  <User className="h-3.5 w-4" /> {doctor.name}
                </span>
                <span>
                  {completed}/{total} Appointments
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-1">
                <div className="relative flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animate ? `${percentage}%` : "0%",
                      backgroundColor: getProgressColor(percentage),
                    }}
                  />
                </div>

                <span className="text-xs text-gray-600 min-w-8 text-right">
                  {percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

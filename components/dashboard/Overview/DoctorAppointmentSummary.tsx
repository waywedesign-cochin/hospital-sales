"use client";

import { useEffect, useRef, useState } from "react";
import { DoctorAppointmentSummaryItem } from "./DashboardOverview";
import { User, Activity } from "lucide-react";

interface DoctorAppointmentSummaryProps {
  doctors: DoctorAppointmentSummaryItem[];
}

function getProgressColor(percentage: number) {
  const base = { r: 45, g: 212, b: 191 }; // #2DD4BF Teal Accent
  const value = Math.min(Math.max(percentage, 0), 100);
  const alpha = 0.5 + (value / 100) * 0.5;
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

  // If no doctors, show the exact empty state from the image
  if (!doctors || doctors.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 h-[340px] w-full flex flex-col">
        {/* Header with Toggle */}
        <div className="flex justify-between items-center mb-auto">
          <h3 className="text-lg font-bold text-[#00236F]">
            Doctor Appointment Summary
          </h3>
          <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
            <button className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 rounded-md transition-colors">
              Daily
            </button>
            <button className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00236F] bg-[#E0F2FE] rounded-md shadow-sm transition-colors">
              Weekly
            </button>
          </div>
        </div>

        {/* Empty State Body */}
        <div className="flex flex-col items-center justify-center mb-auto opacity-60">
          <Activity className="w-8 h-8 text-slate-300 mb-4" />
          <p className="text-sm font-semibold text-slate-500">
            Chart data visualization will appear here.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Awaiting sufficient data for the selected period.
          </p>
        </div>
      </div>
    );
  }

  // If doctors exist, show them using the new styling
  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 h-[340px] w-full flex flex-col">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-lg font-bold text-[#00236F]">
          Doctor Appointment Summary
        </h3>
        <div className="flex items-center bg-slate-100/50 p-1 rounded-lg">
          <button className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-600 rounded-md transition-colors">
            Daily
          </button>
          <button className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#00236F] bg-[#E0F2FE] rounded-md shadow-sm transition-colors">
            Weekly
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-6 modern-scrollbar">
        {doctors.map((doctor) => {
          const completed = doctor.completedAppointments;
          const total = doctor.totalAppointments || 1;
          const percentage = Math.round((completed / total) * 100);

          return (
            <div key={doctor.doctorId} className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-[#00236F] flex items-center gap-2">
                  <User className="h-4 w-4 text-[#2DD4BF]" /> {doctor.name}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {completed}/{total}
                </span>
              </div>

              {/* Progress */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: animate ? `${percentage}%` : "0%",
                      backgroundColor: getProgressColor(percentage),
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-[#00236F] min-w-8 text-right">
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

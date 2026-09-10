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

type ActivityBadgeKind =
  | "ACTIVE"
  | "ON_LEAVE"
  | "INACTIVE"
  | "NEVER_LOGGED_IN"
  | "NO_LOGIN";

const BADGE_CONFIG: Record<
  ActivityBadgeKind,
  { label: string; dot: string; classes: string }
> = {
  ACTIVE: {
    label: "Active",
    dot: "bg-emerald-500",
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ON_LEAVE: {
    label: "On Leave",
    dot: "bg-amber-500",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  INACTIVE: {
    label: "Inactive",
    dot: "bg-slate-400",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
  },
  NEVER_LOGGED_IN: {
    label: "Never Logged In",
    dot: "bg-amber-400",
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  NO_LOGIN: {
    label: "No Login Access",
    dot: "bg-slate-400",
    classes: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

// The employment "status" an admin sets by hand (Active/On Leave/Inactive)
// says nothing about whether the doctor has ever actually signed in — a
// doctor left as "Active" who never logged in shouldn't read as currently
// active. On-leave/inactive is an explicit override; otherwise the badge
// reflects real login history instead.
function getActivityBadge(doctor: DoctorAppointmentSummaryItem): ActivityBadgeKind {
  if (doctor.status === "ON_LEAVE") return "ON_LEAVE";
  if (doctor.status === "INACTIVE") return "INACTIVE";
  if (!doctor.hasLoginAccount) return "NO_LOGIN";
  if (!doctor.lastActiveAt) return "NEVER_LOGGED_IN";
  return "ACTIVE";
}

function StatusBadge({ kind }: { kind: ActivityBadgeKind }) {
  const config = BADGE_CONFIG[kind];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border shrink-0 ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function formatRelativeTime(date?: string | Date) {
  if (!date) return "recently";
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
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

          const badgeKind = getActivityBadge(doctor);
          const showLastActiveCaption =
            badgeKind === "ON_LEAVE" || badgeKind === "INACTIVE";

          return (
            <div key={doctor.doctorId} className="space-y-3">
              {/* Header */}
              <div className="flex justify-between items-start text-sm gap-3">
                <div className="min-w-0">
                  <span className="font-semibold text-[#00236F] flex items-center gap-2 flex-wrap">
                    <User className="h-4 w-4 text-[#2DD4BF] shrink-0" />
                    <span className="truncate">{doctor.name}</span>
                    <StatusBadge kind={badgeKind} />
                  </span>
                  {showLastActiveCaption && (
                    <p className="text-[10px] font-medium text-slate-400 mt-1 ml-6">
                      {doctor.lastActiveAt
                        ? `Last active ${formatRelativeTime(doctor.lastActiveAt)}`
                        : "Never logged in"}
                    </p>
                  )}
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
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

"use client";

import { useEffect, useState, useTransition } from "react";
import { CalendarCheck2, Clock, CheckCircle2, Play, Check } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { updateAppointmentStatusAction } from "@/app/actions/appointmentsActions";

export interface AgendaAppointment {
  _id: string;
  bookingId: string;
  firstName: string;
  lastName?: string;
  treatmentCategory?: string;
  patientId?: string | null;
  startTime: number; // minutes since midnight
  startTimeLabel: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

const TICK_MS = 30 * 1000;

function minutesSinceMidnightNow(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

function formatCountdown(minutesUntil: number) {
  if (minutesUntil <= 0) return "Now";
  if (minutesUntil < 60) return `in ${minutesUntil}m`;
  const hours = Math.floor(minutesUntil / 60);
  const mins = minutesUntil % 60;
  return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
}

export default function TodaysAgenda({
  appointments,
}: {
  appointments: AgendaAppointment[];
}) {
  const [now, setNow] = useState(() => new Date());
  const params = useParams();
  const slug = params.slug as string;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(id);
  }, []);

  const handleUpdateStatus = (id: string, status: "IN_PROGRESS" | "COMPLETED") => {
    startTransition(async () => {
      await updateAppointmentStatusAction(id, status);
      router.refresh();
    });
  };

  const nowMinutes = minutesSinceMidnightNow(now);
  const upcoming = appointments.filter(
    (a) => a.status === "SCHEDULED" || a.status === "IN_PROGRESS",
  );
  const nextId =
    upcoming.find((a) => a.status === "IN_PROGRESS")?._id ??
    upcoming.find((a) => a.startTime >= nowMinutes)?._id ??
    upcoming[0]?._id;

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#00236F] flex items-center gap-2">
          <CalendarCheck2 className="w-5 h-5 text-[#2DD4BF]" />
          Today&apos;s Agenda
        </h3>
        <span className="text-xs font-bold text-slate-400">
          {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {appointments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-60">
          <CalendarCheck2 className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            No appointments today.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5 flex-1 overflow-y-auto modern-scrollbar">
          {appointments.map((apt) => {
            const isNext = apt._id === nextId;
            const isDone =
              apt.status === "COMPLETED" || apt.status === "NO_SHOW";
            const minutesUntil = apt.startTime - nowMinutes;

            return (
              <div
                key={apt._id}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  isNext
                    ? "bg-[#2DD4BF]/10 border-[#2DD4BF]/40 shadow-sm"
                    : isDone
                      ? "border-transparent opacity-50"
                      : "border-transparent hover:bg-slate-50"
                }`}
              >
                <div
                  className={`w-11 text-center shrink-0 text-xs font-bold ${
                    isNext ? "text-[#00236F]" : "text-slate-500"
                  }`}
                >
                  {apt.startTimeLabel}
                </div>

                <div className="flex-1 min-w-0 flex flex-col">
                  {apt.patientId ? (
                    <Link
                      href={`/${slug}/patients/${apt.patientId}`}
                      className="text-sm font-semibold text-[#00236F] truncate hover:underline"
                    >
                      {apt.firstName} {apt.lastName}
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-[#00236F] truncate">
                      {apt.firstName} {apt.lastName}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 truncate">
                    {apt.treatmentCategory || "General consultation"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Actions for Next/In Progress */}
                  {!isDone && apt.status === "SCHEDULED" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(apt._id, "IN_PROGRESS")}
                      className="hidden sm:flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}
                  {!isDone && apt.status === "IN_PROGRESS" && (
                    <button
                      disabled={isPending}
                      onClick={() => handleUpdateStatus(apt._id, "COMPLETED")}
                      className="hidden sm:flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-[10px] font-bold transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3 h-3" />
                      Complete
                    </button>
                  )}

                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isNext ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#00236F] bg-white px-2 py-1 rounded-full border border-[#2DD4BF]/40 shrink-0 whitespace-nowrap">
                      <Clock className="w-3 h-3 text-[#2DD4BF]" />
                      {apt.status === "IN_PROGRESS"
                        ? "In Progress"
                        : formatCountdown(minutesUntil)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-400 shrink-0 whitespace-nowrap">
                      {formatCountdown(minutesUntil)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

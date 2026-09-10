"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export default function MiniCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [
    ...Array(firstDayIndex).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-bold text-[#00236F]">
          {cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCursor(new Date(year, month - 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#00236F] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCursor(new Date(year, month + 1, 1))}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-[#00236F] transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAYS.map((d) => (
          <span
            key={d}
            className="text-[10px] font-bold text-[#00236F]/40 uppercase"
          >
            {d}
          </span>
        ))}

        {cells.map((day, idx) =>
          day === null ? (
            <span key={`empty-${idx}`} />
          ) : (
            <button
              key={day}
              onClick={() =>
                router.push(
                  `/${slug}/appointments/calendar?date=${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
                )
              }
              className={`mx-auto w-7 h-7 rounded-full text-xs font-semibold transition-colors ${
                isToday(day)
                  ? "bg-[#00236F] text-white shadow-sm"
                  : "text-[#00236F]/80 hover:bg-slate-100"
              }`}
            >
              {day}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

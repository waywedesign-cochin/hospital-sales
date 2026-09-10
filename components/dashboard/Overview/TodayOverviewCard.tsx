import { ReactNode } from "react";

interface TodayOverviewCardProps {
  title: string;
  value: number;
  percent: number;
  color: string;
  icon: ReactNode;
}

export default function TodayOverviewCard({
  title,
  value,
  percent,
  color,
  icon,
}: TodayOverviewCardProps) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col gap-4 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,35,111,0.08)] hover:scale-[1.01]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-black text-[#00236F]">{value}</p>
          <p className="text-xs font-bold text-[#00236F]/60 uppercase tracking-wider mt-1">
            {title}
          </p>
        </div>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}18`, color }}
        >
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${clamped}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-xs font-bold" style={{ color }}>
          {clamped}%
        </span>
      </div>
    </div>
  );
}

import { ReactNode } from "react";

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon?: ReactNode;
  accentColor: string;
}

export default function SummaryCard({
  title,
  value,
  icon,
  accentColor,
}: SummaryCardProps) {
  return (
    <div
      className="
        bg-white/70 backdrop-blur-2xl
        rounded-3xl
        border border-white/60
        shadow-[0_8px_30px_rgba(0,35,111,0.04)]
        p-4 md:p-5
        flex items-center justify-between
        transition-all duration-300
        hover:shadow-[0_8px_30px_rgba(0,35,111,0.08)]
        hover:scale-[1.02]
      "
    >
      <div className="flex flex-col gap-1.5">
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#00236F]/60 uppercase whitespace-nowrap">
          {title}
        </p>
        <p className="text-2xl font-black text-[#00236F]">
          {value}
        </p>
      </div>

      {icon && (
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
          style={{
            backgroundColor: `${accentColor}15`, // very light accent bg
            color: accentColor,
            border: `1px solid ${accentColor}30`
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

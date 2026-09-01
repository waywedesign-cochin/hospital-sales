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
  subtitle,
  icon,
  accentColor,
}: SummaryCardProps) {
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
            backgroundColor: `${accentColor}15`, // very light accent bg
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

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
        bg-white
        rounded-[14px]
        border-x-3 border-black
        border-b-[6px] border-b-black
        p-5
       
        flex flex-col justify-between
      "
      style={{
        borderTopWidth: "8px",
        borderTopStyle: "solid",
        borderTopColor: accentColor,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <p className="text-[15px] font-medium text-black">{title}</p>

        {icon && (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "#EAF8F0",
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-[44px] font-extrabold leading-none text-black">
        {value}
      </p>

      {/* Subtitle */}
      <p className="text-[14px] text-gray-700">{subtitle}</p>
    </div>
  );
}

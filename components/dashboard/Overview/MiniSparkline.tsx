"use client";

import { AreaChart, Area, ResponsiveContainer } from "recharts";

export default function MiniSparkline({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const chartData = data.map((value, i) => ({ i, value }));
  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <div className="h-12 w-full -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.35} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

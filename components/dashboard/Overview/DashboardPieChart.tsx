import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";

interface PieDatum {
  name: string;
  value: number;
  color: string;
}

// Defined at module scope: declaring these inside the component made React treat
// the tooltip as a brand-new component type on every render, remounting it each time.
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white px-5 py-3 rounded-xl shadow-2xl border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: payload[0].payload.color }}
        />
        <p className="font-bold text-gray-900 text-sm">{payload[0].name}</p>
      </div>
      <p
        className="text-xl font-bold text-center"
        style={{ color: payload[0].payload.color }}
      >
        {payload[0].value}
      </p>
    </div>
  );
};

const EnhancedPieChart = ({ pieData }: { pieData: PieDatum[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const total = pieData.reduce((sum, d) => sum + d.value, 0) || 1;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {pieData.map((entry, idx) => (
                <filter key={idx} id={`glow-${idx}`}>
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            <Tooltip content={<CustomTooltip />} />

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={3}
              cornerRadius={8}
              labelLine={false}
              onMouseEnter={(_, idx) => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
              stroke="none"
            >
              {pieData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.color}
                  style={{
                    filter:
                      activeIndex === idx
                        ? `url(#glow-${idx}) drop-shadow(0 4px 8px rgba(0,0,0,0))`
                        : "none",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transformOrigin: "center",
                    transform: activeIndex === idx ? "scale(1.03)" : "scale(1)",
                    cursor: "pointer",
                    opacity:
                      activeIndex === null ? 1 : activeIndex === idx ? 1 : 0.6,
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend: colored dot + bold percentage + label, like a share-of-total readout */}
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 pt-3 shrink-0">
        {pieData.map((entry, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <div className="leading-tight">
              <p className="text-xs font-bold" style={{ color: entry.color }}>
                {Math.round((entry.value / total) * 100)}%
              </p>
              <p className="text-[10px] font-medium text-slate-500 capitalize">
                {entry.name.toLowerCase()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPieChart;

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useState } from "react";

const EnhancedPieChart = ({ pieData }: { pieData: any[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const RADIAN = Math.PI / 180;

  const renderSliceLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    value,
  }: any) => {
    if (!value) return null;

    const radius = innerRadius + (outerRadius - innerRadius) / 2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize={12}
        fontWeight={600}
        pointerEvents="none"
      >
        {value}
      </text>
    );
  };

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

  return (
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

        <Legend
          verticalAlign="bottom"
          height={40}
          wrapperStyle={{
            fontSize: "13px",
            fontWeight: 600,
            paddingTop: "20px",
            marginBottom: "20px",
          }}
          iconType="circle"
          iconSize={10}
        />

        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          label={renderSliceLabel}
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
  );
};

export default EnhancedPieChart;

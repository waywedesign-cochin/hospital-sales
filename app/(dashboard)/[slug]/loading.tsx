import { BriefcaseMedical } from "lucide-react";

export default function Loading() {
  return (
    <div className="relative flex h-screen w-full items-center justify-center bg-[#F8FAFC] overflow-hidden">
      {/* Subtle dot grid background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Soft radial glow behind the mark */}
      <div className="absolute h-[420px] w-[420px] rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative flex flex-col items-center gap-8">
        {/* Brand Mark with orbiting ring loader */}
        <div className="relative flex items-center justify-center h-24 w-24">
          {/* Spinning gradient ring */}
          <svg
            className="absolute inset-0 h-full w-full animate-spin"
            style={{ animationDuration: "1.4s" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="url(#ringGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="80 200"
            />
            <defs>
              <linearGradient
                id="ringGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Static faint track ring */}
          <div className="absolute inset-0 rounded-full border-2 border-slate-200" />

          {/* Icon badge */}
          <div className="relative z-10 h-16 w-16 rounded-2xl bg-[#0D1117] shadow-lg shadow-slate-900/10 flex items-center justify-center">
            <BriefcaseMedical size={28} className="text-emerald-400" />
          </div>
        </div>

        {/* Brand Text */}
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Healthcare CRM
          </h2>
          <p className="text-xs font-medium text-slate-400 tracking-wide">
            Setting up your workspace
          </p>
        </div>

        {/* Shimmer progress bar */}
        <div className="relative h-1 w-48 rounded-full bg-slate-200 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 animate-[loading-bar_1.2s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(340%); }
        }
      `}</style>
    </div>
  );
}

import { BriefcaseMedical } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F4F7FB]">
      <div className="flex flex-col items-center gap-8">
        {/* Animated Brand Mark */}
        <div className="relative flex items-center justify-center">
          <div className="relative z-10 h-20 w-20 rounded-2xl bg-[#00236F] shadow-xl shadow-[#00236F]/20 flex items-center justify-center animate-pulse duration-[2000ms]">
            <BriefcaseMedical size={36} className="text-white" />
          </div>

          {/* Expanding pulse rings */}
          <div 
            className="absolute inset-0 rounded-2xl border-[3px] border-[#2DD4BF]/60 animate-ping" 
            style={{ animationDuration: '2s' }} 
          />
          <div 
            className="absolute inset-[-12px] rounded-2xl border border-[#00236F]/30 animate-ping" 
            style={{ animationDuration: '2.5s', animationDelay: '0.2s' }} 
          />
        </div>

        {/* Brand Text & Loading Dots */}
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-bold tracking-tight text-[#00236F]">
            Healthcare CRM
          </h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
            Loading Workspace
          </p>
        </div>
      </div>
    </div>
  );
}
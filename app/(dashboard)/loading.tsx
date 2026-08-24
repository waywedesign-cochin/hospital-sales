export default function Loading() {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-linear-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="flex flex-col items-center gap-5">
          {/* Brand mark */}
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-green-500 via-green-600 to-green-600 shadow-lg shadow-blue-500/30 flex items-center justify-center">
              <span className="text-white text-xl font-bold tracking-tight">
                N
              </span>
            </div>
  
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-ping" />
          </div>
  
          {/* Brand name */}
          <div className="flex flex-col items-center">
            <p className="text-sm font-semibold tracking-wide text-slate-700">
              Hospital
            </p>
            <p className="text-xs text-slate-500">
              Loading your workspace…
            </p>
          </div>
  
       
        </div>
      </div>
    );
  }
  
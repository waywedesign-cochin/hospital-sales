"use client";

import {
  IndianRupee,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Activity,
  CreditCard,
} from "lucide-react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PLAN_COLORS = {
  free: "#94a3b8",
  basic: "#3b82f6",
  pro: "#6366f1",
  enterprise: "#a855f7",
};

export default function PlatformBillingDashboard({ data }: { data: any }) {
  if (!data) return <p className="p-8 text-slate-400">Failed to load platform billing data.</p>;

  const {
    totalRevenue,
    mrr,
    activeSubscriptions,
    trialOrgs,
    activeOrgs,
    expiredOrgs,
    cancelledOrgs,
    planDistribution,
    recentSubscriptions,
  } = data;

  const totalOrgs = trialOrgs + activeOrgs + expiredOrgs + cancelledOrgs;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-3 mb-6">
        <Breadcrumb
          items={[
            { label: "Admin", href: "/admin" },
            { label: "Billing & Revenue", current: true },
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="bg-indigo-500/20 p-3 rounded-xl shadow-lg border border-indigo-500/30">
          <TrendingUp className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Revenue Dashboard</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Platform-wide billing and subscription metrics</p>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={IndianRupee} color="emerald" />
        <MetricCard title="Monthly Recurring (MRR)" value={`₹${mrr.toLocaleString("en-IN")}`} icon={TrendingUp} color="blue" />
        <MetricCard title="Active Subscriptions" value={activeSubscriptions.toString()} icon={CreditCard} color="indigo" />
        <MetricCard title="Total Organizations" value={totalOrgs.toString()} icon={Building2} color="slate" />
      </div>

      {/* Org Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-6">Organization Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatusCard label="Active (Paid)" count={activeOrgs} total={totalOrgs} color="bg-emerald-500" icon={CheckCircle2} />
            <StatusCard label="In Trial" count={trialOrgs} total={totalOrgs} color="bg-amber-500" icon={Activity} />
            <StatusCard label="Trial Expired" count={expiredOrgs} total={totalOrgs} color="bg-red-500" icon={AlertTriangle} />
            <StatusCard label="Cancelled" count={cancelledOrgs} total={totalOrgs} color="bg-slate-500" icon={AlertTriangle} />
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-200 mb-4">Plan Distribution</h2>
          <div className="h-[200px]">
            {planDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="_id"
                  >
                    {planDistribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={(PLAN_COLORS as any)[entry._id] || "#475569"} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    itemStyle={{ color: '#f1f5f9' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-500">No data</div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {planDistribution.map((p: any) => (
              <div key={p._id} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 capitalize">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: (PLAN_COLORS as any)[p._id] || "#475569" }} />
                {p._id} ({p.count})
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Subscriptions Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/50">
          <h2 className="text-lg font-bold text-slate-200">Recent Payments</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-950/50 border-b border-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="p-4 sm:px-6">Organization</th>
                <th className="p-4 sm:px-6">Invoice</th>
                <th className="p-4 sm:px-6">Plan</th>
                <th className="p-4 sm:px-6">Amount</th>
                <th className="p-4 sm:px-6">Date</th>
                <th className="p-4 sm:px-6">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-800/50">
              {recentSubscriptions.map((sub: any) => (
                <tr key={sub._id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 sm:px-6">
                    <div className="font-semibold text-slate-200">{sub.organizationId?.name || "Unknown"}</div>
                    <div className="text-xs text-slate-500">{sub.organizationId?.slug}</div>
                  </td>
                  <td className="p-4 sm:px-6 font-mono text-slate-400 text-xs">{sub.invoiceNumber || "—"}</td>
                  <td className="p-4 sm:px-6">
                    <span className="font-semibold text-slate-300">{sub.plan}</span>
                    <span className="text-slate-500 ml-1 text-xs">({sub.billingCycle})</span>
                  </td>
                  <td className="p-4 sm:px-6 font-bold text-slate-200">₹{sub.amount?.toLocaleString("en-IN")}</td>
                  <td className="p-4 sm:px-6 text-slate-400">
                    {new Date(sub.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="p-4 sm:px-6">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      sub.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      sub.status === "CANCELLED" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentSubscriptions.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No recent payments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color }: any) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    slate: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-2xl border border-slate-800/50 shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-transform hover:scale-[1.02]">
      <div className={`p-3 rounded-xl border ${colors[color]}`}>
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusCard({ label, count, total, color, icon: Icon }: any) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  
  return (
    <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors hover:bg-slate-800/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${color.replace("bg-", "text-")}`} />
        <span className="text-sm font-semibold text-slate-300">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-3">{count}</div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
      <div className="text-xs font-semibold text-slate-500 mt-2">{percentage}% of total</div>
    </div>
  );
}

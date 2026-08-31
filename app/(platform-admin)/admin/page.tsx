import { ShieldAlert, Building2, Users, Activity } from "lucide-react";
import { getPlatformOverviewAction } from "@/app/actions/platformActions";
import Link from "next/link";

export default async function PlatformAdminDashboard() {
  const res = await getPlatformOverviewAction();
  const data = res.success ? res.data : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="text-indigo-500 w-8 h-8" />
            Platform Console
          </h1>
          <p className="text-slate-400 mt-2">
            Overview of the entire SaaS platform ecosystem.
          </p>
        </div>
      </div>

      {data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Organizations Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm">Total Organizations</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{data.totalOrganizations}</h3>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-xl text-indigo-400">
                  <Building2 size={24} />
                </div>
              </div>
              <div className="mt-6">
                <Link href="/admin/organizations" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View all organizations &rarr;</Link>
              </div>
            </div>

            {/* Users Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm">Total Global Users</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{data.totalUsers}</h3>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                  <Users size={24} />
                </div>
              </div>
              <div className="mt-6">
                <Link href="/admin/users" className="text-sm text-purple-400 hover:text-purple-300 font-medium">View global directory &rarr;</Link>
              </div>
            </div>

            {/* Active Subscriptions Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 font-medium text-sm">Active Orgs (Trial + Paid)</p>
                  <h3 className="text-4xl font-bold text-white mt-2">{data.activeOrganizations}</h3>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                  <Activity size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-6">Recent Organizations</h2>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950/50 border-b border-slate-800">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {data.recentOrganizations.map((org: any) => (
                      <tr key={org._id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">{org.name}</div>
                          <div className="text-xs text-slate-500">{org.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-800 text-slate-300">
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            org.subscriptionStatus === "ACTIVE" || org.subscriptionStatus === "TRIAL"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}>
                            {org.subscriptionStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {data.recentOrganizations.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                          No organizations found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400">
          Failed to load platform overview. Make sure you are authenticated as PLATFORM_ADMIN.
        </div>
      )}
    </div>
  );
}

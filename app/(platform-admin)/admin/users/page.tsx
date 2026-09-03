import { Users, Search } from "lucide-react";
import { getAllPlatformUsersAction } from "@/app/actions/platformActions";
import Link from "next/link";

export default async function GlobalUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";
  const role = typeof resolvedParams.role === "string" ? resolvedParams.role : "ALL";

  const res = await getAllPlatformUsersAction(page, 15, search, role);
  const data = res.success ? res.data : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Users className="text-purple-500 w-8 h-8" />
            Global Users
          </h1>
          <p className="text-slate-400 mt-2">
            Directory of all users across all organizations on the platform.
          </p>
        </div>
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col gap-6">
        <form className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name or email..."
              className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all shadow-sm"
            />
            {/* Preserve role when searching */}
            <input type="hidden" name="role" value={role} />
          </div>
          <button type="submit" className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-purple-500/20">
            Search
          </button>
        </form>

        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-px">
          {[
            { id: "ALL", label: "All Users" },
            { id: "PLATFORM_ADMIN", label: "Platform Admins" },
            { id: "ADMIN", label: "Tenant Admins" },
            { id: "DOCTOR", label: "Doctors" },
            { id: "STAFF", label: "Staff" },
          ].map((tab) => {
            const isActive = role === tab.id;
            return (
              <Link
                key={tab.id}
                href={`?page=1&search=${search}&role=${tab.id}`}
                className={`px-5 py-2.5 text-sm font-semibold rounded-t-xl transition-all relative ${
                  isActive 
                    ? "text-purple-400 bg-slate-900 border-t border-l border-r border-slate-800" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-t border-l border-r border-transparent"
                }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-500 rounded-t-full shadow-[0_-2px_10px_rgba(168,85,247,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {data ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.users.map((u: any) => (
                  <tr key={u._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700 text-xs font-bold text-slate-300">
                          {u.firstName.charAt(0)}{u.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{u.firstName} {u.lastName}</div>
                          <div className="text-xs text-slate-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === "PLATFORM_ADMIN" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                        u.role === "ADMIN" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                        u.role === "DOCTOR" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                        "bg-slate-800 text-slate-300"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.organizationId ? (
                        <div className="text-sm font-medium text-slate-300">{u.organizationId.name}</div>
                      ) : (
                        <span className="text-xs italic text-slate-500">Platform Level</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-right">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No users found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data.pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Showing page <span className="font-bold text-white">{data.pagination.page}</span> of <span className="font-bold text-white">{data.pagination.totalPages}</span>
              </div>
              <div className="flex gap-2">
                {data.pagination.page > 1 && (
                  <Link href={`/admin/users?page=${data.pagination.page - 1}&search=${search}&role=${role}`} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Previous
                  </Link>
                )}
                {data.pagination.page < data.pagination.totalPages && (
                  <Link href={`/admin/users?page=${data.pagination.page + 1}&search=${search}&role=${role}`} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400">
          Failed to load users. Make sure you are authenticated as PLATFORM_ADMIN.
        </div>
      )}
    </div>
  );
}

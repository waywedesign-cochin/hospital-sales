import { Building2, Search } from "lucide-react";
import { getAllOrganizationsAction } from "@/app/actions/platformActions";
import Link from "next/link";

export default async function OrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const page = typeof resolvedParams.page === "string" ? parseInt(resolvedParams.page) : 1;
  const search = typeof resolvedParams.search === "string" ? resolvedParams.search : "";

  const res = await getAllOrganizationsAction(page, 10, search);
  const data = res.success ? res.data : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Building2 className="text-indigo-500 w-8 h-8" />
            Organizations
          </h1>
          <p className="text-slate-400 mt-2">
            Manage all tenant hospitals and clinics on the platform.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by organization name..."
          className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
        {/* Preserve page if searching, or just reset to page 1 by omitting it */}
        <button type="submit" className="hidden">Search</button>
      </form>

      {data ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.organizations.map((org: any) => (
                  <tr key={org._id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">{org.name}</div>
                      <div className="text-xs text-indigo-400 mt-1 font-medium">{org.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-300">{org.email}</div>
                      <div className="text-xs text-slate-500 mt-1">{org.phone || "No phone"}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 text-right">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {data.organizations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                      No organizations found matching your search.
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
                  <Link href={`/admin/organizations?page=${data.pagination.page - 1}&search=${search}`} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Previous
                  </Link>
                )}
                {data.pagination.page < data.pagination.totalPages && (
                  <Link href={`/admin/organizations?page=${data.pagination.page + 1}&search=${search}`} className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Next
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center border border-red-500/30 bg-red-500/10 rounded-2xl text-red-400">
          Failed to load organizations. Make sure you are authenticated as PLATFORM_ADMIN.
        </div>
      )}
    </div>
  );
}

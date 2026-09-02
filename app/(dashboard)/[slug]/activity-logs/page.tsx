import React from "react";
import { getActivityLogsAction } from "@/app/actions/activityLogActions";
import { Activity, Clock } from "lucide-react";
import ActivityLogSearch from "./ActivityLogSearch";
import ActivityLogPagination from "./ActivityLogPagination";

export default async function ActivityLogsPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || "1");
  const limit = parseInt(searchParams?.limit || "20");
  const search = searchParams?.search || "";

  const response = await getActivityLogsAction(page, limit, search);
  const logs = response?.data?.logs || [];
  const pagination = response?.data?.pagination || { totalPages: 1, page: 1, totalCount: 0 };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="absolute inset-0" />
        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl border border-blue-100/50">
          <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
              Activity Logs
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              System audit trail and recent organization events
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ActivityLogSearch />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {logs.map((log: any) => (
                <tr key={log._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {log.userId?.firstName} {log.userId?.lastName}
                    </div>
                    <div className="text-xs text-gray-500">{log.userId?.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {log.resourceType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-sm truncate" title={log.details}>
                    {log.details || "-"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <ActivityLogPagination 
          totalPages={pagination.totalPages} 
          currentPage={pagination.page} 
          totalCount={pagination.totalCount} 
        />
      </div>
    </div>
  );
}

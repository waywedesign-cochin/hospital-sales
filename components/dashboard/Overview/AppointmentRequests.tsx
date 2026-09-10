import Link from "next/link";
import { Inbox, ChevronRight } from "lucide-react";

interface NewEnquiryItem {
  _id: string;
  firstName: string;
  lastName?: string;
  treatmentCategory?: string;
  createdAt?: string | Date;
}

const AVATAR_COLORS = ["#2DD4BF", "#818CF8", "#F59E0B", "#F472B6", "#38BDF8"];

function initials(firstName: string, lastName?: string) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() || "?";
}

function timeAgo(dateStr?: string | Date) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AppointmentRequests({
  enquiries,
  slug,
}: {
  enquiries: NewEnquiryItem[];
  slug: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#00236F]">New Enquiries</h3>
        <Link
          href={`/${slug}/enquiries`}
          className="text-xs font-bold text-[#2DD4BF] hover:text-[#00236F] transition-colors"
        >
          View All
        </Link>
      </div>

      {enquiries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-60">
          <Inbox className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            No new enquiries right now.
          </p>
        </div>
      ) : (
        <div className="space-y-1 flex-1 overflow-y-auto modern-scrollbar">
          {enquiries.map((enquiry, idx) => (
            <Link
              key={enquiry._id}
              href={`/${slug}/enquiries/${enquiry._id}`}
              className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                style={{
                  backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length],
                }}
              >
                {initials(enquiry.firstName, enquiry.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#00236F] truncate">
                  {enquiry.firstName} {enquiry.lastName}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {enquiry.treatmentCategory || "General enquiry"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] font-medium text-slate-400">
                  {timeAgo(enquiry.createdAt)}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#2DD4BF] transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import { CalendarX2 } from "lucide-react";

interface RecentAppointment {
  _id: string;
  bookingId: string;
  firstName: string;
  lastName?: string;
  doctor?: { firstName?: string; lastName?: string } | null;
  treatmentCategory?: string;
  date: string | Date;
  startTime: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
}

const STATUS_STYLES: Record<RecentAppointment["status"], string> = {
  SCHEDULED: "bg-amber-100 text-amber-700 border-amber-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  NO_SHOW: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function RecentAppointmentsTable({
  appointments,
  slug,
}: {
  appointments: RecentAppointment[];
  slug: string;
}) {
  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl border border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[#00236F]">Recent Appointments</h3>
        <Link
          href={`/${slug}/appointments`}
          className="text-xs font-bold text-[#2DD4BF] hover:text-[#00236F] transition-colors"
        >
          View All
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 opacity-60">
          <CalendarX2 className="w-8 h-8 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-500">
            No appointments yet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto flex-1 modern-scrollbar">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] font-bold text-[#00236F]/50 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-2 pr-3">Patient</th>
                <th className="pb-2 pr-3">Date</th>
                <th className="pb-2 pr-3">Treatment</th>
                <th className="pb-2 pr-3">Doctor</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr
                  key={apt._id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold text-[#00236F] whitespace-nowrap">
                      {apt.firstName} {apt.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400">{apt.bookingId}</p>
                  </td>
                  <td className="py-2.5 pr-3 whitespace-nowrap text-slate-600">
                    <p>{new Date(apt.date).toLocaleDateString()}</p>
                    <p className="text-[11px] text-slate-400">{apt.startTime}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                    {apt.treatmentCategory || "—"}
                  </td>
                  <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                    {apt.doctor
                      ? `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`
                      : "—"}
                  </td>
                  <td className="py-2.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${STATUS_STYLES[apt.status]}`}
                    >
                      {apt.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

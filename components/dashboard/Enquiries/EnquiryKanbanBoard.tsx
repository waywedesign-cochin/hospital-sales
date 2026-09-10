"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { Eye, Phone, GripVertical } from "lucide-react";
import type { EnquiryDTO } from "@/lib/types";

type EnquiryStatus = "NEW" | "CONTACTED" | "FOLLOW_UP" | "APPOINTMENT_BOOKED";

const COLUMNS: { status: EnquiryStatus; label: string; accent: string; dot: string }[] = [
  { status: "NEW", label: "New", accent: "border-t-amber-400", dot: "bg-amber-400" },
  { status: "CONTACTED", label: "Contacted", accent: "border-t-sky-400", dot: "bg-sky-400" },
  { status: "FOLLOW_UP", label: "Follow Up", accent: "border-t-violet-400", dot: "bg-violet-400" },
  {
    status: "APPOINTMENT_BOOKED",
    label: "Booked",
    accent: "border-t-emerald-400",
    dot: "bg-emerald-400",
  },
];

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function EnquiryKanbanBoard({
  enquiries,
  slug,
  currentUserId,
  onStatusChanged,
}: {
  enquiries: EnquiryDTO[];
  slug: string;
  currentUserId?: string;
  onStatusChanged: (id: string, status: EnquiryStatus) => void;
}) {
  const router = useRouter();
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<EnquiryStatus | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  const grouped = COLUMNS.reduce(
    (acc, col) => {
      acc[col.status] = enquiries.filter((e) => e.status === col.status);
      return acc;
    },
    {} as Record<EnquiryStatus, EnquiryDTO[]>,
  );

  const handleDrop = async (targetStatus: EnquiryStatus) => {
    setDragOverColumn(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;

    const enquiry = enquiries.find((e) => e._id === id);
    if (!enquiry || enquiry.status === targetStatus) return;

    const previousStatus = enquiry.status as EnquiryStatus;
    onStatusChanged(id, targetStatus);
    setMovingId(id);

    try {
      await axios.patch(`/api/enquiry?id=${id}`, {
        status: targetStatus,
        handledBy: currentUserId,
      });
    } catch (error: unknown) {
      onStatusChanged(id, previousStatus);
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? error.response.data.message
          : "Could not update status";
      toast.error(message);
    } finally {
      setMovingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = grouped[col.status];
        const isDragOver = dragOverColumn === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverColumn(col.status);
            }}
            onDragLeave={() => setDragOverColumn((c) => (c === col.status ? null : c))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(col.status);
            }}
            className={`flex flex-col bg-white/70 backdrop-blur-2xl rounded-3xl border-t-4 ${col.accent} border-x border-b border-white/60 shadow-[0_8px_30px_rgba(0,35,111,0.04)] transition-all ${
              isDragOver ? "ring-2 ring-[#2DD4BF]/50 bg-[#2DD4BF]/5" : ""
            }`}
          >
            <div className="px-4 pt-4 pb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-bold text-[#00236F]">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                {col.label}
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                {items.length}
              </span>
            </div>

            <div className="flex-1 min-h-[120px] px-3 pb-3 space-y-2.5 overflow-y-auto max-h-[65vh] modern-scrollbar">
              {items.length === 0 ? (
                <div className="h-24 flex items-center justify-center text-xs font-medium text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                  Drop here
                </div>
              ) : (
                items.map((enquiry) => (
                  <div
                    key={enquiry._id}
                    draggable
                    onDragStart={() => setDragId(enquiry._id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setDragOverColumn(null);
                    }}
                    className={`group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-3 cursor-grab active:cursor-grabbing transition-all ${
                      movingId === enquiry._id ? "opacity-50" : ""
                    } ${dragId === enquiry._id ? "opacity-30" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#00236F] truncate">
                          {enquiry.firstName} {enquiry.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {enquiry.treatmentCategory || "General enquiry"}
                        </p>
                      </div>
                      <GripVertical className="w-3.5 h-3.5 text-slate-200 group-hover:text-slate-400 shrink-0 mt-0.5" />
                    </div>

                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
                      <Phone className="w-3 h-3" />
                      <span className="truncate">{enquiry.phone}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-[10px] font-medium text-slate-400">
                        {timeAgo(enquiry.createdAt)}
                      </span>
                      <button
                        onClick={() => router.push(`/${slug}/enquiries/${enquiry._id}`)}
                        className="flex items-center gap-1 text-[10px] font-bold text-[#2DD4BF] hover:text-[#00236F] transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

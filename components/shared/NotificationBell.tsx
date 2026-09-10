"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Bell, Mail, AlertTriangle, CalendarClock } from "lucide-react";

const POLL_INTERVAL_MS = 30 * 1000;

interface EnquiryItem {
  _id: string;
  firstName: string;
  lastName?: string;
  treatmentCategory?: string;
  createdAt?: string;
}

interface FailedMessageItem {
  _id: string;
  recipientPhone: string;
  content: string;
  createdAt?: string;
}

interface NotificationSummary {
  newEnquiries: { count: number; items: EnquiryItem[] };
  failedMessages: { count: number; items: FailedMessageItem[] };
  todaysAppointments: { count: number };
}

const EMPTY: NotificationSummary = {
  newEnquiries: { count: 0, items: [] },
  failedMessages: { count: 0, items: [] },
  todaysAppointments: { count: 0 },
};

function timeAgo(dateStr?: string) {
  if (!dateStr) return "";
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [summary, setSummary] = useState<NotificationSummary>(EMPTY);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const params = useParams();
  const slug = params.slug as string;

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch("/api/notifications/summary");
        if (res.status === 401 || res.status === 403) {
          clearInterval(id);
          return;
        }
        const json = await res.json();
        if (!cancelled && json?.success) setSummary(json.data);
      } catch {
        // Transient failure; the next tick retries.
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisible);
    poll();

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  // Rendered via a portal (see below) to escape the header's overflow-hidden,
  // which otherwise clips this dropdown to the header's own height — it was
  // rendering, just invisible past the header's bottom edge.
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const updateCoords = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setCoords({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updateCoords();
    window.addEventListener("resize", updateCoords);
    window.addEventListener("scroll", updateCoords, true);

    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        !containerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("resize", updateCoords);
      window.removeEventListener("scroll", updateCoords, true);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const alertCount = summary.newEnquiries.count + summary.failedMessages.count;
  const hasAnything =
    summary.newEnquiries.items.length > 0 ||
    summary.failedMessages.items.length > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-[#00236F] transition-all duration-200"
      >
        <Bell className="w-5 h-5" />
        {alertCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
            {alertCount > 9 ? "9+" : alertCount}
          </span>
        )}
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ top: coords.top, right: coords.right }}
            className="fixed w-80 max-h-96 overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] modern-scrollbar"
          >
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-[#00236F]">Notifications</p>
              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <CalendarClock className="w-3 h-3" />
                {summary.todaysAppointments.count} today
              </span>
            </div>

            {!hasAnything ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  You&apos;re all caught up.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {summary.newEnquiries.items.map((item) => (
                  <Link
                    key={item._id}
                    href={`/${slug}/enquiries/${item._id}`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                      <Mail className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#00236F] truncate">
                        New enquiry: {item.firstName} {item.lastName}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {item.treatmentCategory || "General enquiry"} ·{" "}
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}

                {summary.failedMessages.items.map((item) => (
                  <Link
                    key={item._id}
                    href={`/${slug}/messaging`}
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <span className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#00236F] truncate">
                        Message failed to {item.recipientPhone}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {timeAgo(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {(summary.newEnquiries.count > summary.newEnquiries.items.length ||
              summary.failedMessages.count > 0) && (
              <div className="px-4 py-2.5 border-t border-slate-100 flex justify-between text-[11px] font-bold">
                {summary.newEnquiries.count > 0 && (
                  <Link
                    href={`/${slug}/enquiries`}
                    onClick={() => setOpen(false)}
                    className="text-[#2DD4BF] hover:text-[#00236F]"
                  >
                    View all enquiries
                  </Link>
                )}
                {summary.failedMessages.count > 0 && (
                  <Link
                    href={`/${slug}/messaging`}
                    onClick={() => setOpen(false)}
                    className="text-[#2DD4BF] hover:text-[#00236F]"
                  >
                    View messaging
                  </Link>
                )}
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

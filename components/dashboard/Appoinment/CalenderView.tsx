"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Plus,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import { Doctor } from "@/lib/types";
import axios from "axios";
import { Button } from "@/components/ui/button";

const FullCalendar = dynamic(() => import("./FullCalendarWrapper"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full animate-pulse rounded-xl bg-slate-100/70" />
  ),
});

// --- UPDATED HELPER FUNCTION (UNCHANGED UI)
const renderEventContent = (eventInfo: any) => {
  const isTimeGridView =
    eventInfo.view.type === "timeGridDay" ||
    eventInfo.view.type === "timeGridWeek";
  const isListView = eventInfo.view.type === "listMonth";

  const cornerClass = isTimeGridView ? "rounded-none" : "rounded-lg";

  const cleanedTitle = eventInfo.event.title
    ? eventInfo.event.title
        .replace(/[\s-]*\d{1,2}:\d{2}\s*(AM|PM)?\s*$/i, "")
        .trim()
    : "No Title";

  const displayTitle = cleanedTitle || eventInfo.event.title;

  return (
    <div
      className={`flex flex-col w-full h-full px-2.5 py-1.5 overflow-hidden 
        ${cornerClass} 
        bg-[#0D1117] hover:bg-[#141A21] transition-colors duration-200 shadow-sm cursor-pointer`}
    >
      {isListView ? (
        <div className="flex items-center gap-2 h-full">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <div className="font-bold text-sm text-white truncate leading-tight">
            {displayTitle}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-white/90 truncate">
              {eventInfo.timeText}
            </span>
          </div>
          <div className="font-bold text-sm text-white truncate leading-tight">
            {displayTitle}
          </div>
        </>
      )}
    </div>
  );
};

export default function CalendarView({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [locked, setLocked] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  const logginedDoctor =
    user?.role === "DOCTOR"
      ? doctors.find((doc) => doc.email === user.email)
      : null;

  // Doctors only view their appointments, they cannot create new ones
  const isDoctorView = user?.role === "DOCTOR";

  useEffect(() => {
    if (!logginedDoctor) {
      setLocked(false);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    const doctorParam = params.get("doctor");

    // If correct → unlock UI
    if (doctorParam === logginedDoctor._id) {
      setLocked(false);
      return;
    }

    // This route's server component only loads the doctors list and never reads
    // the "doctor" param, so a router.replace would re-run the whole RSC fetch
    // for byte-identical data and hold the doctor on a spinner while it went to
    // the server. Update the URL in place instead — Next syncs useSearchParams
    // with history.replaceState — and unlock immediately.
    params.set("doctor", logginedDoctor._id);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    setLocked(false);
  }, [logginedDoctor, searchParams]);

  const handleEventClick = useCallback(
    (info: any) => {
      router.push(`/appointments/${info.event.id}`);
    },
    [router],
  );

  const handleDateClick = useCallback(
    (info: any) => {
      // Doctors don't book appointments from the calendar, only view them
      if (isDoctorView) return;
      router.push(`/appointments/create-appointment?date=${info.dateStr}`);
    },
    [router, isDoctorView],
  );

  // datesSet also fires when only the view changes (Month → Week → List), where
  // the visible range is often identical — refetching there made every view
  // switch wait on the network. Track the last fetched range and skip those.
  const lastRangeRef = useRef("");
  const requestIdRef = useRef(0);

  //  Fetch events dynamically based on calendar visible date range
  const handleDataSet = useCallback(
    async (info: any) => {
      const startDate = info.startStr.split("T")[0];
      const endDate = info.endStr.split("T")[0];
      const doctorId = searchParams.get("doctor") ?? logginedDoctor?._id ?? "";

      const rangeKey = `${doctorId}|${startDate}|${endDate}`;
      if (rangeKey === lastRangeRef.current) return;
      lastRangeRef.current = rangeKey;

      const requestId = ++requestIdRef.current;
      setIsFetching(true);
      try {
        const res = await axios.get(
          `/api/appointment/calendar?doctor=${doctorId}&startDate=${startDate}&endDate=${endDate}&limit=1000`,
        );

        // Clicking prev/next quickly fires overlapping requests; without this an
        // earlier response can land last and paint the wrong month's events.
        if (requestId !== requestIdRef.current) return;

        const data = res.data;

        if (data?.data?.appointments) {
          const formatted = data.data.appointments.map((item: any) => {
            // Ensure date is ISO formatted properly
            const dateStr = new Date(item.date).toISOString().split("T")[0];

            // startTime is already in 24hr format: "14:30"
            const startISO = `${dateStr}T${item.startTime}:00`;

            return {
              id: item._id,
              title: `${item.firstName} ${item.lastName || ""}`.trim(),
              start: startISO,
              allDay: false,
              extendedProps: {
                status: item.status,
              },
            };
          });

          setCalendarEvents(formatted);
        }
      } catch (err) {
        if (requestId !== requestIdRef.current) return;
        lastRangeRef.current = ""; // let the next attempt retry this range
        console.error(err);
        toast.error("Failed to load calendar events");
      } finally {
        if (requestId === requestIdRef.current) setIsFetching(false);
      }
    },
    [searchParams, logginedDoctor],
  );

  // Fresh object literals on every render make FullCalendar re-apply its
  // toolbar/format config each time, which is a large part of the view-switch jank.
  const headerToolbar = useMemo(
    () => ({
      left: isMobile ? "prev,next" : "prev,next today",
      center: "title",
      right: isMobile
        ? "dayGridMonth,listMonth"
        : "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
    }),
    [isMobile],
  );

  const buttonText = useMemo(
    () => ({
      today: "Today",
      month: "Month",
      week: "Week",
      day: "Day",
      list: "List",
    }),
    [],
  );

  const eventTimeFormat = useMemo(
    () =>
      ({
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short",
        hour12: true,
      }) as const,
    [],
  );

  if (locked) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl flex flex-col items-center gap-4 animate-in fade-in duration-300">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>

          {/* Text */}
          <p className="text-sm font-semibold text-gray-700 tracking-wide animate-pulse">
            Loading calender...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-2 sm:p-4 md:p-6 font-sans text-slate-900">
      <style jsx global>{`
        .fc {
          --fc-border-color: #f1f5f9;
          --fc-button-text-color: #64748b;
          --fc-button-bg-color: transparent;
          --fc-button-border-color: transparent;
          --fc-button-hover-bg-color: #f8fafc;
          --fc-button-hover-border-color: #e2e8f0;
          --fc-button-active-bg-color: #ecfdf5;
          --fc-button-active-border-color: #a7f3d0;
          --fc-event-bg-color: transparent;
          --fc-event-border-color: transparent;
          --fc-today-bg-color: #f8fafc;
          --fc-page-bg-color: #ffffff;
          font-family: inherit;
        }

        .fc .fc-list-event-graphic {
          display: none;
        }

        .fc .fc-toolbar.fc-header-toolbar {
          margin-bottom: 1.5rem;
          padding: 0 0.5rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* Mobile toolbar adjustments */
        @media (max-width: 640px) {
          .fc .fc-toolbar.fc-header-toolbar {
            margin-bottom: 1rem;
            padding: 0 0.25rem;
          }

          .fc .fc-toolbar-chunk {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            justify-content: center;
          }

          .fc .fc-toolbar-title {
            font-size: 1rem !important;
            width: 100%;
            text-align: center;
            margin-bottom: 0.5rem;
          }

          .fc .fc-button {
            padding: 0.35rem 0.5rem !important;
            font-size: 0.75rem !important;
          }

          .fc .fc-button-group {
            gap: 0.25rem;
          }
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .fc .fc-button {
          font-weight: 600;
          font-size: 0.875rem;
          padding: 0.4rem 0.8rem;
          border-radius: 0.5rem;
          text-transform: capitalize;
          transition: all 0.2s;
          box-shadow: none !important;
        }

        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          color: #047857;
          background-color: #ecfdf5;
          border-color: #a7f3d0;
        }

        .fc .fc-theme-standard th {
          border: none;
          padding: 0.75rem 0;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Mobile table header */
        @media (max-width: 640px) {
          .fc .fc-theme-standard th {
            padding: 0.5rem 0;
            font-size: 0.65rem;
          }

          .fc .fc-col-header-cell-cushion {
            padding: 0.25rem;
          }
        }

        .fc .fc-scrollgrid {
          border: none !important;
        }

        .fc td,
        .fc th {
          border-color: #f1f5f9 !important;
        }

        .fc .fc-daygrid-day-top {
          flex-direction: row;
          padding: 0.5rem;
        }

        /* Mobile day cell */
        @media (max-width: 640px) {
          .fc .fc-daygrid-day-top {
            padding: 0.25rem;
          }

          .fc .fc-daygrid-day-number {
            width: 24px !important;
            height: 24px !important;
            font-size: 0.75rem !important;
          }

          .fc .fc-daygrid-day-frame {
            min-height: 60px;
          }
        }

        .fc .fc-daygrid-day-number {
          font-size: 0.9rem;
          font-weight: 500;
          color: #059669;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9999px;
          z-index: 2;
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          background: #0d1117;
          color: white;
        }

        .fc-h-event {
          background: transparent !important;
          border: none !important;
          margin-top: 2px;
          box-shadow: none !important;
        }

        .fc-event {
          background: transparent !important;
          box-shadow: none !important;
        }

        .fc-daygrid-event-harness {
          margin-bottom: 2px;
        }

        /* Mobile event display */
        @media (max-width: 640px) {
          .fc-daygrid-event {
            font-size: 0.7rem;
          }

          .fc-daygrid-event-harness {
            margin-bottom: 1px;
          }

          .fc .fc-daygrid-day-events {
            margin-top: 2px;
          }
        }

        /* Time grid mobile adjustments */
        @media (max-width: 640px) {
          .fc .fc-timegrid-slot {
            height: 2.5rem !important;
          }

          .fc .fc-timegrid-slot-label {
            font-size: 0.7rem;
          }

          .fc .fc-timegrid-event {
            font-size: 0.7rem;
          }
        }

        /* List view mobile adjustments */
        @media (max-width: 640px) {
          .fc .fc-list-event {
            font-size: 0.8rem;
          }

          .fc .fc-list-event-time {
            font-size: 0.75rem;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        <div className="px-2 sm:px-0">
          <div className="relative z-10 mb-6 flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 px-2.5 rounded-lg hover:bg-[#0D1117] hover:text-white transition-all duration-150 font-medium text-slate-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="h-4 w-px bg-slate-300" />
            <Breadcrumb
              items={[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Appointments", href: "/appointments" },
                { label: "Calendar", current: true },
              ]}
            />
          </div>
        </div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
            <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-3 sm:gap-4 w-full md:w-auto">
              <div className="bg-[#0D1117] p-3 sm:p-4 rounded-xl">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
              </div>

              <div className="flex-1 md:flex-initial">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                  Appointments Calendar
                </h1>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                  Visual overview of appointments by date and time
                </p>
              </div>
            </div>

            {user?.role !== "DOCTOR" && (
              <Button
                type="button"
                onClick={() => router.push("/appointments/create-appointment")}
                className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow-md w-full md:w-auto text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                New Appointment
              </Button>
            )}
          </div>
        </div>

        {/* Calendar */}
        <div className="relative bg-white shadow-xl shadow-slate-200/50 rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 p-1 sm:p-2">
          {isFetching && (
            <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 shadow-sm border border-slate-100">
              <span className="w-3 h-3 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
              <span className="text-xs font-medium text-slate-500">
                Updating
              </span>
            </div>
          )}
          <div className="p-2 sm:p-4">
            <FullCalendar
              initialView={isMobile ? "listMonth" : "dayGridMonth"}
              events={calendarEvents}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              selectable={!isDoctorView}
              height="auto"
              dayMaxEventRows={isMobile ? 2 : 3}
              datesSet={handleDataSet}
              headerToolbar={headerToolbar}
              buttonText={buttonText}
              eventTimeFormat={eventTimeFormat}
              contentHeight={isMobile ? "auto" : undefined}
              aspectRatio={isMobile ? 1 : 1.35}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

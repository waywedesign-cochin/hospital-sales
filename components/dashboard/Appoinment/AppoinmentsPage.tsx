"use client";

import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  SearchIcon,
  Timer,
  Phone,
  Plus,
  CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/DeleteDialog";
import AppointmentStatusDropdown, {
  AppointmentStatus,
} from "./AppointmentStatusDropdown";
import { Doctor } from "@/lib/types";
import { useAuthStore } from "@/providers/AuthStoreProvider";

/* ---------------- CONSTANTS ---------------- */

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

/* ---------------- PAGE ---------------- */

export default function AppointmentsPage({
  appointments,
  pagination,
  doctors,
}: {
  appointments: any[];
  doctors: Doctor[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clinic = useAuthStore((state: any) => state.clinic);
  const { slug } = (useParams() as { slug: string }) || { slug: clinic?.slug };

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [locked, setLocked] = useState(true);
  const [statusOverrides, setStatusOverrides] = useState<
    Record<string, AppointmentStatus>
  >({});
  const canEditStatus = user?.role === "ADMIN" || user?.role === "STAFF";

  const rows = appointments.map((a) =>
    statusOverrides[a._id] ? { ...a, status: statusOverrides[a._id] } : a,
  );

  const handleStatusChanged = (id: string, status: AppointmentStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  };

  const logginedDoctor =
    user?.role === "DOCTOR"
      ? doctors.find((d) => d.email === user.email)
      : null;

  // If this STAFF user is scoped to specific doctors, only offer those in the
  // filter — the backend already enforces this, this just avoids showing
  // options that would silently return nothing.
  const staffAssignedDoctorIds: string[] | null =
    user?.role === "STAFF" && (user as any)?.assignedDoctors?.length
      ? (user as any).assignedDoctors
      : null;

  const visibleDoctors = staffAssignedDoctorIds
    ? doctors.filter((d) => staffAssignedDoctorIds.includes(d._id))
    : doctors;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  /* ---------------- EFFECTS (UNCHANGED) ---------------- */

  useEffect(() => {
    if (!logginedDoctor) {
      setLocked(false);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    let changed = false;

    if (params.get("doctor") !== logginedDoctor._id) {
      params.set("doctor", logginedDoctor._id);
      changed = true;
    }
    if (!params.get("year")) {
      params.set("year", String(currentYear));
      changed = true;
    }
    if (!params.get("month")) {
      params.set("month", String(currentMonth));
      changed = true;
    }

    if (!changed) {
      setLocked(false);
      return;
    }

    router.replace(`/appointments?${params.toString()}`);
  }, [logginedDoctor]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      search ? params.set("search", search) : params.delete("search");
      router.push(`/appointments?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  /* ---------------- HELPERS (UNCHANGED) ---------------- */

  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);

  const updateQueryParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    value === "ALL" ? params.delete(key) : params.set(key, value);
    router.push(`/appointments?${params.toString()}`);
  };

  const handleView = (id: string) => router.push(`/appointments/${id}`);
  const handleEdit = (id: string) =>
    router.push(`/appointments/edit-appointment?id=${id}`);

  const handleDelete = async (id: string) => {
    const res = await axios.delete(`/api/appointment?id=${id}`);
    if (!res.data.success) {
      toast.error(res.data.message || "Failed to delete appointment");
      return;
    }
    toast.success("Appointment deleted");
    router.refresh();
    router.push("/appointments");
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      SCHEDULED: "bg-sky-50 text-sky-700 border-sky-200",
      IN_PROGRESS: "bg-violet-50 text-violet-700 border-violet-200",
      COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
      NO_SHOW: "bg-amber-50 text-amber-700 border-amber-200",
    };

    return (
      <span
        className={`px-3 py-1.5 text-xs font-semibold rounded-full border shadow-sm ${map[status]}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };

  /* ---------------- LOADING ---------------- */

  if (locked) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-white border border-slate-200 shadow-sm p-8 rounded-2xl flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-700">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen space-y-6 relative">
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
            { label: "Dashboard", href: `/${slug}/dashboard` },
            { label: "Appointments", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative z-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <CalendarIcon className="w-8 h-8 text-emerald-400" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Appointments Management
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                View and manage patient appointments
              </p>
            </div>
          </div>

          {user?.role !== "DOCTOR" && (
            <Button
              type="button"
              onClick={() =>
                router.push(`/${slug}/appointments/create-appointment`)
              }
              className="h-11 px-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Search + Filters */}
      <div className="relative z-10 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          {/* Search */}
          <div className="relative w-full lg:max-w-sm">
            <label className="text-xs font-semibold text-gray-500 mb-1 block">
              Search
            </label>
            <SearchIcon className="absolute left-4 mt-3 w-5 h-5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Patient name / Booking ID"
              className="pl-12 h-11 bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            {/* Doctor */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Doctor
              </label>
              <Select
                value={
                  logginedDoctor
                    ? logginedDoctor._id
                    : (searchParams.get("doctor") ?? "")
                }
                onValueChange={(v) => updateQueryParam("doctor", v)}
                disabled={!!logginedDoctor}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All doctors" />
                </SelectTrigger>
                <SelectContent>
                  {!logginedDoctor && (
                    <SelectItem value="ALL">
                      {staffAssignedDoctorIds
                        ? "All My Doctors"
                        : "All Doctors"}
                    </SelectItem>
                  )}
                  {visibleDoctors.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.firstName} {d.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Status
              </label>
              <Select
                value={searchParams.get("status") ?? ""}
                onValueChange={(v) => updateQueryParam("status", v)}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="NO_SHOW">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Month
              </label>
              <Select
                value={searchParams.get("month") ?? String(currentMonth)}
                onValueChange={(v) => updateQueryParam("month", v)}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">
                Year
              </label>
              <Select
                value={searchParams.get("year") ?? String(currentYear)}
                onValueChange={(v) => updateQueryParam("year", v)}
              >
                <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative z-10 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-[#0D1117]">
              <tr>
                {[
                  "Booking ID",
                  "Patient",
                  "Doctor",
                  "Treatment Category",
                  "Date & Time",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-xs font-bold text-slate-200 uppercase tracking-wider text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white/10 divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No appointments found
                  </td>
                </tr>
              ) : (
                rows.map((apt) => (
                  <tr
                    key={apt._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-sm">
                      {apt.bookingId}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">
                          {apt.firstName} {apt.lastName || ""}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {apt.patientPhone}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-semibold text-gray-700 text-sm">
                      Dr.{" "}
                      {typeof apt.doctor === "object" &&
                      "firstName" in apt.doctor
                        ? `${apt.doctor.firstName} ${apt.doctor.lastName}`
                        : "Unknown"}
                    </td>

                    <td className="px-6 py-4 font-semibold text-sm">
                      {apt.treatmentCategory}
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {apt.startTime}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {canEditStatus ? (
                        <AppointmentStatusDropdown
                          appointmentId={apt._id}
                          status={apt.status}
                          onStatusChanged={handleStatusChanged}
                        />
                      ) : (
                        getStatusBadge(apt.status)
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex">
                        <Button
                          variant="ghost"
                          onClick={() => handleView(apt._id)}
                        >
                          <Eye className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(apt._id)}
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </Button>
                        <DeleteDialog
                          trigger={
                            <Button variant="ghost">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          }
                          title="Delete Appointment"
                          description="Are you sure you want to delete this appointment?"
                          onConfirm={() => handleDelete(apt._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            {/* Info */}
            <div className="text-xs text-gray-600 font-medium mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-bold text-emerald-700">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-emerald-700">
                {Math.min(
                  currentPage * pagination.limit,
                  pagination.totalCount,
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-emerald-700">
                {pagination.totalCount}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                onClick={() =>
                  updateQueryParam("page", String(currentPage - 1))
                }
                disabled={currentPage <= 1}
                className="px-3 py-2 text-xs font-bold text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Prev
              </button>

              {/* Page numbers */}
              <div className="hidden sm:flex items-center gap-1 mx-1">
                {Array.from({ length: pagination.totalPages }).map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => updateQueryParam("page", String(page))}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all ${
                        currentPage === page
                          ? "bg-[#0D1117] text-white shadow-md"
                          : "text-emerald-700 hover:bg-emerald-50 border border-emerald-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next */}
              <button
                onClick={() =>
                  updateQueryParam("page", String(currentPage + 1))
                }
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-2 text-xs font-bold text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

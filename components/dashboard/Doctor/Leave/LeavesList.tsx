"use client";

import { useRouter, useSearchParams, useParams } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  Trash2,
  CalendarX,
  Edit,
  Plus,
  SearchIcon,
  ArrowLeft,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Doctor } from "@/lib/types";

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

export default function DoctorLeaveList({
  leaves = [],
  doctors,
  pagination,
}: {
  leaves?: any[];
  doctors?: Doctor[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = useParams<{ slug: string }>();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const years = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "ALL" || !value) params.delete(key);
    else params.set(key, value);
    router.push(`/${slug}/doctors/leave/leaves-list?${params.toString()}`);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (search) params.set("search", search);
      else params.delete("search");
      router.push(`/${slug}/doctors/leave/leaves-list?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/doctor/manage-leave?id=${id}`);
      toast.success("Leave deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/${slug}/doctors/leave/edit-leave?id=${id}`);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="min-h-screen space-y-6">
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Doctors", href: "/doctors" },
            { label: "Leaves List", current: true },
          ]}
        />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <CalendarX className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Doctor Leave Management
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                View, edit, and manage doctor leave schedules
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push(`/${slug}/doctors/leave/create-leave`)}
            className="h-11 px-4 rounded-xl bg-emerald-600 text-white shadow-md hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4" />
            Add Leave
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between p-5 bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Search */}
        <div className="relative w-full xl:w-96">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor / reason / type..."
            className="pl-12 h-11 w-full bg-slate-50 border-slate-200 focus:border-emerald-400 focus:ring-emerald-400/20 rounded-xl"
          />
        </div>

        {/* Filters — SAME STRUCTURE, UI MATCH */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
          <Select
            value={searchParams.get("doctor") ?? ""}
            onValueChange={(v) => updateQuery("doctor", v)}
          >
            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-medium">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Doctors</SelectItem>
              {doctors?.map((doc) => (
                <SelectItem key={doc._id} value={doc._id}>
                  {doc.firstName} {doc.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("type") ?? ""}
            onValueChange={(v) => updateQuery("type", v)}
          >
            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-medium">
              <SelectValue placeholder="Leave Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="FULL_DAY">Full Day</SelectItem>
              <SelectItem value="PARTIAL_SLOTS">Partial Slots</SelectItem>
              <SelectItem value="TIME_RANGE">Time Range</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={searchParams.get("month") ?? ""}
            onValueChange={(v) => updateQuery("month", v)}
          >
            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-medium">
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

          <Select
            value={searchParams.get("year") ?? ""}
            onValueChange={(v) => updateQuery("year", v)}
          >
            <SelectTrigger className="h-11 w-full bg-slate-50 border-slate-200 rounded-xl font-medium">
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

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader className="bg-[#0D1117]">
              <TableRow>
                {[
                  "Doctor",
                  "Type",
                  "Date Range",
                  "Slot / Time",
                  "Reason",
                  "Actions",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="px-4 py-3 text-xs font-bold text-slate-200 uppercase tracking-wider"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody className="bg-white divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-xs text-gray-500"
                  >
                    No leave records found
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow
                    key={leave._id}
                    className="hover:bg-slate-50 transition-colors duration-150"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {leave.doctor.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 hover:text-emerald-700 transition-colors">
                            {leave.doctor.firstName} {leave.doctor.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave.doctor.qualification}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium">
                      {leave.type.replace("_", " ")}
                    </TableCell>

                    <TableCell className="text-xs">
                      {formatDate(leave.fromDate)} – {formatDate(leave.toDate)}
                    </TableCell>

                    <TableCell className="text-xs">
                      {leave.type === "FULL_DAY"
                        ? "Full day"
                        : leave.type === "PARTIAL_SLOTS"
                          ? leave.slots?.join(", ")
                          : `${leave.startTime} – ${leave.endTime}`}
                    </TableCell>

                    <TableCell className="text-xs">
                      {leave.reason || "-"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => handleEdit(leave._id)}
                      >
                        <Edit className="w-4 h-4 text-amber-600" />
                      </Button>

                      <DeleteDialog
                        trigger={
                          <Button variant="ghost">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        }
                        title="Delete Leave"
                        description="Are you sure you want to delete this leave?"
                        onConfirm={() => handleDelete(leave._id)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
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
              {Math.min(currentPage * pagination.limit, pagination.totalCount)}
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
              onClick={() => updateQuery("page", String(currentPage - 1))}
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
                    onClick={() => updateQuery("page", String(page))}
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
              onClick={() => updateQuery("page", String(currentPage + 1))}
              disabled={currentPage >= pagination.totalPages}
              className="px-3 py-2 text-xs font-bold text-emerald-700 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

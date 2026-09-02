"use client";

import React, { useState, useEffect } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  MessageSquare,
  SearchIcon,
  Trash2,
  Edit,
  ArrowLeft,
  Plus,
  Eye,
  Download,
  ClipboardList,
  ArrowRight,
} from "lucide-react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { IEnquiry } from "@/app/models/Enquiry";
import axios from "axios";
import toast from "react-hot-toast";
import { EnquiryDTO } from "@/lib/types";
import { getEnquirySummaryAction } from "@/app/actions/enquiryActions";
import { EnquirySummary } from "@/app/controllers/enquiryController";
import EnquirySummaryCards from "./EnquirySummaryCards";
import Link from "next/link";
import BASE_URL from "@/app/utils/baseUrl";
import { useAuthStore } from "@/providers/AuthStoreProvider";
const statusStyles: Record<string, string> = {
  NEW: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  CONTACTED: "bg-blue-50 text-blue-700 border border-blue-200",
  FOLLOW_UP: "bg-purple-50 text-purple-700 border border-purple-200",
  APPOINTMENT_BOOKED: "bg-green-50 text-green-700 border border-green-200",
};

export interface EnquirySummaryCardsData {
  // Today snapshot
  newEnquiries: number;
  contacted: number;
  appointmentsBooked: number;
  followUps: number;

  // Monthly overview
  totalEnquiries: number;
  conversionRate: number; // %
  topCategory: string;
}

export default function EnquiryPage({
  enquiries,
  pagination,
  summary,
  setupStatus,
  categories,
}: {
  enquiries: EnquiryDTO[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  summary: EnquirySummaryCardsData;
  setupStatus?: { hasTreatmentCategories: boolean; hasDoctors: boolean };
  categories: string[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [updatingId, setUpdatingId] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") ?? "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") ?? "");
  const [exporting, setExporting] = useState(false);
  const clinic = useAuthStore((state: any) => state.clinic);
  const user = useAuthStore((state: any) => state.user);
  const paramsHook = useParams();
  const slug = paramsHook?.slug || clinic?.slug || "";
  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (search) params.set("search", search);
      else params.delete("search");

      router.push(`/${slug}/enquiries?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  //filters
  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value === "ALL") params.delete(key);
    else params.set(key, value);

    router.push(`/${slug}/enquiries?${params.toString()}`);
  };
  // Date Filter
  const handleDateRangeFilter = (from: string, to: string) => {
    const params = new URLSearchParams(searchParams);

    if (from) params.set("fromDate", from);
    else params.delete("fromDate");

    if (to) params.set("toDate", to);
    else params.delete("toDate");

    params.delete("page"); // reset pagination on filter change
    router.push(`/${slug}/enquiries?${params.toString()}`);
  };

  //clear filters
  const handleClearFilters = () => {
    setSearch("");
    setFromDate("");
    setToDate("");
    router.push(`/${slug}/enquiries`);
  };

  // Pagination
  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);
  const handlePageChange = (newPage: number) => {
    const page = Math.max(1, Math.min(pagination.totalPages, newPage));
    if (page === currentPage) return;
    handleFilter("page", String(page));
  };

  // Delete
  const handleDelete = async (id: string) => {
    try {
      const response = await axios.delete(`/api/enquiry?id=${id}`);
      if (response.status === 200) {
        toast.success("Enquiry deleted successfully");
        router.refresh();
      }
    } catch (error: unknown) {
      if (error instanceof Error && "response" in error) {
        const axiosError = error as { response: { data: { message: string } } };
        toast.error(axiosError.response.data.message || "Something went wrong");
      }
    }
  };

  // Appointment
  const handleAppointmentBook = async (enquiry: IEnquiry) => {
    const params = new URLSearchParams({
      name: `${enquiry.firstName || ""} ${enquiry.lastName && enquiry.lastName !== "-" ? enquiry.lastName : ""}`.trim(),
      email: enquiry.email || "",
      phone: enquiry.phone || "",
      enquiryId: enquiry._id,
      status: enquiry.status,
      staffNotes: enquiry.staffNotes || "",
    });

    router.push(`/${clinic?.slug || ""}/appointments/create-appointment?${params.toString()}`);
  };

  // Export to Excel
  const exportExcel = async () => {
    setExporting(true);
    try {
      // Pass ALL active filters — respects what user has filtered
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (searchParams.get("status"))
        params.set("status", searchParams.get("status")!);
      if (searchParams.get("treatmentCategory"))
        params.set("treatmentCategory", searchParams.get("treatmentCategory")!);
      if (searchParams.get("source"))
        params.set("source", searchParams.get("source")!);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const res = await axios.get(`/api/enquiry/export?${params.toString()}`);
      const rows = res.data.data;

      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Enquiries");

      worksheet.columns = [
        { header: "Name", key: "name", width: 25 },
        { header: "Email", key: "email", width: 28 },
        { header: "Phone", key: "phone", width: 16 },
        { header: "Treatment Category", key: "treatmentCategory", width: 20 },
        { header: "Status", key: "status", width: 20 },
        { header: "Source", key: "source", width: 15 },
        { header: "Message", key: "message", width: 35 },
        { header: "Staff Notes", key: "staffNotes", width: 35 },
        { header: "Handled By", key: "handledBy", width: 18 },
        { header: "Date", key: "createdAt", width: 20 },
      ];

      // Header row styling
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF16A34A" },
        };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Data rows
      rows.forEach((enq: any, i: number) => {
        const row = worksheet.addRow({
          name: `${enq.firstName ?? ""} ${enq.lastName ?? ""}`.trim(),
          email: enq.email ?? "",
          phone: enq.phone ?? "",
          treatmentCategory: enq.treatmentCategory ?? "",
          status: enq.status?.replace("_", " ") ?? "",
          source: enq.source ?? "",
          message: enq.message ?? "",
          staffNotes: enq.staffNotes ?? "",
          handledBy: enq.handledBy?.firstName ?? "",
          createdAt: enq.createdAt
            ? new Date(enq.createdAt).toLocaleString()
            : "",
        });

        if (i % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFF0FDF4" },
            };
          });
        }
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        });
      });

      worksheet.views = [{ state: "frozen", ySplit: 1 }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `enquiries_${new Date().toISOString().split("T")[0]}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${rows.length} enquiries`);
    } catch {
      toast.error("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen   p-2 space-y-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-400/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2 hover:bg-green-600 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="h-4 w-px bg-slate-300" />

        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Enquiries", current: true },
          ]}
        />
      </div>

      {/* Onboarding Setup Banner */}
      {setupStatus && (!setupStatus.hasTreatmentCategories || !setupStatus.hasDoctors) && user?.role === "ADMIN" && (
        <div className="bg-linear-to-r from-indigo-600 to-blue-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-indigo-500/20 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <ClipboardList className="w-7 h-7 text-indigo-200" />
              Welcome to your Workspace! Let's get you set up.
            </h2>
            <p className="text-indigo-100 mt-2 font-medium">
              {!setupStatus.hasTreatmentCategories 
                ? "You must create at least one Treatment Category before you can add Patients or Enquiries."
                : "You should add your first Doctor to start scheduling appointments."}
            </p>
          </div>
          <div>
            {!setupStatus.hasTreatmentCategories ? (
              <button 
                onClick={() => router.push(`/${slug}/settings/treatment-category`)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-indigo-50 hover:scale-105 transition-all shadow-sm flex items-center gap-2"
              >
                Create Category <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => router.push(`/${slug}/doctors`)}
                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-indigo-50 hover:scale-105 transition-all shadow-sm flex items-center gap-2"
              >
                Add Doctor <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl  backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center gap-4  backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
                Enquiry Management
              </h1>
              <p className="text-slate-600 font-medium text-sm mt-1">
                View and manage all customer enquiries
              </p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => router.push(`/${slug}/enquiries/add-enquiry`)}
            disabled={setupStatus && (!setupStatus.hasTreatmentCategories || !setupStatus.hasDoctors)}
            className="h-11 px-4 rounded-xl bg-green-800 text-white shadow-md hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Enquiry
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      <EnquirySummaryCards
        data={{
          newEnquiries: summary.newEnquiries,
          contacted: summary.contacted,
          appointmentsBooked: summary.appointmentsBooked,
          followUps: summary.followUps,
          totalEnquiries: summary.totalEnquiries,
          conversionRate: summary.conversionRate,
          topCategory: summary.topCategory,
        }}
      />

      <div className="flex flex-col gap-4 p-5 bg-white backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
        {/* Row 1: Search + Export */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone..."
              className="pl-12 h-9 w-full bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
            />
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportExcel}
            disabled={exporting}
            className="h-9 px-4 w-full sm:w-auto rounded-xl border-green-200 bg-green-50 text-green-700 hover:bg-green-100  whitespace-nowrap disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4 mr-1" />
            {exporting ? "Exporting..." : "Export Excel"}
          </Button>
        </div>

        {/* Row 2: Filters + Clear */}
        <div className="flex flex-col lg:flex-row gap-3 items-end">
          {/* Type Filter */}
          {categories && categories.length > 0 ? (
            <Select
              value={searchParams.get("treatmentCategory") ?? ""}
              onValueChange={(val) => handleFilter("treatmentCategory", val)}
            >
              <SelectTrigger className="h-9 w-full lg:w-44 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium">
                <SelectValue placeholder="Filter by treatment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {categories.map((c: string) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-9 flex items-center px-3 text-sm text-slate-500 bg-slate-50 rounded-xl border border-slate-200 w-full lg:w-auto">
              No treatment categories added yet
            </div>
          )}

          {/* Status Filter */}
          <Select
            value={searchParams.get("status") ?? ""}
            onValueChange={(val) => handleFilter("status", val)}
          >
            <SelectTrigger className="h-9 w-full lg:w-44 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
              <SelectItem value="APPOINTMENT_BOOKED">
                Appointment Booked
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Source Filter */}
          <Select
            value={searchParams.get("source") ?? ""}
            onValueChange={(val) => handleFilter("source", val)}
          >
            <SelectTrigger className="h-9 w-full lg:w-44 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium">
              <SelectValue placeholder="Filter by source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sources</SelectItem>
              <SelectItem value="WEBSITE">Website</SelectItem>
              <SelectItem value="PHONE">Phone</SelectItem>
              <SelectItem value="WHATSAPP">Whatsapp</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-36">
              <label className="text-[11px] font-semibold text-gray-600 leading-none">
                From Date
              </label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  const value = e.target.value;
                  setFromDate(value);
                  handleDateRangeFilter(value, toDate);
                }}
                className="h-9 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium text-xs"
              />
            </div>

            <div className="flex flex-col gap-1 w-full sm:w-36">
              <label className="text-[11px] font-semibold text-gray-600 leading-none">
                To Date
              </label>
              <Input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(e) => {
                  const value = e.target.value;
                  setToDate(value);
                  handleDateRangeFilter(fromDate, value);
                }}
                className="h-9 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium text-xs"
              />
            </div>
          </div>

          {/* Clear Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-9 px-3 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all shrink-0"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto ">
          <table className="min-w-[1300px] w-full table-auto divide-y divide-purple-300 table">
            <thead className="bg-blue-primary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status (Handled By)
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Staff Note
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white/10 divide-y divide-gray-100">
              {enquiries.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="text-center py-8 text-xs text-gray-500"
                  >
                    No enquiries found
                  </td>
                </tr>
              ) : (
                enquiries.map((enq) => (
                  <tr
                    key={enq._id}
                    className="hover:bg-gray-50 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 transition-colors border-b duration-150"
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm hover:shadow-md transition-shadow">
                          {enq.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 hover:text-green-800 transition-colors">
                            {enq.firstName} {enq.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {enq.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3 text-xs text-gray-600 font-medium">
                      {enq.phone}
                    </td>

                    {/* About */}
                    <td className="px-4 py-3 text-xs font-medium text-blue-600">
                      {enq.treatmentCategory}
                    </td>

                    {/* Message */}
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] relative">
                      <div className="group cursor-pointer relative">
                        {/* Single-line fixed height */}
                        <div
                          className={`${enq.message.length > 2 ? "truncate" : ""}`}
                        >
                          {enq.message}
                        </div>

                        {/* Full message on hover */}
                        <div className="absolute left-0 top-full z-50 hidden group-hover:block bg-white shadow-lg border border-green-600 rounded-md p-3 w-[300px] whitespace-normal">
                          {enq.message}
                        </div>
                      </div>
                    </td>

                    {/* Status (Editable Select) */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs text-nowrap font-medium ${
                          statusStyles[enq.status] ??
                          "bg-gray-50 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {enq.status.replace("_", " ")}
                        {enq.handledBy?.firstName && (
                          <span className="ml-1 text-[10px] font-normal opacity-70">
                            ({enq.handledBy.firstName})
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-600 text-nowrap">
                      {enq.createdAt
                        ? new Date(enq.createdAt).toLocaleString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[200px] relative">
                      <div className="group cursor-pointer">
                        {/* Preview (1 line, fixed height) */}
                        <div className="truncate">{enq.staffNotes || "—"}</div>

                        {/* Full content on hover */}
                        {enq.staffNotes && (
                          <div className="absolute left-4 top-auto z-50 hidden group-hover:block bg-white shadow-lg border border-green-600 rounded-md p-3 w-[300px] whitespace-normal">
                            {enq.staffNotes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs text-xs font-semibold text-gray-600 line-clamp-1 hover:line-clamp-none transition-all duration-150 cursor-pointer">
                        {enq.source || "—"}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2 px-2">
                        <Button
                          onClick={() => router.push(`/${slug}/enquiries/${enq?._id}`)}
                          size="sm"
                          className="text-xs bg-white shadow-sm text-blue-primary hover:text-blue-600 px-2 py-1 rounded-md hover:bg-blue-50 transition-all shrink-0"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Activity Notes
                        </Button>

                        {/* Book Appointment Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 transition-all"
                          onClick={() => handleAppointmentBook(enq as IEnquiry)}
                          disabled={enq.status === "APPOINTMENT_BOOKED"}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Book
                        </Button>

                        {/* Delete Button */}
                        <DeleteDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded-md shadow-md hover:bg-red-50 transition-all"
                              disabled={enq.status === "APPOINTMENT_BOOKED"}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          }
                          title="Delete Enquiry"
                          description="Are you sure you want to delete this enquiry? This action cannot be undone."
                          onConfirm={() => handleDelete(enq._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-linear-to-r from-indigo-50/30 via-purple-50/20 to-pink-50/10 border-t border-indigo-100/50">
            {/* Info Text */}
            <div className="text-xs text-gray-600 font-medium mb-2 sm:mb-0">
              Showing{" "}
              <span className="font-bold text-green-700">
                {(currentPage - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-green-700">
                {Math.min(
                  currentPage * pagination.limit,
                  pagination.totalCount,
                )}
              </span>{" "}
              of{" "}
              <span className="font-bold text-green-700">
                {pagination.totalCount}
              </span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1.5">
              {/* Prev */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-2 text-xs font-bold  text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
              >
                Prev
              </button>

              {/* Page Numbers (hidden on very small screens) */}
              <div className="hidden sm:flex items-center gap-1 mx-1">
                {(() => {
                  const total = pagination.totalPages;
                  const cp = currentPage;
                  const nodes: React.ReactNode[] = [];

                  // first
                  nodes.push(
                    <button
                      key={1}
                      onClick={() => handlePageChange(1)}
                      className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                        cp === 1
                          ? "bg-blue-primary text-white shadow-lg shadow-green-500/30 scale-105"
                          : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                      }`}
                    >
                      1
                    </button>,
                  );

                  if (cp > 4) {
                    nodes.push(
                      <span
                        key="e1"
                        className="px-1.5 text-green-400 text-xs font-bold"
                      >
                        · · ·
                      </span>,
                    );
                  }

                  const start = Math.max(2, cp - 1);
                  const end = Math.min(total - 1, cp + 1);

                  for (let i = start; i <= end; i++) {
                    if (i <= 1 || i >= total) continue;
                    nodes.push(
                      <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                          cp === i
                            ? "bg-blue-primary text-white shadow-lg shadow-indigo-500/40 scale-105"
                            : "text-green-700 hover:bg-linear-to-r hover:from-green-50 hover:to-green-50 border border-green-100"
                        }`}
                      >
                        {i}
                      </button>,
                    );
                  }

                  if (cp < total - 3) {
                    nodes.push(
                      <span
                        key="e2"
                        className="px-1.5 text-green-400 text-xs font-bold"
                      >
                        · · ·
                      </span>,
                    );
                  }

                  if (total > 1) {
                    nodes.push(
                      <button
                        key={total}
                        onClick={() => handlePageChange(total)}
                        className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                          cp === total
                            ? "bg-blue-600 text-white shadow-lg shadow-indigo-500/40 scale-105"
                            : "text-green-700 hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 border border-indigo-100"
                        }`}
                      >
                        {total}
                      </button>,
                    );
                  }

                  return nodes;
                })()}
              </div>

              {/* Next */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= pagination.totalPages}
                className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
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

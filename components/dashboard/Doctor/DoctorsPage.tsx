"use client";

import { Doctor } from "@/app/models/Doctor";
import Breadcrumb from "@/components/shared/Breadcrumb";
import {
  Plus,
  Eye,
  Trash2,
  Edit,
  Mail,
  Phone,
  Sparkles,
  SearchIcon,
  StethoscopeIcon,
  ArrowLeft,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import DeleteDialog from "@/components/shared/DeleteDialog";
import { useAuthStore } from "@/providers/AuthStoreProvider";

const getStatusBadge = (status: string) => {
  if (status === "ACTIVE")
    return (
      <span className="px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-emerald-50 to-green-50 text-emerald-700 rounded-full border border-emerald-200 shadow-sm">
        Active
      </span>
    );

  return (
    <span className="px-3 py-1.5 text-xs font-semibold bg-linear-to-r from-amber-50 to-yellow-50 text-amber-700 rounded-full border border-amber-200 shadow-sm">
      On Leave
    </span>
  );
};

export default function DoctorsPage({
  doctors,
  pagination,
}: {
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
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const clinic = useAuthStore((state) => state.clinic);
  const categories = clinic?.departments || [];

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      search ? params.set("search", search) : params.delete("search");
      router.push(`/doctors?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timeout);
  }, [search]);

  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "ALL" || !value) params.delete(key);
    else params.set(key, value);
    router.push(`/doctors?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const p = Math.max(1, Math.min(pagination.totalPages, page));
    if (p !== currentPage) updateQuery("page", String(p));
  };

  const handleEdit = (id: string) =>
    router.push(`/doctors/edit-doctor?id=${id}`);

  const handleView = (id: string) => router.push(`/doctors/${id}`);

  const handleDelete = async (id: string) => {
    const res = await axios.delete(`/api/doctor?id=${id}`);
    if (!res.data.success) {
      toast.error(res.data.message || "Failed to delete doctor");
      return;
    }
    toast.success("Doctor deleted successfully");
    router.refresh();
  };

  return (
    <div className="min-h-screen p-2 space-y-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none"></div>
      <div className="relative z-10 mb-6 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2.5 rounded-lg hover:bg-[#00236F] hover:text-white transition-all duration-150 font-medium text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="h-4 w-px bg-slate-300" />
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Doctors", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
              <StethoscopeIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
                Doctors Management
              </h1>
              <p className="text-slate-600 font-medium text-sm mt-1">
                Manage your medical team and their specializations
              </p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/doctors/add-doctor")}
            className="h-11 px-2 rounded-xl bg-green-800 text-white shadow-md hover:bg-green-900"
          >
            <Plus className="w-4 h-4 " />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between p-5 bg-white backdrop-blur-sm rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50">
        <div className="relative w-full">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or role..."
            className="pl-12 h-11 w-full bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl"
          />
        </div>

        <Select
          value={searchParams.get("specialization") ?? ""}
          onValueChange={(v) => updateQuery("specialization", v)}
        >
          <SelectTrigger className="h-11 w-full bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl font-medium">
            <SelectValue placeholder="Specialization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Specializations</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c.toLowerCase()}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-blue-primary">
              <tr>
                {[
                  "Doctor",
                  "Specialization",
                  "Email",
                  "Status",
                  "Contact",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-xs font-bold text-white uppercase tracking-wider text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white/10 divide-y divide-gray-100">
              {doctors.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No doctors found. Please add a doctor.
                  </td>
                </tr>
              ) : (
                doctors.map((doc) => (
                  <tr
                    key={doc._id}
                    className="hover:bg-gray-50 bg-linear-to-br from-blue-500/5 via-purple-100/5 to-pink-500/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-blue-primary rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">
                          {doc.firstName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-gray-900">
                            Dr. {doc.firstName} {doc.lastName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {doc.qualification}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {doc.specialization.slice(0, 2).map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-linear-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg border"
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </span>
                        ))}

                        {doc.specialization.length > 2 && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="px-2 py-1 text-xs bg-gray-100 rounded-lg border cursor-pointer">
                                  +{doc.specialization.length - 2}
                                </span>
                              </TooltipTrigger>

                              <TooltipContent className="bg-gray-50 border rounded-md p-3">
                                {doc.specialization.slice(2).map((s, i) => (
                                  <div key={i} className="text-xs text-black">
                                    • {s.charAt(0).toUpperCase() + s.slice(1)}
                                  </div>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {doc.email}
                      </div>
                    </td>

                    <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>

                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {doc.contactNumber}
                      </div>
                    </td>

                    <td className="px-3 py-4 text-left">
                      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                        <Button
                          variant="ghost"
                          onClick={() => handleView(doc._id as string)}
                          className="shrink-0"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => handleEdit(doc._id as string)}
                          className="shrink-0"
                        >
                          <Edit className="w-4 h-4 text-amber-600" />
                        </Button>

                        <DeleteDialog
                          trigger={
                            <Button variant="ghost" className="shrink-0">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          }
                          title="Delete Doctor"
                          description="Are you sure you want to delete this doctor?"
                          onConfirm={() => handleDelete(doc._id as string)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 bg-linear-to-r from-indigo-50/30 via-purple-50/20 to-pink-50/10 border-t border-indigo-100/50">
          {/* Info */}
          <div className="text-xs text-gray-600 font-medium mb-2 sm:mb-0">
            Showing{" "}
            <span className="font-bold text-indigo-700">
              {(currentPage - 1) * pagination.limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-indigo-700">
              {Math.min(currentPage * pagination.limit, pagination.totalCount)}
            </span>{" "}
            of{" "}
            <span className="font-bold text-indigo-700">
              {pagination.totalCount}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => updateQuery("page", String(currentPage - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
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
                    className={`min-w-9 h-9 px-2 text-xs font-bold rounded-xl transition-all hover:shadow-md ${
                      currentPage === page
                        ? "bg-blue-primary text-white shadow-lg scale-105"
                        : "text-green-700 hover:bg-green-50 border border-green-100"
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
              className="px-3 py-2 text-xs font-bold text-green-700 bg-white border-2 border-green-200 rounded-xl hover:bg-green-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

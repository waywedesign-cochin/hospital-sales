"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, UserPlus, FileText, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function PatientsPageClient({
  patients,
  pagination,
  activeTreatments,
  messagesSent,
}: {
  patients: Patient[];
  pagination: Pagination;
  activeTreatments: number;
  messagesSent: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const currentPage = Number(searchParams.get("page") ?? pagination.page ?? 1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      search ? params.set("search", search) : params.delete("search");
      params.delete("page");
      router.push(`/patients?${params.toString()}`);
    }, 500);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handlePageChange = (page: number) => {
    const p = Math.max(1, Math.min(pagination.totalPages || 1, page));
    if (p === currentPage) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", String(p));
    router.push(`/patients?${params.toString()}`);
  };

  const handleExportCSV = () => {
    if (patients.length === 0) return;

    const headers = ["Patient Name", "Phone", "Email", "Gender", "Joined Date"];

    const rows = patients.map((patient) => {
      const name = `${patient.firstName} ${patient.lastName}`;
      const joinedDate = new Date(patient.createdAt).toLocaleDateString(
        "en-US",
      );
      return [
        `"${name}"`,
        `"${patient.phone || ""}"`,
        `"${patient.email || ""}"`,
        `"${patient.gender || ""}"`,
        `"${joinedDate}"`,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `patients_export_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            Patient Records
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your patients, view medical history, and analyze engagement.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push("/enquiries/add-enquiry")}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm transition-all rounded-full px-5"
          >
            <UserPlus className="w-4 h-4 mr-2 text-emerald-600" /> New Enquiry
          </Button>
          <Button
            onClick={() => router.push("/appointments/create-appointment")}
            className="bg-[#0D1117] hover:bg-[#141A21] text-white shadow-sm transition-all shadow-black/10 rounded-full px-5"
          >
            <Calendar className="w-4 h-4 mr-2" /> Book Appointment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">
              Total Patients
            </CardDescription>
            <CardTitle className="text-3xl text-slate-800">
              {pagination.totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-600 font-semibold bg-emerald-50 w-fit px-2 py-1 rounded-full">
              +12% this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">
              Active Treatments
            </CardDescription>
            <CardTitle className="text-3xl text-slate-800">
              {activeTreatments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              In progress
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl bg-linear-to-br from-[#0D1117] to-emerald-800 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-300 font-medium">
              Messages Sent
            </CardDescription>
            <CardTitle className="text-3xl text-white">
              {messagesSent.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-emerald-300 font-semibold">
              <Activity className="w-3 h-3 mr-1" /> WhatsApp API Active
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, phone, email..."
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-emerald-100 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="rounded-xl border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={handleExportCSV}
            disabled={patients.length === 0}
          >
            <FileText className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-500">
                  Patient Name
                </TableHead>
                <TableHead className="font-semibold text-slate-500">
                  Contact
                </TableHead>
                <TableHead className="font-semibold text-slate-500">
                  Gender
                </TableHead>
                <TableHead className="font-semibold text-slate-500">
                  Date of Birth
                </TableHead>
                <TableHead className="font-semibold text-slate-500">
                  Joined Date
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-slate-500"
                  >
                    No patients found.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow
                    key={patient._id}
                    className="border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/patients/${patient._id}`)}
                  >
                    <TableCell className="font-medium text-slate-800">
                      {patient.firstName} {patient.lastName}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      <div>{patient.phone}</div>
                      {patient.email && (
                        <div className="text-xs text-slate-400">
                          {patient.email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.gender ? (
                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-md font-medium">
                          {patient.gender}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {patient.dateOfBirth ? (
                        <span className="text-slate-600 text-sm font-medium">
                          {new Date(patient.dateOfBirth).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(patient.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/patients/${patient._id}`);
                        }}
                      >
                        View Profile
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing{" "}
            <span className="font-medium text-slate-800">
              {patients.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              {currentPage} / {pagination.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200"
              disabled={
                currentPage === pagination.totalPages ||
                pagination.totalPages === 0
              }
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, FileText, Activity } from "lucide-react";
import axios from "axios";
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
  createdAt: string;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeTreatments, setActiveTreatments] = useState(0);
  const [messagesSent, setMessagesSent] = useState(0);

  const fetchPatients = async (searchTerm = "", currentPage = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `/api/patients?page=${currentPage}&limit=10&search=${searchTerm}`
      );
      if (res.data.success) {
        setPatients(res.data.data.patients);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalCount(res.data.data.pagination.totalCount || 0);
        setActiveTreatments(res.data.data.activeTreatments || 0);
        setMessagesSent(res.data.data.messagesSent || 0);
      }
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchPatients(searchQuery, page);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page]);

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
        <Button className="bg-blue-primary hover:bg-blue-600 text-white shadow-sm transition-all shadow-blue-500/20 rounded-full px-6">
          <UserPlus className="w-4 h-4 mr-2" /> Add New Patient
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Total Patients</CardDescription>
            <CardTitle className="text-3xl text-slate-800">
              {loading ? "..." : totalCount}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-neon-accent font-semibold bg-neon-accent/10 w-fit px-2 py-1 rounded-full">
              +12% this month
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-500 font-medium">Active Treatments</CardDescription>
            <CardTitle className="text-3xl text-slate-800">
              {loading ? "..." : activeTreatments}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-slate-500 font-medium">
              In progress
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-100 shadow-sm shadow-slate-200/40 rounded-2xl bg-linear-to-br from-blue-primary to-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-100 font-medium">Messages Sent</CardDescription>
            <CardTitle className="text-3xl text-white">
              {loading ? "..." : messagesSent.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-neon-accent font-semibold">
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
              className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-100 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 hover:text-blue-primary hover:bg-blue-50">
            <FileText className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>
        <div className="bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-500">Patient Name</TableHead>
                <TableHead className="font-semibold text-slate-500">Contact</TableHead>
                <TableHead className="font-semibold text-slate-500">Gender</TableHead>
                <TableHead className="font-semibold text-slate-500">Joined Date</TableHead>
                <TableHead className="text-right font-semibold text-slate-500">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    Loading patients...
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
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
                        <div className="text-xs text-slate-400">{patient.email}</div>
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
                    <TableCell className="text-slate-500 text-sm">
                      {new Date(patient.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-primary hover:bg-blue-50 hover:text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
        
        {/* Pagination placeholder */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-800">{patients.length}</span> results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              Previous
            </Button>
            <span className="px-2 font-medium">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg border-slate-200"
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage(p => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { DEFAULT_TIME_SLOTS } from "@/constants/timeSlots";
import { Doctor } from "@/lib/types";
import { doctorLeaveSchema } from "@/app/validations/doctorSchema";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { ArrowLeft, StethoscopeIcon } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function DoctorLeaveForm({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    doctor: "",
    fromDate: "",
    toDate: "",
    type: "FULL_DAY",
    slots: [] as string[],
    startTime: "",
    endTime: "",
    reason: "",
  });

  const updateField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSlot = (slot: string) => {
    setForm((prev) => {
      const exists = prev.slots.includes(slot);
      return {
        ...prev,
        slots: exists
          ? prev.slots.filter((s) => s !== slot)
          : [...prev.slots, slot],
      };
    });
  };

  const submitLeave = async () => {
    setErrors({});
    const validation = doctorLeaveSchema.safeParse(form);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/doctor/manage-leave", { ...form });
      toast.success("Doctor leave added successfully");
      router.push(`/${slug}/doctors/leave/leaves-list`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Breadcrumb */}
      <div className="mb-4">
        <div className="overflow-x-auto sm:overflow-visible">
          <div className="min-w-0 whitespace-nowrap sm:whitespace-normal">
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
                  { label: "Doctors", href: "/doctors" },
                  { label: "Leaves List", href: "/doctors/leave/leaves-list" },
                  { label: "Create Leave", current: true },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="relative flex flex-col sm:flex-row text-center sm:text-left items-center gap-4 p-6 rounded-2xl">
          <div className="bg-[#0D1117] p-4 rounded-xl">
            <StethoscopeIcon className="w-8 h-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Manage Doctor Leave
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Manage doctor leave information and availability
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <Card className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <CardContent className="p-6 space-y-6">
          {/* Doctor */}
          <div className="space-y-1">
            <Label>Select Doctor</Label>
            <Select
              value={form.doctor}
              onValueChange={(val) => updateField("doctor", val)}
            >
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl w-full">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doc) => (
                  <SelectItem key={doc._id} value={doc._id}>
                    {doc.firstName} {doc.lastName} — {doc.qualification}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.doctor && (
              <p className="text-xs text-red-500">{errors.doctor}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>From Date</Label>
              <Input
                type="date"
                value={form.fromDate}
                onChange={(e) => updateField("fromDate", e.target.value)}
                className="h-11 rounded-xl"
              />
              {errors.fromDate && (
                <p className="text-xs text-red-500">{errors.fromDate}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>To Date</Label>
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) => updateField("toDate", e.target.value)}
                className="h-11 rounded-xl"
              />
              {errors.toDate && (
                <p className="text-xs text-red-500">{errors.toDate}</p>
              )}
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-1">
            <Label>Leave Type</Label>
            <Select
              value={form.type}
              onValueChange={(val) => updateField("type", val)}
            >
              <SelectTrigger className="h-11 bg-slate-50 border-slate-200 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_DAY">Full Day Leave</SelectItem>
                <SelectItem value="PARTIAL_SLOTS">Partial Slots</SelectItem>
                <SelectItem value="TIME_RANGE">
                  Time Range (Half Day)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Partial Slots */}
          {form.type === "PARTIAL_SLOTS" && (
            <div className="space-y-2">
              <Label>Select Leave Slots</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition
                      ${
                        form.slots.includes(slot)
                          ? "bg-[#0D1117] text-white shadow"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      }
                    `}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Range */}
          {form.type === "TIME_RANGE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => updateField("startTime", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => updateField("endTime", e.target.value)}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1">
            <Label>Reason (optional)</Label>
            <Textarea
              placeholder="Reason for leave"
              value={form.reason}
              onChange={(e) => updateField("reason", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm hover:shadow-md"
            onClick={submitLeave}
            disabled={loading || !form.doctor || !form.type}
          >
            {loading ? "Saving..." : "Save Leave"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

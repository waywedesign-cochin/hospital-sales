"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Doctor } from "@/lib/types";
import { DEFAULT_TIME_SLOTS } from "@/constants/timeSlots";
import { doctorLeaveSchema } from "@/app/validations/doctorSchema";

import Breadcrumb from "@/components/shared/Breadcrumb";
import { ArrowLeft, StethoscopeIcon } from "lucide-react";

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

export default function EditLeaveForm({
  doctors,
  leaveId,
  initialData,
}: {
  doctors: Doctor[];
  leaveId?: string;
  initialData?: any;
}) {
  const router = useRouter();

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

  // Load initial data
  useEffect(() => {
    if (!initialData) return;

    setForm({
      doctor: initialData.doctor?._id,
      fromDate: initialData.fromDate,
      toDate: initialData.toDate,
      type: initialData.type,
      slots: initialData.slots || [],
      startTime: initialData.startTime || "",
      endTime: initialData.endTime || "",
      reason: initialData.reason || "",
    });
  }, [initialData]);

  const updateField = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
      await axios.put(`/api/doctor/manage-leave?id=${leaveId}`, { ...form });
      toast.success("Leave updated successfully");
      router.push("/doctors/leave/leaves-list");
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to update leave");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2 space-y-6">
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
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Leaves List", href: "/doctors/leave/leaves-list" },
            { label: "Edit Leave", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="relative flex flex-col sm:flex-row text-center sm:text-left items-center gap-4 p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 ">
          <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
            <StethoscopeIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
              Edit Doctor Leave
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Modify doctor leave details and availability
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-100/50">
        <CardContent className="p-6 space-y-6">
          {/* Doctor */}
          <div className="space-y-1">
            <Label>Select Doctor</Label>
            <Select
              value={form.doctor}
              onValueChange={(val) => updateField("doctor", val)}
            >
              <SelectTrigger className="h-11 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl">
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
            </div>

            <div className="space-y-1">
              <Label>To Date</Label>
              <Input
                type="date"
                value={form.toDate}
                onChange={(e) => updateField("toDate", e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          {/* Leave Type */}
          <div className="space-y-1">
            <Label>Leave Type</Label>
            <Select
              value={form.type}
              onValueChange={(val) => updateField("type", val)}
            >
              <SelectTrigger className="h-11 bg-linear-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FULL_DAY">Full Day</SelectItem>
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
              <Label>Leave Slots</Label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {DEFAULT_TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`px-2 py-1 rounded-lg text-xs font-medium transition
                      ${
                        form.slots.includes(slot)
                          ? "bg-blue-600 text-white shadow"
                          : "bg-blue-50 text-blue-700 hover:bg-blue-100"
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
            <Label>Reason</Label>
            <Textarea
              value={form.reason}
              onChange={(e) => updateField("reason", e.target.value)}
              className="rounded-xl"
            />
          </div>

          {/* Submit */}
          <Button
            className="w-full h-11 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl shadow-md hover:shadow-lg"
            disabled={loading || !form.doctor || !form.type}
            onClick={submitLeave}
          >
            {loading ? "Updating..." : "Update Leave"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { appointmentSchema } from "@/app/validations/appointmentSchemas";
import { Doctor } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_TIME_SLOTS } from "@/constants/timeSlots";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import { updateEnquiryStatusSchema } from "@/app/validations/enquirySchemas";

/* ---------------- CONSTANTS ---------------- */

const categories = ["Skin", "Body", "Hair"];
type BlockedSlot = {
  time: string;
  reason: "BOOKED" | "LEAVE";
};

/* ---------------- PAGE ---------------- */

export default function AppointmentForm({
  doctors,
  date,
  prefill,
}: {
  doctors: Doctor[];
  date?: string;
  prefill?: {
    name: string;
    email: string;
    phone: string;
    enquiryId?: string;
    status?: string;
    staffNotes?: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  //console.log(prefill);

  const [form, setForm] = useState({
    enquiryId: prefill?.enquiryId ?? undefined,
    patientName: prefill?.name || "",
    patientPhone: prefill?.phone || "",
    patientEmail: prefill?.email || "",
    doctor: "",
    treatmentCategory: "",
    date: date ?? "",
    startTime: "",
    notes: "",
  });
  const [enquiryForm, setEnquiryForm] = useState({
    status: "APPOINTMENT_BOOKED",
    handledBy: user?._id,
    staffNotes: prefill?.staffNotes || "",
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  //onChange
  const onChange = (key: string, value: string) => {
    const next = { ...form, [key]: value };

    if (key === "treatmentCategory" && value !== form.treatmentCategory) {
      next.doctor = "";
      next.startTime = "";
      setBlockedSlots([]);
    }

    setForm(next);
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const now = new Date();

  const isPastSlot = (slot: string) => {
    if (!form.date) return false;
    return new Date(`${form.date}T${slot}:00`) < now;
  };

  const getSlotReason = (time: string) =>
    blockedSlots.find((s) => s.time === time)?.reason;

  const fetchSlots = async () => {
    if (!form.doctor || !form.date) return;

    try {
      setLoadingSlots(true);
      const res = await axios.get(
        `/api/appointment?doctor=${form.doctor}&date=${form.date}`,
      );

      if (res.data.success) {
        setBlockedSlots(res.data.data || []);
      }
    } catch {
      toast.error("Failed to load slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [form.doctor, form.date]);

  useEffect(() => {
    if (!form.treatmentCategory) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("specialization", form.treatmentCategory);

    router.replace(`?${params.toString()}`);
    router.refresh();
  }, [form.treatmentCategory]);

  //handle form submit
  const handleAddAppointment = async () => {
    setErrors({});

    const validation = appointmentSchema.safeParse({
      ...form,
      handledBy: user?._id,
    });
    if (!validation.success) {
      const e: Record<string, string> = {};
      validation.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message;
      });
      setErrors(e);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/appointment", {
        ...form,
        enquiryId: form?.enquiryId || undefined,
        handledBy: user?._id,
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Appointment added");
      router.push("/appointments");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  //handle enquiry update
  const handleEnquiryUpdate = async () => {
    setErrors({});

    const validation = updateEnquiryStatusSchema.safeParse(enquiryForm);
    if (!validation.success) {
      const e: Record<string, string> = {};
      validation.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message;
      });

      setErrors(e);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.patch(`/api/enquiry?id=${prefill?.enquiryId}`, {
        ...enquiryForm,
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Enquiry updated");
      router.push("/enquiries");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen p-2 space-y-6 relative">
      <div className="mb-4">
        <div className="overflow-x-auto sm:overflow-visible">
          <div className="min-w-0 whitespace-nowrap sm:whitespace-normal">
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
                  { label: "Appointments", href: "/appointments" },
                  { label: "Create Appointment", current: true },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Header – SAME as AppointmentsPage */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-[#ABEDCC]">
        <div className="absolute inset-0 " />
        <div className="flex flex-col sm:flex-row text-center sm: items-center gap-4 p-6 rounded-2xl border border-blue-100/50">
          <div className="bg-greenpick p-4 rounded-xl shadow-lg shadow-blue-500/30">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-greenpick bg-clip-text text-transparent">
              Create Appointment
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Schedule a new patient appointment
            </p>
          </div>
        </div>
      </div>

      {/* Form Card – SAME CARD STYLE AS AppointmentsPage */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Patient Name"
            value={form.patientName}
            onChange={(e) => onChange("patientName", e.target.value)}
          />
          <Input
            placeholder="Phone Number"
            value={form.patientPhone}
            onChange={(e) => onChange("patientPhone", e.target.value)}
          />
          <Input
            placeholder="Email"
            value={form.patientEmail}
            onChange={(e) => onChange("patientEmail", e.target.value)}
          />
          {/* Enquiry status */}
          {prefill?.email && (
            <div>
              <Select
                value={enquiryForm.status}
                onValueChange={(val) =>
                  setEnquiryForm((p) => ({ ...p, status: val }))
                }
              >
                <SelectTrigger className="h-11 w-full">
                  <SelectValue placeholder="Enquiry Status" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value={"NEW"}>New</SelectItem>
                  <SelectItem value={"CONTACTED"}>Contacted</SelectItem>
                  <SelectItem value={"FOLLOW_UP"}>Follow Up</SelectItem> */}
                  <SelectItem value={"APPOINTMENT_BOOKED"}>
                    Book Appointment
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
          )}
          {enquiryForm.status !== "APPOINTMENT_BOOKED" && prefill?.email && (
            <div>
              <Input
                placeholder="Staff Notes"
                value={enquiryForm.staffNotes}
                type="text"
                onChange={(e) =>
                  setEnquiryForm((p) => ({ ...p, staffNotes: e.target.value }))
                }
              />
              {errors.staffNotes && (
                <p className="text-red-500 text-xs mt-1">{errors.staffNotes}</p>
              )}
            </div>
          )}
          {(enquiryForm.status === "APPOINTMENT_BOOKED" || !prefill?.email) && (
            <>
              {/* Category & Doctor */}
              <div>
                <Select
                  value={form.treatmentCategory}
                  onValueChange={(val) => onChange("treatmentCategory", val)}
                >
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Treatment Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.treatmentCategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.treatmentCategory}
                  </p>
                )}
              </div>

              {form.treatmentCategory && (
                <div>
                  <Select
                    value={form.doctor}
                    onValueChange={(val) => onChange("doctor", val)}
                  >
                    <SelectTrigger className="h-11  w-full">
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doc) => (
                        <SelectItem key={doc._id} value={doc._id}>
                          {doc.firstName} {doc.lastName} – {doc.qualification}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.doctor && (
                    <p className="text-red-500 text-xs mt-1">{errors.doctor}</p>
                  )}
                </div>
              )}

              {/* Date */}
              {form.treatmentCategory && (
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => onChange("date", e.target.value)}
                  className="w-auto"
                />
              )}
            </>
          )}{" "}
        </div>
        {/* Time Slots */}
        {form.doctor && form.date && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700">
              Select Time Slot
            </p>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {DEFAULT_TIME_SLOTS.map((time) => {
                const reason = getSlotReason(time);
                const isPast = isPastSlot(time);
                const disabled = isPast || !!reason;

                let cls =
                  "h-11 rounded-xl text-sm border transition flex items-center justify-center";

                if (isPast)
                  cls +=
                    " bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
                else if (reason === "BOOKED")
                  cls +=
                    " bg-red-100 text-red-500 border-red-200 cursor-not-allowed";
                else if (reason === "LEAVE")
                  cls +=
                    " bg-orange-100 text-orange-600 border-orange-200 cursor-not-allowed";
                else if (form.startTime === time)
                  cls += " bg-blue-600 text-white border-blue-700";
                else cls += " bg-blue-50 border-blue-300 hover:bg-blue-100";

                return (
                  <button
                    key={time}
                    disabled={disabled}
                    onClick={() => onChange("startTime", time)}
                    className={cls}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {form.date && form.doctor && (
          <>
            {/* Notes */}
            <Textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => onChange("notes", e.target.value)}
            />
          </>
        )}
        {/* Action Buttons */}
        {form.startTime && form.doctor && form.date && (
          <Button
            onClick={handleAddAppointment}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-linear-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900"
          >
            {loading ? "Adding..." : "Create Appointment"}
          </Button>
        )}
        {enquiryForm.status !== "APPOINTMENT_BOOKED" && prefill?.email && (
          <Button
            onClick={handleEnquiryUpdate}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-linear-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        )}
      </div>
    </div>
  );
}

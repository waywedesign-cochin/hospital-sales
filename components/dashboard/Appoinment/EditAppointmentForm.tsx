"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
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
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { DEFAULT_TIME_SLOTS } from "@/constants/timeSlots";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import { Loader2, ArrowLeft, Plus, Calendar as CalendarIcon } from "lucide-react";
import QuickAddCategoryDialog from "../Settings/QuickAddCategoryDialog";

type BlockedSlot = {
  time: string;
  reason: "BOOKED" | "LEAVE";
};

export default function EditAppointmentForm({
  doctors,
  appointment,
}: {
  doctors: Doctor[];
  appointment: any;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinic = useAuthStore((state: any) => state.clinic);
  const user = useAuthStore((state: any) => state.user);
  const { slug } = useParams() as { slug: string } || { slug: clinic?.slug };
  
  const initialDoctorId = appointment.doctor?._id || appointment.doctor || "";
  const initialTreatmentCategory = appointment.treatmentCategory || "";
  const originalSlot = appointment.startTime;

  const categories: string[] = clinic?.departments || [];
  
  // Ensure the appointment's current category is always in the list even if it was deleted from clinic settings
  const allCategories = Array.from(new Set([...categories, initialTreatmentCategory].filter(Boolean)));

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>(allCategories);

  useEffect(() => {
    if (allCategories && allCategories.length > 0) {
      setLocalCategories(allCategories);
    }
  }, [clinic?.departments]);

  const [form, setForm] = useState({
    enquiryId: appointment.enquiryId?._id ?? undefined,
    firstName: appointment.firstName || "",
    lastName: appointment.lastName || "",
    patientPhone: appointment.patientPhone || "",
    patientEmail: appointment.patientEmail || "",
    dateOfBirth: (appointment as any).patientId?.dateOfBirth ? new Date((appointment as any).patientId.dateOfBirth).toISOString().split('T')[0] : "",
    doctor: initialDoctorId,
    treatmentCategory: initialTreatmentCategory,
    date: appointment.date || "",
    startTime: appointment.startTime || "",
    status: appointment.status || "SCHEDULED",
    notes: appointment.notes || "",
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------------- LOGIC (UNCHANGED) ---------------- */

  const onChange = (key: string, value: string) => {
    setErrors((p) => ({ ...p, [key]: "" }));

    setForm((prev) => {
      let next = { ...prev, [key]: value };

      if (key === "treatmentCategory" && value !== prev.treatmentCategory) {
        next.doctor = value === initialTreatmentCategory ? initialDoctorId : "";
        next.startTime = "";
        setBlockedSlots([]);
      }

      return next;
    });
  };

  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
  }, []);

  const isPastSlot = (slot: string) => {
    if (!form.date || !now) return false;
    const d = new Date(form.date).toISOString().split("T")[0];
    return new Date(`${d}T${slot}:00`) < now;
  };

  const getSlotReason = (time: string) =>
    blockedSlots.find((s) => s.time === time)?.reason;

  const fetchSlots = async () => {
    if (!form.doctor || !form.date || !user?.organizationId) return;

    try {
      setLoadingSlots(true);

      const formattedDate = new Date(form.date).toISOString().split("T")[0];

      const res = await axios.get(
        `/api/appointment?doctor=${form.doctor}&date=${formattedDate}&organizationId=${(user as any)?.organizationId}`
      );

      if (res.data.success) {
        const slots: BlockedSlot[] = res.data.data;

        const filtered =
          form.doctor === initialDoctorId
            ? slots.filter((s) => s.time !== originalSlot)
            : slots;

        setBlockedSlots(filtered);
      }
    } catch {
      toast.error("Failed to load time slots");
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!form.doctor || !form.date || !user?.organizationId) return;
    fetchSlots();
  }, [form.doctor, form.date, user?.organizationId]);

  useEffect(() => {
    if (form.doctor !== initialDoctorId) {
      setForm((prev) => ({ ...prev, startTime: "" }));
    }
    setBlockedSlots([]);
  }, [form.doctor]);

  useEffect(() => {
    if (!form.treatmentCategory) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("specialization", form.treatmentCategory);
    router.replace(`?${params.toString()}`);
  }, [form.treatmentCategory]);

  const handleUpdate = async () => {
    setErrors({});

    const payload = {
      ...form,
      date: formatDate(form.date),
    };

    const validation = appointmentSchema.safeParse(payload);
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
      const res = await axios.put(`/api/appointment?id=${appointment._id}`, {
        ...payload,
        enquiryId: form?.enquiryId || undefined,
      });

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Appointment updated");
      router.push(`/${slug}/appointments`);
    } catch {
      toast.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-2 space-y-6 relative">
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
            { label: "Dashboard", href: `/${slug}/dashboard` },
            { label: "Appointments", href: `/${slug}/appointments` },
            { label: "Edit Appointment", current: true },
          ]}
        />
      </div>
      
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="relative flex items-center gap-4 p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100/50 ">
          <div className="bg-blue-600 p-4 rounded-xl shadow-lg shadow-blue-500/30">
            <CalendarIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
              Edit Appointment
            </h1>
            <p className="text-slate-600 font-medium text-sm mt-1">
              Update appointment details and reschedule if needed
            </p>
          </div>
        </div>
      </div>

      <QuickAddCategoryDialog
        open={quickAddOpen}
        setOpen={setQuickAddOpen}
        onAdded={(newCategory) => {
          setLocalCategories((prev) => [...prev, newCategory]);
          onChange("treatmentCategory", newCategory);
        }}
      />

      {/* Form Card */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6 space-y-6">
      
        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="First Name"
            value={form.firstName}
            onChange={(e) => onChange("firstName", e.target.value)}
          />

          <Input
            placeholder="Last Name"
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />

          <PhoneInput
            placeholder="Phone Number"
            value={form.patientPhone}
            onChange={(val: string) => onChange("patientPhone", val || "")}
          />

          <Input
            placeholder="Email"
            value={form.patientEmail}
            onChange={(e) => onChange("patientEmail", e.target.value)}
          />

          <Input
            type="date"
            placeholder="Date of Birth"
            value={form.dateOfBirth}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
          />
        </div>

        {/* Category & Doctor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Select
              value={form.treatmentCategory || ""}
              onValueChange={(val) => onChange("treatmentCategory", val)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Treatment Category" />
              </SelectTrigger>
              <SelectContent>
                {localCategories.map((c: string) => (
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

          <div>
            <Select
              value={form.doctor || ""}
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
        </div>

        {/* Date */}
        <Input
          type="date"
          value={formatDate(form.date)}
          onChange={(e) => onChange("date", e.target.value)}
        />

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
                const isSelected = form.startTime === time;
                const isOriginalSlot = time === originalSlot;
                
                // Allow the originally booked slot to remain selected and active even if it's in the past
                const disabled = (isPast && !isOriginalSlot) || !!reason;

                let cls =
                  "h-11 rounded-xl text-sm border transition flex items-center justify-center";

                if (isSelected)
                  cls += " bg-blue-600 text-white border-blue-700";
                else if (isPast && !isOriginalSlot)
                  cls +=
                    " bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed";
                else if (reason === "LEAVE")
                  cls +=
                    " bg-orange-100 text-orange-600 border-orange-200 cursor-not-allowed";
                else if (reason === "BOOKED")
                  cls +=
                    " bg-red-100 text-red-500 border-red-200 cursor-not-allowed";
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

        {/* Status */}
        <Select
          value={form.status}
          onValueChange={(v) => onChange("status", v)}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {["SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"].map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Notes */}
        <Textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => onChange("notes", e.target.value)}
        />

        {/* Submit */}
        <Button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-linear-to-r from-green-700 to-green-800 hover:from-green-800 hover:to-green-900"
        >
          {loading ? "Updating..." : "Update Appointment"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { patientSchema } from "@/app/validations/patientSchemas";
import { useAuthStore } from "@/providers/AuthStoreProvider";

const genders = ["MALE", "FEMALE", "OTHER"];

export default function AddPatientForm() {
  const router = useRouter();
  const clinic = useAuthStore((state: any) => state.clinic);
  const { slug } = (useParams() as { slug: string }) || { slug: clinic?.slug };

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = async () => {
    setErrors({});

    const payload = {
      ...form,
      organizationId: clinic?._id || "",
    };

    const validation = patientSchema.safeParse(payload);

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
      const res = await axios.post("/api/patients", payload);

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Patient added");
      router.push(`/${slug}/patients`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-2 space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2.5 rounded-lg hover:bg-[#0D1117] hover:text-white transition-all duration-150 font-medium text-slate-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Breadcrumb
          items={[
            { label: "Dashboard", href: `/${slug}/dashboard` },
            { label: "Patients", href: `/${slug}/patients` },
            { label: "Add Patient", current: true },
          ]}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="First Name"
              value={form.firstName}
              onChange={(e) => onChange("firstName", e.target.value)}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>

          <Input
            placeholder="Last Name (optional)"
            value={form.lastName}
            onChange={(e) => onChange("lastName", e.target.value)}
          />

          <div>
            <Input
              placeholder="Email (optional)"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <PhoneInput
              placeholder="Phone"
              value={form.phone}
              onChange={(val: string) => onChange("phone", val || "")}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Input
              type="date"
              placeholder="Date of Birth"
              value={form.dateOfBirth}
              onChange={(e) => onChange("dateOfBirth", e.target.value)}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <Select
              value={form.gender}
              onValueChange={(val) => onChange("gender", val)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Gender (optional)" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-[#0D1117] hover:bg-[#141A21] text-white"
        >
          {loading ? "Saving..." : "Add Patient"}
        </Button>
      </div>
    </div>
  );
}

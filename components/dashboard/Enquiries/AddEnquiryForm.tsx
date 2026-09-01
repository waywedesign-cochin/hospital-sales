"use client";

import React, { useState, useEffect } from "react";
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
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { enquirySchema } from "@/app/validations/enquirySchemas";
import { Plus } from "lucide-react";
import QuickAddCategoryDialog from "../Settings/QuickAddCategoryDialog";
import { useAuthStore } from "@/providers/AuthStoreProvider";

/* ---------------- CONSTANTS ---------------- */

const sources = ["PHONE", "WHATSAPP", "OTHER"];

/* ---------------- PAGE ---------------- */

export default function AddEnquiryForm({ initialCategories = [] }: { initialCategories?: string[] }) {
  const router = useRouter();
  const clinic = useAuthStore((state: any) => state.clinic);

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState<string[]>(initialCategories);

  useEffect(() => {
    if (initialCategories.length > 0) {
      setLocalCategories(initialCategories);
    }
  }, [initialCategories]);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    treatmentCategory: "",
    message: "",
    source: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ---------------- HANDLE CHANGE ---------------- */

  const onChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    setErrors({});

    const payload = {
      ...form,
      organizationId: clinic?._id || "",
    };

    const validation = enquirySchema.safeParse(payload);

    if (!validation.success) {
      const e: Record<string, string> = {};

      validation.error.issues.forEach((i) => {
        e[i.path[0] as string] = i.message;
      });
      console.log(e);

      setErrors(e);
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/enquiry", payload);

      if (!res.data.success) {
        toast.error(res.data.message);
        return;
      }

      toast.success("Enquiry created");
      router.push("/enquiries");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen p-2 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 px-2 hover:bg-green-600 hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/dashboard" },
            { label: "Enquiries", href: "/enquiries" },
            { label: "Add Enquiry", current: true },
          ]}
        />
      </div>

      {/* Form */}
      {localCategories.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <h2 className="text-xl font-bold mb-2">Configuration Required</h2>
          <p className="mb-6 max-w-md">You must create at least one Treatment Category before you can add an Enquiry.</p>
          <Button onClick={() => router.push("/settings/treatment-category")} className="bg-amber-600 hover:bg-amber-700 text-white">
            Set up Treatment Categories
          </Button>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border p-6 space-y-6">
        {/* Inputs */}
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
              placeholder="Email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <Select
              value={form.treatmentCategory}
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
                <div className="p-2 border-t mt-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setQuickAddOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Category
                  </Button>
                </div>
              </SelectContent>
            </Select>

            {errors.treatmentCategory && (
              <p className="text-red-500 text-xs mt-1">
                {errors.treatmentCategory}
              </p>
            )}
          </div>

          {/* Source */}
          <div>
            <Select
              value={form.source}
              onValueChange={(val) => onChange("source", val)}
            >
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sources.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.source && (
              <p className="text-red-500 text-xs mt-1">{errors.source}</p>
            )}
          </div>
        </div>

        {/* Message */}
        <div>
          <Textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => onChange("message", e.target.value)}
          />
          {errors.message && (
            <p className="text-red-500 text-xs mt-1">{errors.message}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-11 rounded-xl bg-green-700 hover:bg-green-800"
        >
          {loading ? "Saving..." : "Create Enquiry"}
        </Button>
      </div>
      )}

      <QuickAddCategoryDialog
        open={quickAddOpen}
        setOpen={setQuickAddOpen}
        onAdded={(newCategory) => {
          setLocalCategories((prev) => [...prev, newCategory]);
          onChange("treatmentCategory", newCategory);
        }}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { EyeOff, Loader2 } from "lucide-react";
import Select, { MultiValue } from "react-select";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import { ArrowLeft, StethoscopeIcon } from "lucide-react";
import {
  DoctorUpdateFormData,
  doctorUpdateSchema,
} from "@/app/validations/doctorSchema";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";

/* ---------------- Error Message ---------------- */
interface ErrorMessageProps {
  fieldName: keyof DoctorUpdateFormData;
  errors: FieldErrors<DoctorUpdateFormData>;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ fieldName, errors }) => {
  const error = errors[fieldName];
  return error ? (
    <p className="mt-1 text-sm text-red-600">{error.message}</p>
  ) : null;
};

interface EditFormProps {
  initialData: Partial<DoctorUpdateFormData & { _id: string }>;
  initialCategories?: string[];
}

const EditDoctorForm: React.FC<EditFormProps> = ({ initialData, initialCategories = [] }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => setIsMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    control,
  } = useForm<DoctorUpdateFormData>({
    resolver: zodResolver(doctorUpdateSchema),
    defaultValues: {
      prefix: initialData.prefix || "Dr.",
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      email: initialData.email || "",
      contactNumber: initialData.contactNumber || "",
      address: initialData.address || "",
      qualification: initialData.qualification || "",
      education: initialData.education || "",
      specialization: initialData.specialization || [],
      experience: initialData.experience || "",
      registrationNumber: initialData.registrationNumber || "",
      status: initialData.status || "ACTIVE",
    },
  });

  const getErrorClass = (field: keyof DoctorUpdateFormData) =>
    errors[field]
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:ring-blue-500";

  const specializationOptions = initialCategories.map(dept => ({
    value: dept,
    label: dept
  }));

  type Option = { value: string; label: string };

  const onSubmit = async (data: DoctorUpdateFormData) => {
    try {
      setIsSaving(true);
      const res = await axios.put(`/api/doctor?id=${initialData._id}`, data);

      if (!res.data.success) {
        toast.error(res.data.message || "Update failed");
        return;
      }

      toast.success("Doctor updated successfully");
      router.push("/doctors");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-2 space-y-4 relative">
      {/* Background blobs */}

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
            { label: "Doctors", href: "/doctors" },
            { label: "Edit Doctor", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="flex items-center gap-4 p-6 rounded-2xl border border-blue-100/50">
          <div className="bg-blue-primary p-4 rounded-xl shadow-lg">
            <StethoscopeIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-blue-primary bg-clip-text text-transparent">
              Edit Doctor
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Update doctor information
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-5 grid grid-cols-12 gap-4"
      >
        {/* Prefix */}
        <div className="col-span-12 md:col-span-2">
          <label className="text-sm font-medium">Prefix</label>
          <select
            {...register("prefix")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("prefix")}`}
          >
            <option value="Dr.">Dr.</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
            <option value="Prof.">Prof.</option>
          </select>
          <ErrorMessage fieldName="prefix" errors={errors} />
        </div>

        {/* First Name */}
        <div className="col-span-12 md:col-span-5">
          <label className="text-sm font-medium">First Name</label>
          <input
            {...register("firstName")}
            disabled={isSubmitting}
            placeholder="e.g. John"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("firstName")}`}
          />
          <ErrorMessage fieldName="firstName" errors={errors} />
        </div>

        {/* Last Name */}
        <div className="col-span-12 md:col-span-5">
          <label className="text-sm font-medium">Last Name</label>
          <input
            {...register("lastName")}
            disabled={isSubmitting}
            placeholder="e.g. Doe"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("lastName")}`}
          />
          <ErrorMessage fieldName="lastName" errors={errors} />
        </div>

        {/* Email */}
        <div className="col-span-12 md:col-span-6">
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            disabled={isSubmitting}
            placeholder="e.g. doctor@hospital.com"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("email")}`}
          />
          <ErrorMessage fieldName="email" errors={errors} />
        </div>

        {/* Contact */}
        <div className="col-span-12 md:col-span-6">
          <label className="text-sm font-medium">Contact Number</label>
          <Controller
            name="contactNumber"
            control={control}
            render={({ field }) => (
              <PhoneInput
                {...field}
                disabled={isSubmitting}
                placeholder="e.g. +1 234 567 8900"
                className={`mt-1 w-full bg-gray-50 border rounded-lg ${getErrorClass("contactNumber")}`}
              />
            )}
          />
          <ErrorMessage fieldName="contactNumber" errors={errors} />
        </div>

        {/* Address */}
        <div className="col-span-12">
          <label className="text-sm font-medium">Address</label>
          <textarea
            rows={3}
            {...register("address")}
            disabled={isSubmitting}
            placeholder="e.g. 123 Main St, City, Country"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("address")}`}
          />
          <ErrorMessage fieldName="address" errors={errors} />
        </div>

        {/* Qualification */}
        <div className="col-span-12 md:col-span-6">
          <label className="text-sm font-medium">Qualification</label>
          <textarea
            rows={3}
            {...register("qualification")}
            disabled={isSubmitting}
            placeholder="e.g. MBBS, MD (Dermatology)"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("qualification")}`}
          />
          <ErrorMessage fieldName="qualification" errors={errors} />
        </div>

        {/* Education */}
        <div className="col-span-12 md:col-span-6">
          <label className="text-sm font-medium">Education</label>
          <textarea
            rows={3}
            {...register("education")}
            disabled={isSubmitting}
            placeholder="e.g. Harvard Medical School"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("education")}`}
          />
          <ErrorMessage fieldName="education" errors={errors} />
        </div>

        {/* Specialization */}
        <div className="col-span-12">
          <label className="text-sm font-medium mb-1 block">
            Specialization
          </label>
          {isMounted ? (
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={specializationOptions}
                  value={specializationOptions.filter((opt) =>
                    field.value.includes(opt.value)
                  )}
                  onChange={(opts: MultiValue<Option>) =>
                    field.onChange(opts.map((o) => o.value))
                  }
                />
              )}
            />
          ) : (
            <div className="mt-1 h-10 bg-gray-100 rounded-lg animate-pulse" />
          )}
          <ErrorMessage fieldName="specialization" errors={errors} />
        </div>

        {/* Experience */}
        <div className="col-span-12 md:col-span-4">
          <label className="text-sm font-medium">Experience (Years)</label>
          <select
            {...register("experience")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("experience")}`}
          >
            <option value="">Select Experience</option>
            {[...Array(50)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} Years
              </option>
            ))}
          </select>
          <ErrorMessage fieldName="experience" errors={errors} />
        </div>

        {/* Status */}
        <div className="col-span-12 md:col-span-8">
          <label className="text-sm font-medium">Status</label>
          <select
            {...register("status")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("status")}`}
          >
            <option value="">Select Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            {/* <option value="ON_LEAVE">On Leave</option> */}
          </select>
          <ErrorMessage fieldName="status" errors={errors} />
        </div>

        {/* Registration Number */}
        <div className="col-span-12 md:col-span-6">
          <label className="text-sm font-medium">
            Medical Registration No.
          </label>
          <input
            {...register("registrationNumber")}
            disabled={isSubmitting}
            placeholder="e.g. MED123456789"
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass("registrationNumber")}`}
          />
          <ErrorMessage fieldName="registrationNumber" errors={errors} />
        </div>

        {/* Submit */}
        <div className="col-span-12 md:col-span-6 flex items-end">
          <button
            type="submit"
            disabled={isSaving || !isDirty}
            className={`w-full flex justify-center items-center py-3.5 rounded-xl text-sm font-semibold text-white ${
              isSaving || !isDirty
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Updating...
              </>
            ) : (
              "Update Doctor"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDoctorForm;

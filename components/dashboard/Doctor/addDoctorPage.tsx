"use client";

import React, { useEffect, useState } from "react";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorFormData, doctorSchema } from "@/app/validations/doctorSchema";
import Select, { MultiValue } from "react-select";
import axios from "axios";
import { ArrowLeft, Loader2, StethoscopeIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/* ---------------- Error Message ---------------- */
interface ErrorMessageProps {
  fieldName: keyof DoctorFormData;
  errors: FieldErrors<DoctorFormData>;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ fieldName, errors }) => {
  const error = errors[fieldName];
  return error ? (
    <p className="mt-1 text-sm text-red-600">{error.message}</p>
  ) : null;
};

/* ---------------- Page ---------------- */
export default function AddDoctorPage() {
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ---------------- Form ---------------- */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    control,
  } = useForm<DoctorFormData>({
    // resolver: zodResolver(doctorSchema),
    defaultValues: {
      prefix: "Dr.",
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      address: "",
      password: "",
      confirmPassword: "",
      qualification: "",
      education: "",
      specialization: [],
      experience: "",
      registrationNumber: "",
    },
  });

  const onSubmit = async (data: DoctorFormData) => {
    try {
      setIsSaving(true);
      setMessage("");

      const res = await axios.post("/api/doctor", data, {
        withCredentials: true,
      });

      if (!res.data.success) {
        setMessage(res.data.message || "Something went wrong");
        return;
      }

      toast.success("Doctor added successfully");
      router.push("/doctors");
      router.refresh();
    } catch (error: any) {
      setMessage(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  const getErrorClass = (fieldName: keyof DoctorFormData) =>
    errors[fieldName]
      ? "border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500";

  const specializationOptions = [
    { value: "skin", label: "Skin" },
    { value: "hair", label: "Hair" },
    { value: "body", label: "Body" },
  ];

  type Option = (typeof specializationOptions)[0];

  return (
    <div className="min-h-screen p-2 space-y-6 relative">
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
            { label: "Add Doctor", current: true },
          ]}
        />
      </div>
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-[#ABEDCC]">
        <div className="flex items-center gap-4 p-6 rounded-2xl border border-blue-100/50 ">
          <div className="bg-greenpick p-4 rounded-xl shadow-lg">
            <StethoscopeIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold bg-greenpick bg-clip-text text-transparent">
              Add Doctor
            </h1>
            <p className="text-slate-600 text-sm mt-1">Register a new doctor</p>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
          {message}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Prefix */}
        <div>
          <label className="text-sm font-medium">Prefix</label>
          <input
            {...register("prefix")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "prefix",
            )}`}
          />
          <ErrorMessage fieldName="prefix" errors={errors} />
        </div>

        {/* First Name */}
        <div>
          <label className="text-sm font-medium">First Name</label>
          <input
            {...register("firstName")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "firstName",
            )}`}
          />
          <ErrorMessage fieldName="firstName" errors={errors} />
        </div>

        {/* Last Name */}
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <input
            {...register("lastName")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "lastName",
            )}`}
          />
          <ErrorMessage fieldName="lastName" errors={errors} />
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            {...register("email")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "email",
            )}`}
          />
          <ErrorMessage fieldName="email" errors={errors} />
        </div>

        {/* Contact */}
        <div>
          <label className="text-sm font-medium">Contact Number</label>
          <input
            {...register("contactNumber")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "contactNumber",
            )}`}
          />
          <ErrorMessage fieldName="contactNumber" errors={errors} />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">Address</label>
          <textarea
            rows={3}
            {...register("address")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "address",
            )}`}
          />
          <ErrorMessage fieldName="address" errors={errors} />
        </div>

        {/* Qualification */}
        <div>
          <label className="text-sm font-medium">Qualification</label>
          <textarea
            rows={3}
            {...register("qualification")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "qualification",
            )}`}
          />
          <ErrorMessage fieldName="qualification" errors={errors} />
        </div>

        {/* Education */}
        <div>
          <label className="text-sm font-medium">Education</label>
          <textarea
            rows={3}
            {...register("education")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "education",
            )}`}
          />
          <ErrorMessage fieldName="education" errors={errors} />
        </div>

        {/* Specialization */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium mb-1 block">
            Specialization
          </label>
          {isMounted && (
            <Controller
              name="specialization"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  isMulti
                  options={specializationOptions}
                  value={specializationOptions.filter((o) =>
                    (field.value as string[]).includes(o.value),
                  )}
                  onChange={(val: MultiValue<Option>) =>
                    field.onChange(val.map((v) => v.value))
                  }
                  placeholder="Select Specialization"
                  classNamePrefix="react-select"
                />
              )}
            />
          )}
          <ErrorMessage fieldName="specialization" errors={errors} />
        </div>

        {/* Experience */}
        <div>
          <label className="text-sm font-medium">Experience (Years)</label>
          <select
            {...register("experience")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "experience",
            )}`}
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

        {/* Registration Number */}
        <div className="md:col-span-2">
          <label className="text-sm font-medium">
            Medical Registration No.
          </label>
          <input
            {...register("registrationNumber")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "registrationNumber",
            )}`}
          />
          <ErrorMessage fieldName="registrationNumber" errors={errors} />
        </div>

        {/* Password */}
        {/* <div>
          <label className="text-sm font-medium">Temporary Password</label>
          <input
            type="password"
            {...register("password")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "password",
            )}`}
          />
          <ErrorMessage fieldName="password" errors={errors} />
        </div> */}

        {/* Confirm Password */}
        {/* <div>
          <label className="text-sm font-medium">Confirm Password</label>
          <input
            type="password"
            {...register("confirmPassword")}
            disabled={isSubmitting}
            className={`mt-1 w-full px-4 py-2 bg-gray-50 border rounded-lg ${getErrorClass(
              "confirmPassword",
            )}`}
          />
          <ErrorMessage fieldName="confirmPassword" errors={errors} />
        </div> */}

        {/* Submit */}
        <div className="md:col-span-2">
          <button
            type="submit"
            // disabled={isSaving || !isDirty}
            disabled={isSaving}
            className={`w-full flex justify-center items-center py-3.5 rounded-xl text-sm font-semibold text-white ${
              // isSaving || !isDirty
              isSaving
                ? "bg-gray-300"
                : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating...
              </>
            ) : (
              "Create Doctor"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

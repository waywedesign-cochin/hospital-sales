"use client";

import {
  EditUserFormData,
  editUserSchema,
  userRoles,
} from "@/app/validations/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, User, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

// SHADCN UI
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/shared/Breadcrumb";

export const EditUserForm = ({
  user,
  id,
}: {
  user: EditUserFormData;
  id: string;
}) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: user,
  });

  // correct reset
  useEffect(() => {
    reset(user);
  }, [user, reset]);

  // watch role (for shadcn Select)
  const roleValue = watch("role");

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setIsSaving(true);
      setMessage("");

      const res = await axios.put(`/api/user?id=${id}`, data);

      if (!res.data.success) {
        setMessage(res.data.message || "Update failed ❌");
        return;
      }

      setMessage("User updated successfully ✔️");

      reset(data); // reset dirty state
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
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
            { label: "Dashboard", href: "/dashboard" },
            { label: "Users", href: "/users" },
            { label: "Edit User", current: true },
          ]}
        />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl  backdrop-blur-xl border border-white/50 shadow-2xl shadow-blue-500/10 bg-blue-50">
        <div className="flex flex-col md:flex-row justify-between items-center   gap-4  backdrop-blur-sm p-6 rounded-2xl shadow-lg shadow-blue-100/50 border border-green-100/50">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-blue-primary p-4 rounded-xl shadow-lg shadow-blue-500/30">
              <User className="w-8 h-8 max-md:size-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-blue-primary tracking-tight">
                Edit User - {user.firstName} {user.lastName}
              </h1>
              <p className="text-slate-500 font-medium text-sm mt-1">
                Modify user details and roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <p className="text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 mt-4 border-2 shadow-lg p-4 rounded-2xl"
      >
        {/* First Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            First Name *
          </label>
          <Input
            {...register("firstName")}
            disabled={isSaving}
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500 mt-2 font-medium">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Last Name
          </label>
          <Input
            {...register("lastName")}
            disabled={isSaving}
            className={errors.lastName ? "border-red-500" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500 mt-2 font-medium">
              {errors.lastName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email *
          </label>
          <Input
            type="email"
            {...register("email")}
            disabled={isSaving}
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-2 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Role *
          </label>

          <Select
            value={roleValue}
            onValueChange={(value) =>
              setValue("role", value as "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "GUEST", {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger
              className={`${errors.role ? "border-red-500" : ""} w-full`}
            >
              <SelectValue placeholder="Select role" />
            </SelectTrigger>

            <SelectContent>
              {userRoles.options
                .filter((role) => role !== "DOCTOR")
                .map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {errors.role && (
            <p className="text-sm text-red-500 mt-2 font-medium">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSaving || !isDirty}
          className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-lg ${
            isSaving || !isDirty
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5"
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        {!isDirty && !isSaving && (
          <p className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 border border-gray-200">
            No changes detected.
          </p>
        )}
      </form>
    </div>
  );
};

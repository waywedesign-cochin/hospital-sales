"use client";

import {
  EditUserFormData,
  editUserSchema,
  userRoles,
} from "@/app/validations/userSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Lock, Mail, User, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useRouter } from "next/navigation";

// SHADCN UI
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/shared/Breadcrumb";
import { getDoctorsForAssignmentAction } from "@/app/actions/userActions";

export const EditUserForm = ({
  user,
  id,
}: {
  user: EditUserFormData & { assignedDoctors?: string[] };
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

  // Doctor assignment (kept outside react-hook-form since it isn't part of editUserSchema yet)
  const [linkStaffToDoctor, setLinkStaffToDoctor] = useState(
    (user.assignedDoctors?.length ?? 0) > 0,
  );
  const [assignedDoctors, setAssignedDoctors] = useState<string[]>(
    user.assignedDoctors ?? [],
  );
  const [doctorOptions, setDoctorOptions] = useState<
    { _id: string; name: string; specialization: string[]; hasLogin: boolean }[]
  >([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [assignmentDirty, setAssignmentDirty] = useState(false);

  // Load doctors once for the assignment picker
  useEffect(() => {
    const loadDoctors = async () => {
      setDoctorsLoading(true);
      try {
        const doctors = await getDoctorsForAssignmentAction();
        setDoctorOptions(doctors);
      } catch {
        // Non-fatal — the picker just shows "no doctors found" if this fails
      } finally {
        setDoctorsLoading(false);
      }
    };
    loadDoctors();
  }, []);

  // If role changes away from STAFF, the assignment stops applying — reflect that
  useEffect(() => {
    if (roleValue !== "STAFF" && linkStaffToDoctor) {
      setLinkStaffToDoctor(false);
      setAssignedDoctors([]);
      setAssignmentDirty(true);
    }
  }, [roleValue]);

  const toggleAssignedDoctor = (doctorId: string) => {
    setAssignedDoctors((prev) =>
      prev.includes(doctorId)
        ? prev.filter((d) => d !== doctorId)
        : [...prev, doctorId],
    );
    setAssignmentDirty(true);
  };

  const onSubmit = async (data: EditUserFormData) => {
    try {
      setIsSaving(true);
      setMessage("");

      const payload = {
        ...data,
        assignedDoctors: linkStaffToDoctor ? assignedDoctors : [],
      };

      const res = await axios.put(`/api/user?id=${id}`, payload);

      if (!res.data.success) {
        setMessage(res.data.message || "Update failed ❌");
        return;
      }

      setMessage("User updated successfully ✔️");

      reset(data); // reset dirty state
      setAssignmentDirty(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setMessage(err.response?.data?.message || "Something went wrong ❌");
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = isDirty || assignmentDirty;

  return (
    <div>
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
            { label: "Users", href: "/users" },
            { label: "Edit User", current: true },
          ]}
        />
      </div>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row text-center sm:text-left items-center gap-4">
            <div className="bg-[#0D1117] p-4 rounded-xl">
              <User className="w-8 h-8 max-md:size-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-2xl font-bold text-slate-900 tracking-tight">
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
        <p className="text-sm font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-6 mt-4">
          {message}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 mt-4 border border-slate-200 shadow-sm p-6 rounded-2xl bg-white"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600">
              First Name *
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                {...register("firstName")}
                disabled={isSaving}
                className={`pl-9 h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                  errors.firstName ? "border-red-500" : ""
                }`}
              />
            </div>
            {errors.firstName && (
              <p className="text-sm text-red-500 font-medium">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-gray-600">
              Last Name
            </Label>
            <Input
              {...register("lastName")}
              disabled={isSaving}
              className={`h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                errors.lastName ? "border-red-500" : ""
              }`}
            />
            {errors.lastName && (
              <p className="text-sm text-red-500 font-medium">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600">Email *</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="email"
              {...register("email")}
              disabled={isSaving}
              className={`pl-9 h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Role Select */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-gray-600">Role *</Label>

          <Select
            value={roleValue}
            onValueChange={(value) =>
              setValue(
                "role",
                value as "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "GUEST",
                { shouldDirty: true },
              )
            }
          >
            <SelectTrigger
              className={`h-10 rounded-xl border-gray-200 focus:border-emerald-400 focus:ring-emerald-400/20 w-full ${
                errors.role ? "border-red-500" : ""
              }`}
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
            <p className="text-sm text-red-500 font-medium">
              {errors.role.message}
            </p>
          )}
        </div>

        {/* Optionally link this staff member to specific doctors */}
        {roleValue === "STAFF" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-gray-600">
                  Link to a Specific Doctor
                </Label>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Off by default — this staff member manages the whole clinic.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={linkStaffToDoctor}
                onClick={() => {
                  const next = !linkStaffToDoctor;
                  setLinkStaffToDoctor(next);
                  if (!next) setAssignedDoctors([]);
                  setAssignmentDirty(true);
                }}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                  linkStaffToDoctor ? "bg-emerald-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    linkStaffToDoctor ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {linkStaffToDoctor && (
              <div className="border border-gray-200 rounded-xl max-h-40 overflow-y-auto divide-y divide-gray-100">
                {doctorsLoading ? (
                  <p className="text-xs text-gray-400 px-3 py-3">
                    Loading doctors...
                  </p>
                ) : doctorOptions.length === 0 ? (
                  <p className="text-xs text-gray-400 px-3 py-3">
                    No doctors found yet.
                  </p>
                ) : (
                  doctorOptions.map((doc) => (
                    <label
                      key={doc._id}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 hover:bg-emerald-50/50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={assignedDoctors.includes(doc._id)}
                        onChange={() => toggleAssignedDoctor(doc._id)}
                        className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-400/30"
                      />
                      <span className="flex-1">{doc.name}</span>
                      {doc.specialization.length > 0 && (
                        <span className="text-[11px] text-gray-400">
                          {doc.specialization[0]}
                        </span>
                      )}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSaving || !canSubmit}
          className={`w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 shadow-sm ${
            isSaving || !canSubmit
              ? "bg-gray-300 cursor-not-allowed shadow-none"
              : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-md"
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

        {!canSubmit && !isSaving && (
          <p className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg py-2 border border-gray-200">
            No changes detected.
          </p>
        )}
      </form>
    </div>
  );
};

"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Edit,
  Settings,
  Shield,
  Briefcase,
  Save,
  CalendarDays,
  EyeOff,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import toast from "react-hot-toast";
import axios from "axios"; // Assuming you use axios for API calls
import { userProfileUpdateSchema } from "@/app/validations/userSchema";
import { changePasswordSchema } from "@/app/validations/authSchemas";
import { useRouter } from "next/navigation";
import Breadcrumb from "@/components/shared/Breadcrumb";

export interface IUser {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  password?: string;
  role: "PLATFORM_ADMIN" | "ADMIN" | "STAFF" | "DOCTOR" | "GUEST";
  createdAt?: Date;
  updatedAt?: Date;
}

const NAV_SECTIONS = [
  { id: "personal", label: "Personal info", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "settings", label: "Metadata", icon: Settings },
] as const;

type SectionId = (typeof NAV_SECTIONS)[number]["id"];

// "PLATFORM_ADMIN" -> "Platform Admin"
const formatRole = (role: string) =>
  role
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const UserAvatar = ({ firstName }: { firstName: string }) => {
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "?";
  return (
    <div className="relative shrink-0">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0D1117] text-3xl font-semibold text-emerald-400 ring-4 ring-white shadow-lg shadow-black/10">
        {initials}
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-2 ring-white">
        <Briefcase className="h-3.5 w-3.5 text-[#0D1117]" />
      </div>
    </div>
  );
};

const FieldDisplay = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[13px] text-gray-500">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

const ProfilePage = () => {
  const router = useRouter();
  const loggedInUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.signout);

  // State to hold profile data for editing
  const [profile, setProfile] = useState<IUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );
  const [activeSection, setActiveSection] = useState<SectionId>("personal");

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  // Password change form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Effect to initialize profile state when loggedInUser is available
  useEffect(() => {
    if (loggedInUser) {
      setProfile(loggedInUser);
    }
  }, [loggedInUser]);

  // Handle loading state if user is null (not authenticated or still loading)
  if (!loggedInUser || !profile) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600"></div>
        <p className="ml-4 text-gray-700">Loading user profile...</p>
      </div>
    );
  }

  // Create a snapshot of the current logged-in user for reverting changes
  const initialProfileSnapshot: IUser = loggedInUser;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Revert changes if cancelling edit, reset to the loggedInUser snapshot
      setProfile(initialProfileSnapshot);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!profile._id) {
      toast.error("User ID not found for update.");
      return;
    }
    setErrors({});
    const updateData = {
      firstName: profile.firstName,
      lastName: profile.lastName,
    };
    const validation = userProfileUpdateSchema.safeParse(updateData);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }
    try {
      setIsLoading(true);

      const response = await axios.put(
        `/api/user?id=${profile._id}`,
        updateData,
      );
      if (response.data.success) {
        const updatedUser = response.data.data;
        setUser(updatedUser); // Update the AuthStore
        setProfile(updatedUser); // Update local state with fresh data
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        throw new Error(response.data.message || "Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(
        error.message || "An unexpected error occurred during update.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form value
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear only the error for the current field
    setPasswordErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Handle password submit
  const handlePasswordSubmit = async () => {
    setPasswordErrors({});
    const validation = changePasswordSchema.safeParse(passwordForm);

    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((err: any) => {
        formattedErrors[err.path[0] as string] = err.message;
      });
      setPasswordErrors(formattedErrors);
      return;
    }

    try {
      setPasswordLoading(true);

      const res = await axios.post(
        `/api/auth/change-password?id=${loggedInUser._id}`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        },
      );

      if (res.data.success) {
        toast.success("Password updated successfully!");

        // Reset form
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        await logout();
      } else {
        toast.error(res.data.message || "Failed to update password.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Password update failed.");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto">
        <div className="relative z-10 mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 rounded-lg px-2.5 font-medium text-slate-600 transition-all duration-150 hover:bg-[#0D1117] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="h-4 w-px bg-slate-300" />
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Profile", current: true },
            ]}
          />
        </div>

        <div className="space-y-6">
          {/* Identity header */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="h-20 bg-[#0D1117] sm:h-24" />
            <div className="px-5 pb-6 sm:px-8">
              <div className="-mt-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-end">
                  <UserAvatar firstName={profile.firstName} />
                  <div className="text-center sm:pb-4 sm:text-left">
                    <h1 className="text-2xl font-semibold tracking-tight text-emerald-400 sm:text-[28px]">
                      {profile.firstName} {profile.lastName}
                    </h1>
                    <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                      <span className="text-sm font-medium text-emerald-700">
                        {formatRole(profile.role)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-2 sm:justify-end sm:pb-1">
                  <Button
                    onClick={handleEditToggle}
                    variant={isEditing ? "outline" : "default"}
                    className={`transition-colors ${
                      isEditing
                        ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                        : "bg-[#0D1117] text-white hover:bg-[#141A21]"
                    }`}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>

                  {isEditing && (
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-200 pt-6 sm:grid-cols-2">
                <FieldDisplay
                  label="Email address"
                  value={profile.email}
                  icon={Mail}
                />
                <FieldDisplay
                  label="Account role"
                  value={formatRole(profile.role)}
                  icon={Shield}
                />
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr]">
            <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
              {NAV_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors lg:w-full ${
                    activeSection === section.id
                      ? "bg-[#0D1117] text-white"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  <section.icon className="h-4 w-4" />
                  {section.label}
                </button>
              ))}
            </nav>

            <div
              key={activeSection}
              className="animate-in fade-in duration-300 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              {/* PERSONAL: First Name, Last Name, Email (non-editable) */}
              {activeSection === "personal" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Basic details
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Update your name as it appears across the platform.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <Input
                        disabled={!isEditing}
                        name="firstName"
                        value={profile.firstName}
                        onChange={handleInputChange}
                        className="h-11 rounded-lg"
                        required
                      />
                      {errors.firstName && (
                        <p className="text-xs text-red-500">
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <Input
                        disabled={!isEditing}
                        name="lastName"
                        value={profile.lastName || ""}
                        onChange={handleInputChange}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <Input
                      disabled
                      name="email"
                      value={profile.email}
                      className="h-11 cursor-not-allowed rounded-lg bg-gray-50 opacity-70"
                    />
                  </div>

                  {isEditing && (
                    <Button
                      onClick={handleSaveChanges}
                      disabled={isLoading}
                      className="h-11 w-full bg-emerald-600 text-base hover:bg-emerald-700"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading
                        ? "Saving profile..."
                        : "Confirm & save changes"}
                    </Button>
                  )}
                </div>
              )}

              {/* SECURITY: Change Password */}
              {activeSection === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Account security
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Changing your password frequently is recommended for
                      better security.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* CURRENT PASSWORD */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Current password
                      </label>

                      <div className="relative">
                        <Input
                          type={showPassword.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          className="h-11 rounded-lg pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              current: !showPassword.current,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600"
                        >
                          {showPassword.current ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>

                      {passwordErrors.currentPassword && (
                        <p className="text-xs text-red-500">
                          {passwordErrors.currentPassword}
                        </p>
                      )}
                    </div>

                    {/* NEW PASSWORD */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        New password
                      </label>

                      <div className="relative">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordChange}
                          className="h-11 rounded-lg pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              new: !showPassword.new,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600"
                        >
                          {showPassword.new ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>

                      {passwordErrors.newPassword && (
                        <p className="text-xs text-red-500">
                          {passwordErrors.newPassword}
                        </p>
                      )}
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-gray-700">
                        Confirm new password
                      </label>

                      <div className="relative">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordChange}
                          className="h-11 rounded-lg pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword({
                              ...showPassword,
                              confirm: !showPassword.confirm,
                            })
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-emerald-600"
                        >
                          {showPassword.confirm ? (
                            <EyeOff className="h-4.5 w-4.5" />
                          ) : (
                            <Eye className="h-4.5 w-4.5" />
                          )}
                        </button>
                      </div>

                      {passwordErrors.confirmPassword && (
                        <p className="text-xs text-red-500">
                          {passwordErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    {/* SUBMIT */}
                    <Button
                      onClick={handlePasswordSubmit}
                      disabled={passwordLoading || !passwordForm.newPassword}
                      className="h-11 w-full bg-emerald-600 text-base text-white hover:bg-emerald-700"
                    >
                      {passwordLoading
                        ? "Updating password..."
                        : "Update password"}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Your password is encrypted and never stored in plain text.
                  </p>
                </div>
              )}

              {/* METADATA: Role, CreatedAt, UpdatedAt */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Account metadata
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      These fields are system-generated and cannot be edited.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <FieldDisplay
                      label="Account role"
                      value={formatRole(profile.role)}
                      icon={User}
                    />

                    {profile.createdAt && (
                      <FieldDisplay
                        label="Account created"
                        value={new Date(profile.createdAt).toLocaleDateString()}
                        icon={CalendarDays}
                      />
                    )}
                    {profile.updatedAt && (
                      <FieldDisplay
                        label="Last updated"
                        value={new Date(profile.updatedAt).toLocaleDateString()}
                        icon={CalendarDays}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

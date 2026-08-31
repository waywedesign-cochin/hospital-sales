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
  CheckCircle,
  EyeOff,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const UserAvatar = ({ firstName }: { firstName: string }) => {
  const initials = firstName ? firstName.charAt(0).toUpperCase() : "?";
  return (
    <div className="w-24 h-24 rounded-full bg-blue-primary flex items-center justify-center text-yellow-600 text-4xl font-extrabold ring-4 ring-white/50 shadow-2xl">
      {initials}
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
  <div className="space-y-1">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <div className="flex items-center space-x-2 text-sm text-green-700">
      <Icon className="w-4 h-4 text-green-900" />
      <p className="font-medium">{value}</p>
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
    {}
  );
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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
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
        updateData
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
        error.message || "An unexpected error occurred during update."
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
        }
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
    <div className="min-h-screen bg-gray-50 p-2">
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
            { label: "Profile", current: true },
          ]}
        />
      </div>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="shadow-2xl border-none rounded-2xl bg-white">
          <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Left: Avatar & Meta */}
            <div className="flex flex-col items-center md:items-start">
              <UserAvatar firstName={profile.firstName} />
              <div className=" text-center md:text-left">
                <h1 className="text-3xl font-extrabold text-gray-900">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="text-md font-semibold text-green-600 mt-1 flex items-center justify-center md:justify-start gap-1 uppercase">
                  <Briefcase className="w-4 h-4" />
                  {profile.role}
                </p>
                <span className="inline-block mt-2 px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700">
                  Status: Active
                </span>
              </div>
            </div>

            {/* Right: Actions & Quick Info */}
            <div className="flex-1 space-y-4 md:pl-10 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0">
              <div className="flex justify-center sm:justify-end gap-3 w-full">
                <Button
                  onClick={handleEditToggle}
                  variant={isEditing ? "outline" : "default"}
                  className={`transition-colors ${
                    isEditing
                      ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                      : "bg-green-800 hover:bg-green-900 text-white"
                  }`}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>

                {isEditing && (
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </div>

              {/* Quick Contact Info */}
              <div className="hidden  sm:grid grid-cols-1  gap-4 mt-6">
                <FieldDisplay
                  label="Email Address"
                  value={profile.email}
                  icon={Mail}
                />
                <FieldDisplay
                  label="Account Role"
                  value={profile.role}
                  icon={CheckCircle}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          {/* SCROLL WRAPPER — THIS IS CRITICAL */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList
              className="
      inline-flex
      min-w-max
      gap-1
      rounded-xl
      border
      bg-white
      shadow-md
      px-2
      py-1
    "
            >
              <TabsTrigger
                value="personal"
                className="
        shrink-0
        flex items-center gap-2
        text-sm
        px-4 py-2
        data-[state=active]:bg-green-800
        data-[state=active]:text-white
        data-[state=active]:shadow-lg
        data-[state=active]:rounded-xl
        transition-all
      "
              >
                <User className="w-4 h-4" />
                Personal Info
              </TabsTrigger>

              <TabsTrigger
                value="security"
                className="
        shrink-0
        flex items-center gap-2
        text-sm
        px-4 py-2
        data-[state=active]:bg-green-800
        data-[state=active]:text-white
        data-[state=active]:shadow-lg
        data-[state=active]:rounded-xl
        transition-all
      "
              >
                <Shield className="w-4 h-4" />
                Security
              </TabsTrigger>

              <TabsTrigger
                value="settings"
                className="
        shrink-0
        flex items-center gap-2
        text-sm
        px-4 py-2
        data-[state=active]:bg-green-800
        data-[state=active]:text-white
        data-[state=active]:shadow-lg
        data-[state=active]:rounded-xl
        transition-all
      "
              >
                <Settings className="w-4 h-4" />
                Metadata
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB CONTENT CONTINUES BELOW */}

          {/* PERSONAL TAB CONTENT: First Name, Last Name, Email (non-editable) */}
          <TabsContent value="personal" className="mt-6">
            <Card className="rounded-2xl shadow-xl border-none">
              <CardHeader className="border-b border-gray-100 p-6">
                <CardTitle className="text-xl font-bold text-gray-800">
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      First Name
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
                      <p className="text-red-500 text-xs mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Last Name
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

                {/* Email Field (Non-editable as per standard practice) */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input
                    disabled
                    name="email"
                    value={profile.email}
                    className="cursor-not-allowed opacity-70 h-11 rounded-lg bg-gray-100"
                  />
                </div>

                {isEditing && (
                  <Button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="w-full bg-green-800 hover:bg-green-900 h-11 text-base mt-4"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? "Saving Profile..." : "Confirm & Save Changes"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SECURITY TAB: Change Password (Hides the actual password field) */}
          <TabsContent value="security" className="mt-6">
            <Card className="p-6 shadow-xl rounded-2xl border-none">
              <CardTitle className="font-bold text-gray-800 mb-4">
                Account Security
              </CardTitle>

              <p className="text-gray-600 text-sm mb-6">
                Changing your password frequently is recommended for better
                security.
              </p>

              {/* Password Form */}
              <div className="space-y-5">
                {/* CURRENT PASSWORD */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Current Password
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword.current ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.currentPassword}
                    </p>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    New Password
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword.new ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Confirm New Password
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showPassword.confirm ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {passwordErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* SUBMIT */}
                <Button
                  onClick={handlePasswordSubmit}
                  disabled={passwordLoading || !passwordForm.newPassword}
                  className="w-full bg-green-800 hover:bg-green-900 text-white h-11 text-base"
                >
                  {passwordLoading ? "Updating Password..." : "Update Password"}
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-5">
                Note: Your password is encrypted and never stored in plain text.
              </p>
            </Card>
          </TabsContent>

          {/* METADATA TAB: Role, CreatedAt, UpdatedAt */}
          <TabsContent value="settings" className="mt-6">
            <Card className="p-6 shadow-xl rounded-2xl border-none">
              <CardTitle className="font-bold text-gray-800 mb-4">
                Account Metadata
              </CardTitle>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FieldDisplay
                  label="Account Role"
                  value={profile.role}
                  icon={User}
                />

                {profile.createdAt && (
                  <FieldDisplay
                    label="Account Created"
                    value={new Date(profile.createdAt).toLocaleDateString()}
                    icon={Mail}
                  />
                )}
                {profile.updatedAt && (
                  <FieldDisplay
                    label="Last Updated"
                    value={new Date(profile.updatedAt).toLocaleDateString()}
                    icon={Mail}
                  />
                )}
              </div>

              <p className="text-gray-500 text-sm mt-6">
                These fields are system-generated and cannot be edited.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;

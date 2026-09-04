"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Activity } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
} from "@/app/validations/authSchemas";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import axios from "axios";
import type { OrganizationOption } from "@/stores/authStore";

const AuthForm = () => {
  const router = useRouter();
  const signin = useAuthStore((state) => state.signin);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Populated when the backend reports more than one clinic for this email
  const [organizations, setOrganizations] = useState<
    OrganizationOption[] | null
  >(null);
  const [selectedOrgId, setSelectedOrgId] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // A changed email invalidates any org list we picked up for the old one
    if (e.target.name === "email") {
      setOrganizations(null);
      setSelectedOrgId("");
    }
  };

  const validateForm = () => {
    let schema;

    if (showForgotPassword) {
      schema = forgotPasswordSchema;
    } else {
      schema = signInSchema;
    }

    const result = schema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });

      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (showForgotPassword) {
        try {
          const { data } = await axios.post("/api/auth/forgot-password", {
            email: formData.email,
            organizationId: selectedOrgId || undefined,
          });

          if (data.data && "requiresOrgSelection" in data.data) {
            setOrganizations(data.data.organizations);
            toast(data.message || "Select a clinic to continue");
          } else if (data.success) {
            toast.success(data.message || "Reset link sent to your email");
            setShowForgotPassword(false);
            setOrganizations(null);
            setSelectedOrgId("");
            setFormData((prev) => ({
              ...prev,
              password: "",
            }));
          } else {
            toast.error(data.message || "Something went wrong");
          }
        } catch (err: any) {
          const responseData = err.response?.data;
          if (
            responseData?.data &&
            "requiresOrgSelection" in responseData.data
          ) {
            setOrganizations(responseData.data.organizations);
            toast(responseData.message || "Select a clinic to continue");
          } else {
            throw err;
          }
        }
      } else {
        const result = await signin(
          formData.email,
          formData.password,
          selectedOrgId || undefined,
        );

        if ("requiresOrgSelection" in result) {
          setOrganizations(result.organizations);
          toast("Select a clinic to continue");
          return;
        }

        toast.success("Login successful");
        setOrganizations(null);
        setSelectedOrgId("");
        if (result.role === "PLATFORM_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-50 font-sans">
      {/* Glow Effects, matching the homepage hero */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10 py-8">
        <div className="w-full max-w-md">
          {/* Glassmorphic Card */}
          <div className="relative backdrop-blur-2xl bg-white/5 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-white/10 p-10 transition-all duration-500 hover:shadow-indigo-500/20">
            {/* Logo */}
            <div className="justify-center flex items-center gap-2 mb-8">
              <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                HealthcareCRM
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">
                  Email Address
                </Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@hospital.com"
                  className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-50 placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all duration-200"
                />
                {errors.email && (
                  <p className="text-rose-400 text-xs mt-2 ml-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {organizations && (
                <div>
                  <Label className="block text-sm font-semibold text-slate-300 mb-2 ml-1">
                    Select Clinic
                  </Label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-50 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all duration-200"
                  >
                    <option value="" className="bg-slate-900">
                      Choose a clinic…
                    </option>
                    {organizations.map((org: OrganizationOption) => (
                      <option
                        key={org._id}
                        value={org._id}
                        className="bg-slate-900"
                      >
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {!showForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <Label className="block text-sm font-semibold text-slate-300">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setErrors({});
                        setOrganizations(null);
                        setSelectedOrgId("");
                      }}
                      className="text-xs text-indigo-300 hover:text-indigo-200 font-semibold transition-colors duration-200"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-slate-50 placeholder:text-slate-500 focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/20 shadow-sm transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-5 flex items-center text-slate-500 hover:text-indigo-300 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-400 text-xs mt-2 ml-1 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="tracking-wide">
                      {showForgotPassword
                        ? "Sending Reset Link..."
                        : "Signing In..."}
                    </span>
                  </span>
                ) : (
                  <span className="tracking-wide">
                    {organizations
                      ? "Continue"
                      : showForgotPassword
                        ? "Send Reset Link"
                        : "Sign In"}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-slate-400 font-medium">
                {showForgotPassword ? (
                  <>
                    Remember your password?{" "}
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setErrors({});
                        setOrganizations(null);
                        setSelectedOrgId("");
                      }}
                      className="text-indigo-300 font-bold hover:text-indigo-200 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    New clinic?{" "}
                    <a
                      href="/onboarding"
                      className="text-indigo-300 font-bold hover:text-indigo-200 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Get Started Free
                    </a>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="text-center mt-6">
            <p className="text-xs text-slate-500 font-medium">
              Secure Admin Access · Healthcare CRM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

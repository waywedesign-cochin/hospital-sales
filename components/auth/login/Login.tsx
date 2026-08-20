"use client";
import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from "@/app/validations/authSchemas";
import { useAuthStore } from "@/providers/AuthStoreProvider";
import Image from "next/image";
import logo from "@/public/thumbnail_Novesse.png";
import axios from "axios";

const AuthForm = () => {
  const router = useRouter();
  const signin = useAuthStore((state) => state.signin);
  const signup = useAuthStore((state) => state.signup);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const toggleForm = () => {
    setShowSignUp(!showSignUp);
    setShowForgotPassword(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    let schema;

    if (showForgotPassword) {
      schema = forgotPasswordSchema;
    } else if (showSignUp) {
      schema = signUpSchema;
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
        const { data } = await axios.post("/api/auth/forgot-password", {
          email: formData.email,
        });

        if (data.success) {
          toast.success(data.message || "Reset link sent to your email");
          setShowForgotPassword(false);
          setFormData((prev) => ({
            ...prev,
            password: "",
          }));
        }
      } else if (showSignUp) {
        await signup(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );

        toast.success("Account created successfully");
        setShowSignUp(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
      } else {
        await signin(formData.email, formData.password);
        toast.success("Login successful");
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-emerald-50 via-cyan-50 to-teal-50">
      {/* Modern Mesh Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-tr from-emerald-100/40 via-transparent to-cyan-100/40"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-teal-200/30 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-emerald-200/30 to-transparent blur-3xl"></div>

      {/* Floating Shapes */}
      <div className="absolute top-20 right-1/4 w-32 h-32 bg-linear-to-br from-emerald-300/20 to-teal-300/20 rounded-full blur-2xl animate-pulse"></div>
      <div
        className="absolute bottom-32 left-1/3 w-40 h-40 bg-linear-to-br from-cyan-300/20 to-emerald-300/20 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10 py-8">
        <div className="w-full max-w-md">
          {/* Glassmorphic Card */}
          <div className="relative backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl shadow-emerald-200/20 border border-white/60 p-10 transition-all duration-500 hover:shadow-emerald-300/30">
            {/* Modern Logo */}
            <div className="justify-center  flex">
              <Image
                src={logo}
                className="h-36 object-cover w-auto max-w-40"
                alt="Novesse by Vijaya"
              />{" "}
            </div>

            <div className="space-y-4">
              {showSignUp && (
                <>
                  <div>
                    <Label className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                      First Name
                    </Label>
                    <Input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 shadow-sm transition-all duration-200"
                    />
                    {errors.firstName && (
                      <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                      Last Name
                    </Label>
                    <Input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 shadow-sm transition-all duration-200"
                    />
                    {errors.lastName && (
                      <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div>
                <Label className="block text-sm font-bold text-stone-700 mb-2 ml-1">
                  Email Address
                </Label>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@novesse.com"
                  className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 shadow-sm transition-all duration-200"
                />
                {errors.email && (
                  <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                    {errors.email}
                  </p>
                )}
              </div>

              {!showForgotPassword && (
                <div>
                  <div className="flex items-center justify-between mb-2 ml-1">
                    <Label className="block text-sm font-bold text-stone-700">
                      Password
                    </Label>
                    {!showSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setErrors({});
                        }}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-semibold transition-colors duration-200"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••"
                      className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl text-stone-800 placeholder:text-stone-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 shadow-sm transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-5 flex items-center text-stone-400 hover:text-emerald-500 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <FiEyeOff size={20} />
                      ) : (
                        <FiEye size={20} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full mt-6 py-4 bg-linear-to-r from-emerald-500 via-green-500 to-green-600 hover:from-emerald-600 hover:via-green-600 hover:to-green-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-300/40 hover:shadow-xl hover:shadow-emerald-400/50 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
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
                        : showSignUp
                          ? "Creating Account..."
                          : "Signing In..."}
                    </span>
                  </span>
                ) : (
                  <span className="tracking-wide">
                    {showForgotPassword
                      ? "Send Reset Link"
                      : showSignUp
                        ? "Create Account"
                        : "Sign In"}
                  </span>
                )}
              </button>
            </div>

            <div className="mt-7 pt-6 border-t border-stone-200/60">
              <p className="text-center text-sm text-stone-600 font-medium">
                {showForgotPassword ? (
                  <>
                    Remember your password?{" "}
                    <button
                      onClick={() => {
                        setShowForgotPassword(false);
                        setErrors({});
                      }}
                      className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Sign In
                    </button>
                  </>
                ) : showSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={toggleForm}
                      className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Sign In
                    </button>
                  </>
                ) : (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={toggleForm}
                      className="text-yellow-600 font-bold hover:text-yellow-700 transition-colors duration-200 hover:underline underline-offset-2"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Footer Badge */}
          <div className="text-center mt-6">
            <p className="text-xs text-stone-500 font-medium">
              Secure Admin Access · Novesse by Vijaya
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;

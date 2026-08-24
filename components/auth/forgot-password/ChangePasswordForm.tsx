"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordSchema } from "@/app/validations/authSchemas";

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [form, setForm] = useState<ResetPasswordForm>({
    password: "",
    confirm: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ResetPasswordForm, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const result = resetPasswordSchema.safeParse(form);

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((err) => {
        fieldErrors[err.path[0] as keyof ResetPasswordForm] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid or expired reset link");
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      const response = await axios.post(
        `/api/auth/reset-password?token=${token}`,
        {
          password: form.password,
          confirm: form.confirm,
        }
      );

      if (response.data.success) {
        toast.success("Password reset successful. Please sign in.");
        router.push("/auth");
      }
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-[#F4F7FB]">
      {/* Modern Mesh Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 via-white to-blue-100/50"></div>
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-blue-200/30 to-transparent blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-radial from-blue-100/40 to-transparent blur-3xl"></div>

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="relative backdrop-blur-2xl bg-white/80 rounded-3xl shadow-2xl shadow-blue-500/10 border border-white p-10 transition-all duration-500 hover:shadow-blue-500/20">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800">
                Reset Password
              </h1>
              <p className="text-slate-500 text-sm mt-2">
                Create a new secure password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-primary focus:ring-4 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 text-slate-400 hover:text-blue-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-2 ml-1 font-medium">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div>
                <Label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={form.confirm}
                    onChange={(e) =>
                      setForm({ ...form, confirm: e.target.value })
                    }
                    placeholder="••••••••"
                    className="w-full px-5 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-primary focus:ring-4 focus:ring-blue-100 text-slate-800 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-5 text-slate-400 hover:text-blue-primary transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-red-500 text-xs mt-2 ml-1 font-medium">
                    {errors.confirm}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-8 py-4 bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <button
                onClick={() => router.push("/auth ")}
                className="text-sm text-blue-600 font-bold hover:text-blue-700 hover:underline underline-offset-2 transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-slate-400 font-medium">
            Secure Password Reset · Hospital by Vijaya
          </div>
        </div>
      </div>
    </div>
  );
}

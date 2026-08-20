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
    <div className="min-h-screen w-full relative overflow-hidden bg-linear-to-br from-emerald-50 via-cyan-50 to-teal-50">
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-tr from-emerald-100/40 via-transparent to-cyan-100/40"></div>

      <div className="flex items-center justify-center min-h-screen px-4 relative z-10 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="backdrop-blur-2xl bg-white/70 rounded-3xl shadow-2xl shadow-emerald-200/20 border border-white/60 p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-300/40">
                <ShieldCheck className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-emerald-600 via-green-500 to-teal-500 bg-clip-text text-transparent">
                Reset Password
              </h1>
              <p className="text-stone-600 text-sm mt-2">
                Create a new secure password
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password */}
              <div>
                <Label className="block text-sm font-bold text-stone-700 mb-2 ml-1">
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
                    className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 text-stone-400 hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm */}
              <div>
                <Label className="block text-sm font-bold text-stone-700 mb-2 ml-1">
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
                    className="w-full px-5 py-3.5 bg-white/80 border border-stone-200 rounded-2xl focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-5 text-stone-400 hover:text-emerald-500"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-rose-500 text-xs mt-2 ml-1 font-semibold">
                    {errors.confirm}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-4 bg-linear-to-r from-emerald-500 via-green-500 to-green-600 hover:from-emerald-600 hover:via-green-600 hover:to-green-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-300/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>

            <div className="mt-7 pt-6 border-t border-stone-200/60 text-center">
              <button
                onClick={() => router.push("/auth ")}
                className="text-sm text-emerald-600 font-bold hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-stone-500">
            Secure Password Reset · Novesse by Vijaya
          </div>
        </div>
      </div>
    </div>
  );
}

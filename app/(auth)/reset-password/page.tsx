"use client";
// app/(auth)/reset-password/page.tsx
// The backend sends: CLIENT_URL/reset-password?token=<rawToken>

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { resetPasswordAction } from "@/lib/actions/admin/auth-action";

type Step = "form" | "success" | "invalid";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token");

  const [formData, setFormData]   = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors]       = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<Step>("form");

  useEffect(() => {
    if (!token) setStep("invalid");
  }, [token]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.password)
      e.password = "Password is required";
    else if (formData.password.length < 8)
      e.password = "Password must be at least 8 characters";
    if (!formData.confirmPassword)
      e.confirmPassword = "Please confirm your new password";
    else if (formData.password !== formData.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validate()) return;
    setLoading(true);
    try {
      // FIX: resetPasswordAction requires (prevState, FormData) — build FormData manually
      const fd = new FormData();
      fd.append("token",           token);
      fd.append("password",        formData.password);
      fd.append("confirmPassword", formData.confirmPassword);

      const result = await resetPasswordAction(
        { success: false, error: "" }, // prevState (ignored by action)
        fd
      );

      if (result.success) {
        toast.success("Password reset successfully!");
        setStep("success");
      } else {
        // FIX: ResetPasswordResult has result.error, not result.message
        toast.error(result.error || "Reset failed. The link may have expired.");
        if (result.error?.includes("expired") || result.error?.includes("invalid") || result.error?.includes("Invalid")) {
          setStep("invalid");
        }
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 8)           score++;
    if (p.length >= 12)          score++;
    if (/[A-Z]/.test(p))         score++;
    if (/[0-9]/.test(p))         score++;
    if (/[^A-Za-z0-9]/.test(p))  score++;
    if (score <= 2) return { level: score, label: "Weak",   color: "bg-red-400" };
    if (score <= 3) return { level: score, label: "Fair",   color: "bg-yellow-400" };
    if (score <= 4) return { level: score, label: "Good",   color: "bg-blue-400" };
    return              { level: score, label: "Strong", color: "bg-green-400" };
  };
  const strength = getPasswordStrength();

  if (step === "success") {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Password reset!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Your password has been updated successfully.
          You can now sign in with your new password.
        </p>
        <Link
          href="/login"
          className="block w-full text-center bg-orange-500 hover:bg-orange-600
            text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-200"
        >
          Sign in now
        </Link>
      </div>
    );
  }

  if (step === "invalid") {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">⏰</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Link expired or invalid</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          This password reset link is invalid or has expired (links are only valid for 15 minutes).
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full text-center bg-orange-500 hover:bg-orange-600
            text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-orange-200 mb-3"
        >
          Request new reset link
        </Link>
        <Link href="/login" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="text-4xl mb-3">🔐</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Set new password</h1>
        <p className="text-gray-500 text-sm">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* New password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-all
                focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                ${errors.password ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}>
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.password}</p>
          )}
          {formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300
                    ${i <= strength.level ? strength.color : "bg-gray-200"}`} />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Strength:{" "}
                <span className={`font-medium ${
                  strength.label === "Strong" ? "text-green-600" :
                  strength.label === "Good"   ? "text-blue-600"  :
                  strength.label === "Fair"   ? "text-yellow-600" : "text-red-600"
                }`}>{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm outline-none transition-all
                focus:ring-2 focus:ring-orange-300 focus:border-orange-400
                ${errors.confirmPassword ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
            />
            <button type="button" onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}>
              {showConfirmPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span> {errors.confirmPassword}</p>
          )}
          {formData.confirmPassword && !errors.confirmPassword && (
            <p className="mt-1 text-xs text-green-600 flex items-center gap-1">✓ Passwords match</p>
          )}
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700
            text-white font-semibold py-2.5 rounded-xl transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 shadow-md shadow-orange-200 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Resetting password…
            </>
          ) : "Reset password"}
        </button>
      </form>

      <div className="mt-5 text-center">
        <Link href="/login" className="text-sm text-gray-500 hover:text-orange-500 transition-colors">
          ← Back to sign in
        </Link>
      </div>
    </>
  );
}
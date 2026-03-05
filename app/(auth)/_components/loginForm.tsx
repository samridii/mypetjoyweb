"use client";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema, LoginData } from "../schema";
import { loginAction } from "@/lib/actions/admin/auth-action";
import ForgotPasswordForm from "./Forgotpasswordform";

export default function LoginForm() {
  const [pending, startTransition]      = useTransition();
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotOpen, setForgotOpen]     = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
  });

  const submit = async (values: LoginData) => {
    startTransition(async () => {
      setError("");

      const fd = new FormData();
      fd.append("email",    values.email);
      fd.append("password", values.password);

      const result = await loginAction(
        { success: false, error: "", user: null },
        fd
      );

      if (result.success && result.user && result.token) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user",  JSON.stringify(result.user));
        window.location.href = result.user.role === "admin" ? "/admin/dashboard" : "/";
      } else {
        setError(result.error || "Login failed");
      }
    });
  };

  const inputBase = `w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none
    bg-white/20 text-white placeholder-white/50 transition-all
    focus:bg-white/30 focus:border-yellow-300`;

  return (
    <>
      <div className="w-full max-w-sm">

        {error && (
          <div className="mb-4 bg-red-100 border border-red-300 text-red-700 text-sm
            px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              className={`${inputBase} ${errors.email ? "border-red-400" : "border-white/30"}`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-yellow-200">⚠ {errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-sm font-medium text-white/90">Password</label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="text-xs text-yellow-200 hover:text-yellow-100 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${inputBase} pr-12 ${errors.password ? "border-red-400" : "border-white/30"}`}
                {...register("password")}
              />
              <button
                type="button"
                aria-label="Toggle password"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-yellow-200">⚠ {errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || pending}
            className="w-full bg-yellow-300 hover:bg-yellow-400 active:bg-yellow-500
              text-gray-800 font-bold py-3 rounded-2xl transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 shadow-lg mt-2"
          >
            {isSubmitting || pending ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10"
                    stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in…
              </>
            ) : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs text-white/50">
            <span className="bg-[#5b84c4] px-3">New to MyPetJoy?</span>
          </div>
        </div>

        <Link
          href="/register"
          className="block w-full text-center border-2 border-white/40 text-white
            font-semibold py-3 rounded-2xl hover:bg-white/10 transition-all duration-200"
        >
          Create an account
        </Link>
      </div>

      {/* Forgot password modal */}
      {forgotOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setForgotOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-800 font-bold text-xl"
            >
              ×
            </button>
            <ForgotPasswordForm />
          </div>
        </div>
      )}
    </>
  );
}
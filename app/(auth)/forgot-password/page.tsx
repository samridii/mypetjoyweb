"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { forgotPasswordAction } from "@/lib/actions/admin/auth-action";

type Step = "form" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]       = useState<Step>("form");

  const validate = () => {
    if (!email)                            { setError("Email is required");             return false; }
    if (!/\S+@\S+\.\S+/.test(email))       { setError("Enter a valid email address");   return false; }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("email", email);

      const result = await forgotPasswordAction(
        { success: false, error: "", message: "" }, 
        fd
      );

      toast.success("Reset link sent if that email exists!");
      setStep("sent");

      if (!result.success) {
        console.warn("Forgot password:", result.error);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Check your inbox</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          If an account with <strong className="text-gray-700">{email}</strong> exists,
          we&apos;ve sent a password reset link. It expires in{" "}
          <strong className="text-blue-600">15 minutes</strong>.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 text-left mb-6">
          <p className="font-semibold mb-1"> Didn&apos;t receive it?</p>
          <ul className="space-y-1 text-xs">
            <li>• Check your spam / junk folder</li>
            <li>• Make sure you typed the correct email</li>
            <li>• Wait a few minutes and try again</li>
          </ul>
        </div>

        <button
          onClick={() => { setStep("form"); setEmail(""); }}
          className="text-sm text-blue-500 hover:text-blue-600 hover:underline mb-4 block w-full"
        >
          Try a different email
        </button>

        <Link
          href="/login"
          className="block w-full text-center border-2 border-orange-200 text-blue-600
            font-semibold py-2.5 rounded-xl hover:bg-orange-50 transition-all"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="text-4xl mb-3">🔑</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Forgot your password?</h1>
        <p className="text-gray-500 text-sm">
          No worries. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
              focus:ring-2 focus:ring-orange-300 focus:border-blue-400
              ${error ? "border-blue-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
          />
          {error && (
            <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700
            text-white font-semibold py-2.5 rounded-xl transition-all duration-200
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2 shadow-md shadow-orange-200"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Sending reset link…
            </>
          ) : "Send reset link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-gray-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-1"
        >
          ← Back to sign in
        </Link>
      </div>
    </>
  );
}
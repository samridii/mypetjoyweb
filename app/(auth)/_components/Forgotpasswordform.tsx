"use client";

import { useActionState } from "react";
import Link from "next/link";
// FIX: use @/ alias instead of fragile relative ../../../
import { forgotPasswordAction, type ForgotPasswordResult } from "@/lib/actions/admin/auth-action";

// initialState matches ForgotPasswordResult exactly: { success, error, message } ✓
const initialState: ForgotPasswordResult = {
  success: false,
  error:   "",
  message: "",
};

export default function ForgotPasswordForm() {
  // forgotPasswordAction signature is (prevState: ForgotPasswordResult, formData: FormData) ✓
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, initialState);

  if (state.success) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="text-5xl">📬</div>
        <h2 className="text-white font-bold text-xl">Check your inbox!</h2>
        <p className="text-white/80 text-sm leading-relaxed">
          We&apos;ve sent a password reset link to your email. It expires in 15 minutes.
        </p>
        <Link
          href="/login"
          className="block w-full py-3 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#5b84c4] font-bold text-sm transition-all duration-200 text-center shadow-md"
        >
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-sm space-y-4">
      {/* reads state.error — matches ForgotPasswordResult.error ✓ */}
      {state.error && (
        <div className="bg-red-100 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-xl">
          {state.error}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-white text-sm font-medium opacity-90">
          Email address
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-yellow-200 focus:border-transparent transition-all duration-200"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-3 rounded-xl bg-yellow-300 hover:bg-yellow-200 text-[#5b84c4] font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-[0.98]"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Sending...
          </span>
        ) : "Send Reset Link"}
      </button>

      <p className="text-center text-white/80 text-sm">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-yellow-100 font-semibold hover:text-white transition-colors underline underline-offset-2"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoginData, loginSchema } from "../schema";



export default function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const submit = () => {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/dashboard");
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="w-full max-w-sm space-y-6 text-white"
    >

      <div className="space-y-1">
        <label className="text-sm font-medium ml-1">Email address</label>
        <input
          {...register("email")}
          placeholder="Enter your email"
          className="w-full bg-transparent border border-white/40 rounded-full px-5 py-2.5 focus:outline-none focus:border-white placeholder:text-white/40 text-sm"
        />
        {errors.email && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium ml-1">Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Enter your password"
          className="w-full bg-transparent border border-white/40 rounded-full px-5 py-2.5 focus:outline-none focus:border-white placeholder:text-white/40 text-sm"
        />
        {errors.password && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.password.message}
          </p>
        )}

        <div className="text-right">
          <button
            type="button"
            className="text-[10px] font-light hover:underline opacity-90 mr-2"
          >
            forgot password?
          </button>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          disabled={pending}
          className="bg-[#c3c4f3] hover:bg-white text-[#5b84c4] font-bold w-44 h-11 rounded-full shadow-md transition disabled:opacity-70"
        >
          {pending ? "Signing in..." : "Sign In"}
        </button>
      </div>

      <div className="text-center text-sm pt-6">
        <span className="opacity-80 font-light">
          Don&apos;t have an account?{" "}
        </span>
        <Link href="/register" className="font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </form>
  );
}

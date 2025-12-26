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
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Email address
        </label>
        <input
          {...register("email")}
          placeholder="you@example.com"
          className="input-auth"
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Password
        </label>
        <input
          type="password"
          {...register("password")}
          placeholder="••••••••"
          className="input-auth"
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <button className="btn-auth" disabled={pending}>
        {pending ? "Signing in..." : "Login"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-purple-600 hover:text-purple-700 underline">
          Sign up
        </Link>
      </div>
    </form>
  );
}
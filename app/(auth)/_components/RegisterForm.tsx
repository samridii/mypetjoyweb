"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RegisterData, registerSchema } from "../schema";

export default function RegisterForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
  });

  const submit = () => {
    startTransition(async () => {
      await new Promise((r) => setTimeout(r, 1000));
      router.push("/login");
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <input
          placeholder="Full Name"
          {...register("fullName")}
          className="input-auth"
        />
        {errors.fullName && <p className="error">{errors.fullName.message}</p>}
      </div>

      <div>
        <input
          placeholder="Email address"
          {...register("email")}
          className="input-auth"
        />
        {errors.email && <p className="error">{errors.email.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
          className="input-auth"
        />
        {errors.password && <p className="error">{errors.password.message}</p>}
      </div>

      <div>
        <input
          type="password"
          placeholder="Confirm password"
          {...register("confirmPassword")}
          className="input-auth"
        />
        {errors.confirmPassword && <p className="error">{errors.confirmPassword.message}</p>}
      </div>

      <button className="btn-auth" disabled={pending}>
        {pending ? "Creating account..." : "Sign up"}
      </button>

      <div className="text-center text-sm text-gray-600">
        Have an account?{" "}
        <Link href="/login" className="font-semibold text-purple-600 hover:text-purple-700 underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
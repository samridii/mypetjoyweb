"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
  confirmPassword: z.string().min(6),
  agree: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterData = z.infer<typeof registerSchema>;

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
      await new Promise((r) => setTimeout(r, 1200));
      router.push("/login");
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="w-full max-w-sm space-y-5 text-white"
    >

      <div>
        <label className="text-xs ml-2">Name</label>
        <input
          {...register("name")}
          placeholder="Enter your name"
          className="w-full bg-transparent border border-white/40 rounded-full
                     px-5 py-2.5 focus:outline-none focus:border-white
                     transition-colors placeholder:text-white/40 text-sm"
        />
        {errors.name && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs ml-2">Email address</label>
        <input
          {...register("email")}
          placeholder="Enter your email"
          className="w-full bg-transparent border border-white/40 rounded-full
                     px-5 py-2.5 focus:outline-none focus:border-white
                     transition-colors placeholder:text-white/40 text-sm"
        />
        {errors.email && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs ml-2">Password</label>
        <input
          type="password"
          {...register("password")}
          placeholder="Create password"
          className="w-full bg-transparent border border-white/40 rounded-full
                     px-5 py-2.5 focus:outline-none focus:border-white
                     transition-colors placeholder:text-white/40 text-sm"
        />
        {errors.password && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.password.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs ml-2">Confirm Password</label>
        <input
          type="password"
          {...register("confirmPassword")}
          placeholder="Re-enter password"
          className="w-full bg-transparent border border-white/40 rounded-full
                     px-5 py-2.5 focus:outline-none focus:border-white
                     transition-colors placeholder:text-white/40 text-sm"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-red-200 mt-1 ml-4">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          {...register("agree")}
          className="accent-[#c3c4f3]"
        />
        <span>
          I agree to the{" "}
          <span className="underline cursor-pointer">terms & policy</span>
        </span>
      </div>
      {errors.agree && (
        <p className="text-xs text-red-200 ml-4">
          {errors.agree.message}
        </p>
      )}

      <div className="flex justify-center pt-4">
        <button
          disabled={pending}
          className="bg-[#c3c4f3] hover:bg-white text-[#5b84c4]
                     font-bold w-48 h-11 rounded-full shadow-md
                     transition-all disabled:opacity-70"
        >
          {pending ? "Creating..." : "Sign Up"}
        </button>
      </div>

      <p className="text-center text-sm pt-6 opacity-90">
        Already have an account?{" "}
        <Link href="/login" className="font-bold hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}




"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { registerSchema, RegisterData } from "../schema";
import { registerAction } from "@/lib/actions/admin/auth-action";

export default function RegisterForm() {
  const router                          = useRouter();
  const [pending, startTransition]      = useTransition();
  const [error, setError]               = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
  });

  const submit = async (values: RegisterData) => {
    startTransition(async () => {
      setError("");
      const result = await registerAction(values);
      if (result.success) {
        router.push("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    });
  };

  const inputBase = `w-full px-4 py-3 rounded-2xl border-2 text-sm outline-none
    bg-white/20 text-white placeholder-white/50 transition-all
    focus:bg-white/30 focus:border-yellow-300`;

  return (
    <div className="w-full max-w-sm">

      {error && (
        <div className="mb-4 bg-red-100 border border-red-300 text-red-700 text-sm
          px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠</span> {error}
        </div>
      )}

      <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            className={`${inputBase} ${errors.fullName ? "border-red-400" : "border-white/30"}`}
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-yellow-200">⚠ {errors.fullName.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">Email address</label>
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
          <label className="block text-sm font-medium text-white/90 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`${inputBase} pr-12 ${errors.password ? "border-red-400" : "border-white/30"}`}
              {...register("password")}
            />
            <button type="button" onClick={() => setShowPassword((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-xs text-yellow-200">⚠ {errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-white/90 mb-1.5">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`${inputBase} pr-12 ${errors.confirmPassword ? "border-red-400" : "border-white/30"}`}
              {...register("confirmPassword")}
            />
            <button type="button" onClick={() => setShowConfirm((p) => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white">
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-yellow-200">⚠ {errors.confirmPassword.message}</p>
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
              Creating account…
            </>
          ) : "Create account"}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20" />
        </div>
        <div className="relative flex justify-center text-xs text-white/50">
          <span className="bg-[#5b84c4] px-3">Already have an account?</span>
        </div>
      </div>

      <Link href="/login"
        className="block w-full text-center border-2 border-white/40 text-white
          font-semibold py-3 rounded-2xl hover:bg-white/10 transition-all duration-200">
        Sign in instead
      </Link>
    </div>
  );
}
// "use client";

// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { useTransition } from "react";
// import { useRouter } from "next/navigation";
// import { z } from "zod";

// const registerSchema = z.object({
//   name: z.string().min(2, "Name is required"),
//   email: z.string().email("Invalid email"),
//   password: z.string().min(6, "Minimum 6 characters"),
//   confirmPassword: z.string().min(6),
//   agree: z.boolean().refine((val) => val === true, {
//     message: "You must accept the terms",
//   }),
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Passwords do not match",
//   path: ["confirmPassword"],
// });

// type RegisterData = z.infer<typeof registerSchema>;

// export default function RegisterForm() {
//   const router = useRouter();
//   const [pending, startTransition] = useTransition();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<RegisterData>({
//     resolver: zodResolver(registerSchema),
//   });

//   const submit = () => {
//     startTransition(async () => {
//       await new Promise((r) => setTimeout(r, 1200));
//       router.push("/login");
//     });
//   };

//   return (
//     <form
//       onSubmit={handleSubmit(submit)}
//       className="w-full max-w-sm space-y-5 text-white"
//     >

//       <div>
//         <label className="text-xs ml-2">Name</label>
//         <input
//           {...register("name")}
//           placeholder="Enter your name"
//           className="w-full bg-transparent border border-white/40 rounded-full
//                      px-5 py-2.5 focus:outline-none focus:border-white
//                      transition-colors placeholder:text-white/40 text-sm"
//         />
//         {errors.name && (
//           <p className="text-xs text-red-200 mt-1 ml-4">
//             {errors.name.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-xs ml-2">Email address</label>
//         <input
//           {...register("email")}
//           placeholder="Enter your email"
//           className="w-full bg-transparent border border-white/40 rounded-full
//                      px-5 py-2.5 focus:outline-none focus:border-white
//                      transition-colors placeholder:text-white/40 text-sm"
//         />
//         {errors.email && (
//           <p className="text-xs text-red-200 mt-1 ml-4">
//             {errors.email.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-xs ml-2">Password</label>
//         <input
//           type="password"
//           {...register("password")}
//           placeholder="Create password"
//           className="w-full bg-transparent border border-white/40 rounded-full
//                      px-5 py-2.5 focus:outline-none focus:border-white
//                      transition-colors placeholder:text-white/40 text-sm"
//         />
//         {errors.password && (
//           <p className="text-xs text-red-200 mt-1 ml-4">
//             {errors.password.message}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-xs ml-2">Confirm Password</label>
//         <input
//           type="password"
//           {...register("confirmPassword")}
//           placeholder="Re-enter password"
//           className="w-full bg-transparent border border-white/40 rounded-full
//                      px-5 py-2.5 focus:outline-none focus:border-white
//                      transition-colors placeholder:text-white/40 text-sm"
//         />
//         {errors.confirmPassword && (
//           <p className="text-xs text-red-200 mt-1 ml-4">
//             {errors.confirmPassword.message}
//           </p>
//         )}
//       </div>

//       <div className="flex items-center gap-2 text-xs">
//         <input
//           type="checkbox"
//           {...register("agree")}
//           className="accent-[#c3c4f3]"
//         />
//         <span>
//           I agree to the{" "}
//           <span className="underline cursor-pointer">terms & policy</span>
//         </span>
//       </div>
//       {errors.agree && (
//         <p className="text-xs text-red-200 ml-4">
//           {errors.agree.message}
//         </p>
//       )}

//       <div className="flex justify-center pt-4">
//         <button
//           disabled={pending}
//           className="bg-[#c3c4f3] hover:bg-white text-[#5b84c4]
//                      font-bold w-48 h-11 rounded-full shadow-md
//                      transition-all disabled:opacity-70"
//         >
//           {pending ? "Creating..." : "Sign Up"}
//         </button>
//       </div>

//       <p className="text-center text-sm pt-6 opacity-90">
//         Already have an account?{" "}
//         <Link href="/login" className="font-bold hover:underline">
//           Sign In
//         </Link>
//       </p>
//     </form>
//   );
// }




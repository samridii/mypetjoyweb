import { z } from "zod";

export const loginSchema = z.object({
  email:    z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    fullName:        z.string().min(2, "Full name must be at least 2 characters"),
    email:           z.string().min(1, "Email is required").email("Enter a valid email"),
    password:        z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginData    = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
"use server";
// lib/actions/admin/auth-action.ts

import { registerUser, loginUser, forgotPassword, resetPassword, type RegisterData } from "../../api/auth.api";
import { clearAuthCookies, getAuthToken, getUserData, type UserData } from "../../cookie";
import { redirect } from "next/navigation";

export interface RegisterResult       { success: boolean; message: string; data?: unknown; }
export interface LoginResult          { success: boolean; error: string; user: UserData | null; token?: string; }
export interface ForgotPasswordResult { success: boolean; error: string; message: string; }
export interface ResetPasswordResult  { success: boolean; error: string; }

function getErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const r = (err as { response?: { data?: { error?: string; message?: string } } }).response;
    if (typeof r?.data?.error   === "string") return r.data.error;
    if (typeof r?.data?.message === "string") return r.data.message;
  }
  return "";
}

export const registerAction = async (data: RegisterData): Promise<RegisterResult> => {
  try {
    const body = (await registerUser(data)).data;
    if (body.success) return { success: true, message: "Registration successful! Please log in.", data: body };
    return { success: false, message: body?.error || "Registration failed." };
  } catch (err: unknown) {
    return { success: false, message: getErrorMessage(err) || "Registration failed. Please try again." };
  }
};

// FIX: Do NOT call setAuthToken/setUserData here — next/headers cookies() cannot
// be set inside a server action invoked from a client component in Next.js 14.
// Instead, return the token+user to the client and set cookies there.
export const loginAction = async (_prevState: LoginResult, formData: FormData): Promise<LoginResult> => {
  const email    = formData.get("email")    as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required.", user: null };
  }

  try {
    const body = (await loginUser({ email, password })).data;

    if (!body.token || !body.user) {
      return { success: false, error: body.error ?? "Login failed. Please check your credentials.", user: null };
    }

    const userData: UserData = {
      id:       body.user.id,
      fullName: body.user.fullName,
      email:    body.user.email,
      role:     body.user.role,
    };

    // Return token + user to client — login page sets cookies via clientSetAuthToken/clientSetUserData
    return { success: true, error: "", user: userData, token: body.token };

  } catch (err: unknown) {
    return {
      success: false,
      error: getErrorMessage(err) || "Invalid email or password. Please try again.",
      user: null,
    };
  }
};

export const forgotPasswordAction = async (_prevState: ForgotPasswordResult, formData: FormData): Promise<ForgotPasswordResult> => {
  const email = formData.get("email") as string;
  if (!email) return { success: false, error: "Please enter your email address.", message: "" };
  try {
    const body = (await forgotPassword({ email })).data;
    if (!body.success) return { success: false, error: body?.error || "Something went wrong.", message: "" };
    return { success: true, error: "", message: body?.message || "If that email exists, a reset link has been sent." };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err) || "Something went wrong. Please try again.", message: "" };
  }
};

export const resetPasswordAction = async (_prevState: ResetPasswordResult, formData: FormData): Promise<ResetPasswordResult> => {
  const token           = formData.get("token")           as string;
  const password        = formData.get("password")        as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  if (!password || password.length < 8) return { success: false, error: "Password must be at least 8 characters." };
  if (password !== confirmPassword)     return { success: false, error: "Passwords do not match." };
  try {
    const body = (await resetPassword({ token, password })).data;
    if (!body.success) return { success: false, error: body?.error || "Reset failed. Link may have expired." };
    return { success: true, error: "" };
  } catch (err: unknown) {
    return { success: false, error: getErrorMessage(err) || "Reset failed. The link may have expired." };
  }
};

export const logoutAction = async (): Promise<void> => {
  await clearAuthCookies();
  redirect("/login");
};

export const getLoggedInUser = async (): Promise<{ token: string | null; user: UserData | null }> => {
  return { token: await getAuthToken(), user: await getUserData() };
};
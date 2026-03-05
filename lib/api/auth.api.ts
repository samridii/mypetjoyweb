// lib/api/auth.api.ts
// Renamed from auth.ts → auth.api.ts for consistent naming convention across the project.
// Added forgotPassword and resetPassword to match backend routes.

import api from "./axios";
import { API } from "./endpoint";

export interface RegisterData {
  fullName: string;   // FIXED: backend requires 'fullName', original used just email+password
  email: string;
  password: string;
  role?: "user" | "admin";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    message: string;
  };
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  error?: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
  error?: string;
}

export const registerUser = (data: RegisterData) =>
  api.post<RegisterResponse>(API.AUTH.REGISTER, data);

export const loginUser = (data: LoginData) =>
  api.post<LoginResponse>(API.AUTH.LOGIN, data);

export const forgotPassword = (data: ForgotPasswordData) =>
  api.post<MessageResponse>(API.AUTH.FORGOT_PASSWORD, data);

export const resetPassword = (data: ResetPasswordData) =>
  api.post<MessageResponse>(API.AUTH.RESET_PASSWORD, data);
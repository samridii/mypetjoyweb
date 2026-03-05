// lib/api/user.api.ts
import api from "./axios";
import { API } from "./endpoint";

export interface UserProfile {
  id:       string;
  fullName: string;
  email:    string;
  mobile?:  string;
  location?: string;
  role:     "user" | "admin";
}

export interface UpdateProfileData { fullName?: string; email?: string; mobile?: string; location?: string; }
export interface ChangePasswordData { currentPassword: string; newPassword: string; }

export const getMe          = () => api.get<{ user: UserProfile }>(API.USER.ME);
export const updateProfile  = (data: UpdateProfileData) => api.put<{ message: string; user: UserProfile }>(API.USER.UPDATE, data);
export const changePassword = (data: ChangePasswordData) => api.put<{ message: string }>(API.USER.CHANGE_PASSWORD, data);
"use server"

import { cookies } from "next/headers"

export interface UserData {
  _id?:      string;   
  id?:       string;   
  email:     string;
  username?: string;   
  fullName?: string;   
  role:      "user" | "admin";
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const setAuthToken = async (token: string) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name:     "auth_token",
    value:    token,
    httpOnly: false,
    sameSite: "lax",
  });
};

export const getAuthToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value ?? null;
};

export const setUserData = async (userData: UserData) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name:     "user_data",
    value:    JSON.stringify(userData),
    httpOnly: false,
    path:     "/",
    sameSite: "lax",
  });
};

export const getUserData = async (): Promise<UserData | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("user_data")?.value ?? null;
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clientSetUserData = (user: any) => {
  document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))}; path=/`;
};

export const clientClearAuthCookies = () => {
  document.cookie = "auth_token=; path=/; max-age=0";
  document.cookie = "user_data=; path=/; max-age=0";
};

export const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("user_data",  "", { maxAge: 0, path: "/" });
};

export async function serverClearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.set("auth_token", "", { maxAge: 0, path: "/" });
  cookieStore.set("user_data",  "", { maxAge: 0, path: "/" });
}
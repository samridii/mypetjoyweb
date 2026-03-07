import Cookies from "js-cookie";

export interface UserData {
  _id?:      string;
  id?:       string;
  email:     string;
  username?: string;
  fullName?: string;
  role:      "user" | "admin";
  mobile?:   string;
  location?: string;
  image?:    string;
  createdAt?: string;
  updatedAt?: string;
}


export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setUserData = (userData: UserData) => {
  if (typeof window !== "undefined") {
    document.cookie = `user_data=${encodeURIComponent(
      JSON.stringify(userData)
    )}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
  }
};

export const getUserData = (): UserData | null => {
  if (typeof window === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )user_data=([^;]+)"));
  try {
    return match ? JSON.parse(decodeURIComponent(match[2])) : null;
  } catch {
    return null;
  }
};

export const clientSetUserData = (user: UserData) => {
  setUserData(user);
};

export const clearAuthCookies = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0";
    document.cookie = "user_data=; path=/; max-age=0";
  }
};

export const clientClearAuthCookies = () => {
  clearAuthCookies();
};

export const serverClearAuthCookies = () => {
  clearAuthCookies();
};
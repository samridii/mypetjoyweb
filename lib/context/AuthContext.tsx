"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { UserData } from "../cookie";

interface AuthContextType {
  user: UserData | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setUser: (user: UserData | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user:            null,
  token:           null,
  isLoading:       true,
  isAuthenticated: false,
  isAdmin:         false,
  setUser:         () => {},
  setToken:        () => {},
  logout:          () => {},
});

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser]           = useState<UserData | null>(null);
  const [token, setToken]         = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = readCookie("auth_token");
    const rawUser = readCookie("user_data");
    let u: UserData | null = null;
    try {
      if (rawUser) u = JSON.parse(rawUser);
    } catch {
      u = null;
    }
    setToken(t);
    setUser(u);
    setIsLoading(false);
  }, []);

  const logout = () => {
    document.cookie = "auth_token=; Max-Age=0; path=/";
    document.cookie = "user_data=; Max-Age=0; path=/";
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isAdmin:         user?.role === "admin",
        setUser,
        setToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
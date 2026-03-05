// Client-side auth helpers — used in useAuth hook and protected route checks

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
}

export function getStoredUser(): AuthUser | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)user=([^;]+)/);
    if (!match) return null;
    return JSON.parse(decodeURIComponent(match[1]));
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("token=");
}

export function isAdmin(): boolean {
  const user = getStoredUser();
  return user?.role === "admin";
}
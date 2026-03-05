// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token    = request.cookies.get("auth_token")?.value;
  const userData = request.cookies.get("user_data")?.value;

  let user: { role?: string } | null = null;
  try { user = userData ? JSON.parse(userData) : null; } catch { user = null; }

  const isLoggedIn = !!token && !!user;
  const isAdmin    = user?.role === "admin";

  // Auth pages: redirect logged-in users to home
  const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];
  if (authRoutes.some((r) => pathname.startsWith(r))) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/", request.url));
    }
    return NextResponse.next();
  }

  // Admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // Protected routes — require login
  const protectedRoutes = ["/profile", "/orders", "/cart", "/adoptions", "/pets", "/shop", "/quiz"];
  if (protectedRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    if (!isLoggedIn) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login", "/register", "/forgot-password", "/reset-password",
    "/admin/:path*",
    "/profile/:path*", "/orders/:path*", "/cart/:path*", "/adoptions/:path*",
    "/pets", "/pets/:path*",
    "/shop", "/shop/:path*",
    "/quiz", "/quiz/:path*",
  ],
};
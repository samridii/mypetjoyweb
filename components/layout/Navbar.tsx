"use client";
// components/layout/Navbar.tsx — sticky, scrolled state, active links, cart count

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { getCart } from "@/lib/api/cart.api";
import {
  ShoppingCart, Menu, X, ChevronDown,
  User, Package, Settings, LogOut, Sparkles,
} from "lucide-react";

// FIX: define the shape of the cart API response so TS stops complaining about `res`
interface CartItem     { quantity: number; }
interface CartData     { items: CartItem[]; }
interface CartResponse { data: CartData; }

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const [cartCount, setCartCount]       = useState(0);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // FIX: type `res` explicitly → TS now knows res.data.data.items exists
      getCart()
        .then((res: { data: CartResponse }) => {
          const total = res.data.data?.items?.reduce(
            (sum: number, i: CartItem) => sum + i.quantity, 0
          ) ?? 0;
          setCartCount(total);
        })
        .catch(() => {});
    } else {
      setCartCount(0);
    }
  }, [isAuthenticated, pathname]);

  const navLinks = [
    { href: "/",         label: "Home"    },
    { href: "/pets",     label: "Adopt"   },
    { href: "/products", label: "Shop"    },
    { href: "/quiz",     label: "AI Quiz" },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8">
      <nav className={`transition-all duration-300 rounded-3xl
        ${scrolled
          ? "bg-[#ddeaf8]/95 backdrop-blur-md shadow-lg shadow-blue-100/60"
          : "bg-[#e8f2fc] border border-blue-100"}`}>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-8 h-8 rounded-full overflow-hidden shadow-md shadow-blue-200
                group-hover:scale-110 transition-transform flex-shrink-0">
                <Image
                  src="/cutebag.png"
                  alt="MyPetJoy Logo"
                  width={35}
                  height={35}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <span className="text-xl font-bold text-blue-600">MyPetJoy</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  className={`px-4 py-2 rounded-xl text-md font-medium transition-all duration-200
                    ${isActive(link.href)
                      ? "bg-blue-150 text-blue-700"
                      : "text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">

              {/* Cart */}
              {isAuthenticated && (
                <Link href="/cart"
                  className="relative p-2 rounded-xl text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold
                      rounded-full w-5 h-5 flex items-center justify-center leading-none">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </Link>
              )}

              {/* User menu / auth buttons */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-500
                      text-white flex items-center justify-center text-sm font-bold shadow-sm">
                      {user?.fullName?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span className="hidden sm:block text-md font-medium text-gray-700 max-w-[100px] truncate">
                      {user?.fullName}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl shadow-gray-200/60
                        border border-gray-100 py-2 z-20 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 truncate">{user?.fullName}</p>
                          <p className="text-xs text-gray-400 truncate mt-0.5">{user?.email}</p>
                        </div>
                        {[
                          { href:"/profile", label:"My Profile", Icon:User    },
                          { href:"/orders",  label:"My Orders",  Icon:Package },
                        ].map(item => (
                          <Link key={item.href} href={item.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700
                              hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <item.Icon size={15} className="text-gray-400" />
                            {item.label}
                          </Link>
                        ))}
                        {isAdmin && (
                          <Link href="/admin/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-violet-700
                              hover:bg-violet-50 transition-colors">
                            <Settings size={15} className="text-violet-400" />
                            Admin Dashboard
                          </Link>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { setUserMenuOpen(false); logout(); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600
                              hover:bg-rose-50 transition-colors">
                            <LogOut size={15} className="text-rose-400" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register"
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600
                      hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold
                      rounded-xl transition-all shadow-md shadow-blue-200">
                    <Sparkles size={13} />
                    Get started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMenuOpen(p => !p)}
                className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-blue-50 transition-colors">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-blue-100 py-3 space-y-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive(link.href) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-blue-50"}`}>
                  {link.label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="pt-2 flex gap-2 px-4">
                  <Link href="/login" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center border-2 border-blue-200 text-blue-600
                      py-2 rounded-xl text-sm font-medium hover:bg-blue-50 transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" onClick={() => setMenuOpen(false)}
                    className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600
                      text-white py-2 rounded-xl text-sm font-medium">
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, PawPrint, ShoppingBag, ClipboardList,
  Heart, Users, BarChart2, LogOut, Settings, ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/admin/dashboard",  icon: LayoutDashboard },
  { label: "Pets",        href: "/admin/pets",        icon: PawPrint        },
  { label: "Products",    href: "/admin/products",    icon: ShoppingBag     },
  { label: "Orders",      href: "/admin/orders",      icon: ClipboardList   },
  { label: "Adoptions",   href: "/admin/adoptions",   icon: Heart           },
  { label: "Users",       href: "/admin/users",       icon: Users           },
  { label: "Analytics",   href: "/admin/analytics",   icon: BarChart2       },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="w-60 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col min-h-screen sticky top-0">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#5b84c4] flex items-center justify-center">
            <PawPrint size={16} className="text-white" />
          </div>
          <div>
            <p className="font-extrabold text-gray-800 text-sm leading-none">MyPetJoy</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
          Menu
        </p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                active
                  ? "bg-blue-50 text-[#5b84c4] font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              }`}>
              <Icon size={16} className={active ? "text-[#5b84c4]" : "text-gray-400"} />
              {label}
              {active && <ChevronRight size={12} className="ml-auto text-[#5b84c4]" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
        <Link href="/admin/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
          <Settings size={16} className="text-gray-400" />
          Settings
        </Link>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
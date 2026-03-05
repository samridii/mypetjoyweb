"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Products", href: "/admin/products" },
    { name: "Pets", href: "/admin/pets" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Adoptions", href: "/admin/adoptions" },
    { name: "Users", href: "/admin/users" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-gradient-to-b from-blue-500 to-blue-400 text-white p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-10">PetJoy Admin</h2>

          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-2 rounded-lg transition ${
                  pathname === item.href
                    ? "bg-white text-blue-600 font-semibold"
                    : "hover:bg-blue-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <button
          onClick={() => {
            localStorage.removeItem("adminToken");
            window.location.href = "/admin/login";
          }}
          className="bg-white text-blue-600 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
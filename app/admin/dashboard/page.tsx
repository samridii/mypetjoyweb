// app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  PawPrint, ShoppingBag, ClipboardList, Heart,
  Users, TrendingUp, DollarSign, Clock,
} from "lucide-react";
import { getAllPets } from "@/lib/api/pets.api";
import { getMyOrders } from "@/lib/api/orders.api";
import toast from "react-hot-toast";

interface Stats {
  totalPets: number;
  availablePets: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalAdoptions: number;
}

function StatCard({ label, value, sub, icon: Icon, color, bg }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; bg: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-extrabold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAllPets(),
      getMyOrders(),
    ])
      .then(([petsRes, ordersRes]) => {
        const pets   = petsRes.data.data   ?? [];
        const orders = ordersRes.data.data ?? [];
        setStats({
          totalPets:      pets.length,
          availablePets:  pets.filter(p => p.status === "AVAILABLE").length,
          totalOrders:    orders.length,
          pendingOrders:  orders.filter(o => o.status === "PENDING").length,
          totalRevenue:   orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0),
          totalAdoptions: pets.filter(p => p.status === "ADOPTED").length,
        });
      })
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  const STAT_CARDS = [
    { label: "Total Pets",     value: stats?.totalPets     ?? 0, sub: `${stats?.availablePets ?? 0} available`,   icon: PawPrint,      color: "text-blue-500",   bg: "bg-blue-50"   },
    { label: "Total Orders",   value: stats?.totalOrders   ?? 0, sub: `${stats?.pendingOrders ?? 0} pending`,     icon: ClipboardList, color: "text-amber-500",  bg: "bg-amber-50"  },
    { label: "Total Revenue",  value: `NPR ${(stats?.totalRevenue ?? 0).toLocaleString()}`, sub: "from all orders", icon: DollarSign,    color: "text-emerald-500",bg: "bg-emerald-50"},
    { label: "Adoptions",      value: stats?.totalAdoptions ?? 0, sub: "pets adopted",                            icon: Heart,         color: "text-rose-500",   bg: "bg-rose-50"   },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back — here's what's happening.</p>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(c => <StatCard key={c.label} {...c} />)}
        </div>
      )}

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-bold text-gray-700 text-sm mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Manage Pets",      href: "/admin/pets",      icon: PawPrint,      color: "text-blue-500",   bg: "bg-blue-50"   },
            { label: "Manage Products",  href: "/admin/products",  icon: ShoppingBag,   color: "text-violet-500", bg: "bg-violet-50" },
            { label: "View Orders",      href: "/admin/orders",    icon: ClipboardList, color: "text-amber-500",  bg: "bg-amber-50"  },
            { label: "Adoptions",        href: "/admin/adoptions", icon: Heart,         color: "text-rose-500",   bg: "bg-rose-50"   },
            { label: "Users",            href: "/admin/users",     icon: Users,         color: "text-emerald-500",bg: "bg-emerald-50"},
            { label: "Analytics",        href: "/admin/analytics", icon: TrendingUp,    color: "text-cyan-500",   bg: "bg-cyan-50"   },
          ].map(q => (
            <a key={q.href} href={q.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors text-center group">
              <div className={`w-9 h-9 rounded-xl ${q.bg} flex items-center justify-center`}>
                <q.icon size={16} className={q.color} />
              </div>
              <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-800 leading-tight">{q.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent orders placeholder */}
      <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-700 text-sm flex items-center gap-2">
            <Clock size={14} className="text-gray-400" /> Recent Orders
          </h2>
          <a href="/admin/orders" className="text-xs text-[#5b84c4] font-semibold hover:underline">View all</a>
        </div>
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">
            Go to <a href="/admin/orders" className="text-[#5b84c4] font-semibold hover:underline">Orders</a> to manage all orders.
          </p>
        )}
      </div>
    </div>
  );
}
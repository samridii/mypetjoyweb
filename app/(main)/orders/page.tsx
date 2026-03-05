"use client";
// app/(main)/orders/page.tsx
// Soft theme · Fredoka · framer-motion · Lucide icons · no emojis

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package, ShoppingBag, ChevronDown, ChevronRight,
  Calendar, Hash, Truck, CheckCircle, Clock,
  XCircle, CreditCard, ArrowLeft,
} from "lucide-react";
import { getMyOrders, type Order, type OrderStatus } from "@/lib/api/orders.api";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, {
  label: string; Icon: React.ElementType;
  bg: string; text: string; border: string; dot: string;
}> = {
  PENDING:   { label:"Pending",   Icon:Clock,        bg:"bg-amber-50",   text:"text-amber-600",  border:"border-amber-200", dot:"bg-amber-400"   },
  PAID:      { label:"Paid",      Icon:CreditCard,   bg:"bg-violet-50",  text:"text-violet-600", border:"border-violet-200",dot:"bg-violet-400"  },
  SHIPPED:   { label:"Shipped",   Icon:Truck,        bg:"bg-blue-50",    text:"text-blue-600",   border:"border-blue-200",  dot:"bg-blue-400"    },
  DELIVERED: { label:"Delivered", Icon:CheckCircle,  bg:"bg-emerald-50", text:"text-emerald-600",border:"border-emerald-200",dot:"bg-emerald-400" },
  CANCELLED: { label:"Cancelled", Icon:XCircle,      bg:"bg-rose-50",    text:"text-rose-600",   border:"border-rose-200",  dot:"bg-rose-400"    },
};

// Static product images by order index (since backend images may not be accessible)
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1602584386319-fa8eb4361c2c?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=80&h=80&fit=crop",
  "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=80&h=80&fit=crop",
];

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5
      rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Order card ─────────────────────────────────────────────────────────────
function OrderCard({ order, index }: { order: Order; index: number }) {
  const [open, setOpen] = useState(false);
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.PENDING;
  const StatusIcon = cfg.Icon;
  const date = new Date(order.createdAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm
        hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full px-6 py-5 flex flex-col sm:flex-row sm:items-center
          justify-between gap-4 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
            <StatusIcon size={20} className={cfg.text} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash size={12} className="text-gray-300" />
              <span className="text-sm font-bold text-gray-800 font-mono tracking-wide">
                {order._id.slice(-8).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                <Calendar size={11} />
                {date.toLocaleDateString("en-US", { day:"numeric", month:"short", year:"numeric" })}
              </span>
              <span className="text-xs text-gray-300">·</span>
              <span className="text-xs text-gray-400 font-medium">
                {order.products.length} item{order.products.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:flex-shrink-0">
          <StatusBadge status={order.status} />
          <div className="text-right">
            <p className="text-lg font-bold text-gray-800">
              NPR {order.totalAmount.toLocaleString()}
            </p>
          </div>
          <ChevronDown size={16} className={`text-gray-300 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded items */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-6 py-5">
              {/* Items list */}
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                Order Items
              </p>
              <div className="space-y-3 mb-5">
                {order.products.map((item, i) => (
                  <div key={i}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    {/* Product image */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-white border border-gray-100">
                      <img
                        src={PRODUCT_IMAGES[i % PRODUCT_IMAGES.length]}
                        alt={item.product?.name ?? "Product"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.product?.name ?? "Product"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantity} × NPR {item.product?.price?.toLocaleString() ?? "—"}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-700 flex-shrink-0">
                      NPR {((item.product?.price ?? 0) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className={`flex items-center justify-between p-4 rounded-2xl
                border ${cfg.border} ${cfg.bg}`}>
                <span className={`text-sm font-bold ${cfg.text} flex items-center gap-2`}>
                  <StatusIcon size={15} />
                  {cfg.label}
                </span>
                <span className="text-base font-bold text-gray-800">
                  Total: NPR {order.totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Filter button ──────────────────────────────────────────────────────────
function FilterBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border
        ${active
          ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white border-transparent shadow-md shadow-orange-200"
          : "bg-white text-gray-500 border-gray-200 hover:border-orange-300 hover:text-orange-600"}`}>
      {label}
    </button>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gray-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-100 rounded-full w-1/3" />
          <div className="h-3 bg-gray-100 rounded-full w-1/4" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-xl" />
        <div className="h-5 w-24 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["All", "PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type FilterType = (typeof STATUS_FILTERS)[number];

export default function OrdersPage() {
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<FilterType>("All");

  useEffect(() => {
    getMyOrders()
      .then(r => setOrders(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All"
    ? orders
    : orders.filter(o => o.status === filter);

  // Summary counts
  const counts = {
    total:     orders.length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    pending:   orders.filter(o => o.status === "PENDING" || o.status === "PAID" || o.status === "SHIPPED").length,
    spent:     orders.filter(o => o.status !== "CANCELLED").reduce((s, o) => s + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-violet-50/20 font-fredoka">

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-violet-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/profile"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400
              hover:text-orange-500 transition-colors mb-5 font-medium">
            <ArrowLeft size={14} />
            Back to Profile
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-1">My Orders</h1>
              <p className="text-gray-400 font-normal text-sm">Track and manage your purchase history</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white rounded-2xl px-4 py-2.5
              border border-gray-100 shadow-sm text-sm text-gray-500 font-medium">
              <Package size={15} className="text-orange-400" />
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        {!loading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label:"Total Orders",  value:counts.total,              Icon:ShoppingBag, color:"text-orange-500", bg:"bg-orange-50" },
              { label:"Delivered",     value:counts.delivered,          Icon:CheckCircle, color:"text-emerald-500",bg:"bg-emerald-50"},
              { label:"In Progress",   value:counts.pending,            Icon:Truck,       color:"text-blue-500",   bg:"bg-blue-50"  },
              { label:"Total Spent",   value:`NPR ${counts.spent.toLocaleString()}`, Icon:CreditCard, color:"text-violet-500", bg:"bg-violet-50" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 border border-white shadow-sm`}>
                <div className="flex items-center gap-2 mb-2">
                  <s.Icon size={14} className={s.color} />
                  <span className="text-xs text-gray-400 font-medium">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Filters */}
        {!loading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 flex-wrap mb-6"
          >
            {STATUS_FILTERS.map(f => (
              <FilterBtn key={f}
                label={f === "All" ? `All (${orders.length})` :
                  `${STATUS_CONFIG[f as OrderStatus]?.label ?? f} (${orders.filter(o => o.status === f).length})`}
                active={filter === f}
                onClick={() => setFilter(f)}
              />
            ))}
          </motion.div>
        )}

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 rounded-3xl bg-orange-50 flex items-center justify-center mx-auto mb-5">
              <Package size={32} className="text-orange-300" />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              {filter === "All" ? "No orders yet" : `No ${STATUS_CONFIG[filter as OrderStatus]?.label ?? filter} orders`}
            </h2>
            <p className="text-gray-400 text-sm font-normal mb-6 max-w-xs mx-auto">
              {filter === "All"
                ? "Your purchase history will appear here once you place an order."
                : "Try a different filter to see other orders."}
            </p>
            {filter === "All" ? (
              <Link href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r
                  from-orange-500 to-rose-500 text-white font-bold rounded-2xl text-sm
                  shadow-lg shadow-orange-200 hover:-translate-y-0.5 transition-all">
                <ShoppingBag size={16} />
                Browse Shop
                <ChevronRight size={14} />
              </Link>
            ) : (
              <button onClick={() => setFilter("All")}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                  text-orange-500 border-2 border-orange-200 rounded-2xl hover:bg-orange-50 transition-all">
                Show all orders
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((order, i) => (
                <OrderCard key={order._id} order={order} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
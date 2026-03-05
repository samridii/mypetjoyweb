"use client";

import { useState, useEffect } from "react";
import {
  Search, X, ClipboardList, Package, ChevronDown,
  Check, Eye, ShoppingBag,
} from "lucide-react";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";
import type { Order, OrderStatus } from "@/lib/api/orders.api";
import toast from "react-hot-toast";

const STATUS_CONFIG: Record<OrderStatus, { label: string; dot: string; text: string; bg: string }> = {
  PENDING:   { label: "Pending",   dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"   },
  PAID:      { label: "Paid",      dot: "bg-blue-400",    text: "text-blue-700",    bg: "bg-blue-50 border-blue-200"     },
  SHIPPED:   { label: "Shipped",   dot: "bg-violet-400",  text: "text-violet-700",  bg: "bg-violet-50 border-violet-200" },
  DELIVERED: { label: "Delivered", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200"},
  CANCELLED: { label: "Cancelled", dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50 border-red-200"       },
};

const STATUS_FLOW: OrderStatus[] = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

function OrderDetailModal({ order, onClose, onStatusChange }: {
  order: Order;
  onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const sc = STATUS_CONFIG[order.status];

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await onStatusChange(order._id, status);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Order Details</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          {/* Status plus date */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {order.products.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                    {item.product?.image ? (
                      <img src={item.product.image} alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.product?.name ?? "Deleted product"}</p>
                    <p className="text-xs text-gray-400">
                      NPR {item.product?.price?.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-700 text-sm flex-shrink-0">
                    NPR {((item.product?.price ?? 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t border-gray-100">
            <span className="font-bold text-gray-700">Total</span>
            <span className="text-xl font-extrabold text-[#5b84c4]">NPR {order.totalAmount.toLocaleString()}</span>
          </div>

          {/* Update status */}
          {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_FLOW.filter(s => s !== order.status).map(s => {
                  const c = STATUS_CONFIG[s];
                  return (
                    <button key={s} onClick={() => handleStatus(s)} disabled={updating}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all disabled:opacity-50 ${c.bg} ${c.text}`}>
                      {updating ? (
                        <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : <Check size={11} />}
                      Mark as {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Order[] }>(API.ADMIN.ORDERS.GET_ALL);
      setOrders(res.data.data ?? []);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await api.put(API.ADMIN.ORDERS.UPDATE_STATUS(id), { status });
      toast.success(`Order marked as ${STATUS_CONFIG[status].label}`);
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status } : o));
      if (viewOrder?._id === id) setViewOrder(prev => prev ? { ...prev, status } : null);
    } catch { toast.error("Failed to update status"); }
  };

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o._id.toLowerCase().includes(q) ||
      o.products.some(p => p.product?.name?.toLowerCase().includes(q));
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_FLOW.reduce((acc, s) => {
    acc[s] = orders.filter(o => o.status === s).length;
    return acc;
  }, {} as Record<OrderStatus, number>);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-400 mt-0.5">{orders.length} total orders</p>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {STATUS_FLOW.map(s => {
          const c = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`p-3 rounded-xl border text-left transition-all ${
                statusFilter === s ? `${c.bg} ${c.text} border-opacity-60` : "bg-white border-gray-100 hover:border-gray-200"
              }`}>
              <p className="text-xl font-extrabold text-gray-800">{counts[s] ?? 0}</p>
              <p className={`text-xs font-semibold mt-0.5 ${statusFilter === s ? c.text : "text-gray-400"}`}>{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID or product..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={12} />
            </button>
          )}
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 text-gray-600">
          <option value="ALL">All Status</option>
          {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Items</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded-full animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <ClipboardList size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(order => {
                  const sc = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex -space-x-1">
                            {order.products.slice(0, 3).map((item, i) => (
                              <div key={i} className="w-6 h-6 rounded-md overflow-hidden bg-gray-100 border border-white flex-shrink-0">
                                {item.product?.image ? (
                                  <img src={item.product.image} alt="" className="w-full h-full object-cover"
                                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package size={10} className="text-gray-300" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">
                            {order.products.length} item{order.products.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-700">
                        NPR {order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setViewOrder(order)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {viewOrder && (
        <OrderDetailModal
          order={viewOrder}
          onClose={() => setViewOrder(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
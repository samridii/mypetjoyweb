"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Trash2, Plus, Minus, X, Package,
  ChevronRight, RotateCcw, MapPin, Phone, User,
  CheckCircle, Sparkles, PawPrint, ShoppingBag, Info,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import Image from "next/image";
import { getCart, addToCart, removeFromCart, clearCart, type CartItem } from "@/lib/api/cart.api";
import { placeOrder } from "@/lib/api/orders.api";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface CheckoutForm {
  fullName: string;
  phone: string;
  address: string;
  note: string;
}
const INIT_FORM: CheckoutForm = { fullName: "", phone: "", address: "", note: "" };

// ── Cart item row ─────────────────────────────────────────────────────────────
function CartRow({
  item, index, onRemove, onQtyChange, updating,
}: {
  item: CartItem;
  index: number;
  onRemove: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
  updating: string | null;
}) {
  const [imgErr, setImgErr] = useState(false);
  const p    = item.product;
  const busy = updating === p._id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.35, ease }}
      className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-blue-50 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Product image */}
      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-violet-50 flex-shrink-0 border border-blue-100">
        {p.image && !imgErr ? (
          <img src={p.image} alt={p.name} onError={() => setImgErr(true)}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={24} className="text-blue-200" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-800 text-sm truncate">{p.name}</p>
        <p className="text-[#5b84c4] text-xs font-semibold mt-0.5">
          NPR {p.price.toLocaleString()}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          Subtotal: <span className="font-bold text-gray-600">NPR {(p.price * item.quantity).toLocaleString()}</span>
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-1 bg-blue-50 rounded-xl px-2 py-1.5 border border-blue-100">
        <button
          onClick={() => onQtyChange(p._id, item.quantity - 1)}
          disabled={busy || item.quantity <= 1}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-200 text-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus size={11} />
        </button>
        <span className="text-sm font-bold text-blue-700 w-6 text-center">
          {busy ? (
            <svg className="animate-spin w-3 h-3 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(p._id, item.quantity + 1)}
          disabled={busy}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-200 text-blue-600 transition-colors disabled:opacity-40"
        >
          <Plus size={11} />
        </button>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(p._id)}
        disabled={busy}
        className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all disabled:opacity-40"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  );
}

// ── Checkout form field ───────────────────────────────────────────────────────
function Field({ label, name, value, onChange, error, placeholder, type = "text", icon: Icon, textarea }: {
  label: string; name: keyof CheckoutForm; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string; placeholder?: string; type?: string;
  icon: React.ElementType; textarea?: boolean;
}) {
  const base = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-400 placeholder-gray-400";
  const cls  = error ? `${base} border-red-300 bg-red-50` : `${base} border-slate-200 bg-white hover:border-blue-300`;

  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 mb-1.5">
        {label} {name !== "note" && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <Icon size={13} className="absolute left-3 top-3 text-gray-300 pointer-events-none" />
        {textarea ? (
          <textarea rows={2} placeholder={placeholder} value={value} name={name}
            onChange={onChange} className={`${cls} pl-9 resize-none`} />
        ) : (
          <input type={type} placeholder={placeholder} value={value} name={name}
            onChange={onChange} className={`${cls} pl-9`} />
        )}
      </div>
      {error && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{error}</p>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CartPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [items, setItems]           = useState<CartItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState<string | null>(null);
  const [clearing, setClearing]     = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm]             = useState<CheckoutForm>(INIT_FORM);
  const [errors, setErrors]         = useState<Partial<CheckoutForm>>({});
  const [placing, setPlacing]       = useState(false);
  const [success, setSuccess]       = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const res = await getCart();
      const allItems = res.data.data?.items ?? [];
      setItems(allItems.filter(i => i.product != null));
    } catch {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) { router.push("/login"); return; }
      fetchCart();
    }
  }, [authLoading, isAuthenticated, fetchCart, router]);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, fullName: user.fullName || "", phone: "" }));
  }, [user]);

  const total    = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  const handleRemove = async (productId: string) => {
    setUpdating(productId);
    try {
      const res = await removeFromCart(productId);
      setItems((res.data.data?.items ?? []).filter(i => i.product != null));
      toast.success("Item removed");
    } catch { toast.error("Failed to remove item"); }
    finally { setUpdating(null); }
  };

  const handleQtyChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    setUpdating(productId);
    try {
      const res = await addToCart(productId, newQty);
      setItems((res.data.data?.items ?? []).filter(i => i.product != null));
    } catch { toast.error("Failed to update quantity"); }
    finally { setUpdating(null); }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearCart();
      setItems([]);
      toast.success("Cart cleared");
    } catch { toast.error("Failed to clear cart"); }
    finally { setClearing(false); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e: Partial<CheckoutForm> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim())    e.phone    = "Phone number is required";
    if (!form.address.trim())  e.address  = "Delivery address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    try {
      await placeOrder(
        items.map(i => ({ productId: i.product._id, quantity: i.quantity }))
      );
      await clearCart();
      setItems([]);
      setSuccess(true);
    } catch { toast.error("Failed to place order. Please try again."); }
    finally { setPlacing(false); }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease }}
        className="bg-white rounded-3xl shadow-xl border border-blue-50 p-10 max-w-md w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Order Placed!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your order has been placed successfully via <span className="font-bold text-[#5b84c4]">Cash on Delivery</span>.
        </p>
        <p className="text-gray-400 text-xs mb-8">Our team will contact you at <span className="font-semibold">{form.phone}</span> to confirm delivery.</p>
        <div className="flex gap-3">
          <Link href="/shop" className="flex-1 py-3 rounded-xl border-2 border-blue-100 text-[#5b84c4] font-bold text-sm hover:bg-blue-50 transition-all text-center">
            Continue Shopping
          </Link>
          <Link href="/orders" className="flex-1 py-3 rounded-xl font-bold text-white text-sm shadow-md text-center"
            style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
            My Orders
          </Link>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] pt-14 pb-28">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-300/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}>
            <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-4 py-2 rounded-full mb-5">
              <ShoppingCart size={12} /> Your Cart
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
              {items.length === 0 ? "Cart is Empty" : (
                <><span className="text-yellow-300">{itemCount}</span> {itemCount === 1 ? "Item" : "Items"} in Cart</>
              )}
            </h1>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              {items.length === 0
                ? "Browse our shop and add some products!"
                : "Review your items and place your order with Cash on Delivery."}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20 block">
            <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20 relative z-10">

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-2xl border border-blue-50 animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          // ── Empty state ───────────────────────────────────────────────────
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="bg-white rounded-3xl shadow-sm border border-blue-50 p-16 text-center">
            <motion.div animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
              <ShoppingBag size={36} className="text-blue-300" />
            </motion.div>
            <h3 className="text-xl font-extrabold text-gray-700 mb-2">Your cart is empty</h3>
            <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
              Looks like you haven't added anything yet. Browse our shop for pet products!
            </p>
            <Link href="/products">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white text-sm shadow-lg shadow-blue-200 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                <ShoppingBag size={15} /> Browse Shop
                <ChevronRight size={14} />
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          // ── Cart + summary ────────────────────────────────────────────────
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Cart items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Toolbar */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex items-center justify-between bg-white rounded-2xl border border-blue-50 px-4 py-3 shadow-sm">
                <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <ShoppingCart size={15} className="text-[#5b84c4]" />
                  {items.length} {items.length === 1 ? "product" : "products"}
                </p>
                <button onClick={handleClear} disabled={clearing}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50">
                  {clearing ? (
                    <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : <Trash2 size={12} />}
                  Clear Cart
                </button>
              </motion.div>

              {/* Items */}
              <AnimatePresence>
                {items.map((item, i) => (
                  <CartRow key={item.product._id} item={item} index={i}
                    onRemove={handleRemove} onQtyChange={handleQtyChange} updating={updating} />
                ))}
              </AnimatePresence>

              {/* Continue shopping */}
              <Link href="/shop"
                className="flex items-center gap-2 text-xs font-semibold text-[#5b84c4] hover:text-[#4a73b3] mt-2 transition-colors">
                <RotateCcw size={12} /> Continue Shopping
              </Link>
            </div>

            {/* Order summary */}
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="space-y-4 sticky top-6">

              <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-6">
                <h3 className="font-extrabold text-gray-800 text-base mb-4 flex items-center gap-2">
                  <Package size={16} className="text-[#5b84c4]" /> Order Summary
                </h3>

                <div className="space-y-2.5 mb-4">
                  {items.map(item => (
                    <div key={item.product._id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 truncate flex-1 mr-2">
                        {item.product.name}
                        <span className="text-gray-400 ml-1">×{item.quantity}</span>
                      </span>
                      <span className="font-semibold text-gray-700 flex-shrink-0">
                        NPR {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blue-50 pt-4 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-700">NPR {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Delivery</span>
                    <span className="font-semibold text-emerald-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment</span>
                    <span className="font-semibold text-[#5b84c4]">Cash on Delivery</span>
                  </div>
                </div>

                <div className="border-t border-blue-50 pt-4 mt-2 flex justify-between items-center">
                  <span className="font-extrabold text-gray-800">Total</span>
                  <span className="text-2xl font-black text-[#5b84c4]">NPR {total.toLocaleString()}</span>
                </div>

                {/* COD badge */}
                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-base">💵</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700">Cash on Delivery</p>
                    <p className="text-xs text-amber-600/70">Pay when your order arrives</p>
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowCheckout(true)}
                  className="w-full mt-4 py-3.5 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                  style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                  <ShoppingCart size={15} /> Proceed to Checkout
                  <ChevronRight size={14} />
                </motion.button>
              </div>

              {/* Shop more */}
              <div className="rounded-2xl p-4 text-center"
                style={{ background: "linear-gradient(135deg, #fef9c3, #fef3c7)" }}>
                <PawPrint size={20} className="text-amber-500 mx-auto mb-1" />
                <p className="text-xs font-bold text-amber-700">Looking to adopt?</p>
                <Link href="/pets" className="text-xs text-amber-600 underline">Browse available pets</Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Checkout Modal ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowCheckout(false); }}>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ duration: 0.4, ease }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

              {/* Modal header */}
              <div className="relative bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-6 pb-8 text-center">
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-300/15 rounded-full blur-xl" />
                <button onClick={() => setShowCheckout(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all">
                  <X size={14} />
                </button>
                <ShoppingCart size={32} className="text-yellow-300 mx-auto mb-2" />
                <h2 className="text-xl font-extrabold text-white">Delivery Details</h2>
                <p className="text-blue-200 text-xs mt-1">Cash on Delivery · NPR {total.toLocaleString()}</p>
                <div className="absolute bottom-0 left-0 right-0">
                  <svg viewBox="0 0 500 20" preserveAspectRatio="none" className="w-full h-5">
                    <path d="M0,20 C125,0 375,0 500,20 L500,20 L0,20 Z" fill="white" />
                  </svg>
                </div>
              </div>

              <form onSubmit={handlePlaceOrder} className="p-6 pt-3 space-y-3">
                <Field label="Full Name"        name="fullName" value={form.fullName}
                  onChange={handleFormChange} error={errors.fullName}
                  placeholder="Your full name" icon={User} />
                <Field label="Phone Number"     name="phone"    value={form.phone}
                  onChange={handleFormChange} error={errors.phone}
                  placeholder="+977 98XXXXXXXX" type="tel" icon={Phone} />
                <Field label="Delivery Address" name="address"  value={form.address}
                  onChange={handleFormChange} error={errors.address}
                  placeholder="Your full delivery address" icon={MapPin} />
                <Field label="Order Note (optional)" name="note" value={form.note}
                  onChange={handleFormChange} placeholder="Any special instructions..."
                  icon={Info} textarea />

                {/* Order mini-summary */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{itemCount} items</span>
                    <span className="font-bold text-[#5b84c4]">NPR {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Payment method</span>
                    <span className="font-semibold text-amber-600">Cash on Delivery</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-100 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={placing}
                    whileHover={{ scale: placing ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl font-extrabold text-white text-sm shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                    {placing ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>Placing...</>
                    ) : (
                      <><CheckCircle size={15}/> Place Order</>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
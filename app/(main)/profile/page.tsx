"use client";
// app/(main)/profile/page.tsx
// Soft theme · Fredoka · framer-motion · Lucide icons · no emojis

import { useState, useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff,
  Save, Shield, CheckCircle, Camera, PawPrint, ChevronRight,
  Package, LogOut, Star,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { updateProfileAction, changePasswordAction } from "@/lib/actions/user-action";
import { clientSetUserData, clientClearAuthCookies } from "@/lib/cookie";
import { getMyOrders, type Order } from "@/lib/api/orders.api";

type Tab = "profile" | "password" | "activity";

const ease = [0.22, 1, 0.36, 1] as const;
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
};
const tabContent: Variants = {
  hidden:  { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.35, ease } },
  exit:    { opacity: 0, x: -12, transition: { duration: 0.2 } },
};

// ── Shared input ────────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, type = "text", value, onChange, placeholder, readOnly = false,
  rightEl,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  rightEl?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200
        ${readOnly
          ? "bg-gray-50 border-gray-100 cursor-not-allowed"
          : "bg-white border-gray-200 hover:border-blue-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-orange-100 shadow-sm"}`}>
        <Icon size={16} className={readOnly ? "text-gray-300" : "text-orange-400"} />
        <input
          type={type}
          value={value}
          readOnly={readOnly}
          onChange={e => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-700 outline-none placeholder-gray-300 font-medium"
        />
        {rightEl}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email:    user?.email    || "",
    mobile:   user?.mobile   || "",
    location: user?.location || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [savingProfile, setSavingProfile]   = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [recentOrders, setRecentOrders]     = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading]   = useState(false);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        email:    user.email    || "",
        mobile:   user.mobile   || "",
        location: user.location || "",
      });
    }
  }, [user]);

  // Load recent orders for activity tab
  useEffect(() => {
    if (tab === "activity") {
      setOrdersLoading(true);
      getMyOrders()
        .then(r => setRecentOrders(r.data.data.slice(0, 3)))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    }
  }, [tab]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullName.trim()) { toast.error("Full name is required"); return; }
    if (!/\S+@\S+\.\S+/.test(profileForm.email)) { toast.error("Enter a valid email"); return; }
    setSavingProfile(true);
    const result = await updateProfileAction(profileForm);
    if (result.success) {
      toast.success("Profile updated successfully!");
      const updated = { ...user!, ...profileForm };
      setUser(updated);
      clientSetUserData(updated);
    } else {
      toast.error(result.message || "Update failed");
    }
    setSavingProfile(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword)           { toast.error("Current password is required"); return; }
    if (passwordForm.newPassword.length < 8)     { toast.error("New password must be at least 8 characters"); return; }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match"); return;
    }
    setSavingPassword(true);
    const result = await changePasswordAction({
      currentPassword: passwordForm.currentPassword,
      newPassword:     passwordForm.newPassword,
    });
    if (result.success) {
      toast.success("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.message || "Failed to change password");
    }
    setSavingPassword(false);
  };

  const tabs: { key: Tab; label: string; Icon: React.ElementType }[] = [
    { key: "profile",  label: "Edit Profile",     Icon: User    },
    { key: "password", label: "Change Password",  Icon: Shield  },
    { key: "activity", label: "My Activity",      Icon: Package },
  ];

  const initials = user?.fullName
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "U";

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50/40 to-violet-50/30 font-fredoka">

      {/* ── Background blobs ─────────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-200/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Hero card ──────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="relative overflow-hidden rounded-3xl mb-8
            bg-gradient-to-br from-blue-500 via-purple-500 to-blue-500
            shadow-2xl shadow-orange-200/60"
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full" />
          <div className="absolute top-8 right-32 w-20 h-20 bg-white/10 rounded-full" />

          <div className="relative z-10 p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/25
                flex items-center justify-center text-3xl font-bold text-white
                border-2 border-white/40 shadow-lg backdrop-blur-sm">
                {initials}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-xl
                bg-white flex items-center justify-center shadow-md">
                <Camera size={13} className="text-blue-500" />
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{user?.fullName ?? "User"}</h1>
              <p className="text-orange-100 text-sm mb-3">{user?.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5
                  rounded-xl border ${isAdmin
                    ? "bg-violet-500/30 text-white border-violet-300/40"
                    : "bg-white/20 text-white border-white/30"}`}>
                  {isAdmin ? <Shield size={11} /> : <Star size={11} />}
                  {isAdmin ? "Admin" : "Member"}
                </span>
                {user?.location && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                    rounded-xl bg-white/20 text-white border border-white/30">
                    <MapPin size={11} />
                    {user.location}
                  </span>
                )}
                {user?.mobile && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                    rounded-xl bg-white/20 text-white border border-white/30">
                    <Phone size={11} />
                    {user.mobile}
                  </span>
                )}
              </div>
            </div>

            {/* Quick links */}
            <div className="flex sm:flex-col gap-2 sm:gap-2 flex-shrink-0">
              <Link href="/orders"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/20
                  hover:bg-white/30 text-white text-sm font-semibold border border-white/30
                  transition-all backdrop-blur-sm">
                <Package size={14} />
                <span className="hidden sm:block">My Orders</span>
              </Link>
              <button
                onClick={() => { clientClearAuthCookies(); logout(); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10
                  hover:bg-red-500/30 text-white text-sm font-semibold border border-white/20
                  transition-all backdrop-blur-sm">
                <LogOut size={14} />
                <span className="hidden sm:block">Sign Out</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[260px_1fr] gap-6">

          {/* Sidebar tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="space-y-2"
          >
            {tabs.map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl
                  text-sm font-semibold transition-all duration-200 group
                  ${tab === key
                    ? "bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-gray-500 hover:bg-blue50 hover:text-blue-600 border border-gray-100 shadow-sm"}`}>
                <Icon size={16} className={tab === key ? "text-white" : "text-gray-400 group-hover:text-orange-500"} />
                {label}
                {tab === key && <ChevronRight size={14} className="ml-auto text-white/70" />}
              </button>
            ))}

            {/* Info card */}
            <div className="mt-4 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <PawPrint size={14} className="text-orange-400" />
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Account Info</span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-400 font-medium">
                <div className="flex justify-between">
                  <span>Role</span>
                  <span className={isAdmin ? "text-violet-500" : "text-orange-500"}>
                    {isAdmin ? "Administrator" : "Pet Lover"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle size={10} /> Active
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} variants={tabContent}
              initial="hidden" animate="visible" exit="exit">

              {/* ── PROFILE TAB ─────────────────────────────────────────── */}
              {tab === "profile" && (
                <form onSubmit={handleProfileSave}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                      <User size={16} className="text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800">Personal Information</h2>
                      <p className="text-xs text-gray-400 font-normal">Update your profile details</p>
                    </div>
                  </div>
                  <div className="p-7 grid sm:grid-cols-2 gap-5">
                    <Field label="Full Name" icon={User}
                      value={profileForm.fullName}
                      onChange={v => setProfileForm(p => ({ ...p, fullName: v }))}
                      placeholder="Your full name" />
                    <Field label="Email Address" icon={Mail} type="email"
                      value={profileForm.email}
                      onChange={v => setProfileForm(p => ({ ...p, email: v }))}
                      placeholder="you@example.com" />
                    <Field label="Phone / Mobile" icon={Phone}
                      value={profileForm.mobile}
                      onChange={v => setProfileForm(p => ({ ...p, mobile: v }))}
                      placeholder="+977 98XXXXXXXX" />
                    <Field label="Location" icon={MapPin}
                      value={profileForm.location}
                      onChange={v => setProfileForm(p => ({ ...p, location: v }))}
                      placeholder="Kathmandu, Nepal" />
                  </div>
                  <div className="px-7 pb-7">
                    <button type="submit" disabled={savingProfile}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                        bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600
                        text-white font-bold text-sm transition-all shadow-lg shadow-orange-200
                        hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                      {savingProfile ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                      ) : (
                        <><Save size={16} />Save Changes</>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ── PASSWORD TAB ────────────────────────────────────────── */}
              {tab === "password" && (
                <form onSubmit={handlePasswordSave}
                  className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                      <Shield size={16} className="text-violet-500" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-800">Change Password</h2>
                      <p className="text-xs text-gray-400 font-normal">Keep your account secure</p>
                    </div>
                  </div>
                  <div className="p-7 space-y-5">
                    {([ 
                      { label:"Current Password",  key:"current", field:"currentPassword" },
                      { label:"New Password",       key:"new",     field:"newPassword"     },
                      { label:"Confirm New Password", key:"confirm", field:"confirmPassword" },
                    ] as const).map(f => (
                      <Field key={f.field} label={f.label} icon={Lock}
                        type={showPw[f.key] ? "text" : "password"}
                        value={passwordForm[f.field]}
                        onChange={v => setPasswordForm(p => ({ ...p, [f.field]: v }))}
                        placeholder="••••••••"
                        rightEl={
                          <button type="button" tabIndex={-1}
                            onClick={() => setShowPw(p => ({ ...p, [f.key]: !p[f.key] }))}
                            className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0">
                            {showPw[f.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        }
                      />
                    ))}

                    {/* Password strength hint */}
                    {passwordForm.newPassword.length > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${
                            passwordForm.newPassword.length < 6  ? "w-1/4 bg-rose-400" :
                            passwordForm.newPassword.length < 10 ? "w-1/2 bg-amber-400" :
                            "w-full bg-emerald-400"}`} />
                        </div>
                        <span className={`text-xs font-semibold ${
                          passwordForm.newPassword.length < 6  ? "text-rose-400" :
                          passwordForm.newPassword.length < 10 ? "text-amber-500" :
                          "text-emerald-500"}`}>
                          {passwordForm.newPassword.length < 6  ? "Weak" :
                           passwordForm.newPassword.length < 10 ? "Good" : "Strong"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-7 pb-7">
                    <button type="submit" disabled={savingPassword}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl
                        bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600
                        text-white font-bold text-sm transition-all shadow-lg shadow-violet-200
                        hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed">
                      {savingPassword ? (
                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Updating…</>
                      ) : (
                        <><Shield size={16} />Update Password</>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ── ACTIVITY TAB ────────────────────────────────────────── */}
              {tab === "activity" && (
                <div className="space-y-5">
                  {/* Recent orders */}
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                          <Package size={16} className="text-amber-500" />
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-gray-800">Recent Orders</h2>
                          <p className="text-xs text-gray-400 font-normal">Your last 3 purchases</p>
                        </div>
                      </div>
                      <Link href="/orders"
                        className="text-xs font-semibold text-orange-500 hover:text-orange-600
                          flex items-center gap-1 transition-colors">
                        View all <ChevronRight size={12} />
                      </Link>
                    </div>
                    <div className="p-7">
                      {ordersLoading ? (
                        <div className="flex justify-center py-8">
                          <span className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                        </div>
                      ) : recentOrders.length === 0 ? (
                        <div className="text-center py-10">
                          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                            <Package size={22} className="text-gray-300" />
                          </div>
                          <p className="text-sm text-gray-400 font-medium">No orders yet</p>
                          <Link href="/shop"
                            className="mt-3 inline-flex items-center gap-1 text-xs text-orange-500
                              hover:text-orange-600 font-semibold">
                            Browse the shop <ChevronRight size={11} />
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {recentOrders.map(order => (
                            <div key={order._id}
                              className="flex items-center justify-between p-4 rounded-2xl
                                bg-gray-50 border border-gray-100 hover:border-orange-200 transition-all">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-100
                                  flex items-center justify-center flex-shrink-0">
                                  <Package size={16} className="text-orange-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-700">
                                    Order #{order._id.slice(-6).toUpperCase()}
                                  </p>
                                  <p className="text-xs text-gray-400 font-normal">
                                    {new Date(order.createdAt).toLocaleDateString("en-US",
                                      { month:"short", day:"numeric", year:"numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">
                                  NPR {order.totalAmount.toLocaleString()}
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-600" :
                                  order.status === "SHIPPED"   ? "bg-blue-100 text-blue-600"     :
                                  order.status === "PAID"      ? "bg-violet-100 text-violet-600" :
                                  order.status === "CANCELLED" ? "bg-rose-100 text-rose-600"     :
                                  "bg-amber-100 text-amber-600"}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick links */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { href:"/pets",  Icon:PawPrint, label:"Browse Pets",  sub:"Find your next companion", color:"from-rose-400 to-pink-500",   bg:"bg-rose-50",   ic:"text-rose-500"   },
                      { href:"/products",  Icon:Package,  label:"Visit Shop",   sub:"Get supplies for your pet", color:"from-amber-400 to-orange-500", bg:"bg-amber-50",  ic:"text-amber-500"  },
                    ].map(item => (
                      <Link key={item.href} href={item.href}
                        className="group bg-white rounded-2xl p-5 border border-gray-100
                          shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3
                          group-hover:scale-110 transition-transform`}>
                          <item.Icon size={18} className={item.ic} />
                        </div>
                        <p className="text-sm font-bold text-gray-800">{item.label}</p>
                        <p className="text-xs text-gray-400 font-normal mt-0.5">{item.sub}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
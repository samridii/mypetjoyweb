"use client";

import { useState, useEffect } from "react";
import {
  Search, X, Users, Trash2, Eye,
  User, Mail, Phone, MapPin, Shield, Check,
} from "lucide-react";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";
import type { UserProfile } from "@/lib/api/user.api";
import toast from "react-hot-toast";

function UserModal({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">

        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">User Details</h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5b84c4] to-[#4a73b3] flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-extrabold text-white">
                {user.fullName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-base">{user.fullName}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                user.role === "admin"
                  ? "bg-violet-50 border border-violet-200 text-violet-600"
                  : "bg-blue-50 border border-blue-200 text-blue-600"
              }`}>
                {user.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                {user.role}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            {[
              { icon: Mail,   label: "Email",    value: user.email             },
              { icon: Phone,  label: "Phone",    value: user.mobile   || "—"  },
              { icon: MapPin, label: "Location", value: user.location || "—"  },
              { icon: User,   label: "User ID",  value: user.id               },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2.5">
                <f.icon size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-gray-400">{f.label}: </span>
                  <span className="text-xs font-semibold text-gray-700 break-all">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({ name, onConfirm, onCancel, deleting }: {
  name: string; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="font-bold text-gray-800 mb-1">Delete {name}?</h3>
        <p className="text-sm text-gray-400 mb-5">This will permanently remove the user account.</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting && (
              <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [viewUser, setViewUser]     = useState<UserProfile | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [deleting, setDeleting]     = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: UserProfile[] } | UserProfile[]>(API.ADMIN.USERS.GET_ALL);
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data ?? [];
      setUsers(data);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    try {
      await api.delete(API.ADMIN.USERS.DELETE(deleteUser.id));
      toast.success("User deleted");
      setDeleteUser(null);
      setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
    } catch { toast.error("Failed to delete user"); }
    finally { setDeleting(false); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q);
    const matchRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === "admin").length;
  const userCount  = users.filter(u => u.role === "user").length;

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">{users.length} total accounts</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Total Users",  value: users.length,  filter: "ALL",   icon: Users,  bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-200"   },
          { label: "Regular Users",value: userCount,     filter: "user",  icon: User,   bg: "bg-gray-50",   text: "text-gray-600",   border: "border-gray-200"   },
          { label: "Admins",       value: adminCount,    filter: "admin", icon: Shield, bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
        ].map(c => (
          <button key={c.filter} onClick={() => setRoleFilter(roleFilter === c.filter ? "ALL" : c.filter)}
            className={`p-4 rounded-xl border text-left transition-all ${
              roleFilter === c.filter ? `${c.bg} ${c.border}` : "bg-white border-gray-100 hover:border-gray-200"
            }`}>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-extrabold text-gray-800">{c.value}</p>
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon size={15} className={c.text} />
              </div>
            </div>
            <p className={`text-xs font-semibold mt-1 ${roleFilter === c.filter ? c.text : "text-gray-400"}`}>
              {c.label}
            </p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={12} />
            </button>
          )}
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 text-gray-600">
          <option value="ALL">All Roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded-full animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No users found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    {/* Avatar and name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5b84c4] to-[#4a73b3] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-extrabold text-white">
                            {user.fullName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{user.fullName}</p>
                          <p className="text-xs text-gray-400 font-mono">#{user.id?.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-400">{user.mobile || "—"}</p>
                    </td>
                    {/* Location */}
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.location || "—"}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        user.role === "admin"
                          ? "bg-violet-50 border-violet-200 text-violet-600"
                          : "bg-blue-50 border-blue-200 text-blue-500"
                      }`}>
                        {user.role === "admin" ? <Shield size={10} /> : <User size={10} />}
                        {user.role}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setViewUser(user)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                          <Eye size={13} />
                        </button>
                        {user.role !== "admin" && (
                          <button onClick={() => setDeleteUser(user)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {viewUser   && <UserModal   user={viewUser}   onClose={() => setViewUser(null)} />}
      {deleteUser && (
        <DeleteConfirm name={deleteUser.fullName} onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)} deleting={deleting} />
      )}
    </div>
  );
}
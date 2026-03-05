// app/admin/adoptions/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X, Heart, Check, Eye, User, Phone, MapPin, Home, Info } from "lucide-react";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";
import type { Adoption, AdoptionStatus } from "@/lib/api/adoptions.api";
import toast from "react-hot-toast";

// ── config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<AdoptionStatus, { label: string; dot: string; text: string; bg: string }> = {
  PENDING:  { label: "Pending",  dot: "bg-amber-400",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"   },
  APPROVED: { label: "Approved", dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200"},
  REJECTED: { label: "Rejected", dot: "bg-red-400",     text: "text-red-600",     bg: "bg-red-50 border-red-200"       },
};

// ── Detail modal ──────────────────────────────────────────────────────────────
function AdoptionModal({ adoption, onClose, onStatusChange }: {
  adoption: Adoption;
  onClose: () => void;
  onStatusChange: (id: string, status: AdoptionStatus) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const sc = STATUS_CONFIG[adoption.status];

  const handle = async (status: AdoptionStatus) => {
    setUpdating(true);
    await onStatusChange(adoption._id, status);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-base">Adoption Request</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">#{adoption._id.slice(-8).toUpperCase()}</p>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>

        <div className="p-5 space-y-4">

          {/* Status + date */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-full border ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(adoption.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Applicant info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Applicant</p>
            {[
              { icon: User,   label: "Name",    value: adoption.fullName },
              { icon: Info,   label: "Email",   value: adoption.email    },
              { icon: Phone,  label: "Phone",   value: adoption.phone    },
              { icon: MapPin, label: "Address", value: adoption.address  },
            ].map(f => (
              <div key={f.label} className="flex items-start gap-2.5">
                <f.icon size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs text-gray-400">{f.label}: </span>
                  <span className="text-xs font-semibold text-gray-700">{f.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Living situation */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Living Situation</p>
            <div className="flex items-center gap-2">
              <Home size={13} className="text-amber-400" />
              <span className="text-xs text-gray-500">Type: </span>
              <span className="text-xs font-semibold text-gray-700 capitalize">{adoption.livingType}</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={13} className="text-amber-400" />
              <span className="text-xs text-gray-500">Other pets: </span>
              <span className="text-xs font-semibold text-gray-700">{adoption.hasOtherPets ? "Yes" : "No"}</span>
            </div>
          </div>

          {/* Experience & reason */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Experience</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">
                {adoption.experience}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Reason for Adoption</p>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 border border-gray-100 leading-relaxed">
                {adoption.reason}
              </p>
            </div>
          </div>

          {/* Actions */}
          {adoption.status === "PENDING" && (
            <div className="flex gap-3 pt-1">
              <button onClick={() => handle("REJECTED")} disabled={updating}
                className="flex-1 py-2.5 rounded-xl border-2 border-red-200 text-red-500 font-bold text-sm hover:bg-red-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                {updating ? (
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : <X size={13} />}
                Reject
              </button>
              <button onClick={() => handle("APPROVED")} disabled={updating}
                className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                {updating ? (
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                ) : <Check size={13} />}
                Approve
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminAdoptionsPage() {
  const [adoptions, setAdoptions] = useState<Adoption[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [viewAdoption, setViewAdoption] = useState<Adoption | null>(null);

  const fetchAdoptions = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Adoption[] }>(API.ADMIN.ADOPTIONS.GET_ALL);
      setAdoptions(res.data.data ?? []);
    } catch { toast.error("Failed to load adoptions"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAdoptions(); }, []);

  const handleStatusChange = async (id: string, status: AdoptionStatus) => {
    try {
      await api.put(API.ADMIN.ADOPTIONS.UPDATE_STATUS(id), { status });
      toast.success(`Request ${STATUS_CONFIG[status].label}`);
      setAdoptions(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      if (viewAdoption?._id === id) setViewAdoption(prev => prev ? { ...prev, status } : null);
    } catch { toast.error("Failed to update status"); }
  };

  const filtered = adoptions.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a._id.toLowerCase().includes(q);
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    PENDING:  adoptions.filter(a => a.status === "PENDING").length,
    APPROVED: adoptions.filter(a => a.status === "APPROVED").length,
    REJECTED: adoptions.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">Adoptions</h1>
        <p className="text-sm text-gray-400 mt-0.5">{adoptions.length} total requests</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {(["PENDING", "APPROVED", "REJECTED"] as AdoptionStatus[]).map(s => {
          const c = STATUS_CONFIG[s];
          return (
            <button key={s} onClick={() => setStatusFilter(statusFilter === s ? "ALL" : s)}
              className={`p-4 rounded-xl border text-left transition-all ${
                statusFilter === s ? `${c.bg} ${c.text}` : "bg-white border-gray-100 hover:border-gray-200"
              }`}>
              <p className="text-2xl font-extrabold text-gray-800">{counts[s]}</p>
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
            placeholder="Search by name or email..."
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
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Applicant</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Living</th>
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
                    <Heart size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No adoption requests found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(adoption => {
                  const sc = STATUS_CONFIG[adoption.status];
                  return (
                    <tr key={adoption._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-[#5b84c4]">
                              {adoption.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{adoption.fullName}</p>
                            <p className="text-xs text-gray-400 font-mono">#{adoption._id.slice(-6).toUpperCase()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600">{adoption.email}</p>
                        <p className="text-xs text-gray-400">{adoption.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-600 capitalize">{adoption.livingType}</p>
                        <p className="text-xs text-gray-400">{adoption.hasOtherPets ? "Has pets" : "No pets"}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(adoption.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setViewAdoption(adoption)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <Eye size={13} />
                          </button>
                          {adoption.status === "PENDING" && (
                            <>
                              <button onClick={() => handleStatusChange(adoption._id, "APPROVED")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-50 text-gray-400 hover:text-emerald-500 transition-colors">
                                <Check size={13} />
                              </button>
                              <button onClick={() => handleStatusChange(adoption._id, "REJECTED")}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                <X size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {viewAdoption && (
        <AdoptionModal
          adoption={viewAdoption}
          onClose={() => setViewAdoption(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
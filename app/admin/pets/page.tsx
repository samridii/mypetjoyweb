// app/admin/pets/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Pencil, Trash2, Search, X, PawPrint,
  Dog, Cat, Bird, Fish, Check, ChevronDown, Info,
} from "lucide-react";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";
import type { Pet } from "@/lib/api/pets.api";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PENDING:   { label: "Pending",   dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
  ADOPTED:   { label: "Adopted",   dot: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-50 border-slate-200"     },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  dog: Dog, cat: Cat, bird: Bird, fish: Fish,
};

const EMPTY_FORM = {
  name: "", type: "dog", breed: "", age: "",
  description: "", image: "", status: "AVAILABLE",
  yearlyFoodCost: "", yearlyMedicalCost: "",
  yearlyGroomingCost: "", averageLifespan: "",
};

type FormData = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormData, string>>;

// ── Pet Modal ─────────────────────────────────────────────────────────────────
function PetModal({
  pet, onClose, onSaved,
}: {
  pet: Pet | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm]       = useState<FormData>(
    pet ? {
      name: pet.name, type: pet.type, breed: pet.breed,
      age: String(pet.age), description: pet.description,
      image: pet.image ?? "", status: pet.status,
      yearlyFoodCost:    String(pet.yearlyFoodCost    ?? ""),
      yearlyMedicalCost: String(pet.yearlyMedicalCost ?? ""),
      yearlyGroomingCost:String(pet.yearlyGroomingCost?? ""),
      averageLifespan:   String(pet.averageLifespan   ?? ""),
    } : { ...EMPTY_FORM }
  );
  const [errors, setErrors]   = useState<FormErrors>({});
  const [saving, setSaving]   = useState(false);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }));
      setErrors(p => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim())        e.name  = "Required";
    if (!form.breed.trim())       e.breed = "Required";
    if (!form.age || isNaN(Number(form.age))) e.age = "Valid age required";
    if (!form.description.trim()) e.description = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name, type: form.type, breed: form.breed,
      age: Number(form.age), description: form.description,
      image: form.image, status: form.status,
      yearlyFoodCost:     form.yearlyFoodCost     ? Number(form.yearlyFoodCost)     : undefined,
      yearlyMedicalCost:  form.yearlyMedicalCost  ? Number(form.yearlyMedicalCost)  : undefined,
      yearlyGroomingCost: form.yearlyGroomingCost ? Number(form.yearlyGroomingCost) : undefined,
      averageLifespan:    form.averageLifespan     ? Number(form.averageLifespan)    : undefined,
    };
    try {
      if (pet) {
        await api.put(API.ADMIN.PETS.UPDATE(pet._id), payload);
        toast.success("Pet updated");
      } else {
        await api.post(API.ADMIN.PETS.CREATE, payload);
        toast.success("Pet created");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save pet");
    } finally {
      setSaving(false);
    }
  };

  const inp = (err?: string) =>
    `w-full px-3 py-2 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-300 ${
      err ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-blue-300"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">
            {pet ? "Edit Pet" : "Add New Pet"}
          </h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Name <span className="text-red-400">*</span></label>
              <input value={form.name} onChange={set("name")} placeholder="e.g. Buddy" className={inp(errors.name)} />
              {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={set("type")} className={inp()}>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="fish">Fish</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Breed <span className="text-red-400">*</span></label>
              <input value={form.breed} onChange={set("breed")} placeholder="e.g. Labrador" className={inp(errors.breed)} />
              {errors.breed && <p className="text-xs text-red-400 mt-0.5">{errors.breed}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Age (years) <span className="text-red-400">*</span></label>
              <input type="number" min="0" value={form.age} onChange={set("age")} placeholder="e.g. 2" className={inp(errors.age)} />
              {errors.age && <p className="text-xs text-red-400 mt-0.5">{errors.age}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select value={form.status} onChange={set("status")} className={inp()}>
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending</option>
              <option value="ADOPTED">Adopted</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Description <span className="text-red-400">*</span></label>
            <textarea rows={3} value={form.description} onChange={set("description")}
              placeholder="Describe the pet..." className={`${inp(errors.description)} resize-none`} />
            {errors.description && <p className="text-xs text-red-400 mt-0.5">{errors.description}</p>}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
            <input value={form.image} onChange={set("image")} placeholder="https://... or /pets/pet1.png" className={inp()} />
          </div>

          {/* Cost fields */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cost Info (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "yearlyFoodCost",     label: "Yearly Food Cost"     },
                { key: "yearlyMedicalCost",  label: "Yearly Medical Cost"  },
                { key: "yearlyGroomingCost", label: "Yearly Grooming Cost" },
                { key: "averageLifespan",    label: "Average Lifespan (yrs)"},
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{f.label}</label>
                  <input type="number" min="0"
                    value={form[f.key as keyof FormData]}
                    onChange={set(f.key as keyof FormData)}
                    placeholder="0" className={inp()} />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-60 transition-all flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Check size={14} />}
              {pet ? "Save Changes" : "Create Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete confirm ────────────────────────────────────────────────────────────
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
        <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm bg-red-500 hover:bg-red-600 disabled:opacity-60 flex items-center justify-center gap-2">
            {deleting && <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminPetsPage() {
  const [pets, setPets]         = useState<Pet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType]     = useState("ALL");
  const [modalPet, setModalPet] = useState<Pet | null | undefined>(undefined); // undefined = closed
  const [deletePet, setDeletePet] = useState<Pet | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Pet[] }>(API.ADMIN.PETS.GET_ALL);
      setPets(res.data.data ?? []);
    } catch { toast.error("Failed to load pets"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPets(); }, []);

  const handleDelete = async () => {
    if (!deletePet) return;
    setDeleting(true);
    try {
      await api.delete(API.ADMIN.PETS.DELETE(deletePet._id));
      toast.success("Pet deleted");
      setDeletePet(null);
      fetchPets();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const filtered = pets.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q);
    const matchStatus = filterStatus === "ALL" || p.status === filterStatus;
    const matchType   = filterType   === "ALL" || p.type.toLowerCase() === filterType.toLowerCase();
    return matchSearch && matchStatus && matchType;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Pets</h1>
          <p className="text-sm text-gray-400 mt-0.5">{pets.length} total pets</p>
        </div>
        <button onClick={() => setModalPet(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
          <Plus size={15} /> Add Pet
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or breed..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X size={12}/></button>}
        </div>

        {/* Status filter */}
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 text-gray-600">
          <option value="ALL">All Status</option>
          <option value="AVAILABLE">Available</option>
          <option value="PENDING">Pending</option>
          <option value="ADOPTED">Adopted</option>
        </select>

        {/* Type filter */}
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 text-gray-600">
          <option value="ALL">All Types</option>
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
          <option value="bird">Bird</option>
          <option value="fish">Fish</option>
          <option value="other">Other</option>
        </select>

        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Pet</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Breed</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Age</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
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
                    <PawPrint size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No pets found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(pet => {
                  const sc   = STATUS_CONFIG[pet.status];
                  const Icon = TYPE_ICONS[pet.type?.toLowerCase()] ?? PawPrint;
                  return (
                    <tr key={pet._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Pet name + image */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-blue-50 flex-shrink-0 border border-blue-100">
                            {pet.image ? (
                              <img src={pet.image} alt={pet.name}
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Icon size={16} className="text-blue-300" />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800">{pet.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-gray-600 capitalize">
                          <Icon size={13} className="text-gray-400" />
                          {pet.type}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{pet.breed}</td>
                      <td className="px-4 py-3 text-gray-500">{pet.age} yr{pet.age !== 1 ? "s" : ""}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setModalPet(pet)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeletePet(pet)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13} />
                          </button>
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

      {/* Modals */}
      {modalPet !== undefined && (
        <PetModal pet={modalPet} onClose={() => setModalPet(undefined)} onSaved={fetchPets} />
      )}
      {deletePet && (
        <DeleteConfirm name={deletePet.name} onConfirm={handleDelete}
          onCancel={() => setDeletePet(null)} deleting={deleting} />
      )}
    </div>
  );
}
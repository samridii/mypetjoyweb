"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, X, PawPrint, Dog, Cat, Bird, Fish,
  ChevronLeft, ChevronRight, Sparkles, Heart, Calendar, Tag,
} from "lucide-react";
import { getAllPets, type Pet } from "@/lib/api/pets.api";
import Link from "next/link";
import toast from "react-hot-toast";

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType; gradient: string; iconColor: string; bgColor: string;
}> = {
  dog:  { icon: Dog,     gradient: "from-amber-100 to-orange-100",  iconColor: "text-amber-500",  bgColor: "bg-amber-50"  },
  cat:  { icon: Cat,     gradient: "from-rose-100 to-pink-100",     iconColor: "text-rose-500",   bgColor: "bg-rose-50"   },
  bird: { icon: Bird,    gradient: "from-sky-100 to-blue-100",      iconColor: "text-sky-500",    bgColor: "bg-sky-50"    },
  fish: { icon: Fish,    gradient: "from-cyan-100 to-teal-100",     iconColor: "text-cyan-500",   bgColor: "bg-cyan-50"   },
  other:{ icon: PawPrint,gradient: "from-violet-100 to-purple-100", iconColor: "text-violet-500", bgColor: "bg-violet-50" },
};
function getCatConfig(type?: string) {
  return CATEGORY_CONFIG[type?.toLowerCase() ?? "other"] ?? CATEGORY_CONFIG.other;
}

const PET_IMAGES: Record<string, string[]> = {
  dog:  ["/pets/pet1.png", "/pets/pet2.png"],
  cat:  ["/pets/pet1.png", "/pets/pet2.png"],
  bird: ["/pets/pet1.png", "/pets/pet2.png"],
  fish: ["/pets/pet1.png", "/pets/pet2.png"],
  other:["/pets/pet1.png", "/pets/pet2.png"],
};
function petImg(pet: Pet, idx: number): string {
  if (pet.image) return pet.image;
  const pool = PET_IMAGES[pet.type?.toLowerCase()] ?? PET_IMAGES.other;
  return pool[idx % pool.length];
}

const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PENDING:   { label: "Pending",   dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
  ADOPTED:   { label: "Adopted",   dot: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-50 border-slate-200"     },
};

const CATEGORIES = ["All", "Dog", "Cat", "Bird", "Fish"];
const STATUSES   = ["All", "AVAILABLE", "PENDING", "ADOPTED"];
const PER_PAGE   = 9;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function PetCard({ pet, index }: { pet: Pet; index: number }) {
  const [imgErr, setImgErr] = useState(false);
  const cfg = getCatConfig(pet.type);
  const Icon = cfg.icon;
  const sc = STATUS_CONFIG[pet.status] ?? STATUS_CONFIG.AVAILABLE;
  const src = petImg(pet, index);
  const isAvail = pet.status === "AVAILABLE";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.4, ease, delay: (index % PER_PAGE) * 0.05 }}
      layout
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-100/60 border border-blue-50 overflow-hidden flex flex-col transition-shadow duration-300"
    >
      <div className={`relative h-52 bg-gradient-to-br ${cfg.gradient} overflow-hidden flex-shrink-0`}>
        {!imgErr ? (
          <img src={src} alt={pet.name} onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={64} className={`${cfg.iconColor} opacity-40`} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="w-full h-6 block">
            <path d="M0,24 C100,0 300,0 400,24 L400,24 L0,24 Z" fill="white" />
          </svg>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${sc.bg} ${sc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
          </span>
        </div>
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 ${cfg.bgColor} text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.iconColor} border border-white/60 shadow-sm`}>
            <Icon size={11} />{pet.type}
          </span>
        </div>
        {!isAvail && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-800/80 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
              {pet.status === "ADOPTED" ? "Already Adopted" : "Pending"}
            </span>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-1 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-base leading-snug mb-0.5 group-hover:text-blue-600 transition-colors">{pet.name}</h3>
        <p className="text-[#a78bca] text-xs font-semibold mb-2">{pet.breed}</p>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3 flex-1">{pet.description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1"><Calendar size={11} className="text-blue-300" />{pet.age} {pet.age === 1 ? "yr" : "yrs"}</span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="flex items-center gap-1"><Tag size={11} className="text-[#a78bca]" />{pet.breed}</span>
        </div>
        <Link href={`/pets/${pet._id}`}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              isAvail
                ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] hover:from-[#4a73b3] hover:to-[#3d5f9a] text-white shadow-md shadow-blue-200"
                : "bg-gray-100 text-gray-400 cursor-default pointer-events-none"
            }`}>
            <PawPrint size={12} />{isAvail ? `Adopt ${pet.name}` : "View Details"}
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl border border-blue-50 overflow-hidden animate-pulse">
      <div className="h-52 bg-gradient-to-br from-blue-50 to-violet-50" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-2/3" />
        <div className="h-3 bg-violet-50 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full" />
        <div className="h-9 bg-blue-50 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function PetsPage() {
  const [pets, setPets]         = useState<Pet[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus]     = useState("All");
  const [page, setPage]         = useState(1);

 useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllPets();
        setPets(res.data.data ?? []);
      } catch {
        toast.error("Failed to load pets");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => { setPage(1); }, [search, category, status]);

  const filtered = useMemo(() => pets.filter(p => {
    const matchCat    = category === "All" || p.type?.toLowerCase() === category.toLowerCase();
    const matchStatus = status   === "All" || p.status === status;
    const q           = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q);
    return matchCat && matchStatus && matchSearch;
  }), [pets, category, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    All: pets.length,
    Dog: pets.filter(p => p.type?.toLowerCase() === "dog").length,
    Cat: pets.filter(p => p.type?.toLowerCase() === "cat").length,
    Bird: pets.filter(p => p.type?.toLowerCase() === "bird").length,
    Fish: pets.filter(p => p.type?.toLowerCase() === "fish").length,
  };

  const CAT_ICONS: Record<string, React.ElementType> = { all: PawPrint, dog: Dog, cat: Cat, bird: Bird, fish: Fish };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && typeof arr[i-1] === "number" && (p as number) - (arr[i-1] as number) > 1) acc.push("...");
      acc.push(p); return acc;
    }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-yellow-50/40">

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] pt-14 pb-32">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-0 w-96 h-96 bg-violet-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 left-1/3 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }}>
            <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-4 py-2 rounded-full mb-5 backdrop-blur-sm">
              <Sparkles size={12} /> Find Your Perfect Companion
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
              Adopt a Pet,<br /><span className="text-yellow-300">Change a Life</span>
            </h1>
            <p className="text-blue-100 text-sm max-w-md mx-auto mb-8">
              Every pet here deserves a loving home. Browse dogs, cats, birds and fish waiting for you.
            </p>
            <div className="flex justify-center gap-8 mb-8">
              {[
                { label: "Available", value: pets.filter(p=>p.status==="AVAILABLE").length, color: "text-yellow-300" },
                { label: "Total Pets", value: pets.length, color: "text-white" },
                { label: "Adopted",   value: pets.filter(p=>p.status==="ADOPTED").length,   color: "text-violet-300" },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-blue-200 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="relative max-w-lg mx-auto">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or breed..."
                className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white shadow-lg shadow-blue-900/20 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-400 font-medium" />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20 block">
            <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20 relative z-10">

        {/* Category pills */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="flex flex-wrap gap-2 justify-center mb-6">
          {CATEGORIES.map(cat => {
            const key = cat.toLowerCase();
            const active = category === cat;
            const CatIcon = CAT_ICONS[key] ?? PawPrint;
            const count = counts[cat as keyof typeof counts] ?? pets.length;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] text-white border-transparent shadow-lg shadow-blue-200"
                    : "bg-white text-gray-600 border-blue-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}>
                <CatIcon size={14} />{cat}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/25 text-white" : "bg-blue-50 text-blue-400"}`}>{count}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <PawPrint size={14} className="text-[#a78bca]" />
            {loading ? "Loading pets..." : (
              <><span className="text-blue-600 font-bold">{filtered.length}</span> pets
              {category !== "All" && <> in <span className="text-blue-600 font-bold">{category}</span></>}
              {search && <> matching <span className="text-blue-600 font-bold">"{search}"</span></>}</>
            )}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 font-medium">Status:</span>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  status === s
                    ? "bg-[#e9e0f5] border-[#a78bca] text-[#7c5cbf]"
                    : "bg-white border-gray-200 text-gray-500 hover:border-[#a78bca] hover:text-[#7c5cbf]"
                }`}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            {(search || category !== "All" || status !== "All") && (
              <button onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-50 border border-red-100 text-red-400 hover:bg-red-100 transition-all">
                <X size={11} /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-4">
              <Search size={32} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No pets found</h3>
            <p className="text-sm text-gray-400 mb-5">Try a different category or clear your search.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}
              className="px-6 py-2.5 bg-[#5b84c4] text-white text-sm font-bold rounded-xl hover:bg-[#4a73b3] transition-colors">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={`${category}-${status}-${page}`} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((pet, i) => <PetCard key={pet._id} pet={pet} index={i} />)}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-12">
            <button onClick={() => { setPage(p => Math.max(1, p-1)); window.scrollTo({top:0,behavior:"smooth"}); }}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronLeft size={16} />
            </button>
            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`d${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button key={p} onClick={() => { setPage(p as number); window.scrollTo({top:0,behavior:"smooth"}); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    page === p
                      ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] text-white shadow-blue-200 shadow-md scale-110"
                      : "bg-white border border-blue-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}>{p}
                </button>
              )
            )}
            <button onClick={() => { setPage(p => Math.min(totalPages, p+1)); window.scrollTo({top:0,behavior:"smooth"}); }}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronRight size={16} />
            </button>
            <span className="text-xs text-gray-400 font-medium ml-2">Page {page} / {totalPages}</span>
          </motion.div>
        )}

        {/* CTA Banner */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease }}
          className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-yellow-100/60">
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/20 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 left-12 w-28 h-28 bg-white/15 rounded-full pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <Heart size={20} className="text-[#3d5f9a]" />
              <h3 className="text-2xl font-extrabold text-[#3d5f9a]">Need pet supplies too?</h3>
            </div>
            <p className="text-blue-800/70 text-sm">Browse our premium products for your companions.</p>
          </div>
          <Link href="/shop"
            className="relative z-10 flex-shrink-0 flex items-center gap-2 px-8 py-3.5 bg-[#5b84c4] hover:bg-[#4a73b3] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-300/40 hover:-translate-y-0.5 transition-all whitespace-nowrap">
            <PawPrint size={16} />Visit Shop
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
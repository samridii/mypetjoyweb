"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Dog, Cat, Bird, Fish, Search, X,
  UtensilsCrossed, Stethoscope, Scissors, DollarSign,
  TrendingUp, Calendar, ChevronRight, RotateCcw, Sparkles,
} from "lucide-react";
import { getAllPets, getPetCost, type Pet, type PetCost } from "@/lib/api/pets.api";
import Link from "next/link";
import toast from "react-hot-toast";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType; gradient: string; iconColor: string; bgColor: string;
}> = {
  dog:  { icon: Dog,      gradient: "from-amber-100 to-orange-100",  iconColor: "text-amber-500",  bgColor: "bg-amber-50"  },
  cat:  { icon: Cat,      gradient: "from-rose-100 to-pink-100",     iconColor: "text-rose-500",   bgColor: "bg-rose-50"   },
  bird: { icon: Bird,     gradient: "from-sky-100 to-blue-100",      iconColor: "text-sky-500",    bgColor: "bg-sky-50"    },
  fish: { icon: Fish,     gradient: "from-cyan-100 to-teal-100",     iconColor: "text-cyan-500",   bgColor: "bg-cyan-50"   },
  other:{ icon: PawPrint, gradient: "from-violet-100 to-purple-100", iconColor: "text-violet-500", bgColor: "bg-violet-50" },
};
function getCfg(type?: string) {
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

const COST_ITEMS = [
  { key: "food",     label: "Food",     icon: UtensilsCrossed, color: "#f59e0b", bg: "bg-amber-50",   border: "border-amber-100",  bar: "from-amber-400 to-orange-400" },
  { key: "medical",  label: "Medical",  icon: Stethoscope,     color: "#ef4444", bg: "bg-red-50",     border: "border-red-100",    bar: "from-red-400 to-rose-400"     },
  { key: "grooming", label: "Grooming", icon: Scissors,        color: "#a78bca", bg: "bg-violet-50",  border: "border-violet-100", bar: "from-violet-400 to-purple-400"},
];

function CostBar({ value, max, gradient, delay }: { value: number; max: number; gradient: string; delay: number }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, delay, ease: "easeOut" }}
      />
    </div>
  );
}

function PetCard({
  pet, index, selected, onClick,
}: { pet: Pet; index: number; selected: boolean; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const cfg  = getCfg(pet.type);
  const Icon = cfg.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full text-left rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
        selected
          ? "border-[#5b84c4] shadow-lg shadow-blue-100"
          : "border-slate-100 hover:border-blue-200"
      }`}
    >
      <div className={`relative h-28 bg-gradient-to-br ${cfg.gradient} overflow-hidden`}>
        {!imgErr ? (
          <img src={petImg(pet, index)} alt={pet.name} onError={() => setImgErr(true)}
            className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={40} className={`${cfg.iconColor} opacity-40`} strokeWidth={1.5} />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="w-full h-3">
            <path d="M0,12 C50,0 150,0 200,12 L200,12 L0,12 Z" fill="white" />
          </svg>
        </div>
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#5b84c4] flex items-center justify-center shadow-sm">
            <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
              <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        {pet.status !== "AVAILABLE" && (
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-400" />
        )}
      </div>
      <div className="bg-white px-3 pb-3 pt-0.5">
        <p className={`font-bold text-sm truncate ${selected ? "text-[#4a73b3]" : "text-gray-800"}`}>{pet.name}</p>
        <p className="text-[#a78bca] text-xs font-medium truncate">{pet.breed}</p>
      </div>
    </motion.button>
  );
}

export default function CostCalculatorPage() {
  const [pets, setPets]               = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [search, setSearch]           = useState("");
  const [selected, setSelected]       = useState<Pet | null>(null);
  const [cost, setCost]               = useState<PetCost | null>(null);
  const [loadingCost, setLoadingCost] = useState(false);
  const [view, setView]               = useState<"monthly" | "yearly">("yearly");

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getAllPets();
        setPets(r.data.data ?? []);
      } catch {
        toast.error("Failed to load pets");
      } finally {
        setLoadingPets(false);
      }
    };
    load();
  }, []);

  const handleSelect = async (pet: Pet) => {
    setSelected(pet);
    setCost(null);
    setLoadingCost(true);
    try {
      const r = await getPetCost(pet._id);
      setCost(r.data.costDetails);
    } catch {
      toast.error("Cost data not available for this pet.");
      setCost(null);
    } finally {
      setLoadingCost(false);
    }
  };

  const reset = () => { setSelected(null); setCost(null); setSearch(""); };

  const filtered = pets.filter(p => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.breed.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
  });

  const divisor = view === "monthly" ? 12 : 1;
  const label   = view === "monthly" ? "/ mo" : "/ yr";

  const maxVal = cost
    ? Math.max(
        (cost.yearlyBreakdown.food     ?? 0) / divisor,
        (cost.yearlyBreakdown.medical  ?? 0) / divisor,
        (cost.yearlyBreakdown.grooming ?? 0) / divisor,
      )
    : 1;

  const fmt = (v: number) =>
    (v / divisor).toLocaleString("en-US", { maximumFractionDigits: 0 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40">

      <section className="relative overflow-hidden bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] pt-14 pb-28">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-yellow-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}>
            <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-4 py-2 rounded-full mb-5">
              <Sparkles size={12} /> Pet Cost Calculator
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
              Know Before<br /><span className="text-yellow-300">You Adopt</span>
            </h1>
            <p className="text-blue-100 text-sm max-w-md mx-auto">
              Select any pet to see a full yearly cost breakdown — food, medical, and grooming.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20 block">
            <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
            className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden">

            <div className="p-5 border-b border-blue-50">
              <h2 className="font-extrabold text-gray-800 text-base mb-3 flex items-center gap-2">
                <PawPrint size={16} className="text-[#5b84c4]" /> Select a Pet
              </h2>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search pets..."
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-blue-100 bg-blue-50/40 text-sm outline-none focus:ring-2 focus:ring-blue-300 placeholder-gray-400" />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            <div className="p-4 overflow-y-auto" style={{ maxHeight: "520px" }}>
              {loadingPets ? (
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-blue-50 overflow-hidden animate-pulse">
                      <div className="h-28 bg-gradient-to-br from-blue-50 to-violet-50" />
                      <div className="p-3 space-y-1.5">
                        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-2.5 bg-violet-50 rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">
                  <Search size={28} className="text-blue-200 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">No pets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {filtered.map((pet, i) => (
                    <PetCard key={pet._id} pet={pet} index={i}
                      selected={selected?._id === pet._id}
                      onClick={() => handleSelect(pet)} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease }}
            className="lg:col-span-3">

            <AnimatePresence mode="wait">

              {!selected && !loadingCost && (
                <motion.div key="empty"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-blue-50 p-12 text-center"
                  style={{ minHeight: "480px" }}>
                  <motion.div animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-20 h-20 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
                    <DollarSign size={36} className="text-blue-300" />
                  </motion.div>
                  <h3 className="text-lg font-extrabold text-gray-700 mb-2">Select a pet to get started</h3>
                  <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                    Choose any pet from the list to see a full cost breakdown before you adopt.
                  </p>
                  <div className="flex justify-center gap-3 mt-6">
                    {[Dog, Cat, Bird, Fish].map((Icon, i) => (
                      <motion.div key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.4, ease: "easeInOut" }}
                        className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Icon size={18} className="text-[#5b84c4]" strokeWidth={1.5} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {loadingCost && (
                <motion.div key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="bg-white rounded-3xl shadow-sm border border-blue-50 p-12 text-center"
                  style={{ minHeight: "480px" }}>
                  <motion.div animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b84c4] to-[#4a73b3] flex items-center justify-center mx-auto mb-5">
                    <DollarSign size={28} className="text-white" />
                  </motion.div>
                  <p className="text-gray-500 font-semibold text-sm">Calculating costs...</p>
                </motion.div>
              )}

              {selected && cost && !loadingCost && (
                <motion.div key={selected._id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                  className="space-y-5">

                  <div className="bg-white rounded-3xl shadow-sm border border-blue-50 overflow-hidden">
                    <div className="relative bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-5">
                      <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-300/15 rounded-full blur-xl" />
                      <div className="flex items-center justify-between relative z-10">
                        <div>
                          <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-0.5">Cost breakdown for</p>
                          <h3 className="text-2xl font-extrabold text-white">{cost.petName}</h3>
                          <p className="text-[#c4b5fd] text-xs font-semibold mt-0.5">{selected.breed} · {selected.type}</p>
                        </div>
                        <button onClick={reset}
                          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all">
                          <RotateCcw size={11} /> Change
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 600 16" preserveAspectRatio="none" className="w-full h-4">
                          <path d="M0,16 C150,0 450,0 600,16 L600,16 L0,16 Z" fill="white" />
                        </svg>
                      </div>
                    </div>
                    <div className="px-5 pt-3 pb-4 flex items-center justify-between">
                      <p className="text-xs text-gray-400 font-medium">Showing costs</p>
                      <div className="flex gap-1 bg-blue-50 rounded-xl p-1 border border-blue-100">
                        {(["yearly", "monthly"] as const).map(v => (
                          <button key={v} onClick={() => setView(v)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 capitalize ${
                              view === v
                                ? "bg-[#5b84c4] text-white shadow-sm"
                                : "text-gray-500 hover:text-blue-600"
                            }`}>
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-6 space-y-4">
                    <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-2 mb-5">
                      <TrendingUp size={16} className="text-[#5b84c4]" /> Cost Breakdown
                    </h4>
                    {COST_ITEMS.map((item, i) => {
                      const raw = cost.yearlyBreakdown[item.key as keyof typeof cost.yearlyBreakdown] as number ?? 0;
                      return (
                        <motion.div key={item.key}
                          initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.08, duration: 0.4, ease }}
                          className={`${item.bg} border ${item.border} rounded-2xl p-4`}>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="flex items-center gap-2 text-sm font-bold text-gray-700">
                              <item.icon size={15} style={{ color: item.color }} />
                              {item.label}
                            </span>
                            <div className="text-right">
                              <span className="text-base font-extrabold" style={{ color: item.color }}>
                                NPR {fmt(raw)}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">{label}</span>
                            </div>
                          </div>
                          <CostBar value={raw / divisor} max={maxVal} gradient={item.bar} delay={0.2 + i * 0.1} />
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4, ease }}
                      className="bg-white rounded-3xl shadow-sm border border-blue-50 p-5 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5b84c4] to-[#4a73b3] flex items-center justify-center mx-auto mb-3">
                        <Calendar size={18} className="text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        {view === "monthly" ? "Per Month" : "Per Year"}
                      </p>
                      <p className="text-2xl font-black text-[#5b84c4]">
                        NPR {fmt(cost.yearlyBreakdown.totalPerYear)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">total</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.48, duration: 0.4, ease }}
                      className="bg-white rounded-3xl shadow-sm border border-violet-100 p-5 text-center">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#a78bca] to-[#7c5cbf] flex items-center justify-center mx-auto mb-3">
                        <TrendingUp size={18} className="text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">
                        Lifetime ({cost.lifespanYears} yrs)
                      </p>
                      <p className="text-2xl font-black text-[#7c5cbf]">
                        NPR {cost.estimatedLifetimeCost.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">estimated</p>
                    </motion.div>
                  </div>

                  {selected.status === "AVAILABLE" && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55, duration: 0.4, ease }}
                      className="rounded-3xl p-5 flex items-center justify-between gap-4"
                      style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
                      <div>
                        <p className="font-extrabold text-blue-800 text-sm">{cost.petName} is available!</p>
                        <p className="text-blue-600/70 text-xs mt-0.5">Ready to give them a home?</p>
                      </div>
                      <Link href={`/pets/${selected._id}`}>
                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-white text-xs shadow-md cursor-pointer whitespace-nowrap"
                          style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                          <PawPrint size={13} /> Adopt Now
                          <ChevronRight size={13} />
                        </motion.div>
                      </Link>
                    </motion.div>
                  )}
                  {selected && !cost && !loadingCost && (
                    <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-8 text-center">
                      <DollarSign size={32} className="text-blue-200 mx-auto mb-3" />
                      <p className="text-gray-500 font-semibold text-sm mb-1">No cost data available</p>
                      <p className="text-gray-400 text-xs">This pet doesn't have cost information yet.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, PawPrint, Dog, Cat, Bird, Fish, Calendar, Tag,
  Home, Heart, Sparkles, CheckCircle, Clock, XCircle, DollarSign,
  Scissors, Stethoscope, UtensilsCrossed, Info,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getPetById, getPetCost, type Pet, type PetCost } from "@/lib/api/pets.api";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType; gradient: string; iconColor: string; bgColor: string; heroGradient: string;
}> = {
  dog:  { icon: Dog,     gradient: "from-amber-100 to-orange-100",  iconColor: "text-amber-500",  bgColor: "bg-amber-50",  heroGradient: "from-amber-400/30 to-orange-300/20"  },
  cat:  { icon: Cat,     gradient: "from-rose-100 to-pink-100",     iconColor: "text-rose-500",   bgColor: "bg-rose-50",   heroGradient: "from-rose-400/30 to-pink-300/20"     },
  bird: { icon: Bird,    gradient: "from-sky-100 to-blue-100",      iconColor: "text-sky-500",    bgColor: "bg-sky-50",    heroGradient: "from-sky-400/30 to-blue-300/20"      },
  fish: { icon: Fish,    gradient: "from-cyan-100 to-teal-100",     iconColor: "text-cyan-500",   bgColor: "bg-cyan-50",   heroGradient: "from-cyan-400/30 to-teal-300/20"     },
  other:{ icon: PawPrint,gradient: "from-violet-100 to-purple-100", iconColor: "text-violet-500", bgColor: "bg-violet-50", heroGradient: "from-violet-400/30 to-purple-300/20" },
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
function petImg(pet: Pet): string {
  if (pet.image) return pet.image;
  const pool = PET_IMAGES[pet.type?.toLowerCase()] ?? PET_IMAGES.other;
  return pool[0];
}

const STATUS_CONFIG = {
  AVAILABLE: { label: "Available", icon: CheckCircle, dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  PENDING:   { label: "Pending",   icon: Clock,        dot: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50 border-amber-200"     },
  ADOPTED:   { label: "Adopted",   icon: XCircle,      dot: "bg-slate-400",   text: "text-slate-500",   bg: "bg-slate-50 border-slate-200"     },
};

interface AdoptionForm {
  fullName: string; email: string; phone: string; address: string;
  livingType: string; hasOtherPets: string; experience: string; reason: string;
}
const INIT: AdoptionForm = { fullName:"",email:"",phone:"",address:"",livingType:"",hasOtherPets:"",experience:"",reason:"" };

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function PetDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [pet, setPet]           = useState<Pet | null>(null);
  const [cost, setCost]         = useState<PetCost | null>(null);
  const [loading, setLoading]   = useState(true);
  const [imgErr, setImgErr]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<AdoptionForm>(INIT);
  const [errors, setErrors]     = useState<Partial<AdoptionForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab]   = useState<"about"|"cost">("about");

  useEffect(() => {
    Promise.all([
      getPetById(id).then(r => setPet(r.data.data)),
      getPetCost(id).then(r => setCost(r.data.costDetails)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user) setForm(p => ({ ...p, fullName: user.fullName || "", email: user.email || "" }));
  }, [user]);

  const validate = () => {
    const e: Partial<AdoptionForm> = {};
    if (!form.fullName.trim())    e.fullName    = "Required";
    if (!form.email.trim())       e.email       = "Required";
    if (!form.phone.trim())       e.phone       = "Required";
    if (!form.address.trim())     e.address     = "Required";
    if (!form.livingType)         e.livingType  = "Required";
    if (!form.hasOtherPets)       e.hasOtherPets = "Required";
    if (!form.experience.trim())  e.experience  = "Required";
    if (!form.reason.trim())      e.reason      = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!isAuthenticated) { toast.error("Please log in to adopt."); router.push("/login"); return; }
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post(API.ADOPTIONS.REQUEST, {
        pet: id, fullName: form.fullName, email: form.email, phone: form.phone,
        address: form.address, livingType: form.livingType,
        hasOtherPets: form.hasOtherPets === "true",
        experience: form.experience, reason: form.reason,
      });
      toast.success("Adoption request submitted! We'll contact you soon.");
      setShowForm(false); setForm(INIT);
    } catch { toast.error("Failed to submit. Please try again."); }
    finally { setSubmitting(false); }
  };

  const inp    = "w-full px-4 py-2.5 rounded-2xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-300 border-blue-100 bg-blue-50/40 hover:border-blue-300";
  const inpErr = "w-full px-4 py-2.5 rounded-2xl border text-sm outline-none border-red-300 bg-red-50";

  const F = ({ label, name, type="text", placeholder, opts, ta }: {
    label:string; name:keyof AdoptionForm; type?:string; placeholder?:string;
    opts?:{value:string;label:string}[]; ta?:boolean;
  }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} <span className="text-red-400">*</span></label>
      {opts ? (
        <select value={form[name]} onChange={e=>{setForm(p=>({...p,[name]:e.target.value}));setErrors(p=>({...p,[name]:""}));}}
          className={errors[name]?inpErr:inp}>
          <option value="">Select...</option>
          {opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : ta ? (
        <textarea rows={3} placeholder={placeholder} value={form[name]}
          onChange={e=>{setForm(p=>({...p,[name]:e.target.value}));setErrors(p=>({...p,[name]:""}));}}
          className={(errors[name]?inpErr:inp)+" resize-none"} />
      ) : (
        <input type={type} placeholder={placeholder} value={form[name]}
          onChange={e=>{setForm(p=>({...p,[name]:e.target.value}));setErrors(p=>({...p,[name]:""}));}}
          className={errors[name]?inpErr:inp} />
      )}
      {errors[name] && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors[name]}</p>}
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-white to-yellow-50/40">
      <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="text-center">
        <motion.div animate={{ y: [0,-12,0] }} transition={{ repeat:Infinity, duration:1.2, ease:"easeInOut" }}>
          <PawPrint size={56} className="text-[#5b84c4] mx-auto mb-4" />
        </motion.div>
        <p className="text-blue-400 font-semibold text-sm">Loading pet details...</p>
      </motion.div>
    </div>
  );

  if (!pet) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50/60 via-white to-yellow-50/40">
      <div className="text-center">
        <PawPrint size={56} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4 font-medium">Pet not found</p>
        <Link href="/pets" className="text-[#5b84c4] underline font-semibold">Browse all pets</Link>
      </div>
    </div>
  );

  const cfg    = getCatConfig(pet.type);
  const Icon   = cfg.icon;
  const sc     = STATUS_CONFIG[pet.status] ?? STATUS_CONFIG.AVAILABLE;
  const StatusIcon = sc.icon;
  const src    = petImg(pet);
  const isAvail = pet.status === "AVAILABLE";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-yellow-50/40 pb-20">

      {/* Hero section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] pt-6 pb-28">
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-violet-300/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back */}
          <Link href="/pets"
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-6 transition-colors">
            <ChevronLeft size={16} /> Back to Pets
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Pet image */}
            <motion.div initial={{ opacity:0, x:-32 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, ease }}
              className="relative">
              <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${cfg.gradient} shadow-2xl shadow-blue-900/30`}
                style={{ height: "360px" }}>
                {!imgErr ? (
                  <img src={src} alt={pet.name} onError={() => setImgErr(true)}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon size={96} className={`${cfg.iconColor} opacity-40`} strokeWidth={1} />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                  <svg viewBox="0 0 400 32" preserveAspectRatio="none" className="w-full h-8 block">
                    <path d="M0,32 C100,4 300,4 400,32 L400,32 L0,32 Z" fill="white" fillOpacity="0.15" />
                  </svg>
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border shadow-sm ${sc.bg} ${sc.text}`}>
                  <StatusIcon size={12} />{sc.label}
                </span>
              </div>
              <div className="absolute top-4 left-4">
                <span className={`inline-flex items-center gap-1.5 ${cfg.bgColor} text-xs font-bold px-3 py-1.5 rounded-full ${cfg.iconColor} border border-white/60 shadow-sm`}>
                  <Icon size={12} />{pet.type}
                </span>
              </div>
            </motion.div>

            {/* Pet info */}
            <motion.div initial={{ opacity:0, x:32 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6, ease, delay:0.1 }}>
              <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sparkles size={11} /> {isAvail ? "Available for Adoption" : pet.status}
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-2 leading-tight">{pet.name}</h1>
              <p className="text-[#c4b5fd] font-semibold text-sm mb-4">{pet.breed}</p>
              <p className="text-blue-100 text-sm leading-relaxed mb-6 line-clamp-3">{pet.description}</p>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { icon: Calendar, label: "Age",    value: `${pet.age} ${pet.age===1?"year":"years"}` },
                  { icon: Tag,      label: "Breed",  value: pet.breed },
                  { icon: Icon,     label: "Type",   value: pet.type  },
                  { icon: Home,     label: "Status", value: sc.label  },
                ].map(s => (
                  <div key={s.label} className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 flex items-center gap-3">
                    <s.icon size={16} className="text-blue-200 flex-shrink-0" />
                    <div>
                      <p className="text-blue-200 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
                      <p className="text-white text-sm font-bold capitalize">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {isAvail ? (
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (!isAuthenticated) { toast.error("Please log in first."); router.push("/login"); return; }
                    setShowForm(true);
                  }}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-yellow-300 to-amber-300 hover:from-yellow-200 hover:to-amber-200 text-[#3d5f9a] font-extrabold text-sm rounded-2xl shadow-lg shadow-yellow-500/30 transition-all">
                  <PawPrint size={16} /> Adopt {pet.name}
                </motion.button>
              ) : (
                <div className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-blue-200 font-bold text-sm rounded-2xl">
                  <XCircle size={16} /> Not Available
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Arch bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20 block">
            <path d="M0,80 C360,20 1080,20 1440,80 L1440,80 L0,80 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Tabs section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 relative z-10">

        {/* Tab nav */}
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.2, ease }}
          className="flex gap-2 mb-6">
          {(["about","cost"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                activeTab === tab
                  ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] text-white border-transparent shadow-lg shadow-blue-200"
                  : "bg-white text-gray-600 border-blue-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
              }`}>
              {tab === "about" ? <><Info size={14}/>About</> : <><DollarSign size={14}/>Cost Estimate</>}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === "about" && (
            <motion.div key="about" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.35, ease }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Description */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-blue-50 p-6">
                <h3 className="font-bold text-gray-800 text-base mb-3 flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-xl ${cfg.bgColor} flex items-center justify-center`}>
                    <Icon size={14} className={cfg.iconColor} />
                  </div>
                  About {pet.name}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{pet.description}</p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Calendar,       label: "Age",     value: `${pet.age} years`           },
                    { icon: Icon,           label: "Species", value: pet.type                     },
                    { icon: Tag,            label: "Breed",   value: pet.breed                    },
                    { icon: StatusIcon,     label: "Status",  value: sc.label                     },
                  ].map(s => (
                    <div key={s.label} className="bg-blue-50/50 rounded-2xl p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <s.icon size={14} className="text-[#5b84c4]" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                        <p className="text-sm font-bold text-gray-700 capitalize">{s.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Traits */}
                <div className="mt-5">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Traits</p>
                  <div className="flex flex-wrap gap-2">
                    {["Friendly","Playful","Loving","Gentle","Curious"].map(t => (
                      <span key={t} className="inline-flex items-center gap-1 px-3 py-1 bg-[#e9e0f5] border border-[#c4b5fd] text-[#7c5cbf] text-xs font-semibold rounded-full">
                        <Heart size={10} />{t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Side card */}
              <div className="space-y-4">
                <div className="bg-white rounded-3xl shadow-sm border border-blue-50 p-5">
                  <h4 className="font-bold text-gray-700 text-xs uppercase tracking-widest mb-3">Quick Info</h4>
                  {[
                    { icon: Calendar, label: "Listed",   value: new Date(pet.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) },
                    { icon: PawPrint, label: "ID",       value: pet._id.slice(-6).toUpperCase() },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="flex items-center gap-2 text-xs text-gray-400"><f.icon size={12}/>{f.label}</span>
                      <span className="text-xs font-bold text-gray-600">{f.value}</span>
                    </div>
                  ))}
                </div>

                {isAvail && (
                  <div className="rounded-3xl p-5 text-center"
                    style={{ background: "linear-gradient(135deg, #dbeafe, #ede9fe)" }}>
                    <Home size={32} className="text-[#5b84c4] mx-auto mb-2" />
                    <p className="font-bold text-blue-800 text-sm mb-1">Ready for a home</p>
                    <p className="text-blue-600/70 text-xs mb-3 leading-relaxed">{pet.name} is waiting for someone like you.</p>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        if (!isAuthenticated) { toast.error("Please log in first."); router.push("/login"); return; }
                        setShowForm(true);
                      }}
                      className="w-full py-2.5 rounded-xl font-bold text-white text-xs shadow-md transition-all"
                      style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                      <PawPrint size={12} className="inline mr-1.5" />Start Adoption
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "cost" && (
            <motion.div key="cost" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
              transition={{ duration:0.35, ease }}
              className="bg-white rounded-3xl shadow-sm border border-blue-50 p-6">
              {cost ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <DollarSign size={18} className="text-[#5b84c4]" /> Annual Cost Breakdown
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border">Estimated</span>
                  </div>

                  {[
                    { label:"Food",     value:cost.yearlyBreakdown.food,     icon:UtensilsCrossed, color:"#f59e0b", bg:"bg-amber-50",  border:"border-amber-100" },
                    { label:"Medical",  value:cost.yearlyBreakdown.medical,   icon:Stethoscope,    color:"#ef4444", bg:"bg-red-50",    border:"border-red-100"   },
                    { label:"Grooming", value:cost.yearlyBreakdown.grooming,  icon:Scissors,       color:"#a78bca", bg:"bg-violet-50", border:"border-violet-100"},
                  ].map(item => (
                    <div key={item.label} className={`${item.bg} border ${item.border} rounded-2xl p-4`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <item.icon size={15} style={{ color: item.color }} />{item.label}
                        </span>
                        <span className="text-sm font-extrabold" style={{ color: item.color }}>
                          ${item.value.toLocaleString()}/yr
                        </span>
                      </div>
                      <div className="h-2 bg-white/70 rounded-full overflow-hidden">
                        <motion.div className="h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value/cost.yearlyBreakdown.totalPerYear)*100}%` }}
                          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                          style={{ background: item.color }} />
                      </div>
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-center">
                      <div className="w-10 h-10 bg-[#5b84c4] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <DollarSign size={18} className="text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">Per Year</p>
                      <p className="text-2xl font-black text-[#5b84c4]">${cost.yearlyBreakdown.totalPerYear.toLocaleString()}</p>
                    </div>
                    <div className="bg-[#f3eeff] border border-[#c4b5fd] rounded-2xl p-5 text-center">
                      <div className="w-10 h-10 bg-[#a78bca] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Heart size={18} className="text-white" />
                      </div>
                      <p className="text-xs text-gray-400 mb-1">Lifetime ({cost.lifespanYears} yrs)</p>
                      <p className="text-2xl font-black text-[#7c5cbf]">${cost.estimatedLifetimeCost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
                    <DollarSign size={28} className="text-blue-300" />
                  </div>
                  <h3 className="font-bold text-gray-600 mb-1">No cost data available</h3>
                  <p className="text-gray-400 text-sm">Cost estimate is not available for this pet.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Adoption Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.65)", backdropFilter: "blur(6px)" }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
            <motion.div
              initial={{ opacity:0, y:40, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:20, scale:0.97 }}
              transition={{ duration:0.4, ease }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

              {/* Modal hero */}
              <div className="relative bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-6 pb-10 text-center">
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />
                <button onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all text-lg font-bold">
                  ×
                </button>
                <PawPrint size={36} className="text-yellow-300 mx-auto mb-2" />
                <h2 className="text-2xl font-extrabold text-white">Adopt {pet.name}</h2>
                <p className="text-blue-200 text-xs mt-1">Fill in the details — we'll review and contact you!</p>
                <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
                  <svg viewBox="0 0 600 24" preserveAspectRatio="none" className="w-full h-6 block">
                    <path d="M0,24 C150,0 450,0 600,24 L600,24 L0,24 Z" fill="white" />
                  </svg>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">

                <div className="bg-blue-50/40 rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-[#5b84c4] uppercase tracking-wider flex items-center gap-2">
                    <Info size={12} />Personal Information
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <F label="Full Name"  name="fullName" placeholder="Your full name" />
                    <F label="Email"      name="email"    type="email" placeholder="you@example.com" />
                    <F label="Phone"      name="phone"    type="tel"   placeholder="+977 98XXXXXXXX" />
                    <F label="Address"    name="address"  placeholder="Your full address" />
                  </div>
                </div>

                <div className="rounded-2xl p-4 space-y-3" style={{ background:"linear-gradient(135deg,#fef9c3,#fef3c7)" }}>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-2">
                    <Home size={12} />Living Situation
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <F label="Living Type" name="livingType"
                      opts={[{value:"house",label:"House with yard"},{value:"apartment",label:"Apartment"},{value:"condo",label:"Condo"},{value:"other",label:"Other"}]} />
                    <F label="Other pets at home?" name="hasOtherPets"
                      opts={[{value:"true",label:"Yes"},{value:"false",label:"No"}]} />
                  </div>
                </div>

                <div className="bg-[#f3eeff] rounded-2xl p-4 space-y-3">
                  <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wider flex items-center gap-2">
                    <Heart size={12} />Your Experience
                  </p>
                  <F label="Experience with pets" name="experience" ta placeholder="Describe your experience caring for pets..." />
                  <F label={`Why adopt ${pet.name}?`} name="reason" ta placeholder="Tell us why you'd be a great match..." />
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.02 }} whileTap={{ scale: 0.97 }}
                    className="flex-1 py-3 rounded-2xl font-bold text-white text-sm shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                    {submitting ? (
                      <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>Submitting...</>
                    ) : <><PawPrint size={14}/>Submit Application</>}
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
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Home, Heart, Phone, Mail, MapPin,
  User, CheckCircle, ChevronRight, Dog, Cat, Bird, Fish, Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/context/AuthContext";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface AdoptionForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  livingType: string;
  hasOtherPets: string;
  experience: string;
  reason: string;
}

const INIT: AdoptionForm = {
  fullName: "", email: "", phone: "", address: "",
  livingType: "", hasOtherPets: "", experience: "", reason: "",
};

const LIVING_OPTIONS = [
  { value: "house",     label: "House with yard" },
  { value: "apartment", label: "Apartment"       },
  { value: "condo",     label: "Condo"           },
  { value: "other",     label: "Other"           },
];

export default function AdoptionPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const petId        = searchParams.get("petId") ?? "";
  const petName      = searchParams.get("petName") ?? "this pet";
  const { user, isAuthenticated, isLoading } = useAuth();

  const [form, setForm]         = useState<AdoptionForm>(INIT);
  const [errors, setErrors]     = useState<Partial<AdoptionForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);

  // Pre-fill from logged-in user
  useEffect(() => {
    if (user) setForm(p => ({ ...p, fullName: user.fullName || "", email: user.email || "" }));
  }, [user]);

  // Redirect if not auth
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please log in to submit an adoption request.");
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  const set = (name: keyof AdoptionForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(p => ({ ...p, [name]: e.target.value }));
    setErrors(p => ({ ...p, [name]: "" }));
  };

  const validate = (): boolean => {
    const e: Partial<AdoptionForm> = {};
    if (!form.fullName.trim())    e.fullName    = "Full name is required";
    if (!form.email.trim())       e.email       = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email";
    if (!form.phone.trim())       e.phone       = "Phone is required";
    if (!form.address.trim())     e.address     = "Address is required";
    if (!form.livingType)         e.livingType  = "Please select your living type";
    if (!form.hasOtherPets)       e.hasOtherPets = "Please select an option";
    if (!form.experience.trim())  e.experience  = "Please describe your experience";
    if (!form.reason.trim())      e.reason      = "Please tell us your reason";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!petId) { toast.error("No pet selected. Please go back and choose a pet."); return; }
    setSubmitting(true);
    try {
      await api.post(API.ADOPTIONS.REQUEST, {
        pet:          petId,
        fullName:     form.fullName,
        email:        form.email,
        phone:        form.phone,
        address:      form.address,
        livingType:   form.livingType,
        hasOtherPets: form.hasOtherPets === "true",
        experience:   form.experience,
        reason:       form.reason,
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-300 focus:border-blue-400 border-slate-200 bg-white hover:border-blue-300 placeholder-gray-400";
  const inputErr  = "w-full px-4 py-2.5 rounded-xl border text-sm outline-none border-red-300 bg-red-50 placeholder-gray-400";

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50">
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
        <PawPrint size={48} className="text-[#5b84c4]" />
      </motion.div>
    </div>
  );

  // Success screen
  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-violet-50 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease }}
        className="bg-white rounded-3xl shadow-xl border border-blue-50 p-10 max-w-md w-full text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={40} className="text-emerald-500" />
        </motion.div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Request Submitted!</h2>
        <p className="text-gray-500 text-sm leading-relaxed mb-2">
          Your adoption request for <span className="font-bold text-[#5b84c4]">{petName}</span> has been received.
        </p>
        <p className="text-gray-400 text-xs mb-8">We'll review your application and reach out soon.</p>
        <div className="flex gap-3">
          <button onClick={() => router.push("/pets")}
            className="flex-1 py-3 rounded-xl border-2 border-blue-100 text-[#5b84c4] font-bold text-sm hover:bg-blue-50 transition-all">
            Browse More Pets
          </button>
          <button onClick={() => router.push("/")}
            className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all shadow-md"
            style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden flex flex-col lg:flex-row"
          style={{ minHeight: "620px" }}>

          {/* ── LEFT SPLASH PANEL ────────────────────────────────────────── */}
          <div className="relative lg:w-2/5 flex-shrink-0 bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-10 flex flex-col justify-between overflow-hidden">

            {/* Decorative circles */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-yellow-300/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-violet-300/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full pointer-events-none" />

            {/* Top: logo + badge */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-8">
                <PawPrint size={11} /> Adoption Application
              </div>
              <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
                Give {petName}<br />a Loving Home
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed">
                Fill out this short form and we'll review your application. Every pet deserves a family.
              </p>
            </div>

            {/* Middle: pet type icons */}
            <div className="relative z-10 flex gap-3 my-6">
              {[Dog, Cat, Bird, Fish].map((Icon, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.4, ease }}
                  className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-sm">
                  <Icon size={18} className="text-white/80" strokeWidth={1.5} />
                </motion.div>
              ))}
            </div>

            {/* Bottom: steps */}
            <div className="relative z-10 space-y-3">
              {[
                { icon: User,        label: "Fill your details"     },
                { icon: Home,        label: "Tell us about your home" },
                { icon: Heart,       label: "Share your reason"     },
                { icon: CheckCircle, label: "We'll contact you soon" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <step.icon size={13} className="text-yellow-200" />
                  </div>
                  <span className="text-blue-100 text-xs font-medium">{step.label}</span>
                </div>
              ))}
            </div>

            {/* Arch right edge */}
            <div className="absolute top-0 right-0 bottom-0 w-8 pointer-events-none hidden lg:block">
              <svg viewBox="0 0 32 800" preserveAspectRatio="none" className="h-full w-full">
                <path d="M32,0 C12,200 12,600 32,800 L32,800 L32,0 Z" fill="white" />
              </svg>
            </div>
            {/* Arch bottom edge (mobile) */}
            <div className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none lg:hidden">
              <svg viewBox="0 0 600 32" preserveAspectRatio="none" className="w-full h-full">
                <path d="M0,32 C150,4 450,4 600,32 L600,32 L0,32 Z" fill="white" />
              </svg>
            </div>
          </div>

          {/* ── RIGHT FORM PANEL ──────────────────────────────────────────── */}
          <div className="flex-1 p-8 lg:p-10 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-gray-800 mb-1">Adoption Request</h3>
              <p className="text-gray-400 text-sm">
                Applying for <span className="font-bold text-[#5b84c4]">{petName}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>

              {/* Personal Info */}
              <div>
                <p className="text-xs font-bold text-[#5b84c4] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User size={11} /> Personal Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input type="text" placeholder="Your full name" value={form.fullName}
                        onChange={set("fullName")}
                        className={(errors.fullName ? inputErr : inputBase) + " pl-9"} />
                    </div>
                    {errors.fullName && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input type="email" placeholder="you@example.com" value={form.email}
                        onChange={set("email")}
                        className={(errors.email ? inputErr : inputBase) + " pl-9"} />
                    </div>
                    {errors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Phone <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input type="tel" placeholder="+977 98XXXXXXXX" value={form.phone}
                        onChange={set("phone")}
                        className={(errors.phone ? inputErr : inputBase) + " pl-9"} />
                    </div>
                    {errors.phone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.phone}</p>}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Address <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                      <input type="text" placeholder="Your full address" value={form.address}
                        onChange={set("address")}
                        className={(errors.address ? inputErr : inputBase) + " pl-9"} />
                    </div>
                    {errors.address && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Living Situation */}
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Home size={11} /> Living Situation
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Living Type <span className="text-red-400">*</span>
                    </label>
                    <select value={form.livingType} onChange={set("livingType")}
                      className={errors.livingType ? inputErr : inputBase}>
                      <option value="">Select type...</option>
                      {LIVING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors.livingType && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.livingType}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Other pets at home? <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[{ value: "true", label: "Yes" }, { value: "false", label: "No" }].map(opt => (
                        <button key={opt.value} type="button"
                          onClick={() => { setForm(p => ({ ...p, hasOtherPets: opt.value })); setErrors(p => ({ ...p, hasOtherPets: "" })); }}
                          className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                            form.hasOtherPets === opt.value
                              ? "bg-[#5b84c4] border-[#5b84c4] text-white shadow-md shadow-blue-200"
                              : "bg-white border-slate-200 text-gray-500 hover:border-blue-300"
                          }`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {errors.hasOtherPets && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.hasOtherPets}</p>}
                  </div>
                </div>
              </div>

              {/* Experience & Reason */}
              <div>
                <p className="text-xs font-bold text-[#7c5cbf] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Heart size={11} /> Your Story
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Experience with pets <span className="text-red-400">*</span>
                    </label>
                    <textarea rows={2} placeholder="Describe your experience caring for pets..."
                      value={form.experience} onChange={set("experience")}
                      className={(errors.experience ? inputErr : inputBase) + " resize-none"} />
                    {errors.experience && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.experience}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      Why do you want to adopt {petName}? <span className="text-red-400">*</span>
                    </label>
                    <textarea rows={2} placeholder="Tell us why you'd be a great match..."
                      value={form.reason} onChange={set("reason")}
                      className={(errors.reason ? inputErr : inputBase) + " resize-none"} />
                    {errors.reason && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><Info size={10}/>{errors.reason}</p>}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm shadow-lg shadow-blue-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                {submitting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Submitting...</>
                ) : (
                  <><PawPrint size={15}/>Submit Adoption Request<ChevronRight size={15}/></>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
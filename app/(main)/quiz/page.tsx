"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Dog, Cat, Bird, Fish, Home, Zap, Clock,
  Star, Baby, Wind, Ruler, Heart, ChevronRight, ChevronLeft,
  Sparkles, RotateCcw, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { submitQuiz } from "@/lib/api/quiz.api";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ── Quiz questions ────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "living",
    icon: Home,
    question: "Where do you live?",
    subtitle: "Your space helps us find the right fit",
    options: [
      { value: "house_yard",  label: "House with yard",  icon: "🏡" },
      { value: "house_small", label: "House, no yard",   icon: "🏠" },
      { value: "apartment",   label: "Apartment",        icon: "🏢" },
      { value: "condo",       label: "Condo / Studio",   icon: "🏙️" },
    ],
  },
  {
    id: "activity",
    icon: Zap,
    question: "How active is your lifestyle?",
    subtitle: "Be honest — your pet will match your energy!",
    options: [
      { value: "very_active",   label: "Very active",     icon: "🏃" },
      { value: "moderately",    label: "Moderately active",icon: "🚶" },
      { value: "low",           label: "Prefer relaxing", icon: "🛋️" },
      { value: "mostly_indoors",label: "Mostly indoors",  icon: "📺" },
    ],
  },
  {
    id: "hoursHome",
    icon: Clock,
    question: "How many hours are you home daily?",
    subtitle: "Some pets need more company than others",
    options: [
      { value: "less_4",  label: "Less than 4 hrs",  icon: "⏰" },
      { value: "4_to_8",  label: "4 – 8 hours",      icon: "🕐" },
      { value: "8_to_12", label: "8 – 12 hours",     icon: "🕗" },
      { value: "most_day",label: "Most of the day",  icon: "🏠" },
    ],
  },
  {
    id: "experience",
    icon: Star,
    question: "What's your experience with pets?",
    subtitle: "No wrong answer — we all start somewhere",
    options: [
      { value: "none",       label: "First-time owner", icon: "🌱" },
      { value: "some",       label: "Some experience",  icon: "🌿" },
      { value: "experienced",label: "Experienced",      icon: "🌳" },
      { value: "expert",     label: "Expert / Breeder", icon: "🏆" },
    ],
  },
  {
    id: "children",
    icon: Baby,
    question: "Do you have children at home?",
    subtitle: "Helps us suggest pet-friendly breeds",
    options: [
      { value: "no",          label: "No children",     icon: "🧑" },
      { value: "toddlers",    label: "Toddlers (0–4)",  icon: "👶" },
      { value: "young",       label: "Young (5–12)",    icon: "🧒" },
      { value: "teens",       label: "Teenagers",       icon: "👦" },
    ],
  },
  {
    id: "allergies",
    icon: Wind,
    question: "Any pet allergies in the household?",
    subtitle: "Some breeds are hypoallergenic",
    options: [
      { value: "none",     label: "No allergies",       icon: "✅" },
      { value: "mild",     label: "Mild allergies",     icon: "🤧" },
      { value: "moderate", label: "Moderate allergies", icon: "😷" },
      { value: "severe",   label: "Severe allergies",   icon: "🚨" },
    ],
  },
  {
    id: "size",
    icon: Ruler,
    question: "What size pet do you prefer?",
    subtitle: "Big love comes in all sizes",
    options: [
      { value: "small",  label: "Small (< 10 lbs)",  icon: "🐹" },
      { value: "medium", label: "Medium (10–40 lbs)",icon: "🐕" },
      { value: "large",  label: "Large (40+ lbs)",   icon: "🐕‍🦺" },
      { value: "any",    label: "No preference",     icon: "🐾" },
    ],
  },
  {
    id: "reason",
    icon: Heart,
    question: "Why do you want to adopt?",
    subtitle: "Your motivation helps us find your perfect match",
    options: [
      { value: "companion",  label: "Companionship",    icon: "💛" },
      { value: "family",     label: "Family pet",       icon: "👨‍👩‍👧" },
      { value: "exercise",   label: "Exercise buddy",   icon: "🏃" },
      { value: "emotional",  label: "Emotional support",icon: "🤗" },
    ],
  },
];

// ── Pet type icon map for result ──────────────────────────────────────────────
const PET_ICONS: Record<string, React.ElementType> = {
  dog: Dog, cat: Cat, bird: Bird, fish: Fish,
};

function getPetIcon(text: string): React.ElementType {
  const lower = text.toLowerCase();
  if (lower.includes("dog"))  return Dog;
  if (lower.includes("cat"))  return Cat;
  if (lower.includes("bird")) return Bird;
  if (lower.includes("fish")) return Fish;
  return PawPrint;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="flex-1 h-1.5 bg-blue-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full bg-gradient-to-r from-[#5b84c4] to-[#4a73b3]"
          initial={{ width: 0 }}
          animate={{ width: `${(current / total) * 100}%` }}
          transition={{ duration: 0.5, ease }} />
      </div>
      <span className="text-xs font-bold text-[#5b84c4] whitespace-nowrap">
        {current} / {total}
      </span>
    </div>
  );
}

// ── Option button ─────────────────────────────────────────────────────────────
function OptionBtn({
  option, selected, onClick,
}: {
  option: { value: string; label: string; icon: string };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border-2 text-left transition-all duration-200 ${
        selected
          ? "border-[#5b84c4] bg-gradient-to-r from-blue-50 to-violet-50 shadow-md shadow-blue-100"
          : "border-slate-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
      }`}
    >
      <span className="text-2xl w-8 text-center flex-shrink-0">{option.icon}</span>
      <span className={`text-sm font-semibold ${selected ? "text-[#4a73b3]" : "text-gray-700"}`}>
        {option.label}
      </span>
      {selected && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}
          className="ml-auto w-5 h-5 rounded-full bg-[#5b84c4] flex items-center justify-center flex-shrink-0">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}

// ── Loading dots ──────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full bg-[#5b84c4]"
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15, ease: "easeInOut" }} />
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [step, setStep]             = useState<"intro" | "quiz" | "loading" | "result">("intro");
  const [currentQ, setCurrentQ]     = useState(0);
  const [answers, setAnswers]       = useState<Record<string, string>>({});
  const [recommendation, setRec]    = useState("");
  const [direction, setDirection]   = useState(1); // 1 = forward, -1 = back

  const total   = QUESTIONS.length;
  const question = QUESTIONS[currentQ];
  const selected = answers[question?.id];
  const canNext  = !!selected;

  const selectAnswer = (qId: string, value: string) => {
    setAnswers(p => ({ ...p, [qId]: value }));
  };

  const goNext = () => {
    if (!canNext) return;
    setDirection(1);
    if (currentQ < total - 1) {
      setCurrentQ(q => q + 1);
    } else {
      submitAnswers();
    }
  };

  const goBack = () => {
    setDirection(-1);
    if (currentQ === 0) setStep("intro");
    else setCurrentQ(q => q - 1);
  };

  const submitAnswers = async () => {
    setStep("loading");
    try {
      // Call our Next.js API route which calls Groq
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (data.success && data.recommendation) {
        setRec(data.recommendation);
        // Also save to backend
        try { await submitQuiz(answers); } catch { /* non-critical */ }
        setStep("result");
      } else {
        throw new Error("No recommendation");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
      setStep("quiz");
    }
  };

  const restart = () => {
    setStep("intro");
    setCurrentQ(0);
    setAnswers({});
    setRec("");
  };

  const slideVariants = {
    enter:  (d: number) => ({ opacity: 0, x: d > 0 ? 40 : -40 }),
    center: { opacity: 1, x: 0 },
    exit:   (d: number) => ({ opacity: 0, x: d > 0 ? -40 : 40 }),
  };

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (step === "intro") return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="w-full max-w-lg">

        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden">
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-10 text-center overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-300/15 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-8 w-36 h-36 bg-violet-300/20 rounded-full blur-2xl" />

            <motion.div animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="inline-block mb-4">
              <PawPrint size={52} className="text-yellow-300 mx-auto" />
            </motion.div>

            <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Sparkles size={11} /> AI-Powered Pet Matching
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-2">Find Your Perfect Pet</h1>
            <p className="text-blue-200 text-sm leading-relaxed">
              Answer 8 quick questions and our AI will recommend the ideal pet and breed for your lifestyle.
            </p>

            {/* Arch bottom */}
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 600 24" preserveAspectRatio="none" className="w-full h-6">
                <path d="M0,24 C150,0 450,0 600,24 L600,24 L0,24 Z" fill="white" />
              </svg>
            </div>
          </div>

          <div className="p-8">
            {/* Pet type icons */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                { Icon: Dog,  label: "Dogs",  color: "text-amber-500",  bg: "bg-amber-50",  border: "border-amber-100" },
                { Icon: Cat,  label: "Cats",  color: "text-rose-500",   bg: "bg-rose-50",   border: "border-rose-100"  },
                { Icon: Bird, label: "Birds", color: "text-sky-500",    bg: "bg-sky-50",    border: "border-sky-100"   },
                { Icon: Fish, label: "Fish",  color: "text-cyan-500",   bg: "bg-cyan-50",   border: "border-cyan-100"  },
              ].map(({ Icon, label, color, bg, border }, i) => (
                <motion.div key={label}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.4, ease }}
                  className={`flex flex-col items-center gap-1.5 w-16 h-16 rounded-2xl ${bg} border ${border} justify-center`}>
                  <Icon size={22} className={color} strokeWidth={1.5} />
                  <span className={`text-[9px] font-bold ${color}`}>{label}</span>
                </motion.div>
              ))}
            </div>

            {/* What you'll get */}
            <div className="bg-gradient-to-r from-blue-50 to-violet-50 rounded-2xl p-4 mb-6 space-y-2">
              {[
                "Personalized pet type recommendation",
                "Specific breed suggestions for you",
                "AI-powered lifestyle matching",
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-4 h-4 rounded-full bg-[#5b84c4] flex items-center justify-center flex-shrink-0">
                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                      <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  {t}
                </div>
              ))}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={() => setStep("quiz")}
              className="w-full py-4 rounded-2xl font-extrabold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
              <Sparkles size={15} /> Start the Quiz
              <ChevronRight size={15} />
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-3">Takes about 2 minutes · 8 questions</p>
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (step === "loading") return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease }}
        className="bg-white rounded-3xl shadow-xl border border-blue-50 p-12 max-w-sm w-full text-center">

        <motion.div animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#5b84c4] to-[#4a73b3] flex items-center justify-center mx-auto mb-6">
          <Sparkles size={28} className="text-white" />
        </motion.div>

        <h3 className="text-xl font-extrabold text-gray-800 mb-2">Analyzing your answers...</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
          Our AI is finding your perfect pet match based on your lifestyle.
        </p>
        <div className="flex justify-center mb-6">
          <LoadingDots />
        </div>

        {/* Animated pet icons */}
        <div className="flex justify-center gap-3">
          {[Dog, Cat, Bird, Fish].map((Icon, i) => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3, ease: "easeInOut" }}
              className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <Icon size={18} className="text-[#5b84c4]" strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (step === "result") {
    const PetIcon = getPetIcon(recommendation);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="w-full max-w-lg">

          <div className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden">
            {/* Result header */}
            <div className="relative bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] p-8 text-center overflow-hidden">
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-300/15 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-violet-300/20 rounded-full blur-2xl" />

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-yellow-300/20 border border-yellow-300/30 flex items-center justify-center mx-auto mb-4">
                <PetIcon size={40} className="text-yellow-300" strokeWidth={1.5} />
              </motion.div>

              <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
                <Sparkles size={11} /> Your AI Match is Ready
              </div>
              <h2 className="text-2xl font-extrabold text-white">Perfect Match Found!</h2>

              {/* Arch bottom */}
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 600 24" preserveAspectRatio="none" className="w-full h-6">
                  <path d="M0,24 C150,0 450,0 600,24 L600,24 L0,24 Z" fill="white" />
                </svg>
              </div>
            </div>

            <div className="p-8">
              {/* Recommendation text */}
              <div className="bg-gradient-to-br from-blue-50/80 to-violet-50/60 border border-blue-100 rounded-2xl p-5 mb-6 relative">
                <div className="absolute -top-3 left-5">
                  <span className="bg-[#5b84c4] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles size={10} /> AI Recommendation
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mt-2">{recommendation}</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/pets">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="w-full py-3.5 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                    <PawPrint size={15} /> Browse Pets for Adoption
                    <ArrowRight size={14} />
                  </motion.div>
                </Link>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                  onClick={restart}
                  className="w-full py-3 rounded-2xl border-2 border-blue-100 text-[#5b84c4] font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                  <RotateCcw size={14} /> Retake Quiz
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  const QuestionIcon = question.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-violet-50/40 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden">

          {/* Top bar */}
          <div className="bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] px-6 pt-6 pb-8 relative">
            <div className="absolute bottom-0 left-0 right-0">
              <svg viewBox="0 0 600 20" preserveAspectRatio="none" className="w-full h-5">
                <path d="M0,20 C150,0 450,0 600,20 L600,20 L0,20 Z" fill="white" />
              </svg>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <QuestionIcon size={11} />
                Question {currentQ + 1} of {total}
              </div>
              <button onClick={restart}
                className="text-white/60 hover:text-white text-xs font-medium flex items-center gap-1 transition-colors">
                <RotateCcw size={11} /> Restart
              </button>
            </div>
            <ProgressBar current={currentQ + 1} total={total} />
          </div>

          {/* Question area */}
          <div className="px-6 pb-6 pt-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div key={currentQ} custom={direction}
                variants={slideVariants} initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease }}>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                      <QuestionIcon size={17} className="text-[#5b84c4]" />
                    </div>
                    <h2 className="text-lg font-extrabold text-gray-800 leading-snug">{question.question}</h2>
                  </div>
                  <p className="text-gray-400 text-xs ml-12">{question.subtitle}</p>
                </div>

                <div className="space-y-2.5">
                  {question.options.map(opt => (
                    <OptionBtn
                      key={opt.value}
                      option={opt}
                      selected={selected === opt.value}
                      onClick={() => selectAnswer(question.id, opt.value)}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-blue-100 text-[#5b84c4] font-bold text-sm hover:bg-blue-50 transition-all">
                <ChevronLeft size={15} /> Back
              </motion.button>

              <motion.button
                whileHover={{ scale: canNext ? 1.02 : 1 }}
                whileTap={{ scale: canNext ? 0.97 : 1 }}
                onClick={goNext}
                disabled={!canNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-white text-sm shadow-md shadow-blue-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
                {currentQ === total - 1 ? (
                  <><Sparkles size={14} /> Get My Match</>
                ) : (
                  <>Next <ChevronRight size={15} /></>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom hint */}
        <p className="text-center text-xs text-gray-400 mt-4">
          {total - currentQ - 1 > 0
            ? `${total - currentQ - 1} question${total - currentQ - 1 > 1 ? "s" : ""} remaining`
            : "Last question — almost done!"}
        </p>
      </div>
    </div>
  );
}
"use client";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useInView, useAnimation, AnimatePresence, type Variants } from "framer-motion";
import {
  Heart, ShoppingBag, Brain, Calculator, Star,
  ArrowRight, CheckCircle, Users, Package, Home,
  PawPrint, ChevronRight, Sparkles, Shield, Zap,
  ShoppingCart, TrendingUp, ChevronDown, HelpCircle,
  MessageCircle,
} from "lucide-react";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const scaleIn: Variants = {
  hidden:  { opacity: 0, scale: 0.88 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease } },
};

function Reveal({
  children, variants = fadeUp, className = "", delay = 0,
}: {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const ctrl   = useAnimation();
  useEffect(() => {
    if (inView) ctrl.start("visible");
  }, [inView, ctrl]);
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={ctrl}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const features = [
  {
    img:   "/Adopt.png",
    Icon:  Heart,
    title: "Adopt",
    desc:  "Find your forever companion",
    href:  "/pets",
    color: "from-rose-400 to-pink-500",
    light: "bg-rose-50 text-rose-500",
  },
  {
    img:   "/Shop.png",
    Icon:  ShoppingBag,
    title: "Shop",
    desc:  "Premium pet supplies",
    href:  "/products",
    color: "from-[#5b84c4] to-[#4a73b3]",
    light: "bg-blue-50 text-[#5b84c4]",
  },
  {
    img:   "/Quiz.png",
    Icon:  Brain,
    title: "AI Quiz",
    desc:  "Match your lifestyle",
    href:  "/quiz",
    color: "from-[#c4b5fd] to-[#a78bfa]",
    light: "bg-[#f5f3ff] text-[#a78bfa]",
  },
  {
    img:   "/Calculate.png",
    Icon:  Calculator,
    title: "Calculator",
    desc:  "Estimate pet costs",
    href:  "/cost",
    color: "from-[#f3d46d] to-[#e8c04a]",
    light: "bg-yellow-50 text-[#c9a227]",
  },
];

const whyCards = [
  {
    Icon:  Sparkles,
    title: "All-in-One Platform",
    desc:  "Shop, adopt, quiz, and track costs — everything your pet needs in one beautiful place.",
    color: "text-[#c9a227]",
    bg:    "bg-yellow-50",
    border:"border-yellow-100",
  },
  {
    Icon:  Zap,
    title: "Smart & Personalized",
    desc:  "AI-powered pet matching that learns your lifestyle and recommends your perfect companion.",
    color: "text-[#a78bfa]",
    bg:    "bg-[#f5f3ff]",
    border:"border-[#ede9fe]",
  },
  {
    Icon:  Shield,
    title: "Safe & Trusted",
    desc:  "Every pet is verified, every transaction secure. Adopt and shop with complete confidence.",
    color: "text-[#5b84c4]",
    bg:    "bg-blue-50",
    border:"border-blue-100",
  },
];

const stats = [
  { Icon: PawPrint, value: "500+",   label: "Pets Adopted",  color: "text-[#5b84c4]",  bg: "bg-blue-50"   },
  { Icon: Package,  value: "200+",   label: "Products",      color: "text-[#c9a227]",  bg: "bg-yellow-50" },
  { Icon: Users,    value: "1000+",  label: "Happy Owners",  color: "text-[#a78bfa]",  bg: "bg-[#f5f3ff]" },
];

const featuredProducts = [
  {
    img:      "/birdfood.png",
    name:     "Royal Bird Food",
    price:    "NPR 300",
    desc:     "Complete nutrition for bird food. Vet-recommended formula.",
    tag:      "Bird Food",
    tagCls:   "bg-blue-50 text-[#5b84c4]",
  },
  {
    img:      "/dogbites.png",
    name:     "Premium Dog Chews",
    price:    "NPR 750",
    badgeCls: "bg-[#ede9fe] text-[#7c3aed]",
    desc:     "Safe and sturdy chew for strong, happy pups.",
    tag:      "Dog Chew",
    tagCls:   "bg-[#f5f3ff] text-[#a78bfa]",
  },
  {
    img:      "/dogmed.png",
    name:     "Dog Medicine",
    price:    "NPR 500",
    badgeCls: "bg-blue-100 text-[#3d5f9a]",
    desc:     "Vet-approved formula for safe and effective treatment.",
    tag:      "Medicine",
    tagCls:   "bg-sky-50 text-[#5b84c4]",
  },
];
//FAQ
const allFaqs = [
  {
    q: "How do I start the pet adoption process?",
    a: "Browse our available pets on the Adopt page, find one you love, and click 'Meet Me'. You'll fill out a short adoption form and our team will contact you within 24 hours to arrange a meet-and-greet. All pets are health-checked and vaccinated before adoption.",
  },
  {
    q: "Is there an adoption fee?",
    a: "Yes, a small adoption fee covers vaccinations, microchipping, deworming, and a basic health check. Dogs typically range NPR 2,000–5,000 and cats NPR 1,500–3,000. This helps us continue caring for animals in our network.",
  },
  {
    q: "Are the products on your shop genuine?",
    a: "Yes, 100%. We source all products directly from verified manufacturers and authorized distributors. Every listing includes product details, ingredients where applicable, and batch information. We do not allow third-party unverified resellers.",
  },
  {
    q: "Do you offer returns or exchanges?",
    a: "We offer a 7-day hassle-free return policy on all physical products. Items must be unused, in original packaging, and accompanied by proof of purchase. Perishable items like opened pet food are not eligible for return.",
  },
  {
    q: "How does the AI pet matching quiz work?",
    a: "Our quiz asks 8 questions about your lifestyle, living space, activity level, and family situation. Our AI model processes your answers against 50+ breed profiles to recommend your top 3 matches with compatibility scores and care tips.",
  },
  {
    q: "Does the quiz cost anything?",
    a: "The quiz is completely free — no account required. It's one of our core tools to help more animals find loving homes by ensuring pets are matched with owners who can truly care for them.",
  },
  {
    q: "Which areas do you deliver to?",
    a: "We deliver to all major cities in Nepal including Kathmandu, Pokhara, Chitwan, Butwal, Biratnagar, and Birgunj. Enter your address at checkout to confirm availability for your area.",
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-white
        ${open
          ? "border-[#5b84c4]/30 shadow-md shadow-blue-50"
          : "border-gray-100 shadow-sm hover:border-[#c4b5fd]/50"
        }`}
    >
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left group"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className={`w-7 h-7 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all duration-300
              ${open ? "bg-[#5b84c4] text-white" : "bg-blue-50 text-[#5b84c4]"}`}
          >
            {index + 1}
          </span>
          <span className={`font-semibold text-base sm:text-lg leading-snug transition-colors
            ${open ? "text-gray-900" : "text-gray-700 group-hover:text-gray-900"}`}>
            {q}
          </span>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease }}
          className={`ml-3 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300
            ${open ? "bg-blue-200 text-[#5b84c4]" : "bg-gray-100 text-gray-400"}`}
        >
          <ChevronDown size={15} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease }}
          >
            <div className="px-5 pb-5 pl-[60px]">
              <p className="text-gray-500 text-base leading-relaxed font-normal">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
//hero
const HERO_IMG = "/cuteall.png";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden font-fredoka">

      <section className="relative min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-[#e9e4ff] overflow-hidden flex items-center">
        <div className="absolute inset-0 pointer-events-none -z-0">
          <div className="absolute -top-40 -left-40 w-[540px] h-[540px] bg-blue-300/50 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-40 -right-40 w-[540px] h-[540px] bg-[#c4b5fd]/45 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-200/45 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </div>

        {([
          { top:"14%", left:"6%",  s:26, d:0,   r:-12 },
          { top:"72%", left:"4%",  s:18, d:0.6, r:8   },
          { top:"22%", right:"5%", s:22, d:1.1, r:18  },
          { top:"68%", right:"7%", s:16, d:1.7, r:-8  },
        ] as Array<{top:string;left?:string;right?:string;s:number;d:number;r:number}>).map((p, i) => (
          <motion.div key={i}
            className="absolute text-blue-300/70"
            style={{ top: p.top, left: p.left, right: p.right }}
            animate={{ y:[0,-14,0], rotate:[p.r, p.r+8, p.r] }}
            transition={{ duration:4+i, repeat:Infinity, delay:p.d, ease:"easeInOut" }}>
            <PawPrint size={p.s} strokeWidth={1.5} />
          </motion.div>
        ))}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-screen lg:min-h-0 lg:py-20">

            {/* Left text */}
            <motion.div
              initial="hidden" animate="visible" variants={stagger}
              className="text-center lg:text-left order-2 lg:order-1"
            >
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm
                  border border-blue-200 text-[#5b84c4] text-base font-semibold
                  px-4 py-2 rounded-full mb-6 shadow-sm">
                <Sparkles size={14} />
                Nepal&apos;s #1 Pet Platform
              </motion.div>
              <motion.h1 variants={fadeUp}
                className="text-6xl sm:text-7xl lg:text-[5rem] font-bold text-yellow-500 mb-5 leading-[1.1] tracking-tight">
                Find Your
                <span className="block">
                  <span className="shimmer-text">Perfect</span>
                  {" "}Companion
                </span>
              </motion.h1>

              <motion.p variants={fadeUp}
                className="text-xl text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Adopt a loving pet, shop premium supplies, and give an animal the home they truly deserve — all in one place.
              </motion.p>

              <motion.div variants={fadeUp}
                className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/pets"
                  className="group flex items-center justify-center gap-2 px-7 py-4
                    bg-gradient-to-r from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a]
                    hover:from-[#4a73b3] hover:to-[#3d5f9a] text-white font-semibold
                    rounded-2xl text-lg transition-all duration-300
                    shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5">
                  <Heart size={18} />
                  Adopt a Pet
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/quiz"
                  className="group flex items-center justify-center gap-2 px-7 py-4
                    bg-white/90 hover:bg-white border-2 border-[#c4b5fd] hover:border-[#a78bfa]
                    text-[#a78bfa] font-semibold rounded-2xl text-lg
                    transition-all duration-300 backdrop-blur-sm">
                  <Brain size={18} />
                  AI Match Quiz
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}
                className="flex flex-wrap items-center gap-4 mt-7 justify-center lg:justify-start">
                {["500+ Pets Available", "Verified Sellers", "Secure Payments"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-base text-gray-500 font-medium">
                    <CheckCircle size={14} className="text-emerald-500" />
                    {t}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Arch image */}
            <motion.div
              initial={{ opacity:0, scale:0.9, y:30 }}
              animate={{ opacity:1, scale:1, y:0 }}
              transition={{ duration:0.9, delay:0.2, ease }}
              className="relative flex justify-center items-center order-1 lg:order-2"
            >
              <div className="relative w-72 sm:w-80 xl:w-96">
                <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-blue-200/40 to-[#c4b5fd]/40 blur-xl" />

                <div
                  className="relative overflow-hidden shadow-2xl shadow-blue-200/60 border-4 border-white/80"
                  style={{ borderRadius:"50% 50% 16px 16px / 58% 58% 16px 16px" }}
                >
                  <img
                    src={HERO_IMG}
                    alt="Happy dog with owner"
                    className="w-full h-[500px] sm:h-[540px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/15 via-transparent to-transparent" />
                </div>

                <motion.div
                  animate={{ y:[0,-8,0] }}
                  transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }}
                  className="absolute -left-10 top-20 bg-white rounded-2xl shadow-lg shadow-blue-100
                    p-3 flex items-center gap-3 border border-blue-100 w-44 z-10">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Heart size={16} className="text-[#5b84c4]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5 font-medium">Ready to adopt</p>
                    <p className="text-base font-bold text-gray-800">50+ Pets</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y:[0,-10,0] }}
                  transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut", delay:0.6 }}
                  className="absolute -right-8 top-40 bg-white rounded-2xl shadow-lg shadow-[#ede9fe]
                    p-3 flex items-center gap-3 border border-[#ede9fe] w-40 z-10">
                  <div className="w-9 h-9 rounded-xl bg-[#f5f3ff] flex items-center justify-center flex-shrink-0">
                    <Users size={16} className="text-[#a78bfa]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5 font-medium">Happy owners</p>
                    <p className="text-base font-bold text-gray-800">1,000+</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y:[0,-7,0] }}
                  transition={{ duration:4, repeat:Infinity, ease:"easeInOut", delay:1.2 }}
                  className="absolute -left-6 bottom-20 bg-white rounded-2xl shadow-lg shadow-yellow-100
                    p-3 flex items-center gap-3 border border-yellow-100 w-40 z-10">
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center flex-shrink-0">
                    <Star size={16} className="text-[#c9a227] fill-[#f3d46d]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 leading-none mb-0.5 font-medium">Platform rating</p>
                    <p className="text-base font-bold text-gray-800">4.9 / 5</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none"
            style={{ display:"block", width:"100%", height:"90px" }}>
            <path d="M0,90 L0,45 Q360,0 720,0 Q1080,0 1440,45 L1440,90 Z" fill="white" fillOpacity="0.5"/>
            <path d="M0,90 L0,60 Q360,18 720,18 Q1080,18 1440,60 L1440,90 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/*stats*/}
      <section className="bg-white py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {stats.map(({ Icon, value, label, color, bg }) => (
                <motion.div
                  key={label}
                  whileHover={{ y:-4, scale:1.03 }}
                  transition={{ type:"spring", stiffness:260 }}
                  className={`${bg} rounded-3xl p-6 text-center border border-white shadow-sm`}
                >
                  <div className="w-11 h-11 rounded-2xl bg-white mx-auto mb-3 flex items-center justify-center shadow-sm">
                    <Icon size={20} className={color} />
                  </div>
                  <div className={`text-4xl font-bold ${color} mb-1`}>{value}</div>
                  <div className="text-base text-gray-500 font-medium">{label}</div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-14">
            <p className="text-base font-semibold text-[#5b84c4] uppercase tracking-widest mb-3">What We Offer</p>
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-3">
              Everything Your Pet Needs
            </h2>
            <p className="text-gray-500 text-xl max-w-xl mx-auto font-normal">
              One platform for adoption, shopping, and complete pet care
            </p>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-60px" }}
            variants={stagger}
            className="flex flex-wrap justify-center gap-8"
          >
            {features.map(({ img, Icon, title, desc, href, color, light }) => (
              <motion.div key={title} variants={scaleIn}
                whileHover={{ y:-8, scale:1.03 }}
                transition={{ type:"spring", stiffness:200 }}
              >
                <Link href={href} className="flex flex-col items-center group w-[220px]">
                  <div
                    className="w-[220px] h-[280px] overflow-hidden shadow-xl group-hover:shadow-2xl
                      transition-all duration-500 border-4 border-white"
                    style={{ borderRadius:"50% 50% 20px 20px / 55% 55% 20px 20px" }}
                  >
                    <img src={img} alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>

                  <div className={`-mt-5 w-10 h-10 rounded-2xl ${light} flex items-center justify-center
                    shadow-lg border-2 border-white z-10 relative`}>
                    <Icon size={18} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mt-3 group-hover:text-[#5b84c4] transition-colors">
                    {title}
                  </h3>
                  <p className="text-gray-500 text-base text-center mt-1 font-normal">{desc}</p>
                  <span className={`mt-3 text-sm font-semibold bg-gradient-to-r ${color}
                    bg-clip-text text-transparent flex items-center gap-1`}>
                    Explore <ArrowRight size={12} className="text-[#5b84c4] group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* why choose us */}
      <section id="why" className="relative min-h-[85vh] overflow-hidden bg-[#5b84c4] px-4 md:px-6">
        <div className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[110%] h-[115%]
          bg-gradient-to-t from-white via-white to-transparent rounded-t-[100%] shadow-2xl" />

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col justify-center min-h-[85vh] pt-20 pb-16">
          <Reveal className="text-center mb-16">
            <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-6
              text-[#f3d46d] drop-shadow-sm">
              WHY CHOOSE US
            </h2>
            <p className="text-white/90 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed font-normal">
              A smarter, emotional, all-in-one platform designed to engage users and convert attention into action.
            </p>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-40px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-2 sm:px-4"
          >
            {whyCards.map(({ Icon, title, desc, color, bg, border }) => (
              <motion.div key={title} variants={fadeUp}
                whileHover={{ y:-6, scale:1.02 }}
                transition={{ type:"spring", stiffness:220 }}
                className={`bg-white rounded-3xl p-8 shadow-2xl border ${border} group`}
              >
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center mb-5
                  group-hover:scale-110 transition-transform`}>
                  <Icon size={22} className={color} />
                </div>
                <h3 className={`${color} font-bold text-lg mb-3 uppercase tracking-wide`}>{title}</h3>
                <p className="text-gray-500 text-base leading-relaxed font-normal">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* featutred product */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <Reveal className="flex items-end justify-between mb-12">
            <div>
              <p className="text-base font-semibold text-[#5b84c4] uppercase tracking-widest mb-2">Our Store</p>
              {/* heading: text-4xl sm:text-5xl → text-5xl sm:text-6xl */}
              <h2 className="text-5xl sm:text-6xl font-bold text-gray-800">
                Featured Products
              </h2>
              <p className="text-gray-400 text-lg mt-2 font-normal">Handpicked essentials your pet will love</p>
            </div>
            <Link href="/products"
              className="hidden sm:flex items-center gap-2 text-[#5b84c4] font-semibold
                hover:text-[#4a73b3] transition-colors group text-base">
              View all
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-60px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7"
          >
            {featuredProducts.map(({ img, name, price,  badgeCls,  desc, tag, tagCls }) => (
              <motion.div key={name} variants={fadeUp}
                whileHover={{ y:-6 }}
                transition={{ type:"spring", stiffness:200 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100
                  shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <img src={img} alt={name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-sm font-semibold px-2.5 py-1 rounded-xl ${tagCls}`}>{tag}</span>
                    <div className="flex gap-0.5">

                    </div>
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg mt-2 mb-1 leading-snug">{name}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-4 font-normal line-clamp-2">{desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-800">{price}</span>
                    <Link href="/shop"
                      className="flex items-center gap-1.5 px-4 py-2 bg-[#5b84c4] hover:bg-[#4a73b3]
                        text-white text-sm font-semibold rounded-xl transition-all
                        shadow-md shadow-blue-200 hover:-translate-y-0.5">
                      <ShoppingCart size={13} />
                      Add to Cart
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          <div className="mt-8 text-center sm:hidden">
            <Link href="/shop"
              className="inline-flex items-center gap-2 text-[#5b84c4] font-semibold text-base hover:text-[#4a73b3]">
              View all products <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-[#f5f3ff]">
        <div className="max-w-3xl mx-auto">

          <Reveal className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm
              border border-blue-200 text-[#5b84c4] text-base font-semibold
              px-4 py-2 rounded-full mb-5 shadow-sm">
              <HelpCircle size={14} />
              Got Questions?
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-500 text-xl max-w-xl mx-auto font-normal">
              Everything you need to know about adopting, shopping, and using our platform
            </p>
          </Reveal>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once:true, margin:"-60px" }}
            variants={stagger}
            className="space-y-3"
          >
            {allFaqs.map(({ q, a }, i) => (
              <FAQItem key={q} q={q} a={a} index={i} />
            ))}
          </motion.div>

          <Reveal delay={0.2} className="mt-10">
            <div className="rounded-3xl bg-gradient-to-br from-[#5b84c4] to-[#c4b5fd] p-8 text-white
              flex flex-col sm:flex-row items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <MessageCircle size={20} className="text-white" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <p className="font-bold text-lg mb-1">Still have questions?</p>
                <p className="text-white/80 text-base leading-relaxed font-normal">
                  Our team is available Sun–Fri, 9 AM–6 PM .
                </p>
              </div>
              <Link href="mailto:support@pawnepal.com"
                className="inline-flex items-center gap-1.5 text-base font-bold bg-white/20
                  hover:bg-white/30 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap">
                Contact Us <ChevronRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* cta */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#c4b5fd] p-12 text-center">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5">
                  <TrendingUp size={26} className="text-white" />
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold text-white mb-4">
                  Ready to Find Your Match?
                </h2>
                <p className="text-blue-100 text-xl mb-8 font-normal max-w-xl mx-auto">
                  Take our 2-minute AI quiz and meet pets that perfectly fit your lifestyle.
                </p>
                <Link href="/quiz"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#5b84c4]
                    font-bold rounded-2xl text-xl hover:bg-blue-50 transition-all
                    shadow-lg hover:-translate-y-0.5 group">
                  <Brain size={20} />
                  Start the Quiz
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
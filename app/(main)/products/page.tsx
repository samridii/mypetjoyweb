"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart, Search, SlidersHorizontal, Star, Sparkles,
  ChevronLeft, ChevronRight, X, Plus, Minus, Heart, Package,
  Dog, Cat, Bird, Fish, PawPrint, ShoppingBag,
} from "lucide-react";
import { getAllProducts, type Product as ApiProduct } from "@/lib/api/products.api";
import { addToCart } from "@/lib/api/cart.api";
import { useAuth } from "@/lib/context/AuthContext";
import toast from "react-hot-toast";
import Link from "next/link";
interface Product extends ApiProduct {
  category?: string;
}

const CATEGORY_CONFIG: Record<string, {
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
  bgColor: string;
}> = {
  dog:   { icon: Dog,      gradient: "from-amber-100 to-orange-100", iconColor: "text-amber-500",  bgColor: "bg-amber-50"  },
  cat:   { icon: Cat,      gradient: "from-rose-100 to-pink-100",    iconColor: "text-rose-500",   bgColor: "bg-rose-50"   },
  bird:  { icon: Bird,     gradient: "from-sky-100 to-blue-100",     iconColor: "text-sky-500",    bgColor: "bg-sky-50"    },
  fish:  { icon: Fish,     gradient: "from-cyan-100 to-teal-100",    iconColor: "text-cyan-500",   bgColor: "bg-cyan-50"   },
  other: { icon: PawPrint, gradient: "from-violet-100 to-purple-100",iconColor: "text-violet-500", bgColor: "bg-violet-50" },
};

function getCatConfig(category?: string) {
  return CATEGORY_CONFIG[category?.toLowerCase() ?? "other"] ?? CATEGORY_CONFIG.other;
}

const CATEGORY_IMAGES: Record<string, string[]> = {
  dog:   ["/public/husky.jpg",  "/products/dog2.jpg",  "/products/dog3.jpg"],
  cat:   ["/products/cat1.jpg",  "/products/cat2.jpg",  "/products/cat3.jpg"],
  bird:  ["/products/bird1.jpg", "/products/bird2.jpg", "/products/bird3.jpg"],
  fish:  ["/products/fish1.jpg", "/products/fish2.jpg", "/products/fish3.jpg"],
  other: ["/products/pet1.jpg",  "/products/pet2.jpg",  "/products/pet3.jpg"],
};

function productImg(p: Product, idx: number): string | null {
  if (p.image) return p.image;
  const cat  = p.category?.toLowerCase() ?? "other";
  const pool = CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES.other;
  return pool[idx % pool.length] ?? null;
}

const CATEGORIES = ["All", "Dog", "Cat", "Bird", "Fish", "Other"];
const SORT_OPTIONS = [
  { value: "default",    label: "Featured"           },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc",   label: "Name: A to Z"       },
];
const PER_PAGE = 12;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

function ProductCard({
  product, index, onAddToCart, wishlist, onToggleWish,
}: {
  product: Product;
  index: number;
  onAddToCart: (p: Product, qty: number) => void;
  wishlist: Set<string>;
  onToggleWish: (id: string) => void;
}) {
  const [qty, setQty]       = useState(1);
  const [imgErr, setImgErr] = useState(false);
  const src    = productImg(product, index);
  const cfg    = getCatConfig(product.category);
  const Icon   = cfg.icon;
  const inStock = product.stock > 0;
  const wished  = wishlist.has(product._id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ duration: 0.4, ease, delay: (index % PER_PAGE) * 0.04 }}
      layout
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-blue-100/60 border border-blue-50 overflow-hidden flex flex-col transition-shadow duration-300"
    >
      {/* Image area */}
      <div className={`relative h-52 bg-gradient-to-br ${cfg.gradient} overflow-hidden flex-shrink-0`}>
        {src && !imgErr ? (
          <img
            src={src}
            alt={product.name}
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={64} className={`${cfg.iconColor} opacity-40`} strokeWidth={1.5} />
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={() => onToggleWish(product._id)}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-200 ${
            wished
              ? "bg-rose-500 text-white scale-110"
              : "bg-white/90 text-gray-400 hover:text-rose-400 hover:scale-110"
          }`}
        >
          <Heart size={14} className={wished ? "fill-white" : ""} />
        </button>

        {/* Out of stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-gray-800 text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wide">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge */}
        {product.category && (
          <div className="absolute bottom-3 left-3">
            <span className={`inline-flex items-center gap-1.5 ${cfg.bgColor} text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.iconColor} border border-white/60 shadow-sm`}>
              <Icon size={11} />
              {product.category}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 font-normal leading-relaxed line-clamp-2 mb-3 flex-1">
          {product.description || "Premium quality pet product for your beloved companion."}
        </p>

        {/* Price + stars */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xl font-extrabold text-blue-600">
            NPR {product.price.toLocaleString()}
          </span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} size={11}
                className={s <= 4 ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"} />
            ))}
          </div>
        </div>

        {/* Qty + Add to cart */}
        {inStock ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-blue-50 rounded-xl px-2 py-1.5 border border-blue-100">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-200 text-blue-600 transition-colors">
                <Minus size={11} />
              </button>
              <span className="text-sm font-bold text-blue-700 w-5 text-center">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-200 text-blue-600 transition-colors">
                <Plus size={11} />
              </button>
            </div>
            <button
              onClick={() => { onAddToCart(product, qty); setQty(1); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] hover:from-[#4a73b3] hover:to-[#3d5f9a] text-white text-xs font-bold shadow-md shadow-blue-200 hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              <ShoppingCart size={13} />
              Add to Cart
            </button>
          </div>
        ) : (
          <button disabled
            className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold cursor-not-allowed">
            Out of Stock
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl border border-blue-50 overflow-hidden animate-pulse">
      <div className="h-52 bg-gradient-to-br from-blue-50 to-blue-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
        <div className="h-9 bg-blue-50 rounded-xl mt-2" />
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort]         = useState("default");
  const [page, setPage]         = useState(1);
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getAllProducts();
        setProducts((res.data.data ?? []) as Product[]);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => { setPage(1); }, [search, category, sort]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (category !== "All")
      list = list.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    if (sort === "price-asc")  list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name-asc")   list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleAddToCart = async (product: Product, qty: number) => {
    if (!isAuthenticated) { toast.error("Please sign in to add to cart"); return; }
    try {
      await addToCart(product._id, qty);
      toast.success(`${product.name} added to cart!`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const toggleWish = (id: string) => {
    setWishlist(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from wishlist"); }
      else              { next.add(id);    toast.success("Saved to wishlist"); }
      return next;
    });
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce<(number | "...")[]>((acc, p, i, arr) => {
      if (i > 0 && typeof arr[i - 1] === "number" && (p as number) - (arr[i - 1] as number) > 1)
        acc.push("...");
      acc.push(p);
      return acc;
    }, []);

  const CAT_ICONS: Record<string, React.ElementType> = {
    all: ShoppingBag, dog: Dog, cat: Cat, bird: Bird, fish: Fish, other: PawPrint,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-yellow-50/40 font-fredoka">

      {/*hero with arch*/}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#5b84c4] via-[#4a73b3] to-[#3d5f9a] pt-14 pb-32">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-12 right-0 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-8 left-1/3 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}>
            <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/30 text-yellow-200 text-xs font-semibold px-4 py-2 rounded-full mb-5 backdrop-blur-sm">
              <Sparkles size={12} /> Premium Pet Products
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 leading-tight">
              Everything Your Pet
              <br />
              <span className="text-yellow-300">Deserves</span>
            </h1>
            <p className="text-blue-100 text-sm font-normal max-w-md mx-auto mb-8">
              Handpicked supplies, treats and accessories for dogs, cats, birds and fish.
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-11 pr-12 py-4 rounded-2xl bg-white shadow-lg shadow-blue-900/20 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-yellow-300 placeholder-gray-400 font-medium"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 pb-20 relative z-10">

        {/* Category pills with icons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease }}
          className="flex flex-wrap gap-2 justify-center mb-8"
        >
          {CATEGORIES.map(cat => {
            const key    = cat.toLowerCase();
            const active = category === cat;
            const CatIcon = CAT_ICONS[key] ?? ShoppingBag;
            const count  = products.filter(p =>
              cat === "All" ? true : p.category?.toLowerCase() === key
            ).length;
            return (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold border transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] text-white border-transparent shadow-lg shadow-blue-200"
                    : "bg-white text-gray-600 border-blue-100 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}>
                <CatIcon size={14} />
                {cat}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-white/25 text-white" : "bg-blue-50 text-blue-400"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
            <Package size={14} className="text-blue-400" />
            {loading ? "Loading products..." : (
              <>
                <span className="text-blue-600 font-bold">{filtered.length}</span> products
                {category !== "All" && <> in <span className="text-blue-600 font-bold">{category}</span></>}
                {search && <> matching <span className="text-blue-600 font-bold">"{search}"</span></>}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-blue-100 rounded-xl px-3 py-2 shadow-sm">
              <SlidersHorizontal size={13} className="text-blue-400" />
              <select value={sort} onChange={e => setSort(e.target.value)}
                className="text-sm text-gray-600 font-medium bg-transparent outline-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            {wishlist.size > 0 && (
              <span className="flex items-center gap-1 bg-rose-50 border border-rose-100 text-rose-500 text-xs font-bold px-3 py-2 rounded-xl">
                <Heart size={12} className="fill-rose-500" /> {wishlist.size} saved
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : paginated.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-4">
              <Search size={32} className="text-blue-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-sm text-gray-400 mb-5">Try a different category or clear your search.</p>
            <button onClick={() => { setSearch(""); setCategory("All"); }}
              className="px-6 py-2.5 bg-[#5b84c4] text-white text-sm font-bold rounded-xl hover:bg-[#4a73b3] transition-colors">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={`${category}-${sort}-${page}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginated.map((product, i) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  index={i}
                  onAddToCart={handleAddToCart}
                  wishlist={wishlist}
                  onToggleWish={toggleWish}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => { setPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 1}
              className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronLeft size={16} />
            </button>

            {pageNumbers.map((p, i) =>
              p === "..." ? (
                <span key={`d${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">…</span>
              ) : (
                <button key={p}
                  onClick={() => { setPage(p as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                    page === p
                      ? "bg-gradient-to-r from-[#5b84c4] to-[#4a73b3] text-white shadow-blue-200 shadow-md scale-110"
                      : "bg-white border border-blue-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                  }`}>
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => { setPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === totalPages}
              className="w-10 h-10 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-500 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all">
              <ChevronRight size={16} />
            </button>

            <span className="text-xs text-gray-400 font-medium ml-2">
              Page {page} / {totalPages}
            </span>
          </motion.div>
        )}

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease }}
          className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-200 p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-yellow-100/60"
        >
          <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/20 rounded-full pointer-events-none" />
          <div className="absolute -bottom-8 left-12 w-28 h-28 bg-white/15 rounded-full pointer-events-none" />
          <div className="relative z-10 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
              <PawPrint size={20} className="text-[#3d5f9a]" />
              <h3 className="text-2xl font-extrabold text-[#3d5f9a]">Looking to adopt a pet?</h3>
            </div>
            <p className="text-blue-800/70 text-sm font-normal">
              Find your perfect companion and give them a loving home.
            </p>
          </div>
          <Link href="/pets"
            className="relative z-10 flex-shrink-0 flex items-center gap-2 px-8 py-3.5 bg-[#5b84c4] hover:bg-[#4a73b3] text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-300/40 hover:-translate-y-0.5 transition-all whitespace-nowrap">
            <PawPrint size={16} />
            Browse Pets
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
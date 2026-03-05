// app/admin/products/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Search, X,
  ShoppingBag, Check, Package,
} from "lucide-react";
import api from "@/lib/api/axios";
import { API } from "@/lib/api/endpoint";
import type { Product } from "@/lib/api/products.api";
import toast from "react-hot-toast";

// ── helpers ───────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", description: "", price: "", stock: "", image: "",
};
type FormData   = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormData, string>>;

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({
  product, onClose, onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm]     = useState<FormData>(
    product ? {
      name:        product.name,
      description: product.description,
      price:       String(product.price),
      stock:       String(product.stock),
      image:       product.image ?? "",
    } : { ...EMPTY_FORM }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(p => ({ ...p, [k]: e.target.value }));
      setErrors(p => ({ ...p, [k]: "" }));
    };

  const validate = () => {
    const e: FormErrors = {};
    if (!form.name.trim())                           e.name        = "Required";
    if (!form.description.trim())                    e.description = "Required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0)
                                                     e.price       = "Valid price required";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
                                                     e.stock       = "Valid stock required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name:        form.name,
      description: form.description,
      price:       Number(form.price),
      stock:       Number(form.stock),
      image:       form.image,
    };
    try {
      if (product) {
        await api.put(API.ADMIN.PRODUCTS.UPDATE(product._id), payload);
        toast.success("Product updated");
      } else {
        await api.post(API.ADMIN.PRODUCTS.CREATE, payload);
        toast.success("Product created");
      }
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save product");
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-base">
            {product ? "Edit Product" : "Add New Product"}
          </h2>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input value={form.name} onChange={set("name")}
              placeholder="e.g. Premium Dog Food" className={inp(errors.name)} />
            {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea rows={3} value={form.description} onChange={set("description")}
              placeholder="Describe the product..."
              className={`${inp(errors.description)} resize-none`} />
            {errors.description && <p className="text-xs text-red-400 mt-0.5">{errors.description}</p>}
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Price (NPR) <span className="text-red-400">*</span>
              </label>
              <input type="number" min="0" step="0.01"
                value={form.price} onChange={set("price")}
                placeholder="e.g. 1500" className={inp(errors.price)} />
              {errors.price && <p className="text-xs text-red-400 mt-0.5">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Stock <span className="text-red-400">*</span>
              </label>
              <input type="number" min="0"
                value={form.stock} onChange={set("stock")}
                placeholder="e.g. 50" className={inp(errors.stock)} />
              {errors.stock && <p className="text-xs text-red-400 mt-0.5">{errors.stock}</p>}
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
            <input value={form.image} onChange={set("image")}
              placeholder="https://... or /products/image.png"
              className={inp()} />
            {form.image && (
              <div className="mt-2 w-16 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                <img src={form.image} alt="preview"
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-white text-sm disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
              {saving ? (
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              ) : <Check size={14} />}
              {product ? "Save Changes" : "Create Product"}
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
        <h3 className="font-bold text-gray-800 mb-1">Delete "{name}"?</h3>
        <p className="text-sm text-gray-400 mb-5">This action cannot be undone.</p>
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [modalProduct, setModalProduct] = useState<Product | null | undefined>(undefined);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: Product[] }>(API.ADMIN.PRODUCTS.GET_ALL);
      setProducts(res.data.data ?? []);
    } catch { toast.error("Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await api.delete(API.ADMIN.PRODUCTS.DELETE(deleteProduct._id));
      toast.success("Product deleted");
      setDeleteProduct(null);
      fetchProducts();
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(false); }
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q);
    const matchStock  =
      stockFilter === "ALL"      ? true :
      stockFilter === "IN_STOCK" ? p.stock > 0 :
      stockFilter === "LOW"      ? p.stock > 0 && p.stock <= 5 :
                                   p.stock === 0;
    return matchSearch && matchStock;
  });

  const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Products</h1>
          <p className="text-sm text-gray-400 mt-0.5">{products.length} total · Inventory value: NPR {totalValue.toLocaleString()}</p>
        </div>
        <button onClick={() => setModalProduct(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm shadow-md hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #5b84c4, #4a73b3)" }}>
          <Plus size={15} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50" />
          {search && (
            <button onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={12} />
            </button>
          )}
        </div>

        <select value={stockFilter} onChange={e => setStockFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 text-gray-600">
          <option value="ALL">All Stock</option>
          <option value="IN_STOCK">In Stock</option>
          <option value="LOW">Low Stock (≤5)</option>
          <option value="OUT">Out of Stock</option>
        </select>

        <span className="text-xs text-gray-400 font-medium ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Value</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Added</th>
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
                    <Package size={28} className="text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No products found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(product => {
                  const stockStatus =
                    product.stock === 0   ? { label: "Out of Stock", cls: "bg-red-50 border-red-200 text-red-600"        } :
                    product.stock <= 5    ? { label: "Low Stock",    cls: "bg-amber-50 border-amber-200 text-amber-600"  } :
                                            { label: "In Stock",     cls: "bg-emerald-50 border-emerald-200 text-emerald-600" };
                  return (
                    <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      {/* Product */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            {product.image ? (
                              <img src={product.image} alt={product.name}
                                className="w-full h-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 leading-tight">{product.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-48">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        NPR {product.price.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">{product.stock}</span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${stockStatus.cls}`}>
                            {stockStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        NPR {(product.price * product.stock).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setModalProduct(product)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => setDeleteProduct(product)}
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
      {modalProduct !== undefined && (
        <ProductModal product={modalProduct} onClose={() => setModalProduct(undefined)} onSaved={fetchProducts} />
      )}
      {deleteProduct && (
        <DeleteConfirm name={deleteProduct.name} onConfirm={handleDelete}
          onCancel={() => setDeleteProduct(null)} deleting={deleting} />
      )}
    </div>
  );
}



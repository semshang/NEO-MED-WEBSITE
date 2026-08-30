"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Edit, ImageIcon, Plus, Search, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES } from "@/data/products";
import { type Product, useAdmin } from "@/components/admin/AdminProvider";

type EditorState = Product | "new" | null;

export default function ProductsPage() {
  const { products, settings, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<EditorState>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(
    () => products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase())),
    [products, search],
  );

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => form.get(name)?.toString().trim() ?? "";
    const stock = value("stock");
    const price = value("price");
    const product = {
      name: value("name"), category: value("category"), description: value("description"), image: value("image"),
      stock: stock === "" ? null : Number(stock), price: price === "" ? null : Number(price),
    };
    try {
      setError(null);
      if (editor === "new") await addProduct(product);
      else if (editor) await updateProduct(editor.id, product);
      setEditor(null);
    } catch (saveError: unknown) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save this product.");
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteProduct(deletingId);
      setDeletingId(null);
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to remove this product.");
    }
  }

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div><h1 className="text-3xl font-bold text-brand-navy">Products</h1><p className="mt-1 text-slate-500">Manage the live catalogue and verified inventory.</p></div>
        <button onClick={() => setEditor("new")} className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"><Plus size={16} />Add product</button>
      </div>
      {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4"><label className="relative block w-full md:w-96"><span className="sr-only">Search products</span><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="search" placeholder="Search products by name or category" value={search} onChange={(event) => setSearch(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20" /></label></div>
        <div className="overflow-x-auto"><table className="min-w-[800px] w-full text-left"><thead><tr className="bg-slate-50/50 text-xs uppercase text-slate-500"><th className="px-6 py-3">Image</th><th className="px-6 py-3">Product</th><th className="px-6 py-3">Category</th><th className="px-6 py-3 text-right">Stock</th><th className="px-6 py-3">Status</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
          {filteredProducts.length === 0 ? <tr><td colSpan={6} className="py-8 text-center text-slate-500">No products found.</td></tr> : filteredProducts.map((product) => <tr key={product.id} className="hover:bg-slate-50/50"><td className="px-6 py-3"><Thumbnail product={product} /></td><td className="max-w-60 truncate px-6 py-3 text-sm font-medium text-brand-navy">{product.name}</td><td className="px-6 py-3 text-sm text-slate-500">{product.category}</td><td className="px-6 py-3 text-right text-sm font-medium text-slate-600">{product.stock ?? "Not set"}</td><td className="px-6 py-3">{stockStatus(product.stock, settings.lowStockThreshold)}</td><td className="space-x-2 px-6 py-3 text-right"><button aria-label={`Edit ${product.name}`} onClick={() => setEditor(product)} className="rounded-lg p-2 text-slate-400 hover:bg-brand-blue/10 hover:text-brand-blue"><Edit size={16} /></button><button aria-label={`Remove ${product.name}`} onClick={() => setDeletingId(product.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button></td></tr>)}
        </tbody></table></div>
      </div>
      <AnimatePresence>{editor && <Editor editor={editor} onClose={() => setEditor(null)} onSave={saveProduct} />}{deletingId && <DeleteDialog onCancel={() => setDeletingId(null)} onConfirm={() => void confirmDelete()} />}</AnimatePresence>
    </div>
  );
}

function Thumbnail({ product }: { product: Product }) {
  return product.image ? <Image src={product.image} alt={product.name} width={48} height={48} sizes="48px" className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 object-cover" /> : <div aria-label={`${product.name} image pending`} className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"><ImageIcon size={18} /></div>;
}

function stockStatus(stock: number | null, threshold: number) {
  if (stock === null) return <Badge color="slate">Pending</Badge>;
  if (stock === 0) return <Badge color="red">Out of stock</Badge>;
  if (stock <= threshold) return <Badge color="amber">Low stock</Badge>;
  return <Badge color="green">In stock</Badge>;
}

function Badge({ color, children }: { color: "slate" | "red" | "amber" | "green"; children: React.ReactNode }) {
  const classes = { slate: "bg-slate-100 text-slate-600", red: "bg-red-100 text-red-800", amber: "bg-amber-100 text-amber-800", green: "bg-green-100 text-green-800" };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[color]}`}>{children}</span>;
}

function Editor({ editor, onClose, onSave }: { editor: EditorState; onClose: () => void; onSave: (event: FormEvent<HTMLFormElement>) => Promise<void> }) {
  const product = editor === "new" ? null : editor;
  return <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="my-8 w-full max-w-lg rounded-2xl bg-white shadow-xl"><div className="flex items-center justify-between border-b border-slate-100 p-6"><h2 className="text-xl font-bold text-brand-navy">{editor === "new" ? "Add product" : "Edit product"}</h2><button aria-label="Close product editor" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100"><X /></button></div><form onSubmit={onSave} className="space-y-4 p-6"><Field label="Product name"><input name="name" required defaultValue={product?.name ?? ""} className="input" /></Field><Field label="Category"><select name="category" required defaultValue={product?.category ?? ""} className="input bg-white"><option value="" disabled>Select a category</option>{CATEGORIES.filter((category) => category !== "All Products").map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="Public image path (optional)"><input name="image" defaultValue={product?.image ?? ""} placeholder="/products/image.jpg" className="input" /><p className="mt-1 text-xs text-slate-500">Add approved images under public/products before using them here.</p></Field><div className="grid grid-cols-2 gap-4"><Field label="Stock"><input name="stock" type="number" min="0" defaultValue={product?.stock ?? ""} placeholder="Not set" className="input" /></Field><Field label="Price (NPR)"><input name="price" type="number" min="0" defaultValue={product?.price ?? ""} placeholder="Quote required" className="input" /></Field></div><Field label="Verified description"><textarea name="description" rows={4} defaultValue={product?.description ?? ""} className="input" /></Field><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-lg px-5 py-2.5 hover:bg-slate-100">Cancel</button><button type="submit" className="rounded-lg bg-brand-blue px-5 py-2.5 text-white">Save product</button></div></form></motion.div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block text-sm font-medium text-slate-700">{label}<span className="mt-1 block">{children}</span></label>; }

function DeleteDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"><AlertCircle className="mx-auto mb-4 text-red-500" /><h2 className="text-lg font-bold">Remove this product?</h2><p className="my-4 text-sm text-slate-500">It will be hidden from the catalogue and cannot be selected for new requests.</p><div className="flex gap-3"><button onClick={onCancel} className="flex-1 rounded-lg bg-slate-100 py-2.5">Cancel</button><button onClick={onConfirm} className="flex-1 rounded-lg bg-red-500 py-2.5 text-white">Remove</button></div></motion.div></div>;
}

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
    () =>
      products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.category.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (name: string) => form.get(name)?.toString().trim() ?? "";
    const stock = value("stock");
    const price = value("price");

    const imageFile = form.get("image_file") as File | null;
    let imageVal = value("existing_image");
    if (imageFile && imageFile.size > 0) {
      const reader = new FileReader();
      imageVal = await new Promise((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(imageFile);
      });
    }

    const features = value("features")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const applications = value("applications")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const specifications = value("specifications")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex === -1) return { label: line, value: "-" };
        return {
          label: line.slice(0, colonIndex).trim(),
          value: line.slice(colonIndex + 1).trim(),
        };
      })
      .filter((s) => s.label && s.value);

    const faq = value("faq")
      .split("\n\n")
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const lines = block.split("\n");
        const q = lines[0].replace(/^(q:|question:)\s*/i, "").trim();
        const a = lines.slice(1).join("\n").replace(/^(a:|answer:)\s*/i, "").trim();
        return { question: q, answer: a };
      })
      .filter((item) => item.question && item.answer);

    const isActive = form.get("isActive") === "on";

    const product = {
      name: value("name"),
      category: value("category"),
      description: value("description"),
      image: imageVal,
      isActive,
      active: isActive,
      stock: stock === "" ? null : Number(stock),
      price: price === "" ? null : Number(price),
      seoTitle: value("seoTitle"),
      seoDescription: value("seoDescription"),
      imageAlt: value("imageAlt"),
      brand: value("brand"),
      model: value("model"),
      shortDescription: value("shortDescription"),
      detailedDescription: value("detailedDescription"),
      features,
      applications,
      specifications,
      warranty: value("warranty"),
      installationSupport: value("installationSupport"),
      deliveryInformation: value("deliveryInformation"),
      faq,
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
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Products</h1>
          <p className="mt-1 text-slate-500">Manage the live catalogue and inventory.</p>
        </div>
        <button
          onClick={() => setEditor("new")}
          className="flex items-center gap-2 rounded-lg bg-brand-blue px-4 py-2 font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus size={16} />
          Add product
        </button>
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <label className="relative block w-full md:w-96">
            <span className="sr-only">Search products</span>
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="search"
              placeholder="Search products by name or category"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-xs uppercase text-slate-500">
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Product</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3">
                      <Thumbnail product={product} />
                    </td>
                    <td className="max-w-60 truncate px-6 py-3 text-sm font-medium text-brand-navy">
                      {product.name}
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-500">{product.category}</td>
                    <td className="px-6 py-3 text-right text-sm font-medium text-slate-600">
                      {product.stock ?? "Not set"}
                    </td>
                    <td className="px-6 py-3">
                      {product.isActive === false || (product as { active?: boolean }).active === false ? (
                        <Badge color="red">Disabled</Badge>
                      ) : (
                        stockStatus(product.stock, settings.lowStockThreshold)
                      )}
                    </td>
                    <td className="space-x-2 px-6 py-3 text-right">
                      <button
                        aria-label={`Edit ${product.name}`}
                        onClick={() => setEditor(product)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-brand-blue/10 hover:text-brand-blue"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        aria-label={`Remove ${product.name}`}
                        onClick={() => setDeletingId(product.id)}
                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {editor && <Editor editor={editor} onClose={() => setEditor(null)} onSave={saveProduct} />}
        {deletingId && <DeleteDialog onCancel={() => setDeletingId(null)} onConfirm={() => void confirmDelete()} />}
      </AnimatePresence>
    </div>
  );
}

function Thumbnail({ product }: { product: Product }) {
  return product.image ? (
    <Image
      src={product.image}
      alt={product.imageAlt || product.name}
      width={48}
      height={48}
      sizes="48px"
      className="h-12 w-12 rounded-lg border border-slate-200 bg-slate-100 object-cover"
    />
  ) : (
    <div
      aria-label={`${product.name} image pending`}
      className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"
    >
      <ImageIcon size={18} />
    </div>
  );
}

function stockStatus(stock: number | null, threshold: number) {
  if (stock === null) return <Badge color="slate">Pending</Badge>;
  if (stock === 0) return <Badge color="red">Out of stock</Badge>;
  if (stock <= threshold) return <Badge color="amber">Low stock</Badge>;
  return <Badge color="green">In stock</Badge>;
}

function Badge({
  color,
  children,
}: {
  color: "slate" | "red" | "amber" | "green";
  children: React.ReactNode;
}) {
  const classes = {
    slate: "bg-slate-100 text-slate-600",
    red: "bg-red-100 text-red-800",
    amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${classes[color]}`}>
      {children}
    </span>
  );
}

function Editor({
  editor,
  onClose,
  onSave,
}: {
  editor: EditorState;
  onClose: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const [activeTab, setActiveTab] = useState<"basic" | "seo" | "specs">("basic");
  const product = editor === "new" ? null : editor;

  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "");

  const defaultFeatures = product?.features?.join("\n") ?? "";
  const defaultApplications = product?.applications?.join("\n") ?? "";
  const defaultSpecifications = product?.specifications?.map((s) => `${s.label}: ${s.value}`).join("\n") ?? "";
  const defaultFaq = product?.faq?.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n") ?? "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <h2 className="text-xl font-bold text-brand-navy">
            {editor === "new" ? "Add product" : "Edit product"}
          </h2>
          <button aria-label="Close product editor" onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 px-6 pt-2 bg-slate-50/50 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === "basic"
                ? "border-brand-blue text-brand-blue font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Basic & Pricing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === "seo"
                ? "border-brand-blue text-brand-blue font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            SEO & Metadata
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`pb-3 px-4 border-b-2 transition-colors ${
              activeTab === "specs"
                ? "border-brand-blue text-brand-blue font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Specs & Rich Content
          </button>
        </div>

        <form onSubmit={onSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 max-h-[60vh]">
            {/* Tab 1: Basic */}
            <div className={activeTab === "basic" ? "space-y-4" : "hidden"}>
              <Field label="Product name">
                <input name="name" required defaultValue={product?.name ?? ""} className="input" />
              </Field>
              <Field label="Category">
                <select name="category" required defaultValue={product?.category ?? ""} className="input bg-white">
                  <option value="" disabled>Select a category</option>
                  {CATEGORIES.filter((category) => category !== "All Products").map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Product Image">
                <input type="file" accept="image/*" name="image_file" className="input py-2" />
                <input type="hidden" name="existing_image" value={product?.image ?? ""} />
                <p className="mt-1 text-xs text-slate-500">Upload a picture for this product (leave blank to keep current).</p>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Stock">
                  <input name="stock" type="number" min="0" defaultValue={product?.stock ?? ""} placeholder="Not set" className="input" />
                </Field>
                <Field label="Price (NPR)">
                  <input name="price" type="number" min="0" defaultValue={product?.price ?? ""} placeholder="Quote required" className="input" />
                </Field>
              </div>
              <Field label="Product description">
                <textarea name="description" rows={4} defaultValue={product?.description ?? ""} className="input" />
              </Field>
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={product ? (product.isActive !== false && (product as { active?: boolean }).active !== false) : true}
                  className="h-4 w-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue"
                />
                <span className="text-sm font-medium text-slate-700">Active in public catalogue & sitemap</span>
              </label>
            </div>

            {/* Tab 2: SEO */}
            <div className={activeTab === "seo" ? "space-y-4" : "hidden"}>
              <Field label="SEO Custom Title (Optional)">
                <input
                  name="seoTitle"
                  placeholder="Defaults to '{Product Name} in Nepal | Neomeditech'"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="input"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Custom meta title for search engines. Recommended: 50–60 characters.</span>
                  <span
                    className={`font-mono font-medium ${
                      seoTitle.length >= 50 && seoTitle.length <= 60
                        ? "text-emerald-600"
                        : seoTitle.length > 60
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {seoTitle.length} chars
                  </span>
                </div>
              </Field>
              <Field label="SEO Meta Description (Optional)">
                <textarea
                  name="seoDescription"
                  rows={3}
                  placeholder="Custom meta description for search engine result snippets."
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  className="input"
                />
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Recommended: 140–160 characters. Avoid unverified claims.</span>
                  <span
                    className={`font-mono font-medium ${
                      seoDescription.length >= 140 && seoDescription.length <= 160
                        ? "text-emerald-600"
                        : seoDescription.length > 160
                        ? "text-amber-600"
                        : "text-slate-400"
                    }`}
                  >
                    {seoDescription.length} chars
                  </span>
                </div>
              </Field>
              <Field label="Image Alt Text (Optional)">
                <input
                  name="imageAlt"
                  placeholder="Defaults to '{Product Name} supplied by Neomeditech in Nepal'"
                  defaultValue={product?.imageAlt ?? ""}
                  className="input"
                />
              </Field>
            </div>

            {/* Tab 3: Specs & Rich Content */}
            <div className={activeTab === "specs" ? "space-y-4" : "hidden"}>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Brand / Manufacturer">
                  <input
                    name="brand"
                    placeholder="Manufacturer / Brand name from datasheet"
                    defaultValue={product?.brand ?? ""}
                    className="input"
                  />
                </Field>
                <Field label="Model Number">
                  <input
                    name="model"
                    placeholder="Model number as indicated by manufacturer"
                    defaultValue={product?.model ?? ""}
                    className="input"
                  />
                </Field>
              </div>
              <Field label="Short Summary / Subtitle">
                <input
                  name="shortDescription"
                  placeholder="One sentence summary for catalog listings."
                  defaultValue={product?.shortDescription ?? ""}
                  className="input"
                />
              </Field>
              <Field label="Detailed Overview & Specifications">
                <textarea
                  name="detailedDescription"
                  rows={4}
                  placeholder="Full clinical or engineering description (rendered above features)."
                  defaultValue={product?.detailedDescription ?? ""}
                  className="input"
                />
              </Field>
              <Field label="Key Features (One feature per line)">
                <textarea
                  name="features"
                  rows={4}
                  placeholder="Feature 1 (from manufacturer datasheet)&#10;Feature 2&#10;Feature 3"
                  defaultValue={defaultFeatures}
                  className="input font-mono text-xs"
                />
              </Field>
              <Field label="Technical Specifications (Format: Label: Value, one per line)">
                <textarea
                  name="specifications"
                  rows={5}
                  placeholder="Dimensions: e.g. 300 x 200 x 150 mm&#10;Power: e.g. AC 220V, 50Hz&#10;Weight: e.g. 5 kg"
                  defaultValue={defaultSpecifications}
                  className="input font-mono text-xs"
                />
              </Field>
              <Field label="Clinical Applications & Departments (One per line)">
                <textarea
                  name="applications"
                  rows={3}
                  placeholder="Department or intended medical setting (one per line)"
                  defaultValue={defaultApplications}
                  className="input font-mono text-xs"
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Warranty Information">
                  <input
                    name="warranty"
                    placeholder="e.g. Standard manufacturer warranty (enter official datasheet terms)"
                    defaultValue={product?.warranty ?? ""}
                    className="input text-xs"
                  />
                </Field>
                <Field label="Installation Support">
                  <input
                    name="installationSupport"
                    placeholder="e.g. Technical support & operational guidance upon delivery"
                    defaultValue={product?.installationSupport ?? ""}
                    className="input text-xs"
                  />
                </Field>
                <Field label="Delivery Information">
                  <input
                    name="deliveryInformation"
                    placeholder="e.g. Delivery terms in Nepal (enter factual dispatch details)"
                    defaultValue={product?.deliveryInformation ?? ""}
                    className="input text-xs"
                  />
                </Field>
              </div>
              <Field label="Product FAQs (Format: Q: Question on first line, A: Answer on next lines. Separate Q&As with blank line.)">
                <textarea
                  name="faq"
                  rows={5}
                  placeholder="Q: What is included in the package?&#10;A: Refer to standard manufacturer datasheet packing list.&#10;&#10;Q: How to request a quotation?&#10;A: Click Inquire on WhatsApp or submit the inquiry form."
                  defaultValue={defaultFaq}
                  className="input text-xs"
                />
              </Field>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-5 py-2.5 hover:bg-slate-100 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-blue px-5 py-2.5 text-white text-sm font-medium shadow-sm hover:bg-blue-700"
            >
              Save product
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <span className="mt-1 block">{children}</span>
    </label>
  );
}

function DeleteDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl"
      >
        <AlertCircle className="mx-auto mb-4 text-red-500" />
        <h2 className="text-lg font-bold">Remove this product?</h2>
        <p className="my-4 text-sm text-slate-500">
          It will be hidden from the catalogue and cannot be selected for new requests.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 rounded-lg bg-slate-100 py-2.5">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-red-500 py-2.5 text-white">
            Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
}

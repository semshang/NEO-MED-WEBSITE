"use client";
import { useState, useMemo } from "react";
import { useAdmin, Product } from "@/components/admin/AdminProvider";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, X, Edit, Trash2, AlertCircle } from "lucide-react";

export default function ProductsPage() {
  const { products, settings, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | "new" | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct === "new") {
      // Actually we'd need a real form state, using a simple hack here for mock
      const form = e.target as HTMLFormElement;
      addProduct({
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        category: (form.elements.namedItem("category") as HTMLSelectElement).value,
        description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
        stock: parseInt((form.elements.namedItem("stock") as HTMLInputElement).value || "0"),
        price: parseInt((form.elements.namedItem("price") as HTMLInputElement).value || "0"),
        image: "/products/placeholder.jpg",
      });
    } else if (editingProduct && typeof editingProduct === "object" && editingProduct.id) {
      const form = e.target as HTMLFormElement;
      updateProduct(editingProduct.id, {
        name: (form.elements.namedItem("name") as HTMLInputElement).value,
        category: (form.elements.namedItem("category") as HTMLSelectElement).value,
        description: (form.elements.namedItem("description") as HTMLTextAreaElement).value,
        stock: parseInt((form.elements.namedItem("stock") as HTMLInputElement).value || "0"),
        price: parseInt((form.elements.namedItem("price") as HTMLInputElement).value || "0"),
      });
    }
    setEditingProduct(null);
  };

  const getStatusBadge = (stock: number) => {
    if (stock <= 0) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
    if (stock <= settings.lowStockThreshold) return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low Stock</span>;
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">In Stock</span>;
  };

  return (
    <div className="px-6 py-10 lg:px-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Products</h1>
          <p className="text-slate-500 mt-1">Manage catalog and inventory</p>
        </div>
        <button onClick={() => setEditingProduct("new")} className="flex items-center space-x-2 bg-brand-blue text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search products by name or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Image</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Product Name</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Category</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Stock</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate-500">No products found.</td></tr>
              ) : filteredProducts.map((product, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  key={product.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="py-3 px-6">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100" />
                  </td>
                  <td className="py-3 px-6 text-sm font-medium text-brand-navy max-w-[200px] truncate" title={product.name}>{product.name}</td>
                  <td className="py-3 px-6 text-sm text-slate-500">{product.category}</td>
                  <td className="py-3 px-6 text-sm text-slate-600 font-medium text-right">{product.stock}</td>
                  <td className="py-3 px-6 text-sm">{getStatusBadge(product.stock)}</td>
                  <td className="py-3 px-6 text-sm text-right space-x-2">
                    <button onClick={() => setEditingProduct(product)} className="p-2 text-slate-400 hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingId(product.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      <AnimatePresence>
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                <h2 className="text-xl font-bold text-brand-navy">
                  {editingProduct === "new" ? "Add New Product" : "Edit Product"}
                </h2>
                <button onClick={() => setEditingProduct(null)} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input name="name" required defaultValue={editingProduct !== "new" ? editingProduct.name : ""} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select name="category" required defaultValue={editingProduct !== "new" ? editingProduct.category : ""} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white">
                    <option value="Respiratory Care">Respiratory Care</option>
                    <option value="Cardiology Diagnostic Devices">Cardiology Diagnostic Devices</option>
                    <option value="Emergency & Critical Care">Emergency & Critical Care</option>
                    <option value="Ultrasound & Sonography">Ultrasound & Sonography</option>
                    <option value="Patient Monitoring Accessories">Patient Monitoring Accessories</option>
                    <option value="Hospital Furniture">Hospital Furniture</option>
                    <option value="Laboratory Equipment">Laboratory Equipment</option>
                    <option value="Diabetes Management">Diabetes Management</option>
                    <option value="General Diagnostics">General Diagnostics</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                    <input name="stock" type="number" required min="0" defaultValue={editingProduct !== "new" ? editingProduct.stock : "0"} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (NPR)</label>
                    <input name="price" type="number" min="0" defaultValue={editingProduct !== "new" ? editingProduct.price : "0"} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea name="description" rows={3} defaultValue={editingProduct !== "new" ? editingProduct.description : ""} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-brand-blue focus:outline-none" />
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                  <button type="button" onClick={() => setEditingProduct(null)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-brand-blue text-white font-medium hover:bg-blue-700 rounded-lg transition-colors">Save Product</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Delete Dialog */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Product?</h3>
              <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="flex space-x-3 justify-center">
                <button onClick={() => setDeletingId(null)} className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                <button onClick={() => { deleteProduct(deletingId); setDeletingId(null); }} className="flex-1 py-2.5 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

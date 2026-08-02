"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/adminStore";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import AdminQuickEditModal from '@/components/AdminQuickEditModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '';
  const decoded = src.startsWith('http') ? src : `${API_BASE}${src}`;
  return encodeURI(decoded);
}

export default function AdminProducts() {
  const { products, fetchProducts, deleteProduct, isLoading } = useAdminStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id);
        toast.success("Product deleted successfully");
      } catch (err: any) {
        toast.error("Failed to delete product");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Product Management</h1>
        <Link 
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </Link>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Stock</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, i) => (
                <motion.tr
                  key={product._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-lg border border-white/10 overflow-hidden flex items-center justify-center text-xs">
                      {product.image ? (
                        <img src={getImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        "Img"
                      )}
                    </div>
                    <span className="text-sm text-white font-medium">{product.name}</span>
                  </td>
                  <td className="p-4 text-sm font-semibold text-[#D4AF37]">${product.price.toFixed(2)}</td>
                  <td className="p-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${product.stock > 10 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {product.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300">
                    {product.categories && product.categories.length > 0
                      ? product.categories.map((c: any) => c.name).join(', ')
                      : 'Uncategorized'}
                  </td>
                  <td className="p-4 flex justify-end gap-3">
                    <Link 
                      href={`/admin/products/${product._id}/edit`}
                      className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg flex items-center justify-center"
                    >
                      <Edit size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(product._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 rounded-lg flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

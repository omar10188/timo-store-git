"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/adminStore";
import { motion } from "framer-motion";
import { Plus, Trash2, Tag } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminCoupons() {
  const { coupons, fetchCoupons, deleteCoupon, isLoading } = useAdminStore();

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleDelete = async (id: string) => {
    if (confirm("Delete this coupon code forever?")) {
      try {
        await deleteCoupon(id);
        toast.success("Coupon deleted");
      } catch (err) {
        toast.error("Failed to delete");
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
        <h1 className="text-3xl font-bold text-white">Coupon Management</h1>
        <button className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus size={20} />
          <span>New Coupon</span>
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/40 text-gray-400 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Type</th>
                <th className="p-4 font-medium">Value</th>
                <th className="p-4 font-medium">Usage</th>
                <th className="p-4 font-medium">Expires</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon, i) => (
                <motion.tr
                  key={coupon._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4">
                    <span className="flex items-center gap-2 font-mono text-white bg-black px-3 py-1 rounded-lg border border-white/10 w-max">
                      <Tag size={14} className="text-[#D4AF37]" />
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-300 capitalize">{coupon.type}</td>
                  <td className="p-4 text-sm font-semibold text-[#D4AF37]">
                    {coupon.type === "percent" ? `${coupon.discountValue}%` : `$${coupon.discountValue}`}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {coupon.usedCount} / {coupon.usageLimit || '∞'}
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {new Date(coupon.expiresAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex justify-end">
                    <button 
                      onClick={() => handleDelete(coupon._id)}
                      className="p-2 text-red-400 hover:text-red-300 transition-colors bg-red-500/10 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No active coupons found.
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

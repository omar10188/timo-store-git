"use client";

import { useEffect } from "react";
import { useAdminStore } from "@/lib/store/adminStore";
import { motion } from "framer-motion";
import { User, Shield } from "lucide-react";

export default function AdminUsers() {
  const { users, fetchUsers, isLoading } = useAdminStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">User Registry</h1>
        <p className="text-gray-400">Manage customers and admin accounts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user, i) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm flex flex-col gap-4 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              {user.role === 'admin' ? (
                <Shield size={24} className="text-[#D4AF37]" />
              ) : (
                <User size={24} className="text-gray-600" />
              )}
            </div>
            
            <div className="w-14 h-14 bg-gradient-to-tr from-[#D4AF37] to-[#F3E5AB] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              <span className="text-black font-bold text-xl">{user.name.charAt(0)}</span>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-gray-400 text-sm">{user.email}</p>
            </div>
            
            <div className="mt-2 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider ${
                user.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-gray-800 text-gray-300'
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-500">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {users.length === 0 && (
        <div className="p-12 text-center border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import AdminProductForm from './AdminProductForm';
import { productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AdminQuickEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onUpdateSuccess?: () => void;
}

export default function AdminQuickEditModal({
  isOpen,
  onClose,
  product,
  onUpdateSuccess,
}: AdminQuickEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      await productsAPI.update(product._id, formData);
      toast.success('Product updated successfully');
      if (onUpdateSuccess) onUpdateSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-6"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg-elevated)] transition-colors text-[var(--color-text-muted)] hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6 font-playfair">
          Quick Edit Product
        </h2>

        <div className="mt-4">
          <AdminProductForm
            initialData={product}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

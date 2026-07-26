"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminProductForm from "@/components/AdminProductForm";
import { productsAPI } from "@/lib/api";
import { useAdminStore } from "@/lib/store/adminStore";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const { fetchProducts } = useAdminStore();
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { data } = await productsAPI.getById(id);
        setInitialData(data);
      } catch (err) {
        toast.error("Product not found");
        router.push("/admin/products");
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
  }, [id, router]);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await productsAPI.update(id, data);
      toast.success("Product updated successfully!");
      fetchProducts(); // Refresh store
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <AdminProductForm 
      initialData={initialData} 
      onSubmit={handleSubmit} 
      isLoading={isSubmitting} 
    />
  );
}

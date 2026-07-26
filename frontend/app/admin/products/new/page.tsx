"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductForm from "@/components/AdminProductForm";
import { productsAPI } from "@/lib/api";
import { useAdminStore } from "@/lib/store/adminStore";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const { fetchProducts } = useAdminStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      await productsAPI.create(data);
      toast.success("Product created successfully!");
      fetchProducts(); // Refresh store
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return <AdminProductForm onSubmit={handleSubmit} isLoading={isSubmitting} />;
}

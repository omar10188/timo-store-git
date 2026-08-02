"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { categoriesAPI, imagesAPI } from "@/lib/api";
import toast from "react-hot-toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

interface Category {
  _id: string;
  name: string;
}

interface ImageFile {
  filename: string;
  url: string;
}

interface AdminProductFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  isLoading: boolean;
}

export default function AdminProductForm({ initialData, onSubmit, isLoading }: AdminProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    brand: initialData?.brand || "",
    categories: initialData?.categories?.map((c: any) => c._id || c) || (initialData?.category ? [initialData.category._id || initialData.category] : []),
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    discount: initialData?.discount?.toString() || "0",
    stock: initialData?.stock?.toString() || "0",
    isFeatured: initialData?.isFeatured || false,
    tags: initialData?.tags?.join(", ") || "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(initialData?.image || null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image || null);

  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mediaImages, setMediaImages] = useState<ImageFile[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);

  const openMediaModal = async () => {
    setIsMediaModalOpen(true);
    setIsLoadingMedia(true);
    try {
      const { data } = await imagesAPI.getProductImages();
      setMediaImages(data);
    } catch (err) {
      toast.error("Failed to load media library");
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    setSelectedImageUrl(url);
    setImagePreview(url);
    setImageFile(null); // Clear any local file
    setIsMediaModalOpen(false);
  };

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await categoriesAPI.getAll();
        setCategories(data || []);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox" && name !== "categories") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => {
      const isSelected = prev.categories.includes(categoryId);
      if (isSelected) {
        return { ...prev, categories: prev.categories.filter((id: string) => id !== categoryId) };
      } else {
        return { ...prev, categories: [...prev.categories, categoryId] };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description || !formData.brand) {
      toast.error("Please fill all required fields");
      return;
    }
    if (formData.categories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("brand", formData.brand);
    formData.categories.forEach((catId: string) => {
      data.append("categories[]", catId);
    });
    data.append("description", formData.description);
    
    // Normalize numeric fields
    data.append("price", String(Number(formData.price) || 0));
    data.append("discount", String(Number(formData.discount) || 0));
    data.append("stock", String(Number(formData.stock) || 0));
    data.append("isFeatured", String(formData.isFeatured));
    
    if (formData.tags) {
      const tagsArray = formData.tags.split(",").map((t: string) => t.trim()).filter(Boolean);
      tagsArray.forEach((tag: string) => data.append("tags[]", tag));
    }

    if (imageFile) {
      data.append("images", imageFile);
    } else if (selectedImageUrl) {
      data.append("image", selectedImageUrl);
    }

    // Step 2: Debug logging
    console.log("🚀 Payload:", Object.fromEntries(data.entries()));

    try {
      await onSubmit(data);
    } catch (err: any) {
      console.error("❌ FULL ERROR:", err.response?.data);
      toast.error(err.response?.data?.message || "Validation failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          {initialData ? "Edit Product" : "Create New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Info Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product Name *</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                placeholder="e.g. Royal Oud"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Brand *</label>
              <input 
                type="text" name="brand" value={formData.brand} onChange={handleChange} required
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                placeholder="e.g. Creed"
              />
            </div>
            <div className="space-y-3 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Categories (Select multiple) *</label>
              <div className="flex flex-wrap gap-3">
                {categories.map(cat => {
                  const isSelected = formData.categories.includes(cat._id);
                  return (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat._id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                        isSelected 
                          ? 'bg-[#D4AF37] border-[#D4AF37] text-[#1A1A1A] shadow-sm' 
                          : 'bg-[#333333] border-[#333333] text-white hover:bg-[#444444]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2 flex flex-col justify-start border-t border-gray-100 pt-4 mt-2">
              <label className="flex items-center gap-3 cursor-pointer p-2.5 border border-transparent hover:border-gray-200 rounded-lg transition-colors">
                <input 
                  type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-900 font-medium">Feature this product</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description *</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} required
              rows={4}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all resize-y"
              placeholder="Detailed description of the fragrance notes and inspiration..."
            />
          </div>
        </div>

        {/* Pricing & Inventory Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Price ($) *</label>
              <input 
                type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Discount (%)</label>
              <input 
                type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Stock Quantity *</label>
              <input 
                type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Media & Tags Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-3">Media & Organization</h2>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input 
              type="text" name="tags" value={formData.tags} onChange={handleChange}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              placeholder="e.g. Floral, Summer, Men"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-medium text-gray-700">Product Image (Primary) {initialData ? "" : "*"}</label>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <label className="w-full md:w-64 h-48 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-blue-500 transition-all overflow-hidden relative group shadow-sm">
                {imagePreview ? (
                  <>
                    <img 
                      src={imagePreview.startsWith('http') || imagePreview.startsWith('blob:') || imagePreview.startsWith('data:') ? imagePreview : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imagePreview}`} 
                      alt="Preview" 
                      className="w-full h-full object-contain p-2" 
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white font-medium flex items-center gap-2"><Upload size={18}/> Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <Upload size={24} className="text-blue-500" />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">Click to upload image</span>
                    <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>

              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex items-center gap-4 mt-2 md:mt-20">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">OR</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>
                <button
                  type="button"
                  onClick={openMediaModal}
                  className="flex items-center justify-center gap-2 w-full border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <ImageIcon size={18} className="text-blue-500" />
                  <span>Select from Media Library</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-2.5 rounded-lg font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}
            onMouseEnter={(e) => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) (e.currentTarget as HTMLElement).style.backgroundColor = '#2563EB';
            }}
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Save size={18} />
                <span>Save Product</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* Media Library Modal */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ImageIcon size={20} className="text-blue-500" />
                Select Media from Library
              </h2>
              <button 
                type="button" 
                onClick={() => setIsMediaModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {isLoadingMedia ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
              ) : mediaImages.length === 0 ? (
                <div className="text-center flex flex-col items-center justify-center text-gray-500 py-16">
                  <ImageIcon size={48} className="text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900">No images found</p>
                  <p className="text-sm mt-1">Upload them in the Media Library first.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaImages.map((img) => (
                    <div 
                      key={img.filename}
                      onClick={() => handleSelectMedia(img.url)}
                      className={`cursor-pointer aspect-square rounded-xl overflow-hidden bg-gray-50 border-2 transition-all ${
                        selectedImageUrl === img.url ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`} 
                        alt={img.filename} 
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Save, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { categoriesAPI, imagesAPI } from "@/lib/api";
import toast from "react-hot-toast";

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
    category: initialData?.category?._id || initialData?.category || "",
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
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
    
    const requiredFields = ["name", "price", "category", "description", "brand"] as const;
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        toast.error(`Please fill all required fields (Missing: ${field})`);
        return;
      }
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("brand", formData.brand);
    data.append("category", formData.category);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("discount", formData.discount);
    data.append("stock", formData.stock);
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

    await onSubmit(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Products</span>
        </button>
        <h1 className="text-3xl font-bold text-white">
          {initialData ? "Edit Product" : "Create New Product"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#D4AF37] border-b border-white/10 pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Product Name *</label>
              <input 
                type="text" name="name" value={formData.name} onChange={handleChange} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="e.g. Royal Oud"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Brand *</label>
              <input 
                type="text" name="brand" value={formData.brand} onChange={handleChange} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="e.g. Creed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Category *</label>
              <select 
                name="category" value={formData.category} onChange={handleChange} required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/40 border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                <input 
                  type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange}
                  className="w-5 h-5 accent-[#D4AF37]"
                />
                <span className="text-white font-medium">Feature this product</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Description *</label>
            <textarea 
              name="description" value={formData.description} onChange={handleChange} required
              rows={4}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
              placeholder="Detailed description of the fragrance notes and inspiration..."
            />
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#D4AF37] border-b border-white/10 pb-2">Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Base Price ($) *</label>
              <input 
                type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Discount (%)</label>
              <input 
                type="number" name="discount" value={formData.discount} onChange={handleChange} min="0" max="100"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Stock Quantity *</label>
              <input 
                type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Metadata & Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#D4AF37] border-b border-white/10 pb-2">Media & Organization</h2>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Tags (comma separated)</label>
            <input 
              type="text" name="tags" value={formData.tags} onChange={handleChange}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              placeholder="e.g. Floral, Summer, Men"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">Product Image (Primary) {initialData ? "" : "*"}</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                {imagePreview ? (
                  <img src={imagePreview.startsWith('http') ? imagePreview : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${imagePreview}`} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={32} className="text-gray-600" />
                )}
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-medium transition-colors cursor-pointer flex-1">
                    <Upload size={18} />
                    <span>Choose Image...</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  <button
                    type="button"
                    onClick={openMediaModal}
                    className="flex items-center justify-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-6 py-3 rounded-xl font-medium transition-colors flex-1"
                  >
                    <ImageIcon size={18} />
                    <span>Media Library</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500">Recommended: 800x800px, max 5MB (JPG, PNG)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black bg-[#D4AF37] hover:bg-[#F3E5AB] transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ImageIcon size={20} className="text-[#D4AF37]" />
                Select Media
              </h2>
              <button 
                type="button" 
                onClick={() => setIsMediaModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {isLoadingMedia ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
                </div>
              ) : mediaImages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  No images found. Upload them in the Media Library first.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mediaImages.map((img) => (
                    <div 
                      key={img.filename}
                      onClick={() => handleSelectMedia(img.url)}
                      className={`cursor-pointer aspect-square rounded-xl overflow-hidden bg-black/60 border-2 transition-all ${
                        selectedImageUrl === img.url ? 'border-[#D4AF37]' : 'border-transparent hover:border-white/20'
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

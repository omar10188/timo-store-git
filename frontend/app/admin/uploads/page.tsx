"use client";

import { useState, useEffect, useRef } from "react";
import { uploadAPI, imagesAPI } from "@/lib/api";
import { motion } from "framer-motion";
import { Upload, Trash2, Copy, Image as ImageIcon, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ImageFile {
  filename: string;
  url: string;
  createdAt: string;
  size: number;
}

export default function AdminUploadsPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    try {
      const { data } = await imagesAPI.getProductImages();
      setImages(data);
    } catch (err) {
      toast.error("Failed to load images");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      await uploadAPI.uploadProductImage(formData);
      toast.success("Image uploaded successfully");
      fetchImages(); // Refresh gallery
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (filename: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        await imagesAPI.deleteProductImage(filename);
        toast.success("Image deleted");
        setImages(images.filter((img) => img.filename !== filename));
      } catch (err) {
        toast.error("Failed to delete image");
      }
    }
  };

  const handleCopyUrl = (url: string) => {
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Media Library</h1>
        <p className="text-gray-400">Manage your product images and assets.</p>
      </div>

      {/* Upload Zone */}
      <div 
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="bg-white/5 border-2 border-dashed border-white/20 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors backdrop-blur-sm"
      >
        <div className="w-16 h-16 bg-[#D4AF37]/20 text-[#D4AF37] rounded-full flex items-center justify-center mb-4">
          {isUploading ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {isUploading ? "Uploading..." : "Drag & Drop Image Here"}
        </h3>
        <p className="text-gray-400 mb-6 text-sm">
          Supports JPG, PNG, WEBP (Max 5MB)
        </p>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) handleFileUpload(e.target.files[0]);
          }}
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="bg-[#D4AF37] text-black px-6 py-2 rounded-xl font-bold hover:bg-[#F3E5AB] transition-colors disabled:opacity-50"
        >
          Browse Files
        </button>
      </div>

      {/* Image Grid */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[400px]">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <ImageIcon size={20} className="text-[#D4AF37]" />
          Uploaded Assets ({images.length})
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-[#D4AF37]" size={32} />
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No images found. Upload your first image above.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={img.filename}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="group relative aspect-square rounded-xl overflow-hidden bg-black/40 border border-white/10"
              >
                <img 
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'}${img.url}`} 
                  alt={img.filename} 
                  className="w-full h-full object-contain p-2"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleCopyUrl(img.url)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      title="Copy URL"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(img.filename)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-300 truncate font-medium">
                    {img.filename}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

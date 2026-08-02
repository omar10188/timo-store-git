'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Share2, Heart, Star, Sparkles,
  Flame, Trees, Citrus as CitrusIcon, Sun, Droplets,
  Pencil, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { wishlistAPI, productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminQuickEditModal from '../AdminQuickEditModal';

export interface ProductDetailProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    discount?: number;
    image: string;
    description?: string;
    categoryName?: string;
    brand?: string;
    stock?: number;
    rating?: number;
    numReviews?: number;
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '';
  const decoded = src.startsWith('http') ? src : `${API_BASE}${src}`;
  return encodeURI(decoded);
}

const BASE_NOTES = [
  { name: 'Amber', icon: Flame },
  { name: 'Wood', icon: Trees },
  { name: 'Atlas Cedar', icon: Sparkles },
  { name: 'Citrus', icon: CitrusIcon },
  { name: 'Fir Balsam', icon: Droplets },
];

export default function MobileProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<'2ml' | '50ml'>('50ml');
  const [adding, setAdding] = useState(false);

  const { addToCartAsync } = useCartStore();
  const { productIds, toggleItem } = useWishlistStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const isWishlisted = productIds.includes(product._id);
  const displayPrice = product.salePrice || product.price;
  const rating = product.rating || 4.5;
  const reviewsCount = product.numReviews || 24;

  const priceMultiplier = selectedSize === '2ml' ? 0.2 : 1;
  const finalPrice = displayPrice * priceMultiplier;

  const handleBuyNow = async () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(50); } catch {}
    }

    if (!isAuthenticated) {
      toast.error('Please sign in to complete purchase');
      router.push('/auth/login');
      return;
    }
    setAdding(true);
    try {
      await addToCartAsync(product._id, 1, {
        name: `${product.name} (${selectedSize})`,
        price: finalPrice,
        image: product.image,
      });
      toast.success('Added to cart!');
      setTimeout(() => router.push('/checkout'), 400);
    } catch {
      toast.error('Failed to proceed');
      setAdding(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save wishlist');
      return;
    }
    try {
      await wishlistAPI.toggle(product._id);
      toggleItem(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(product._id);
        toast.success('Product deleted successfully');
        router.push('/'); // Or /products
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen pb-36 bg-[var(--color-bg)]">
      {/* Mobile Top Header */}
      <header
        className="sticky top-0 z-40 flex h-14 items-center justify-between px-4"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
          aria-label="Back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="font-serif text-sm font-bold tracking-[0.18em] uppercase text-[var(--color-text-primary)]">
          Scent Sphere
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={handleWishlist}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
            aria-label="Bookmark"
          >
            <Heart size={16} fill={isWishlisted ? 'var(--color-gold)' : 'none'} className={isWishlisted ? 'text-[var(--color-gold)]' : ''} />
          </button>
          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
            aria-label="Share"
          >
            <Share2 size={16} />
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
                aria-label="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-red-500"
                aria-label="Delete"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="px-5 pt-4">
        {/* Product Bottle Image (no card background, large centered, soft shadow) */}
        <div className="flex items-center justify-center py-6">
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            src={getImageUrl(product.image)}
            alt={product.name}
            className="max-h-72 w-auto object-contain filter drop-shadow(0 16px 32px rgba(0,0,0,0.6))"
          />
        </div>

        {/* Product Name */}
        <div className="text-center mt-2 mb-2">
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--color-gold)] mb-1">
            {product.brand || product.categoryName || 'LUXURY PARFUM'}
          </p>
          <h2 className="font-serif text-2xl font-bold tracking-wide text-[var(--color-text-primary)]">
            {product.name}
          </h2>
          {/* Smart Product Hint — Decision Shortcut */}
          <p className="text-[11px] font-medium text-center text-[var(--color-text-secondary)] mt-1.5 flex items-center justify-center gap-1">
            <Sparkles size={12} className="text-[var(--color-gold)]" />
            <span>Perfect for: Evening • Winter • Bold Signature</span>
          </p>
        </div>

        {/* Short Description */}
        <p className="text-center text-xs leading-relaxed text-[var(--color-text-secondary)] px-4 mb-4">
          {product.description ||
            'Crafted with master delicacy, blending rare natural essences to create an unforgettable signature trail.'}
        </p>

        {/* Social Proof Badge — Trust Boost */}
        <div className="flex flex-col items-center gap-1 mb-5">
          <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-semibold bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.25)] text-[var(--color-gold)]">
            🔥 120+ bought this week • ⭐ {rating.toFixed(1)} ({reviewsCount} reviews)
          </span>
        </div>

        <div className="h-px w-full bg-[var(--color-border)] mb-5" />

        {/* Base Notes Label */}
        <div className="text-center mb-4">
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-secondary)]">
            Base Notes
          </span>
        </div>

        {/* Icon Chips Row */}
        <div className="flex items-center justify-around gap-2 overflow-x-auto pb-4">
          {BASE_NOTES.map((note) => {
            const Icon = note.icon;
            return (
              <div key={note.name} className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)]"
                  style={{ background: 'var(--color-bg-elevated)' }}
                >
                  <Icon size={16} className="text-[var(--color-gold)]" />
                </div>
                <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                  {note.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Pills Row: "See all notes" + "Reviews ★4.2" */}
        <div className="flex items-center gap-3 my-5">
          <button
            className="flex-1 py-2.5 rounded-full text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)]"
          >
            See all notes
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-full text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-bg-elevated)]"
          >
            <span>Reviews</span>
            <Star size={12} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
            <span>{rating.toFixed(1)}</span>
          </button>
        </div>

        {/* Size Selector */}
        <div className="mb-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[var(--color-text-secondary)] mb-2">
            Select Bottle Size
          </p>
          <div className="flex items-center justify-center gap-3 mb-3">
            {(['2ml', '50ml'] as const).map((size) => {
              const isSelected = selectedSize === size;
              return (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="px-6 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: isSelected ? 'var(--color-gold)' : 'var(--color-bg-elevated)',
                    color: isSelected ? 'var(--color-bg)' : 'var(--color-text-primary)',
                    border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  }}
                >
                  {size}
                </button>
              );
            })}
          </div>

          {/* Light Urgency Text */}
          <p className="text-[10px] font-semibold text-amber-400/90 flex items-center justify-center gap-1">
            ⚡ Limited stock available in 50ml — Order soon
          </p>
        </div>
      </div>

      {/* Sticky Bottom Bar (Glass/blur background) */}
      <div
        className="fixed bottom-[60px] left-0 right-0 z-40 flex items-center justify-between gap-3 px-5 py-3"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button
          onClick={handleBuyNow}
          disabled={adding || product.stock === 0}
          className="flex-1 py-3.5 rounded-full text-sm font-bold uppercase tracking-widest text-[var(--color-bg)] transition-all active:scale-95 shadow-md disabled:opacity-50"
          style={{ background: 'var(--color-gold)' }}
        >
          {adding ? 'Processing…' : 'Buy Now'}
        </button>

        <div className="rounded-full px-4 py-2.5 text-xs font-bold bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)]">
          EGP {finalPrice.toFixed(0)}
        </div>
      </div>

      <AdminQuickEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        product={product} 
        onUpdateSuccess={() => window.location.reload()} 
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWishlistStore, useAuthStore } from '@/lib/store';
import { wishlistAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  discount?: number;
  image: string;
  categoryName?: string;
  brand?: string;
  rating?: number;
  stock?: number;
}

interface MobileProductCardProps {
  product: Product;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function MobileProductCard({ product }: MobileProductCardProps) {
  const router = useRouter();
  const { productIds, toggleItem } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const isWishlisted = productIds.includes(product._id);
  const displayPrice = product.salePrice || product.price;
  const rating = product.rating || 4.5;
  const brandName = product.brand || product.categoryName || 'LUXURY PARFUM';

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => router.push(`/products/${product._id}`)}
      className="relative flex flex-col justify-between overflow-hidden cursor-pointer p-3 rounded-[var(--radius-lg)] transition-all duration-300"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top row: Rating pill (left) + Wishlist Heart (right) */}
      <div className="flex items-center justify-between z-10 mb-2">
        {/* Star Rating Badge */}
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
          }}
        >
          <Star size={10} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
          <span>{rating.toFixed(1)}</span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="flex h-7 w-7 items-center justify-center rounded-full transition-transform active:scale-90"
          style={{
            background: isWishlisted ? 'rgba(212, 168, 83, 0.15)' : 'var(--color-bg-elevated)',
            border: isWishlisted ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
            color: isWishlisted ? 'var(--color-gold)' : 'var(--color-text-muted)',
          }}
          aria-label="Toggle Wishlist"
        >
          <Heart size={13} fill={isWishlisted ? 'var(--color-gold)' : 'none'} />
        </button>
      </div>

      {/* Centered Product Photo */}
      <div className="relative flex h-32 w-full items-center justify-center py-2 overflow-hidden">
        <img
          src={getImageUrl(product.image)}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-contain filter drop-shadow(0 4px 12px rgba(0,0,0,0.4))"
          onError={(e) => {
            e.currentTarget.src = `https://placehold.co/300x300/161616/C9A96E?text=${encodeURIComponent(product.name[0] || 'P')}`;
          }}
        />
      </div>

      {/* Product Name & Brand — Centered, Small Caps */}
      <div className="mt-2 text-center">
        <p
          className="text-[9px] uppercase tracking-[0.15em] font-semibold truncate mb-0.5"
          style={{ color: 'var(--color-gold)' }}
        >
          {brandName}
        </p>
        <h3
          className="text-xs font-semibold tracking-wide line-clamp-1 mb-2 font-serif"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {product.name}
        </h3>
      </div>

      {/* Price Range / Price Pill at Bottom */}
      <div
        className="mt-auto flex items-center justify-center rounded-full py-1 px-3 text-[11px] font-bold tracking-wider"
        style={{
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
        }}
      >
        EGP {displayPrice.toFixed(0)}
      </div>
    </motion.div>
  );
}

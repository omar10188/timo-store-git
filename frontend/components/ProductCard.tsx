'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { cartAPI, wishlistAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export interface Product {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  discount?: number;
  image: string;
  images?: string[];
  description?: string;
  category?: string | { _id: string; name: string };
  categoryName?: string;
  brand?: string;
  stock?: number;
  rating?: number;
  numReviews?: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(src: string) {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const { addItem, openCart } = useCartStore();
  const { productIds, toggleItem } = useWishlistStore();

  const isWishlisted = productIds.includes(product._id);
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.discount && product.discount > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to add to cart');
      return;
    }
    if (product.stock === 0) {
      toast.error('Out of stock');
      return;
    }
    setAddingToCart(true);
    try {
      await cartAPI.add(product._id, 1);
      addItem({
        product: product._id,
        name: product.name,
        price: displayPrice,
        image: product.image,
        quantity: 1,
      });
      openCart();
      toast.success('Added to cart!');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <Link href={`/products/${product._id}`} className="block h-full outline-none">
      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="group relative flex h-full flex-col rounded-2xl sm:rounded-3xl p-3 sm:p-4 transition-all duration-500 hover:-translate-y-2"
        style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold-lg)';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-gold)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
        }}
      >
        {/* Subtle background glow overlay on hover */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-transparent to-[var(--color-gold-muted)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />

        {/* Image Container */}
        <div
          className="relative flex h-[160px] sm:h-[200px] w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-all duration-500 group-hover:scale-110"
            style={{ filter: 'drop-shadow(0 6px 12px var(--color-gold-muted))' }}
            onError={(e) => { e.currentTarget.src = `https://placehold.co/400x400/161616/C9A96E?text=${encodeURIComponent(product.name[0])}`; }}
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1.5 sm:gap-2">
            {hasDiscount && (
              <span
                className="rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                style={{ background: 'var(--color-gold)', color: 'var(--color-bg)' }}
              >
                {product.discount}% OFF
              </span>
            )}
            {product.isFeatured && (
              <span
                className="rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider backdrop-blur-md"
                style={{
                  background: 'var(--color-border)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                Featured
              </span>
            )}
            {product.stock === 0 && (
              <span className="rounded-full bg-red-900/80 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                Out of Stock
              </span>
            )}
          </div>

          {/* Action overlay (Wishlist, Quick View) */}
          <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex flex-col gap-1.5 sm:gap-2 opacity-100 md:opacity-0 transition-all duration-300 md:group-hover:opacity-100 translate-x-0 md:translate-x-2 md:group-hover:translate-x-0">
            <button
              onClick={handleWishlist}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110"
              style={{
                border: isWishlisted ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                background: isWishlisted ? 'var(--color-gold-muted)' : 'var(--color-bg-card)',
                color: isWishlisted ? 'var(--color-gold)' : 'var(--color-text-muted)',
              }}
              aria-label="Wishlist"
            >
              <Heart size={14} className="sm:w-4 sm:h-4" fill={isWishlisted ? 'var(--color-gold)' : 'none'} />
            </button>
            <Link
              href={`/products/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl backdrop-blur-md transition-all duration-300 hover:scale-110"
              style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-card)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
              }}
            >
              <Eye size={14} className="sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="relative mt-3 sm:mt-5 flex flex-col z-10 flex-1">
          {/* Brand & Rating row */}
          <div className="mb-1 sm:mb-2 flex items-center justify-between">
            {(product.categoryName || product.brand) && (
              <span className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {product.brand || product.categoryName}
              </span>
            )}
            {(product.numReviews ?? 0) > 0 && (
              <div className="flex items-center gap-1">
                <Star size={10} className="sm:w-3 sm:h-3" style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} />
                <span className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {product.rating?.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Name */}
          <h3
            className="mb-1 sm:mb-2 text-sm sm:text-base font-medium tracking-wide line-clamp-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {product.name}
          </h3>

          <div className="mt-auto pt-2 flex items-end justify-between">
            {/* Price */}
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs line-through" style={{ color: 'var(--color-text-muted)' }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
              <span className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-gold)' }}>
                ${displayPrice.toFixed(2)}
              </span>
            </div>
          </div>
          
          {/* Add to Cart Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            disabled={addingToCart || product.stock === 0}
            className="mt-3 sm:mt-4 flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              border: '1px solid var(--color-gold)',
              color: 'var(--color-gold)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!(e.currentTarget as HTMLButtonElement).disabled) {
                (e.currentTarget as HTMLElement).style.background = 'var(--color-gold)';
                (e.currentTarget as HTMLElement).style.color = 'var(--color-bg)';
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
            }}
          >
            {addingToCart ? (
              <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-b-2 border-t-2 border-current"></div>
            ) : (
              <>
                <ShoppingCart size={14} className="sm:w-4 sm:h-4 transition-transform duration-300 group-hover:scale-110" />
                <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
              </>
            )}
          </motion.button>
        </div>
      </motion.article>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <article
      className="flex h-full flex-col rounded-2xl sm:rounded-3xl p-3 sm:p-4 animate-pulse"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
      }}
    >
      <div
        className="relative flex h-[160px] sm:h-[200px] w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4"
        style={{ background: 'var(--color-bg-elevated)' }}
      />
      
      <div className="relative mt-3 sm:mt-5 flex flex-col z-10 flex-1">
        <div className="mb-1 sm:mb-2 flex items-center justify-between">
          <div className="h-3 w-16 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="h-3 w-8 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="h-4 sm:h-5 w-3/4 rounded-full mt-2 mb-2" style={{ background: 'var(--color-border)' }} />
        <div className="h-4 sm:h-5 w-1/2 rounded-full mb-2" style={{ background: 'var(--color-border)' }} />

        <div className="mt-auto pt-2 flex items-end justify-between">
          <div className="h-5 sm:h-6 w-16 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        
        <div className="mt-3 sm:mt-4 h-9 sm:h-11 w-full rounded-lg sm:rounded-xl" style={{ background: 'var(--color-border)' }} />
      </div>
    </article>
  );
}

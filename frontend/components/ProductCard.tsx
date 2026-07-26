'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
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
    <Link href={`/products/${product._id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        className="card"
        style={{
          overflow: 'hidden',
          transition: 'all var(--transition-base)',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: 'var(--color-bg-elevated)' }}>
          <img
            src={getImageUrl(product.image)}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform var(--transition-slow)' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            onError={(e) => { e.currentTarget.src = `https://placehold.co/400x400/161616/d4a853?text=${encodeURIComponent(product.name[0])}`; }}
          />

          {/* Badges */}
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {hasDiscount && (
              <span className="badge badge-gold">{product.discount}% OFF</span>
            )}
            {product.isFeatured && (
              <span className="badge badge-info">Featured</span>
            )}
            {product.stock === 0 && (
              <span className="badge badge-error">Out of Stock</span>
            )}
          </div>

          {/* Action overlay */}
          <div style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <button
              onClick={handleWishlist}
              style={{
                width: '36px', height: '36px',
                background: isWishlisted ? 'var(--color-gold-muted)' : 'rgba(10,10,10,0.8)',
                border: `1px solid ${isWishlisted ? 'var(--color-gold)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all var(--transition-fast)',
                backdropFilter: 'blur(8px)',
              }}
              aria-label="Wishlist"
            >
              <Heart size={16} fill={isWishlisted ? 'var(--color-gold)' : 'none'} color={isWishlisted ? 'var(--color-gold)' : 'var(--color-text-secondary)'} />
            </button>

            <Link
              href={`/products/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '36px', height: '36px',
                background: 'rgba(10,10,10,0.8)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Eye size={16} color="var(--color-text-secondary)" />
            </Link>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '1rem' }}>
          {/* Category */}
          {(product.categoryName || product.brand) && (
            <p style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '0.35rem', fontWeight: 600 }}>
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.3, fontFamily: 'var(--font-heading)' }}>
            {product.name}
          </h3>

          {/* Rating */}
          {(product.numReviews ?? 0) > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.5rem' }}>
              <Star size={13} fill="var(--color-gold)" color="var(--color-gold)" />
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                {product.rating?.toFixed(1)} ({product.numReviews})
              </span>
            </div>
          )}

          {/* Price + Cart */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)' }}>
                ${displayPrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '0.5rem' }}>
                  ${product.price.toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || product.stock === 0}
              style={{
                width: '36px', height: '36px',
                background: 'var(--color-gold-muted)',
                border: '1px solid var(--color-border-gold)',
                borderRadius: 'var(--radius-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                opacity: product.stock === 0 ? 0.5 : 1,
                transition: 'all var(--transition-fast)',
              }}
              aria-label="Add to cart"
            >
              {addingToCart ? (
                <div className="spinner" style={{ width: '14px', height: '14px' }} />
              ) : (
                <ShoppingCart size={16} color="var(--color-gold)" />
              )}
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

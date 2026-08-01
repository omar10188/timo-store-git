'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus,
  Share2, Check, Sparkles, ChevronDown, ChevronUp,
  Truck, Tag, RotateCcw, CreditCard, ThumbsUp, CheckCircle2, Eye,
} from 'lucide-react';
import { productsAPI, reviewsAPI, wishlistAPI } from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import StarRating from '@/components/StarRating';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

interface Review {
  _id: string;
  user: { name: string; avatar?: string };
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  verifiedPurchase?: boolean;
  images?: string[];
  helpfulCount?: number;
}

/* ── Design tokens (scoped to this page) ─────────────────────────── */
const DS = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  elevated: '#242424',
  border: 'rgba(255,255,255,0.07)',
  borderHover: 'rgba(255,255,255,0.18)',
  textPrimary: '#ffffff',
  textSecondary: '#aaaaaa',
  textMuted: '#555555',
  gold: '#c8a96e',
  goldMuted: 'rgba(200,169,110,0.12)',
  accent: '#ffffff',         // white accent buttons
  accentText: '#0f0f0f',     // black text on white
  shadowSm: '0 2px 8px rgba(0,0,0,0.55)',
  shadowMd: '0 6px 24px rgba(0,0,0,0.7)',
  shadowLg: '0 16px 48px rgba(0,0,0,0.85)',
  radius: '18px',
  radiusMd: '12px',
  radiusSm: '8px',
};

/* ── Animated Accordion ──────────────────────────────────────────── */
function Accordion({
  title, children, defaultOpen = false, icon,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<string>(defaultOpen ? 'auto' : '0px');

  // Animate height on toggle
  React.useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (open) {
      // Measure real height, then animate
      const h = el.scrollHeight;
      setHeight(`${h}px`);
      // After transition, let it be auto so it can resize freely
      const t = setTimeout(() => setHeight('auto'), 300);
      return () => clearTimeout(t);
    } else {
      // Snap to measured height first, then animate to 0
      const h = el.scrollHeight;
      setHeight(`${h}px`);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setHeight('0px'));
      });
    }
  }, [open]);

  return (
    <div style={{
      border: `1px solid ${open ? 'rgba(255,255,255,0.12)' : DS.border}`,
      borderRadius: DS.radiusMd,
      overflow: 'hidden',
      transition: 'border-color 0.25s ease',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.95rem 1.2rem',
          background: open ? DS.card : DS.elevated,
          border: 'none', cursor: 'pointer',
          color: DS.textPrimary, fontSize: '0.88rem',
          fontWeight: 600, letterSpacing: '0.04em',
          fontFamily: 'var(--font-body)',
          transition: 'background 0.2s ease',
          gap: '0.6rem',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {icon && <span style={{ color: DS.gold, display: 'flex' }}>{icon}</span>}
          {title}
        </span>
        <ChevronDown
          size={15}
          style={{
            color: DS.textMuted,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.25s ease',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Animated content wrapper */}
      <div
        ref={contentRef}
        style={{
          height,
          overflow: 'hidden',
          transition: 'height 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <div style={{
          padding: '1rem 1.2rem 1.1rem',
          background: DS.card,
          color: DS.textSecondary,
          fontSize: '0.875rem',
          lineHeight: 1.85,
          borderTop: `1px solid ${DS.border}`,
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

/* ── Rating Bar ──────────────────────────────────────────────────── */
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.78rem' }}>
      <span style={{ color: DS.textMuted, minWidth: 8 }}>{star}</span>
      <Star size={10} style={{ fill: DS.gold, color: DS.gold, flexShrink: 0 }} />
      <div style={{
        flex: 1, height: 5, borderRadius: 99,
        background: DS.border, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: DS.gold, borderRadius: 99,
          transition: 'width 0.7s ease',
        }} />
      </div>
      <span style={{ color: DS.textMuted, minWidth: 24, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

/* ── CTA Button — Buy Now (solid white) ─────────────────────────── */
function BuyNowBtn({
  children, onClick, disabled, loading: isLoading = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.55rem', height: 54, borderRadius: 14,
        flex: 1,
        fontWeight: 800, fontSize: '0.9rem', letterSpacing: '0.06em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        border: 'none',
        fontFamily: 'var(--font-body)',
        /* White solid fill */
        background: pressed && !disabled
          ? '#d4d4d4'
          : hovered && !disabled
            ? '#efefef'
            : '#ffffff',
        color: '#0a0a0a',
        /* Lift + scale on hover */
        transform: pressed && !disabled
          ? 'translateY(1px) scale(0.98)'
          : hovered && !disabled
            ? 'translateY(-2px) scale(1.01)'
            : 'none',
        /* Glow */
        boxShadow: pressed && !disabled
          ? '0 2px 8px rgba(255,255,255,0.12)'
          : hovered && !disabled
            ? '0 8px 32px rgba(255,255,255,0.25), 0 2px 8px rgba(255,255,255,0.12)'
            : '0 4px 18px rgba(255,255,255,0.14)',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isLoading ? (
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2.5px solid rgba(10,10,10,0.3)',
          borderTopColor: '#0a0a0a',
          animation: 'pdp-spin 0.55s linear infinite',
        }} />
      ) : null}
      {children}
    </button>
  );
}

/* ── CTA Button — Add to Cart (outline) ─────────────────────────── */
function AddToCartBtn({
  children, onClick, disabled, loading: isLoading = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.55rem', height: 54, borderRadius: 14,
        flex: 1,
        fontWeight: 700, fontSize: '0.88rem', letterSpacing: '0.05em',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        fontFamily: 'var(--font-body)',
        /* Outline fill */
        background: pressed && !disabled
          ? 'rgba(255,255,255,0.10)'
          : hovered && !disabled
            ? 'rgba(255,255,255,0.06)'
            : 'transparent',
        color: '#ffffff',
        border: `1.5px solid ${
          pressed && !disabled
            ? 'rgba(255,255,255,0.6)'
            : hovered && !disabled
              ? 'rgba(255,255,255,0.5)'
              : 'rgba(255,255,255,0.25)'
        }`,
        transform: pressed && !disabled
          ? 'translateY(1px) scale(0.98)'
          : hovered && !disabled
            ? 'translateY(-1px)'
            : 'none',
        boxShadow: hovered && !disabled
          ? '0 4px 18px rgba(255,255,255,0.06)'
          : 'none',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {isLoading ? (
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2.5px solid rgba(255,255,255,0.3)',
          borderTopColor: '#ffffff',
          animation: 'pdp-spin 0.55s linear infinite',
        }} />
      ) : null}
      {children}
    </button>
  );
}

/* ── White action button (generic fallback) ──────────────────────── */
function WhiteBtn({
  children, onClick, disabled, outline = false, style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  outline?: boolean;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
    height: 50, borderRadius: DS.radiusMd,
    fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.06em',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 0.2s ease',
    fontFamily: 'var(--font-body)',
    border: 'none',
  };
  const solidStyle: React.CSSProperties = {
    ...base,
    background: hovered && !disabled ? '#e8e8e8' : DS.accent,
    color: DS.accentText,
    boxShadow: hovered && !disabled ? '0 6px 22px rgba(255,255,255,0.20)' : '0 4px 14px rgba(255,255,255,0.10)',
    transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
  };
  const outlineStyle: React.CSSProperties = {
    ...base,
    background: hovered && !disabled ? 'rgba(255,255,255,0.06)' : 'transparent',
    color: DS.accent,
    border: `1.5px solid ${hovered && !disabled ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.22)'}`,
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...(outline ? outlineStyle : solidStyle), ...style }}
    >
      {children}
    </button>
  );
}

/* ── Icon button ─────────────────────────────────────────────────── */
function IconBtn({
  children, onClick, active = false, title = '', style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  title?: string;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        height: 54,
        borderRadius: 14,
        border: `1.5px solid ${active ? DS.gold : hovered ? 'rgba(255,255,255,0.35)' : DS.border}`,
        background: pressed && !active
          ? 'rgba(255,255,255,0.08)'
          : active ? DS.goldMuted
            : hovered ? 'rgba(255,255,255,0.05)'
              : DS.elevated,
        color: active ? DS.gold : hovered ? DS.textPrimary : DS.textMuted,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════ */
export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { isAuthenticated } = useAuthStore();
  const { addToCartAsync } = useCartStore();
  const { productIds, toggleItem } = useWishlistStore();
  const isWishlisted = productIds.includes(id);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, revRes, recRes] = await Promise.all([
          productsAPI.getById(id),
          reviewsAPI.getByProduct(id),
          productsAPI.getRecommendations(id),
        ]);
        setProduct(prodRes.data);
        setReviews(revRes.data || []);
        setRecommendations(recRes.data || []);
      } catch {
        toast.error('Product not found');
        router.push('/products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleAddToCart = async (redirect = false) => {
    if (!product?._id) { toast.error('Product ID missing'); return; }
    setAddingToCart(true);
    try {
      await addToCartAsync(product._id, quantity, {
        name: product.name,
        price: product.salePrice || product.price,
        image: product.image,
      });
      toast.success('Added to cart!');
      if (redirect) router.push('/checkout');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please sign in'); return; }
    await wishlistAPI.toggle(product._id);
    toggleItem(product._id);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist!');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Sign in to leave a review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await reviewsAPI.create({ productId: id, rating: newRating, comment: newComment });
      setReviews((prev) => [data, ...prev]);
      setNewComment(''); setNewRating(5); setShowReviewForm(false);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div style={{ paddingTop: '4rem', background: DS.bg, minHeight: '100vh' }}><LoadingSpinner text="Loading product..." /></div>;
  if (!product) return null;

  const displayPrice = product.salePrice || product.price;
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div style={{ background: DS.bg, minHeight: '100vh', color: DS.textPrimary }}>

      {/* ══ Ambient top glow ══════════════════════════════════════ */}
      <div style={{
        position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 400, borderRadius: '50%', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at top, rgba(200,169,110,0.06) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, padding: '2rem var(--container-padding)', maxWidth: 1200 }}>

        {/* ── Breadcrumb ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '2.5rem', fontSize: '0.78rem', color: DS.textMuted,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: DS.textMuted, fontSize: '0.78rem',
              fontFamily: 'var(--font-body)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = DS.textSecondary; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = DS.textMuted; }}
          >
            <ArrowLeft size={13} /> Home
          </button>
          <span>/</span>
          <span style={{ color: DS.textMuted }}>Products</span>
          <span>/</span>
          <span style={{ color: DS.textSecondary }}>{product.name}</span>
        </div>

        {/* ═════════════════════════════════════════════════════════
            TOP SECTION — Image Left · Details Right
        ═════════════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: '3.5rem',
          marginBottom: '2.5rem',
          alignItems: 'start',
        }} className="pdp-top">

          {/* ── Left: Main Product Image ── */}
          <div>
            <div style={{
              aspectRatio: '1 / 1',
              borderRadius: 24,
              overflow: 'hidden',
              background: DS.card,
              border: `1px solid ${DS.border}`,
              boxShadow: DS.shadowLg,
              position: 'relative',
            }}>
              {/* Discount badge */}
              {product.discount > 0 && (
                <div style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 2,
                  background: DS.accent, color: DS.accentText,
                  borderRadius: DS.radiusSm, padding: '4px 12px',
                  fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.06em',
                }}>
                  {product.discount}% OFF
                </div>
              )}

              {/* Featured badge */}
              {product.isFeatured && (
                <div style={{
                  position: 'absolute', top: 16, right: 16, zIndex: 2,
                  background: DS.goldMuted,
                  border: `1px solid ${DS.gold}`,
                  color: DS.gold,
                  borderRadius: DS.radiusSm, padding: '4px 12px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em',
                }}>
                  ✦ Featured
                </div>
              )}

              <img
                src={getImageUrl(allImages[selectedImage] || '')}
                alt={product.name}
                loading="eager"
                decoding="async"
                fetchPriority="high"
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1)',
                }}
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/700x700/1a1a1a/c8a96e?text=${encodeURIComponent(product.name[0])}`;
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              />
            </div>
          </div>

          {/* ── Right: All Product Details ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

            {/* Brand */}
            {product.brand && (
              <span style={{
                fontSize: '0.7rem', letterSpacing: '0.16em',
                textTransform: 'uppercase', color: DS.gold,
                fontWeight: 700,
              }}>
                {product.brand}
              </span>
            )}

            {/* Name */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.7rem, 3.2vw, 2.5rem)',
              fontWeight: 700, lineHeight: 1.1,
              color: DS.textPrimary, margin: 0,
            }}>
              {product.name}
            </h1>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <StarRating rating={product.rating || 0} size={15} />
              <span style={{ fontSize: '0.78rem', color: DS.textMuted }}>
                {product.rating?.toFixed(1)} · {product.numReviews || 0} reviews
              </span>
              {product.stock === 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700,
                  color: '#e05c5c', background: 'rgba(224,92,92,0.10)',
                  borderRadius: 20, padding: '3px 12px',
                }}>Out of Stock</span>
              )}
              {(product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '0.72rem', fontWeight: 700,
                  color: '#f0a04b', background: 'rgba(240,160,75,0.10)',
                  borderRadius: 20, padding: '3px 12px',
                }}>Only {product.stock} left</span>
              )}
            </div>

            {/* Price */}
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: '0.75rem',
              padding: '1rem 1.2rem',
              background: DS.card,
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radiusMd,
            }}>
              <span style={{
                fontSize: '2.1rem', fontWeight: 800,
                color: DS.textPrimary, letterSpacing: '-0.02em',
              }}>
                EGP {displayPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <>
                  <span style={{ fontSize: '1rem', color: DS.textMuted, textDecoration: 'line-through' }}>
                    EGP {product.price.toFixed(2)}
                  </span>
                  <span style={{
                    marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700,
                    color: DS.accentText, background: DS.accent,
                    borderRadius: 20, padding: '3px 12px',
                  }}>
                    Save {product.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Description Accordion */}
            <Accordion title="Description" defaultOpen>
              {product.description || 'No description available.'}
            </Accordion>

            {/* Main Notes (Interactive Selectable Tags) */}
            {product.tags?.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <p style={{
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: DS.textMuted, margin: 0,
                  }}>
                    Main Notes
                  </p>
                  {selectedTags.length > 0 && (
                    <button
                      onClick={() => setSelectedTags([])}
                      style={{
                        fontSize: '0.7rem', color: DS.gold, background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0, textDecoration: 'underline',
                      }}
                    >
                      Clear selection
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {product.tags.map((tag: string) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <NoteTag
                        key={tag}
                        active={isSelected}
                        onClick={() => {
                          setSelectedTags((prev) =>
                            isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                          );
                        }}
                      >
                        {tag}
                      </NoteTag>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', color: DS.textMuted, fontWeight: 600, letterSpacing: '0.04em' }}>
                Quantity
              </span>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: `1.5px solid ${DS.border}`,
                borderRadius: 14, overflow: 'hidden',
                background: DS.card,
                height: 44,
              }}>
                <QuantityBtn onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus size={13} />
                </QuantityBtn>
                <span style={{
                  width: 50, textAlign: 'center', fontWeight: 800,
                  color: DS.textPrimary, fontSize: '0.95rem',
                  height: 44, lineHeight: '44px',
                  background: DS.elevated,
                  borderLeft: `1px solid ${DS.border}`,
                  borderRight: `1px solid ${DS.border}`,
                  userSelect: 'none',
                }}>
                  {quantity}
                </span>
                <QuantityBtn onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} disabled={quantity >= (product.stock || 99)}>
                  <Plus size={13} />
                </QuantityBtn>
              </div>
            </div>

            {/* ═══ ACTION BUTTONS ══════════════════════════════════ */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

              {/* Row 1: Add to Cart + Buy Now (full-width pair) */}
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <AddToCartBtn
                  onClick={() => handleAddToCart(false)}
                  disabled={addingToCart || product.stock === 0}
                  loading={addingToCart}
                >
                  {!addingToCart && <ShoppingCart size={16} />}
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </AddToCartBtn>

                <BuyNowBtn
                  onClick={() => handleAddToCart(true)}
                  disabled={addingToCart || product.stock === 0}
                >
                  Buy Now
                </BuyNowBtn>
              </div>

              {/* Row 2: Wishlist + Share (icon pair) */}
              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <IconBtn
                  onClick={handleWishlist}
                  active={isWishlisted}
                  title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  style={{ flex: 1 }}
                >
                  <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                    {isWishlisted ? 'Wishlisted' : 'Wishlist'}
                  </span>
                </IconBtn>

                <IconBtn title="Share" style={{ width: 54, flex: 'none' }}>
                  <Share2 size={15} />
                </IconBtn>
              </div>
            </div>

            {/* Stock status & Live Scarcity Social Proof Banner */}
            {(product.stock ?? 0) > 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '0.45rem',
                padding: '0.85rem 1.1rem', borderRadius: 14,
                background: 'rgba(240, 160, 75, 0.08)',
                border: '1px solid rgba(240, 160, 75, 0.22)',
                fontSize: '0.78rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f0a04b', fontWeight: 700 }}>
                  <Sparkles size={14} />
                  <span>🔥 High Demand: Only {product.stock <= 5 ? product.stock : 3} left in stock!</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: DS.textSecondary, fontSize: '0.74rem' }}>
                  <Eye size={13} style={{ color: DS.gold }} />
                  <span>14 customers are viewing this fragrance right now</span>
                </div>
              </div>
            )}

            {/* Delivery Options Accordion */}
            <Accordion title="Delivery Options">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                {[
                  { icon: <Tag size={15} />, label: 'Discount', val: 'Save 15%' },
                  { icon: <CreditCard size={15} />, label: 'Payment', val: 'Cash on Delivery' },
                  { icon: <Truck size={15} />, label: 'Delivery Time', val: '3-4 Working Days' },
                  { icon: <RotateCcw size={15} />, label: 'Return & Warranty', val: '7 Days easy return' },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    padding: '0.75rem', borderRadius: DS.radiusSm,
                    background: DS.elevated, border: `1px solid ${DS.border}`,
                  }}>
                    <span style={{ color: DS.gold, flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: '0.68rem', color: DS.textMuted, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: '0.78rem', fontWeight: 700, color: DS.textPrimary }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════
            THUMBNAILS STRIP
        ═════════════════════════════════════════════════════════ */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '4rem', flexWrap: 'wrap' }}>
            {allImages.map((img: string, i: number) => (
              <Thumbnail
                key={i}
                src={getImageUrl(img)}
                alt={`View ${i + 1}`}
                active={i === selectedImage}
                onClick={() => setSelectedImage(i)}
                fallback={product.name[0]}
              />
            ))}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════
            RATING & REVIEWS
        ═════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '5rem' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '2.5rem',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.65rem', fontWeight: 700,
              color: DS.textPrimary, margin: 0,
            }}>
              Rating &amp; Reviews
            </h2>
            <div style={{ height: 1, flex: 1, background: DS.border, marginLeft: '1.5rem' }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(200px, 280px) 1fr',
            gap: '2.5rem',
            alignItems: 'start',
          }} className="pdp-reviews-grid">

            {/* ── Rating Summary Card ── */}
            <div style={{
              background: DS.card,
              border: `1px solid ${DS.border}`,
              borderRadius: DS.radius,
              padding: '1.75rem',
              boxShadow: DS.shadowMd,
            }}>
              {/* Big number */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <span style={{
                  fontSize: '4.5rem', fontWeight: 900, lineHeight: 1,
                  color: DS.textPrimary, letterSpacing: '-0.04em',
                }}>
                  {(product.rating || 0).toFixed(1)}
                </span>
                <span style={{ fontSize: '1.1rem', color: DS.textMuted, marginBottom: '0.7rem' }}>/5</span>
              </div>
              <StarRating rating={product.rating || 0} size={17} />
              <p style={{ fontSize: '0.75rem', color: DS.textMuted, margin: '0.75rem 0 1.5rem' }}>
                {reviews.length} New Reviews
              </p>

              {/* Star bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {starCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} />
                ))}
              </div>
            </div>

            {/* ── Right: Write Review + List ── */}
            <div>
              {/* Write Review CTA Card */}
              <div style={{
                background: DS.card,
                border: `1px solid ${DS.border}`,
                borderRadius: DS.radius,
                padding: '1.5rem',
                marginBottom: '1.25rem',
                boxShadow: DS.shadowSm,
              }}>
                <h3 style={{
                  fontSize: '1rem', fontWeight: 700,
                  color: DS.textPrimary, marginBottom: '0.25rem',
                  fontFamily: 'var(--font-heading)',
                }}>
                  Review this product
                </h3>
                <p style={{ fontSize: '0.78rem', color: DS.textMuted, marginBottom: '1.1rem' }}>
                  Share your thoughts with other customers
                </p>

                {!showReviewForm ? (
                  <WhiteBtn
                    outline
                    onClick={() => {
                      if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
                      setShowReviewForm(true);
                    }}
                    style={{ width: '100%' }}
                  >
                    Write a customer review
                  </WhiteBtn>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{
                        fontSize: '0.75rem', color: DS.textMuted,
                        display: 'block', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.06em',
                      }}>
                        YOUR RATING
                      </label>
                      <StarRating rating={newRating} interactive onChange={setNewRating} size={24} />
                    </div>
                    <div>
                      <label style={{
                        fontSize: '0.75rem', color: DS.textMuted,
                        display: 'block', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.06em',
                      }}>
                        YOUR REVIEW
                      </label>
                      <textarea
                        style={{
                          width: '100%', minHeight: 88, resize: 'vertical',
                          background: DS.elevated,
                          border: `1px solid ${DS.border}`,
                          borderRadius: DS.radiusMd,
                          color: DS.textPrimary,
                          padding: '0.75rem 1rem', fontSize: '0.875rem',
                          fontFamily: 'var(--font-body)',
                          outline: 'none',
                          lineHeight: 1.6,
                        }}
                        placeholder="Share your experience with this fragrance..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = DS.border; }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <WhiteBtn
                        disabled={submittingReview}
                        style={{ flex: 1 }}
                        onClick={() => {}} // form submit handled by form
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </WhiteBtn>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        style={{
                          padding: '0 1.2rem', borderRadius: DS.radiusMd,
                          border: `1px solid ${DS.border}`,
                          background: 'transparent', color: DS.textSecondary,
                          fontSize: '0.85rem', cursor: 'pointer',
                          fontFamily: 'var(--font-body)',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Reviews List */}
              {reviews.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '3.5rem 2rem',
                  background: DS.card, borderRadius: DS.radius,
                  border: `1px solid ${DS.border}`,
                  color: DS.textMuted, fontSize: '0.875rem',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                }}>
                  <Star size={32} style={{ color: DS.gold, opacity: 0.5 }} />
                  <div>
                    <p style={{ fontWeight: 700, color: DS.textPrimary, marginBottom: 4 }}>No reviews yet</p>
                    <p style={{ fontSize: '0.8rem', color: DS.textMuted }}>Be the first customer to share your experience with this fragrance!</p>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((r) => {
                    const userName = r.user?.name || 'Anonymous Buyer';
                    const initial = userName.charAt(0).toUpperCase();
                    return (
                      <ReviewCard key={r._id} review={r} userName={userName} initial={initial} />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════
            YOU MIGHT ALSO LIKE (Related Products Grid)
        ═════════════════════════════════════════════════════════ */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: '4rem' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              textAlign: 'center', marginBottom: '2.5rem',
            }}>
              <span style={{
                fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase',
                color: DS.gold, fontWeight: 700, marginBottom: '0.4rem',
              }}>
                Curated Selection
              </span>
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 2.5vw, 2.1rem)',
                fontWeight: 700, color: DS.textPrimary, margin: 0,
              }}>
                You might also like
              </h2>
              <p style={{ fontSize: '0.82rem', color: DS.textMuted, marginTop: '0.4rem', maxWidth: 460 }}>
                Explore complementary fragrances from our exclusive collection
              </p>
            </div>

            <div className="products-grid">
              {recommendations.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {recommendations.length > 4 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
                <button
                  onClick={() => router.push('/products')}
                  style={{
                    padding: '0.8rem 2rem', borderRadius: 20,
                    border: `1.5px solid ${DS.border}`,
                    background: DS.elevated, color: DS.textPrimary,
                    fontSize: '0.82rem', fontWeight: 700, letterSpacing: '0.06em',
                    cursor: 'pointer', transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = DS.border;
                    (e.currentTarget as HTMLElement).style.transform = 'none';
                  }}
                >
                  See all fragrances
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════
          STICKY MOBILE BOTTOM BAR (Mobile conversion booster)
      ═════════════════════════════════════════════════════════ */}
      <div className="pdp-mobile-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.68rem', color: DS.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            Total ({quantity}x)
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: DS.textPrimary, letterSpacing: '-0.02em' }}>
            EGP {(displayPrice * quantity).toFixed(2)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flex: 1, justifyContent: 'flex-end', maxWidth: 220 }}>
          <AddToCartBtn
            onClick={() => handleAddToCart(false)}
            disabled={addingToCart || product.stock === 0}
            loading={addingToCart}
          >
            {!addingToCart && <ShoppingCart size={17} />}
          </AddToCartBtn>

          <BuyNowBtn
            onClick={() => handleAddToCart(true)}
            disabled={addingToCart || product.stock === 0}
          >
            Buy Now
          </BuyNowBtn>
        </div>
      </div>

      {/* ── Page-scoped styles ── */}
      <style>{`
        @keyframes pdp-spin {
          to { transform: rotate(360deg); }
        }

        .pdp-mobile-sticky-bar {
          display: none;
        }

        @media (max-width: 768px) {
          .pdp-mobile-sticky-bar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 99;
            background: rgba(15, 15, 15, 0.94);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom, 0px));
            box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.75);
          }

          .pdp-top {
            grid-template-columns: 1fr !important;
            gap: 1.75rem !important;
          }

          .pdp-reviews-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }

          /* Extra bottom padding so sticky bar doesn't cover content */
          .container {
            padding-bottom: 100px !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components (co-located for simplicity) ─────────────────── */

/* ── Selectable Note Tag ─────────────────────────────────────────── */
function NoteTag({
  children, active, onClick,
}: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        padding: '5px 14px', borderRadius: 20,
        border: `1px solid ${
          active ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.13)'
        }`,
        background: active
          ? 'rgba(255,255,255,0.12)'
          : pressed
            ? 'rgba(255,255,255,0.06)'
            : DS.elevated,
        color: active ? DS.textPrimary : DS.textSecondary,
        fontSize: '0.76rem', fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.34,1.56,0.64,1)',
        transform: pressed ? 'scale(0.95)' : active ? 'scale(1.04)' : 'scale(1)',
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        fontFamily: 'var(--font-body)',
        userSelect: 'none',
        boxShadow: active ? '0 0 12px rgba(255,255,255,0.08)' : 'none',
      }}
    >
      {active && (
        <Check size={10} style={{ color: DS.textPrimary, flexShrink: 0 }} />
      )}
      {children}
    </button>
  );
}

/* ── Quantity Button ─────────────────────────────────────────────── */
function QuantityBtn({
  children, onClick, disabled,
}: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={() => { if (!disabled) setPressed(true); }}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        width: 44, height: 44,
        background: pressed && !disabled ? 'rgba(255,255,255,0.12)' : DS.elevated,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? DS.textMuted : DS.textPrimary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
        /* Spring bounce on press */
        transform: pressed && !disabled ? 'scale(0.85)' : 'scale(1)',
        transition: pressed
          ? 'transform 0.06s ease, background 0.1s'
          : 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.15s',
        fontFamily: 'var(--font-body)',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        /* Larger touch target for mobile */
        minWidth: 44,
      }}
    >
      {children}
    </button>
  );
}

function Thumbnail({
  src, alt, active, onClick, fallback,
}: { src: string; alt: string; active: boolean; onClick: () => void; fallback: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 88, height: 88, borderRadius: 14, overflow: 'hidden',
        border: `2px solid ${active ? DS.accent : DS.border}`,
        cursor: 'pointer', background: 'none', padding: 0,
        boxShadow: active ? '0 0 16px rgba(255,255,255,0.15)' : 'none',
        transition: 'all 0.2s ease',
        transform: active ? 'scale(1.06)' : 'scale(1)',
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          e.currentTarget.src = `https://placehold.co/88x88/1a1a1a/c8a96e?text=${encodeURIComponent(fallback)}`;
        }}
      />
    </button>
  );
}

/* ── Modern Review Card Component ────────────────────────────────── */
function ReviewCard({
  review: r, userName, initial,
}: { review: Review; userName: string; initial: string }) {
  const [helpfulCount, setHelpfulCount] = useState(r.helpfulCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const handleHelpful = () => {
    if (isLiked) {
      setHelpfulCount((c) => Math.max(0, c - 1));
      setIsLiked(false);
    } else {
      setHelpfulCount((c) => c + 1);
      setIsLiked(true);
    }
  };

  return (
    <div style={{
      background: DS.card,
      border: `1px solid ${DS.border}`,
      borderRadius: DS.radiusMd,
      padding: '1.35rem 1.5rem',
      boxShadow: DS.shadowSm,
      transition: 'border-color 0.2s ease',
    }}>
      {/* Top Header Row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '0.85rem',
        flexWrap: 'wrap', gap: '0.75rem',
      }}>
        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Avatar / Initial circle */}
          {r.user?.avatar ? (
            <img
              src={getImageUrl(r.user.avatar)}
              alt={userName}
              style={{
                width: 42, height: 42, borderRadius: '50%',
                objectFit: 'cover', border: `1.5px solid ${DS.border}`,
              }}
            />
          ) : (
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg, #2a2a2a, #181818)',
              border: `1.5px solid ${DS.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: DS.gold, fontWeight: 800, fontSize: '0.95rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              flexShrink: 0,
            }}>
              {initial}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: DS.textPrimary, margin: 0 }}>
                {userName}
              </p>
              {/* Verified Buyer Badge */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.68rem', fontWeight: 600, color: '#4caf7d',
                background: 'rgba(76,175,125,0.10)',
                border: '1px solid rgba(76,175,125,0.22)',
                borderRadius: 12, padding: '2px 8px',
              }}>
                <CheckCircle2 size={10} /> Verified Buyer
              </span>
            </div>
            <p style={{ fontSize: '0.72rem', color: DS.textMuted, marginTop: 2 }}>
              {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Rating */}
        <StarRating rating={r.rating} size={14} />
      </div>

      {/* Review Title */}
      {r.title && (
        <h4 style={{
          fontWeight: 700, fontSize: '0.9rem',
          color: DS.textPrimary, marginBottom: '0.4rem',
        }}>
          {r.title}
        </h4>
      )}

      {/* Review Body */}
      <p style={{
        color: DS.textSecondary, fontSize: '0.86rem',
        lineHeight: 1.75, margin: '0 0 1rem',
      }}>
        {r.comment}
      </p>

      {/* Customer Photos Gallery (if any) */}
      {r.images && r.images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {r.images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActivePhoto(img)}
              style={{
                width: 68, height: 68, borderRadius: 10, overflow: 'hidden',
                border: `1px solid ${DS.border}`, padding: 0, background: 'none',
                cursor: 'pointer', flexShrink: 0,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
            >
              <img src={getImageUrl(img)} alt={`Customer photo ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}

      {/* Footer / Helpful action */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: '0.65rem', borderTop: `1px solid ${DS.border}`,
      }}>
        <button
          onClick={handleHelpful}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: isLiked ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: `1px solid ${isLiked ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
            borderRadius: 8, padding: '4px 10px',
            color: isLiked ? DS.textPrimary : DS.textMuted,
            fontSize: '0.75rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s ease',
            fontFamily: 'var(--font-body)',
          }}
        >
          <ThumbsUp size={13} style={{ color: isLiked ? DS.gold : 'currentColor' }} />
          <span>Helpful {helpfulCount > 0 ? `(${helpfulCount})` : ''}</span>
        </button>
      </div>

      {/* Lightbox photo modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', cursor: 'zoom-out',
          }}
        >
          <img
            src={getImageUrl(activePhoto)}
            alt="Customer photo"
            style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 16, objectFit: 'contain', boxShadow: DS.shadowLg }}
          />
        </div>
      )}
    </div>
  );
}

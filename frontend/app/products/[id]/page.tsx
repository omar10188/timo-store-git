'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus,
  Share2, Check, Sparkles, ChevronDown, ChevronUp,
  Truck, Tag, RotateCcw, CreditCard,
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

/* ── Accordion ───────────────────────────────────────────────────── */
function Accordion({
  title, children, defaultOpen = false,
}: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      border: `1px solid ${DS.border}`,
      borderRadius: DS.radiusMd,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.9rem 1.2rem',
          background: DS.elevated,
          border: 'none', cursor: 'pointer',
          color: DS.textPrimary, fontSize: '0.88rem',
          fontWeight: 600, letterSpacing: '0.04em',
          fontFamily: 'var(--font-body)',
        }}
      >
        <span>{title}</span>
        {open
          ? <ChevronUp size={15} style={{ color: DS.textMuted }} />
          : <ChevronDown size={15} style={{ color: DS.textMuted }} />}
      </button>
      {open && (
        <div style={{
          padding: '1rem 1.2rem',
          background: DS.card,
          color: DS.textSecondary,
          fontSize: '0.875rem',
          lineHeight: 1.8,
        }}>
          {children}
        </div>
      )}
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

/* ── White action button ─────────────────────────────────────────── */
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
    transition: 'all 0.22s ease',
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
  children, onClick, active = false, title = '',
}: {
  children: React.ReactNode; onClick?: () => void; active?: boolean; title?: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 50, height: 50, borderRadius: DS.radiusMd,
        border: `1.5px solid ${active ? DS.gold : hovered ? 'rgba(255,255,255,0.3)' : DS.border}`,
        background: active ? DS.goldMuted : hovered ? 'rgba(255,255,255,0.04)' : DS.elevated,
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

            {/* Main Notes */}
            {product.tags?.length > 0 && (
              <div>
                <p style={{
                  fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: DS.textMuted, marginBottom: '0.65rem',
                }}>
                  Main Notes
                </p>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {product.tags.map((tag: string) => (
                    <NoteTag key={tag}>{tag}</NoteTag>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.78rem', color: DS.textMuted, fontWeight: 600 }}>Quantity</span>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: `1px solid ${DS.border}`,
                borderRadius: DS.radiusSm, overflow: 'hidden',
                background: DS.card,
              }}>
                <QuantityBtn onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
                  <Minus size={12} />
                </QuantityBtn>
                <span style={{
                  width: 46, textAlign: 'center', fontWeight: 800,
                  color: DS.textPrimary, fontSize: '0.95rem',
                  height: 40, lineHeight: '40px',
                  background: DS.elevated,
                }}>
                  {quantity}
                </span>
                <QuantityBtn onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} disabled={quantity >= (product.stock || 99)}>
                  <Plus size={12} />
                </QuantityBtn>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
              <WhiteBtn
                outline
                onClick={() => handleAddToCart(false)}
                disabled={addingToCart || product.stock === 0}
                style={{ flex: 1 }}
              >
                {addingToCart
                  ? <div style={{ width: 15, height: 15, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'pdp-spin 0.6s linear infinite' }} />
                  : <ShoppingCart size={15} />}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </WhiteBtn>

              <WhiteBtn
                onClick={() => handleAddToCart(true)}
                disabled={addingToCart || product.stock === 0}
                style={{ flex: 1 }}
              >
                Buy Now
              </WhiteBtn>

              <IconBtn onClick={handleWishlist} active={isWishlisted} title="Wishlist">
                <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
              </IconBtn>

              <IconBtn title="Share">
                <Share2 size={15} />
              </IconBtn>
            </div>

            {/* Stock status */}
            {(product.stock ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                {(product.stock ?? 0) <= 5 ? (
                  <>
                    <Sparkles size={12} style={{ color: '#f0a04b' }} />
                    <span style={{ color: '#f0a04b', fontWeight: 600 }}>
                      Hurry! Only {product.stock} left in stock
                    </span>
                  </>
                ) : (
                  <>
                    <Check size={12} style={{ color: '#4caf7d' }} />
                    <span style={{ color: '#4caf7d' }}>
                      {product.stock} in stock — ready to ship
                    </span>
                  </>
                )}
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
                  textAlign: 'center', padding: '3rem 2rem',
                  background: DS.card, borderRadius: DS.radius,
                  border: `1px solid ${DS.border}`,
                  color: DS.textMuted, fontSize: '0.875rem',
                }}>
                  No reviews yet. Be the first to review!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  {reviews.map((r) => (
                    <div key={r._id} style={{
                      background: DS.card,
                      border: `1px solid ${DS.border}`,
                      borderRadius: DS.radiusMd,
                      padding: '1.2rem 1.4rem',
                    }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: '0.7rem',
                        flexWrap: 'wrap', gap: '0.5rem',
                      }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: DS.textPrimary, marginBottom: '0.1rem' }}>
                            {r.user?.name || 'Anonymous'}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: DS.textMuted }}>
                            {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      {r.title && (
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: DS.textPrimary, marginBottom: '0.35rem' }}>
                          {r.title}
                        </p>
                      )}
                      <p style={{ color: DS.textSecondary, fontSize: '0.845rem', lineHeight: 1.7 }}>
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═════════════════════════════════════════════════════════
            YOU MIGHT ALSO LIKE
        ═════════════════════════════════════════════════════════ */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem',
            }}>
              <div style={{ height: 1, flex: 1, background: DS.border }} />
              <h2 style={{
                fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700,
                color: DS.textPrimary, margin: 0, whiteSpace: 'nowrap',
              }}>
                You might also like
              </h2>
              <div style={{ height: 1, flex: 1, background: DS.border }} />
            </div>
            <div className="products-grid">
              {recommendations.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Page-scoped styles ── */}
      <style>{`
        @keyframes pdp-spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 860px) {
          .pdp-top {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
        @media (max-width: 640px) {
          .pdp-reviews-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ── Sub-components (co-located for simplicity) ─────────────────── */

function NoteTag({ children }: { children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '4px 14px', borderRadius: 20,
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.35)' : DS.border}`,
        background: hovered ? 'rgba(255,255,255,0.05)' : DS.elevated,
        color: hovered ? DS.textPrimary : DS.textSecondary,
        fontSize: '0.76rem', fontWeight: 500,
        cursor: 'default', transition: 'all 0.2s ease',
      }}
    >
      {children}
    </span>
  );
}

function QuantityBtn({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{
        width: 38, height: 40,
        background: DS.elevated,
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        color: disabled ? DS.textMuted : DS.textPrimary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
        transition: 'background 0.15s',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = DS.elevated; }}
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

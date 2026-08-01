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

// ── Accordion Component ──────────────────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.9rem 1.25rem', background: 'var(--color-bg-elevated)',
          border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)',
          fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em',
        }}
      >
        <span>{title}</span>
        {open ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
      </button>
      {open && (
        <div style={{ padding: '1rem 1.25rem', background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Rating Bar ───────────────────────────────────────────────────────────────
function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem' }}>
      <span style={{ color: 'var(--color-text-muted)', minWidth: 8 }}>{star}</span>
      <Star size={11} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)', flexShrink: 0 }} />
      <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--color-border)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-gold)', borderRadius: 99, transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ color: 'var(--color-text-muted)', minWidth: 24, textAlign: 'right' }}>{count}</span>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
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

  if (loading) return <div style={{ paddingTop: '4rem' }}><LoadingSpinner text="Loading product..." /></div>;
  if (!product) return null;

  const displayPrice = product.salePrice || product.price;
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  // Compute rating distribution
  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '2rem var(--container-padding)', maxWidth: 1200 }}>

        {/* ── Breadcrumb / Back ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> Home
          </button>
          <span>/</span>
          <span style={{ color: 'var(--color-text-secondary)' }}>Products</span>
          <span>/</span>
          <span style={{ color: 'var(--color-text-primary)' }}>{product.name}</span>
        </div>

        {/* ═══════════════════════════════════════════════════
            TOP SECTION: Image Left + Details Right
        ═══════════════════════════════════════════════════ */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr)',
          gap: '3rem',
          marginBottom: '2.5rem',
          alignItems: 'start',
        }}
          className="product-top-grid"
        >
          {/* ── LEFT: Main Image ── */}
          <div>
            <div style={{
              aspectRatio: '1 / 1',
              borderRadius: 20,
              overflow: 'hidden',
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
            }}>
              {/* Discount badge */}
              {product.discount > 0 && (
                <div style={{
                  position: 'absolute', top: 16, left: 16, zIndex: 2,
                  background: 'var(--color-gold)', color: 'var(--color-bg)',
                  borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem', fontWeight: 700,
                }}>
                  {product.discount}% OFF
                </div>
              )}
              <img
                src={getImageUrl(allImages[selectedImage] || '')}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onError={(e) => {
                  e.currentTarget.src = `https://placehold.co/700x700/161616/d4a853?text=${encodeURIComponent(product.name[0])}`;
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              />
            </div>
          </div>

          {/* ── RIGHT: Product Details ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Brand */}
            {product.brand && (
              <span style={{ fontSize: '0.72rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: 700 }}>
                {product.brand}
              </span>
            )}

            {/* Name */}
            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--color-text-primary)',
              margin: 0,
            }}>
              {product.name}
            </h1>

            {/* Rating row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <StarRating rating={product.rating || 0} size={15} />
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                {product.rating?.toFixed(1)} &nbsp;·&nbsp; {product.numReviews || 0} reviews
              </span>
              {product.stock === 0 ? (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-error)', background: 'rgba(224,92,92,0.12)', borderRadius: 6, padding: '2px 10px' }}>Out of Stock</span>
              ) : (product.stock ?? 0) <= 5 ? (
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-warning)', background: 'rgba(240,160,75,0.12)', borderRadius: 6, padding: '2px 10px' }}>Only {product.stock} left</span>
              ) : null}
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--color-gold)', letterSpacing: '-0.02em' }}>
                EGP {displayPrice.toFixed(2)}
              </span>
              {product.discount > 0 && (
                <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                  EGP {product.price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Description Accordion */}
            <Accordion title="Description" defaultOpen>
              {product.description || 'No description available.'}
            </Accordion>

            {/* Main Notes / Tags */}
            {product.tags?.length > 0 && (
              <div>
                <p style={{ fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>Main Notes</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.tags.map((tag: string) => (
                    <span key={tag} style={{
                      padding: '4px 14px', borderRadius: 20,
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-secondary)',
                      fontSize: '0.78rem', fontWeight: 500,
                      cursor: 'default',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Quantity</span>
              <div style={{
                display: 'flex', alignItems: 'center',
                border: '1px solid var(--color-border)',
                borderRadius: 10, overflow: 'hidden',
              }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  style={{
                    width: 38, height: 38, background: 'var(--color-bg-elevated)',
                    border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <Minus size={13} />
                </button>
                <span style={{
                  width: 44, textAlign: 'center', fontWeight: 700,
                  color: 'var(--color-text-primary)', fontSize: '0.95rem',
                  background: 'var(--color-bg-card)',
                  height: 38, lineHeight: '38px',
                }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  disabled={quantity >= (product.stock || 99)}
                  style={{
                    width: 38, height: 38, background: 'var(--color-bg-elevated)',
                    border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.2s',
                  }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(false)}
                disabled={addingToCart || product.stock === 0}
                style={{
                  flex: 1, height: 48, borderRadius: 12,
                  border: '1.5px solid var(--color-gold)',
                  background: 'transparent', color: 'var(--color-gold)',
                  fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.04em',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  transition: 'all 0.25s ease',
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
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.6s linear infinite' }} />
                ) : <ShoppingCart size={16} />}
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>

              {/* Buy Now */}
              <button
                onClick={() => handleAddToCart(true)}
                disabled={addingToCart || product.stock === 0}
                style={{
                  flex: 1, height: 48, borderRadius: 12,
                  border: 'none', background: 'var(--color-gold)',
                  color: '#0a0a0a', fontWeight: 700, fontSize: '0.875rem',
                  letterSpacing: '0.04em', cursor: 'pointer',
                  transition: 'opacity 0.2s, transform 0.15s',
                  boxShadow: '0 4px 14px rgba(212,168,83,0.35)',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0.88'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
              >
                Buy Now
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  border: `1.5px solid ${isWishlisted ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  background: isWishlisted ? 'var(--color-gold-muted)' : 'var(--color-bg-elevated)',
                  color: isWishlisted ? 'var(--color-gold)' : 'var(--color-text-muted)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Heart size={17} fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>

              {/* Share */}
              <button
                title="Share"
                style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-muted)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
              >
                <Share2 size={16} />
              </button>
            </div>

            {/* Stock status */}
            {(product.stock ?? 0) > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                {(product.stock ?? 0) <= 5 ? (
                  <>
                    <Sparkles size={13} style={{ color: 'var(--color-warning)' }} />
                    <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
                      Hurry! Only {product.stock} left in stock
                    </span>
                  </>
                ) : (
                  <>
                    <Check size={13} style={{ color: 'var(--color-success)' }} />
                    <span style={{ color: 'var(--color-success)' }}>
                      {product.stock} in stock — ready to ship
                    </span>
                  </>
                )}
              </div>
            )}

            {/* Delivery Accordion */}
            <Accordion title="Delivery Options">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { icon: <Tag size={16} />, label: 'Discount', val: 'Save 15%' },
                  { icon: <CreditCard size={16} />, label: 'Payment', val: 'Cash on Delivery' },
                  { icon: <Truck size={16} />, label: 'Delivery Time', val: '3-4 Working Days' },
                  { icon: <RotateCcw size={16} />, label: 'Return & Warranty', val: '7 Days easy return' },
                ].map(({ icon, label, val }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    padding: '0.75rem', borderRadius: 10,
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                  }}>
                    <span style={{ color: 'var(--color-gold)', flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Accordion>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            THUMBNAILS STRIP (below main section)
        ═══════════════════════════════════════════════════ */}
        {allImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '3.5rem', flexWrap: 'wrap' }}>
            {allImages.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                style={{
                  width: 90, height: 90, borderRadius: 14, overflow: 'hidden', flexShrink: 0,
                  border: `2px solid ${i === selectedImage ? 'var(--color-gold)' : 'var(--color-border)'}`,
                  cursor: 'pointer', background: 'none', padding: 0,
                  boxShadow: i === selectedImage ? 'var(--shadow-gold)' : 'var(--shadow-sm)',
                  transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.15s',
                  transform: i === selectedImage ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <img
                  src={getImageUrl(img)}
                  alt={`View ${i + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/90x90/161616/d4a853?text=${encodeURIComponent(product.name[0])}`;
                  }}
                />
              </button>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════
            RATING & REVIEWS SECTION
        ═══════════════════════════════════════════════════ */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700,
            marginBottom: '2rem', color: 'var(--color-text-primary)',
            borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem',
          }}>
            Rating &amp; Reviews
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '3rem', alignItems: 'start' }}>

            {/* ── Left: Big Number + Bars ── */}
            <div style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border)',
              borderRadius: 16, padding: '1.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1, color: 'var(--color-text-primary)' }}>
                  {(product.rating || 0).toFixed(1)}
                </span>
                <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', marginBottom: '0.6rem' }}>/5</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <StarRating rating={product.rating || 0} size={18} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                {reviews.length} New Reviews
              </p>

              {/* Star distribution bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {starCounts.map(({ star, count }) => (
                  <RatingBar key={star} star={star} count={count} total={reviews.length} />
                ))}
              </div>
            </div>

            {/* ── Right: Write Review Panel + Reviews List ── */}
            <div>
              {/* Write Review CTA */}
              <div style={{
                background: 'var(--color-bg-card)', border: '1px solid var(--color-border)',
                borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>
                  Review this product
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Share your thoughts with other customers
                </p>

                {!showReviewForm ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { toast.error('Please sign in to leave a review'); return; }
                      setShowReviewForm(true);
                    }}
                    style={{
                      width: '100%', height: 42, borderRadius: 10,
                      border: '1.5px solid var(--color-border)',
                      background: 'transparent', color: 'var(--color-text-primary)',
                      fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
                  >
                    Write a customer review
                  </button>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Your Rating
                      </label>
                      <StarRating rating={newRating} interactive onChange={setNewRating} size={24} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>
                        Your Review
                      </label>
                      <textarea
                        className="input"
                        style={{ minHeight: '90px', resize: 'vertical', fontSize: '0.875rem' }}
                        placeholder="Share your experience with this fragrance..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        style={{
                          flex: 1, height: 42, borderRadius: 10, border: 'none',
                          background: 'var(--color-gold)', color: '#0a0a0a',
                          fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                        }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        style={{
                          height: 42, padding: '0 1.2rem', borderRadius: 10,
                          border: '1px solid var(--color-border)',
                          background: 'transparent', color: 'var(--color-text-secondary)',
                          fontSize: '0.875rem', cursor: 'pointer',
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
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((r) => (
                    <div key={r._id} style={{
                      background: 'var(--color-bg-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 14, padding: '1.25rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--color-text-primary)', marginBottom: '0.1rem' }}>
                            {r.user?.name || 'Anonymous'}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                            {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <StarRating rating={r.rating} size={13} />
                      </div>
                      {r.title && (
                        <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)', marginBottom: '0.3rem' }}>
                          {r.title}
                        </p>
                      )}
                      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.845rem', lineHeight: 1.65 }}>
                        {r.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════
            YOU MIGHT ALSO LIKE — Related Products
        ═══════════════════════════════════════════════════ */}
        {recommendations.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700,
              textAlign: 'center', color: 'var(--color-text-primary)',
              marginBottom: '2rem',
            }}>
              You might also like
            </h2>
            <div className="products-grid">
              {recommendations.slice(0, 8).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Responsive overrides ── */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .product-top-grid {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
}

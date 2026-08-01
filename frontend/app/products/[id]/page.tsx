'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingCart, Heart, Star, ArrowLeft, Minus, Plus, Share2, Check, Sparkles } from 'lucide-react';
import { productsAPI, reviewsAPI, cartAPI, wishlistAPI } from '@/lib/api';
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

interface Review { _id: string; user: { name: string }; rating: number; comment: string; createdAt: string; }

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
    if (!isAuthenticated) { toast.error('Please sign in to add to cart'); return; }
    if (!product?._id) { toast.error('Product ID missing'); return; }

    setAddingToCart(true);
    try {
      await addToCartAsync(product._id, quantity, {
        name: product.name,
        price: product.salePrice || product.price,
        image: product.image,
      });
      toast.success('Added to cart!');
      if (redirect) {
        router.push('/checkout');
      }
    } catch (err) {
      console.error('❌ Failed to add to cart:', err);
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
      setNewComment(''); setNewRating(5);
      toast.success('Review submitted!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return <div style={{ paddingTop: '4rem' }}><LoadingSpinner text="Loading product..." /></div>;
  if (!product) return null;

  const displayPrice = product.salePrice || product.price;
  const allImages = [product.image, ...(product.images || [])].filter(Boolean);

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)' }}>
      {/* Back */}
      <button className="btn btn-ghost" style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }} onClick={() => router.back()}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Product layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginBottom: '4rem' }}>
        {/* Images */}
        <div>
          {/* Main image */}
          <div style={{ aspectRatio: '1', borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
            <img
              src={getImageUrl(allImages[selectedImage] || '')}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => { e.currentTarget.src = `https://placehold.co/600x600/161616/d4a853?text=${product.name[0]}`; }}
            />
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: `2px solid ${i === selectedImage ? 'var(--color-gold)' : 'var(--color-border)'}`, cursor: 'pointer', background: 'none', padding: 0 }}>
                  <img src={getImageUrl(img)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = `https://placehold.co/72x72/161616/d4a853?text=${product.name[0]}`; }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Brand + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {product.brand && <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{product.brand}</span>}
            {product.isFeatured && <span className="badge badge-info">Featured</span>}
            {product.stock === 0 && <span className="badge badge-error">Out of Stock</span>}
            {(product.stock ?? 0) > 0 && (product.stock ?? 0) <= 5 && <span className="badge badge-warning">Only {product.stock} left</span>}
          </div>

          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '1rem', fontWeight: 700 }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <StarRating rating={product.rating || 0} />
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
              {product.rating?.toFixed(1)} ({product.numReviews || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-gold)' }}>
              ${displayPrice.toFixed(2)}
            </span>
            {product.discount > 0 && (
              <>
                <span style={{ fontSize: '1.1rem', color: 'var(--color-text-muted)', textDecoration: 'line-through', marginLeft: '0.75rem' }}>
                  ${product.price.toFixed(2)}
                </span>
                <span className="badge badge-gold" style={{ marginLeft: '0.75rem' }}>{product.discount}% OFF</span>
              </>
            )}
          </div>

          {/* Description */}
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginBottom: '2rem' }}>
            {product.description}
          </p>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {product.tags.map((tag: string) => (
                <span key={tag} className="badge badge-info" style={{ padding: '0.3rem 0.7rem' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Quantity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Qty:</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '40px', height: '40px', background: 'var(--color-bg-elevated)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Minus size={14} />
              </button>
              <span style={{ width: '48px', textAlign: 'center', fontWeight: 600 }}>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))} style={{ width: '40px', height: '40px', background: 'var(--color-bg-elevated)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, minWidth: '140px', justifyContent: 'center' }}
              onClick={() => handleAddToCart(false)}
              disabled={addingToCart || product.stock === 0}
            >
              {addingToCart ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : <ShoppingCart size={18} />}
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            
            <button
              className="btn btn-secondary"
              style={{ flex: 1, minWidth: '140px', justifyContent: 'center', background: 'var(--color-gold)', color: 'var(--color-bg)', border: 'none' }}
              onClick={() => handleAddToCart(true)}
              disabled={addingToCart || product.stock === 0}
            >
              Buy Now
            </button>

            <button
              className={`btn ${isWishlisted ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.75rem 1rem' }}
              onClick={handleWishlist}
              title="Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            <button className="btn btn-ghost" style={{ padding: '0.75rem 1rem' }} title="Share">
              <Share2 size={18} />
            </button>
          </div>

          {/* Stock info */}
          {(product.stock ?? 0) > 0 && (
            <div style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
              {(product.stock ?? 0) <= 5 ? (
                <p style={{ color: 'var(--color-error)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, animation: 'pulse 2s infinite' }}>
                  <Sparkles size={14} /> Hurry! Only {product.stock} left in stock.
                </p>
              ) : (
                <p style={{ color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Check size={14} /> {product.stock} in stock — ready to ship
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recommendations Section (AI Driven) */}
      {recommendations.length > 0 && (
        <section style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 600 }}>
              You May Also Like
            </h2>
          </div>
          <div className="products-grid">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Reviews Section */}
      <section>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
          Customer Reviews
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
          {/* Reviews List */}
          <div>
            {reviews.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)' }}>No reviews yet. Be the first to review!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {reviews.map((r) => (
                  <div key={r._id} className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.user?.name || 'Anonymous'}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StarRating rating={r.rating} size={14} />
                    </div>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Write Review */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', marginBottom: '1.25rem' }}>Write a Review</h3>
            {!isAuthenticated ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                Please <a href="/auth/login" style={{ color: 'var(--color-gold)' }}>sign in</a> to leave a review.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Your Rating</label>
                  <StarRating rating={newRating} interactive onChange={setNewRating} size={24} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Your Review</label>
                  <textarea
                    className="input"
                    style={{ minHeight: '100px', resize: 'vertical' }}
                    placeholder="Share your experience with this fragrance..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : null}
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

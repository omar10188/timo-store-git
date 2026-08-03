'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ShoppingCart, Heart, Star, Eye, Pencil, Trash2, Flame } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  type Variants,
  type Transition,
} from 'framer-motion';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { wishlistAPI, productsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import AdminQuickEditModal from './AdminQuickEditModal';

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
  categories?: { _id: string; name: string }[];
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const WHATSAPP_PHONE = '201008313604';

function getImageUrl(src?: string) {
  if (!src) return '/hero-perfume.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

const springSmooth: Transition = { type: 'spring', stiffness: 220, damping: 32 };
const springBouncy: Transition = { type: 'spring', stiffness: 380, damping: 30 };
const springGentle: Transition = { type: 'spring', stiffness: 100, damping: 22 };

const floatVariants: Variants = {
  animate: {
    y: [0, -3, 0],
    transition: {
      duration: 5.5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export default function ProductCard({ product }: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartPulsed, setCartPulsed]     = useState(false);
  const [isHovered, setIsHovered]       = useState(false);
  const [sweepActive, setSweepActive]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [imgError, setImgError]         = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useAuthStore();
  const { addToCartAsync }  = useCartStore();
  const { productIds, toggleItem } = useWishlistStore();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';
  const isWishlisted = productIds.includes(product._id);

  // Price calculations & discount check
  const displayPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasRealDiscount = Boolean(
    (product.discount && product.discount > 0) ||
    (product.salePrice && product.salePrice < product.price)
  );

  const discountPercent = product.discount || (
    product.salePrice && product.price
      ? Math.round(((product.price - product.salePrice) / product.price) * 100)
      : 0
  );

  // Parallax mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]),  springGentle);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springGentle);
  const imgX    = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springSmooth);
  const imgY    = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), springSmooth);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
      mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
    },
    [mouseX, mouseY]
  );

  const handleMouseEnter = () => {
    setIsHovered(true);
    setSweepActive(true);
    setTimeout(() => setSweepActive(false), 700);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  // WhatsApp Order Handler
  const handleWhatsAppOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const message = `Hi! I want to order ${product.name} - Price: EGP ${displayPrice.toFixed(2)} from Timo Perfume.`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Cart Handler
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!product?._id)    { toast.error('Product ID missing');             return; }
    if (!isAuthenticated) { toast.error('Please sign in to add to cart'); return; }
    if (product.stock === 0) { toast.error('Out of stock');               return; }

    setAddingToCart(true);
    try {
      await addToCartAsync(product._id, 1, {
        name:  product.name,
        price: displayPrice,
        image: product.image,
      });
      setCartPulsed(true);
      setTimeout(() => setCartPulsed(false), 600);
      toast.success('Added to cart! 🛒');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please sign in to save wishlist'); return; }
    try {
      await wishlistAPI.toggle(product._id);
      toggleItem(product._id);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist! ❤️');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(product._id);
        toast.success('Product deleted successfully');
        window.location.reload();
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div
      onClick={() => router.push(`/products/${product._id}`)}
      className="block h-full outline-none cursor-pointer w-full box-border"
      style={{ perspective: '1000px' }}
    >
      <motion.div variants={floatVariants} animate="animate" className="h-full">
        <motion.article
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            scale: 1.02,
            boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.5), 0 0 25px rgba(212,168,83,0.2)',
            transition: { ...springSmooth, duration: 0.35 },
          }}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
          className="group relative flex h-full flex-col rounded-2xl p-3 sm:p-4 box-border border border-[var(--color-border)] shadow-md transition-all duration-300"
        >
          {/* Light sweep shimmer */}
          <AnimatePresence>
            {sweepActive && (
              <motion.div
                key="sweep"
                initial={{ x: '-110%', opacity: 1 }}
                animate={{ x: '210%', opacity: 0.7 }}
                exit={{}}
                transition={{ duration: 0.65, ease: 'easeOut' as const }}
                className="absolute inset-0 pointer-events-none z-30 rounded-2xl overflow-hidden"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.09) 50%, transparent 62%)',
                }}
              />
            )}
          </AnimatePresence>

          {/* Image Area - Aspect Ratio 4:5 / fixed clean box */}
          <div
            className="relative flex aspect-[4/5] sm:aspect-square w-full items-center justify-center rounded-xl p-3 overflow-hidden"
            style={{ background: 'var(--color-bg-elevated)' }}
          >
            {!imgError ? (
              <motion.img
                src={getImageUrl(product.image)}
                alt={product.name}
                loading="lazy"
                decoding="async"
                animate={{
                  scale: isHovered ? 1.08 : 1,
                  filter: isHovered
                    ? 'drop-shadow(0 8px 20px rgba(212,168,83,0.35))'
                    : 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                }}
                transition={springSmooth}
                style={{ x: imgX, y: imgY }}
                className="h-full w-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              /* Fallback Neutral Perfume Graphic */
              <div className="flex flex-col items-center justify-center gap-2 p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(212,168,83,0.15)] border border-[rgba(212,168,83,0.3)] flex items-center justify-center text-[#D4AF37]">
                  <Flame size={28} />
                </div>
                <span className="text-[11px] font-serif text-[var(--color-text-secondary)] tracking-widest uppercase">
                  Timo Perfume
                </span>
              </div>
            )}

            {/* Badges - Top Left with proper inset padding */}
            <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-20">
              {hasRealDiscount && discountPercent > 0 && (
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"
                  style={{ background: '#D4AF37', color: '#0B0B0B' }}
                >
                  -{discountPercent}%
                </span>
              )}
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[rgba(212,168,83,0.15)] text-[#D4AF37] border border-[rgba(212,168,83,0.3)]">
                  <Flame size={10} className="fill-[#D4AF37]" /> Best Seller
                </span>
              )}
              {product.stock === 0 && (
                <span className="rounded-full bg-red-900/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Action Buttons - Top Right with proper inset margin */}
            <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
              {isAdmin && (
                <>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setIsEditModalOpen(true); }}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md border border-[var(--color-border)] bg-[var(--color-bg-card)]/90 text-[var(--color-text-primary)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
                    aria-label="Edit Product"
                  >
                    <Pencil size={13} />
                  </motion.button>
                  <motion.button
                    onClick={handleDelete}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md border border-red-500/30 bg-red-500/10 text-red-500"
                    aria-label="Delete Product"
                  >
                    <Trash2 size={13} />
                  </motion.button>
                </>
              )}

              <motion.button
                onClick={handleWishlist}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all"
                style={{
                  border: isWishlisted ? '1px solid #D4AF37' : '1px solid var(--color-border)',
                  background: isWishlisted ? 'rgba(212,168,83,0.2)' : 'rgba(20,20,20,0.75)',
                  color: isWishlisted ? '#D4AF37' : 'var(--color-text-secondary)',
                }}
                aria-label="Wishlist"
              >
                <Heart size={14} fill={isWishlisted ? '#D4AF37' : 'none'} />
              </motion.button>

              <motion.button
                onClick={(e) => { e.stopPropagation(); router.push(`/products/${product._id}`); }}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md border border-[var(--color-border)] bg-[rgba(20,20,20,0.75)] text-[var(--color-text-secondary)] hover:border-[#D4AF37] hover:text-[#D4AF37]"
                aria-label="Quick view"
              >
                <Eye size={13} />
              </motion.button>
            </div>
          </div>

          {/* Footer Area - Sitting on slightly lighter surface with rounded bottom corners */}
          <div className="relative mt-3 p-3.5 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border)] flex flex-col justify-between flex-1 box-border">
            
            {/* Brand / Category & Rating */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#D4AF37] truncate">
                {product.brand || product.categoryName || 'TIMO PERFUME'}
              </span>
              {product.rating && product.rating > 0 && (
                <div className="flex items-center gap-1 shrink-0">
                  <Star size={11} className="fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-[11px] font-bold text-[var(--color-text-primary)]">
                    {product.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Product Name */}
            <h3 className="font-serif text-sm sm:text-base font-bold text-[var(--color-text-primary)] tracking-wide line-clamp-1 mb-2">
              {product.name}
            </h3>

            {/* Price & Action Row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--color-border)]">
              {/* Price display */}
              <div className="flex flex-col">
                {hasRealDiscount && (
                  <span className="text-[11px] text-gray-400 line-through leading-none mb-0.5">
                    EGP {product.price.toFixed(2)}
                  </span>
                )}
                <span className="text-sm sm:text-base font-extrabold text-[#D4AF37] leading-none">
                  EGP {displayPrice.toFixed(2)}
                </span>
              </div>

              {/* Action Buttons: WhatsApp + Add to Cart */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleWhatsAppOrder}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(37,211,102,0.15)] text-[#25D366] border border-[rgba(37,211,102,0.4)] hover:bg-[#25D366] hover:text-white transition-all active:scale-95 cursor-pointer"
                  title="Order via WhatsApp"
                >
                  <FaWhatsapp size={15} />
                </button>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart || product.stock === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#e8c97a] transition-all active:scale-95 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ShoppingCart size={13} />
                  <span>{addingToCart ? '...' : 'Buy'}</span>
                </button>
              </div>
            </div>

          </div>
        </motion.article>
      </motion.div>

      <AdminQuickEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        product={product} 
        onUpdateSuccess={() => window.location.reload()} 
      />
    </div>
  );
}

// Skeleton
export function ProductCardSkeleton() {
  return (
    <article className="flex flex-col rounded-2xl p-3 sm:p-4 animate-pulse bg-[var(--color-bg-card)] border border-[var(--color-border)]">
      <div className="aspect-square w-full rounded-xl bg-[var(--color-bg-elevated)]" />
      <div className="mt-3 p-3.5 rounded-xl bg-[var(--color-bg-elevated)] flex flex-col gap-2">
        <div className="h-3 w-16 rounded bg-[var(--color-border)]" />
        <div className="h-4 w-3/4 rounded bg-[var(--color-border)]" />
        <div className="h-5 w-1/2 rounded bg-[var(--color-border)] mt-2" />
      </div>
    </article>
  );
}

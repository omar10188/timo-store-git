'use client';

import { useRouter } from 'next/navigation';
import { useState, useRef, useCallback } from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
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
import { wishlistAPI } from '@/lib/api';
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

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(src: string) {
  if (!src) return '/placeholder.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

// ─── Typed spring configs ──────────────────────────────────────────────────
const springSmooth: Transition = { type: 'spring', stiffness: 300, damping: 30 };
const springBouncy: Transition = { type: 'spring', stiffness: 500, damping: 25 };
const springGentle: Transition = { type: 'spring', stiffness: 150, damping: 20 };

// ─── Float variant ─────────────────────────────────────────────────────────
const floatVariants: Variants = {
  animate: {
    y: [0, -4, 0],
    transition: {
      duration: 4,
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
  const cardRef = useRef<HTMLDivElement>(null);

  const { isAuthenticated } = useAuthStore();
  const { addToCartAsync }  = useCartStore();
  const { productIds, toggleItem } = useWishlistStore();
  const router = useRouter();

  const isWishlisted = productIds.includes(product._id);
  const displayPrice = product.salePrice || product.price;
  const hasDiscount  = product.discount && product.discount > 0;

  // ─── Parallax mouse tracking ─────────────────────────────────────────────
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]),  springGentle);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springGentle);
  const imgX    = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springSmooth);
  const imgY    = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), springSmooth);
  const glowX   = useTransform(mouseX, [-0.5, 0.5], [20, 80]);
  const glowY   = useTransform(mouseY, [-0.5, 0.5], [20, 80]);

  // ─── Magnetic button ──────────────────────────────────────────────────────
  const btnX = useSpring(0, springSmooth);
  const btnY = useSpring(0, springSmooth);

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
    btnX.set(0);
    btnY.set(0);
  };

  const handleBtnMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    btnX.set((e.clientX - rect.left - rect.width  / 2) * 0.35);
    btnY.set((e.clientY - rect.top  - rect.height / 2) * 0.35);
  };

  // ─── Cart handler ──────────────────────────────────────────────────────────
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

  // ─── Dynamic glow gradient ────────────────────────────────────────────────
  const glowBg = useTransform(
    [glowX, glowY],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(201,169,110,0.13) 0%, transparent 60%)`
  );

  return (
    <div
      onClick={() => router.push(`/products/${product._id}`)}
      className="block h-full outline-none cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      {/* ── Floating idle ── */}
      <motion.div variants={floatVariants} animate="animate" className="h-full">

        {/* ── Card ── */}
        <motion.article
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{
            scale: 1.03,
            boxShadow:
              '0 0 0 1.5px rgba(201,169,110,0.6), 0 20px 60px -10px rgba(201,169,110,0.3), 0 4px 20px -4px rgba(0,0,0,0.8)',
            transition: springSmooth,
          }}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
          }}
          className="group relative flex h-full flex-col rounded-2xl sm:rounded-3xl p-3 sm:p-4 overflow-hidden"
        >
          {/* ── Cursor-tracking glow ── */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl"
            style={{
              background: glowBg,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.4s ease',
            }}
          />

          {/* ── Light sweep shimmer ── */}
          <AnimatePresence>
            {sweepActive && (
              <motion.div
                key="sweep"
                initial={{ x: '-110%', opacity: 1 }}
                animate={{ x: '210%', opacity: 0.7 }}
                exit={{}}
                transition={{ duration: 0.65, ease: 'easeOut' as const }}
                className="absolute inset-0 pointer-events-none z-30"
                style={{
                  background:
                    'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.09) 50%, transparent 62%)',
                }}
              />
            )}
          </AnimatePresence>

          {/* ── Bottom veil on hover ── */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-transparent via-transparent to-[rgba(201,169,110,0.05)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* ── Image Container ── */}
          <div
            className="relative flex h-[160px] sm:h-[200px] w-full items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl p-2 sm:p-4"
            style={{ background: 'var(--color-bg-elevated)' }}
          >
            <motion.img
              src={getImageUrl(product.image)}
              alt={product.name}
              loading="lazy"
              decoding="async"
              animate={{
                scale: isHovered ? 1.12 : 1,
                filter: isHovered
                  ? 'drop-shadow(0 8px 24px rgba(201,169,110,0.45))'
                  : 'drop-shadow(0 4px 8px rgba(201,169,110,0.15))',
              }}
              transition={springSmooth}
              style={{ x: imgX, y: imgY }}
              className="h-full w-full object-contain"
              onError={(e) => {
                e.currentTarget.src = `https://placehold.co/400x400/161616/C9A96E?text=${encodeURIComponent(product.name[0])}`;
              }}
            />

            {/* Badges */}
            <div className="absolute left-2 top-2 sm:left-3 sm:top-3 flex flex-col gap-1.5 z-10">
              {hasDiscount && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider"
                  style={{ background: 'var(--color-gold)', color: 'var(--color-bg)' }}
                >
                  {product.discount}% OFF
                </motion.span>
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

            {/* ── Action icons ── */}
            <div className="absolute right-2 top-2 sm:right-3 sm:top-3 flex flex-col gap-1.5 z-20">
              <motion.button
                onClick={handleWishlist}
                initial={{ opacity: 0, x: 12 }}
                animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ ...springBouncy, delay: 0 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl backdrop-blur-md"
                style={{
                  border:     isWishlisted ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                  background: isWishlisted ? 'rgba(201,169,110,0.18)' : 'rgba(26,26,26,0.85)',
                  color:      isWishlisted ? 'var(--color-gold)' : 'var(--color-text-muted)',
                }}
                aria-label="Wishlist"
              >
                <Heart size={14} fill={isWishlisted ? 'var(--color-gold)' : 'none'} />
              </motion.button>

              <motion.button
                onClick={(e) => { e.stopPropagation(); router.push(`/products/${product._id}`); }}
                initial={{ opacity: 0, x: 12 }}
                animate={isHovered ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
                transition={{ ...springBouncy, delay: 0.06 }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl backdrop-blur-md"
                style={{
                  border:     '1px solid var(--color-border)',
                  background: 'rgba(26,26,26,0.85)',
                  color:      'var(--color-text-muted)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                }}
                aria-label="Quick view"
              >
                <Eye size={14} />
              </motion.button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="relative mt-3 sm:mt-4 flex flex-col z-10 flex-1">
            {/* Brand & Rating */}
            <div className="mb-1 sm:mb-2 flex items-center justify-between">
              {(product.categoryName || product.brand) && (
                <span
                  className="text-[10px] sm:text-xs tracking-widest uppercase"
                  style={{ color: 'var(--color-gold)' }}
                >
                  {product.brand || product.categoryName}
                </span>
              )}
              {(product.numReviews ?? 0) > 0 && (
                <div className="flex items-center gap-1">
                  <Star size={10} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} />
                  <span className="text-[10px] sm:text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {product.rating?.toFixed(1)} ({product.numReviews})
                  </span>
                </div>
              )}
            </div>

            {/* Name */}
            <h3
              className="mb-1 sm:mb-2 text-sm sm:text-base font-medium tracking-wide line-clamp-2 leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {product.name}
            </h3>

            {/* Price */}
            <div className="mt-auto pt-2 flex items-end justify-between">
              <div className="flex flex-col">
                {hasDiscount && (
                  <span
                    className="text-[10px] sm:text-xs line-through"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    EGP {product.price.toFixed(2)}
                  </span>
                )}
                <motion.span
                  key={displayPrice}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-base sm:text-lg font-bold"
                  style={{ color: hasDiscount ? 'var(--color-gold)' : 'var(--color-text-primary)' }}
                >
                  EGP {displayPrice.toFixed(2)}
                </motion.span>
              </div>
            </div>

            {/* ── Add to Cart — Magnetic + spring bounce ── */}
            <div className="mt-3 sm:mt-4">
              <motion.button
                style={{
                  x: btnX,
                  y: btnY,
                  border:     '1.5px solid var(--color-gold)',
                  background: isHovered ? 'var(--color-gold)' : 'transparent',
                  color:      isHovered ? 'var(--color-bg)'   : 'var(--color-gold)',
                  transition: 'background 0.35s ease, color 0.35s ease',
                }}
                onMouseMove={handleBtnMouseMove}
                onMouseLeave={() => { btnX.set(0); btnY.set(0); }}
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                whileTap={{ scale: 0.94 }}
                animate={cartPulsed ? { scale: [1, 1.06, 0.97, 1] } : {}}
                transition={springBouncy}
                className="relative h-11 sm:h-12 w-full flex items-center justify-center gap-2 rounded-xl text-sm sm:text-base font-semibold tracking-wide overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
              >

                {/* Button inner shimmer */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.span
                      key="btn-shimmer"
                      initial={{ x: '-100%' }}
                      animate={{ x: '200%' }}
                      exit={{}}
                      transition={{ duration: 0.6, ease: 'easeOut' as const, delay: 0.05 }}
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.16) 50%, transparent 60%)',
                      }}
                    />
                  )}
                </AnimatePresence>

                {addingToCart ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' as const }}
                    className="h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 border-current border-t-transparent"
                  />
                ) : product.stock === 0 ? (
                  <span>Out of Stock</span>
                ) : (
                  <motion.span
                    className="flex items-center gap-2"
                    animate={cartPulsed ? { scale: [1, 1.15, 1] } : {}}
                    transition={springBouncy}
                  >
                    <ShoppingCart size={16} />
                    <span>Add to Cart</span>
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.article>
      </motion.div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────
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
        className="relative h-[160px] sm:h-[200px] w-full overflow-hidden rounded-xl sm:rounded-2xl"
        style={{ background: 'var(--color-bg-elevated)' }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, transparent 20%, rgba(255,255,255,0.04) 50%, transparent 80%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.6s infinite linear',
          }}
        />
      </div>
      <div className="relative mt-3 sm:mt-4 flex flex-col z-10 flex-1">
        <div className="mb-1 sm:mb-2 flex items-center justify-between">
          <div className="h-3 w-16 rounded-full" style={{ background: 'var(--color-border)' }} />
          <div className="h-3 w-8  rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="h-4 sm:h-5 w-3/4 rounded-full mt-2 mb-1" style={{ background: 'var(--color-border)' }} />
        <div className="h-4 sm:h-5 w-1/2 rounded-full mb-2"      style={{ background: 'var(--color-border)' }} />
        <div className="mt-auto pt-2">
          <div className="h-5 sm:h-6 w-20 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="mt-3 sm:mt-4 h-11 sm:h-12 w-full rounded-xl" style={{ background: 'var(--color-border)' }} />
      </div>
    </article>
  );
}

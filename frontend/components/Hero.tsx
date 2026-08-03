'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star, Sparkles, ShoppingBag, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';

export interface HeroProduct {
  _id: string;
  name: string;
  price: number;
  salePrice?: number;
  image: string;
  rating?: number;
  numReviews?: number;
  categoryName?: string;
  brand?: string;
  description?: string;
}

const FALLBACK_PRODUCTS: HeroProduct[] = [
  {
    _id: 'hero-1',
    name: 'Oud Royale Exquisite',
    price: 320,
    salePrice: 280,
    image: '/hero-perfume.png',
    rating: 4.9,
    numReviews: 128,
    categoryName: 'Luxury Oud',
    description: 'A regal blend of rare Cambodian oud, amber, and damask rose.',
  },
  {
    _id: 'hero-2',
    name: 'Velvet Amber Noir',
    price: 240,
    salePrice: 195,
    image: '/hero-perfume.png',
    rating: 4.8,
    numReviews: 96,
    categoryName: 'Oriental',
    description: 'Rich dark amber notes infused with vanilla bean and smoked cedar.',
  },
  {
    _id: 'hero-3',
    name: 'Celestial Bloom',
    price: 210,
    salePrice: 175,
    image: '/hero-perfume.png',
    rating: 4.9,
    numReviews: 114,
    categoryName: 'Floral Elite',
    description: 'Masterfully crafted jasmine sambac with white musk and bergamot.',
  },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
const WHATSAPP_PHONE = '201008313604';

function getImageUrl(src: string) {
  if (!src) return '/hero-perfume.png';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function Hero() {
  const [bestSellers, setBestSellers] = useState<HeroProduct[]>(FALLBACK_PRODUCTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCartAsync } = useCartStore();

  // 3D Parallax Tilt state
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 150, damping: 20 });

  useEffect(() => {
    async function fetchTopBestSellers() {
      try {
        const res = await productsAPI.getAll({ sort: 'popular', limit: 3 });
        const prods = res.data?.products || [];
        if (prods.length > 0) {
          setBestSellers(prods.slice(0, 3));
        }
      } catch (err) {
        console.log('Using fallback hero products');
      }
    }
    fetchTopBestSellers();
  }, []);

  // SMART BEST SELLER AUTO-ROTATE EVERY 7 SECONDS
  useEffect(() => {
    if (bestSellers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bestSellers.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [bestSellers.length]);

  const currentProduct = bestSellers[currentIndex] || FALLBACK_PRODUCTS[0];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // SMART WHATSAPP BOT INTEGRATION
  const handleWhatsAppOrder = (product?: HeroProduct) => {
    const targetProduct = product || currentProduct;
    const price = targetProduct.salePrice || targetProduct.price;
    const message = `Hi! I want to order ${targetProduct.name} - Price: $${price} from Timo Perfume.`;
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addToCartAsync(currentProduct._id, 1, {
        name: currentProduct.name,
        price: currentProduct.salePrice || currentProduct.price,
        image: currentProduct.image,
      });
      toast.success(`${currentProduct.name} added to cart!`);
    } catch {
      toast.error('Failed to add item to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-[var(--color-bg)] border-b border-[var(--color-border)] transition-colors duration-500">
      
      {/* LUXURY AMBIENT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 right-1/4 w-[650px] h-[650px] bg-[var(--color-gold-muted)] opacity-20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-[var(--color-gold-muted)] opacity-10 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* BASE RESPONSIVE LAYOUT */}
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 md:py-16 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-10 z-10">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-[var(--color-gold-muted)] border border-[var(--color-border-gold)] shadow-sm">
            <Sparkles size={14} className="text-[var(--color-gold)]" />
            <span className="text-xs font-bold tracking-[0.12em] uppercase text-[var(--color-gold)]">
              NEW COLLECTION 2025
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6 font-bold text-[var(--color-text-primary)] tracking-tight">
            Discover Your
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)]">
              {" "}Signature Scent
            </span>
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-8 max-w-[520px] text-[var(--color-text-secondary)]">
            Explore an exclusive collection of luxury fragrances crafted by master perfumers. From rare oud to fresh florals — find the scent that defines your elegance.
          </p>

          {/* PREMIUM BUTTONS WITH GOLD GRADIENT & GLOW */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 mb-10">
            <Link
              href="/products"
              className="group flex items-center justify-center gap-2.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
              style={{
                background: 'linear-gradient(135deg, #e8c97a 0%, #D4AF37 50%, #b8892f 100%)',
                color: '#0B0B0B',
                boxShadow: '0 4px 20px rgba(212,168,83,0.4)',
                padding: '0.95rem 2.2rem',
              }}
            >
              Shop Collection <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>

            {/* SMART WHATSAPP ORDER BUTTON ON HERO */}
            <button
              onClick={() => handleWhatsAppOrder(currentProduct)}
              className="flex items-center justify-center gap-2.5 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto cursor-pointer border border-[rgba(212,168,83,0.45)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] hover:border-[var(--color-gold)] shadow-md"
              style={{ padding: '0.95rem 2.2rem' }}
            >
              <FaWhatsapp className="text-[#25D366] text-lg" />
              <span>Order via WhatsApp</span>
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} size={16} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
              <strong className="text-[var(--color-text-primary)] font-bold">2,400+</strong> happy customers
            </p>
          </div>

        </div>

        {/* RIGHT VISUAL: BEST SELLER LUXURY SMOOTH CARD */}
        <div className="flex-1 w-full flex flex-col items-center justify-center">
          
          {/* SMOOTH LUXURY CARD CONTAINER */}
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative w-full max-w-[460px] aspect-[4/5] sm:aspect-square flex items-center justify-center cursor-grab active:cursor-grabbing"
            style={{ perspective: 1000 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentProduct._id}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                  rotateX,
                  rotateY,
                  transformStyle: 'preserve-3d',
                }}
                className="relative w-full h-full rounded-3xl p-6 flex flex-col items-center justify-between border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-lg)] overflow-hidden group transition-colors duration-500"
              >
                {/* GLOW EFFECT BEHIND PRODUCT */}
                <div className="absolute inset-0 bg-radial from-[var(--color-gold-muted)] to-transparent blur-3xl pointer-events-none opacity-50" />

                {/* BEST SELLER BADGE & PROGRESS INDICATOR */}
                <div className="w-full flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--color-gold-muted)] text-[var(--color-gold)] border border-[var(--color-border-gold)] shadow-sm">
                    <Flame size={12} className="fill-[var(--color-gold)]" /> Best Seller
                  </span>
                  {currentProduct.rating && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-border)]">
                      <Star size={12} className="fill-[var(--color-gold)] text-[var(--color-gold)]" /> {currentProduct.rating}
                    </span>
                  )}
                </div>

                {/* CENTERED PRODUCT IMAGE */}
                <div className="relative w-44 h-44 sm:w-56 sm:h-56 my-auto transition-transform duration-500 group-hover:scale-105">
                  <Image
                    src={getImageUrl(currentProduct.image)}
                    alt={currentProduct.name}
                    fill
                    className="object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
                    priority
                  />
                </div>

                {/* OVERLAY DETAILS & BUY BUTTON - SMOOTH ROUNDED LUXURY BAR */}
                <div className="w-full bg-[var(--color-bg-elevated)] p-4 rounded-2xl border border-[var(--color-border)] flex items-center justify-between z-10 gap-3">
                  <div className="flex flex-col text-left truncate min-w-0 flex-1">
                    <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--color-text-primary)] truncate">
                      {currentProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-gold)] font-bold text-sm sm:text-base">
                        ${currentProduct.salePrice || currentProduct.price}
                      </span>
                      {currentProduct.salePrice && (
                        <span className="text-[var(--color-text-muted)] text-xs line-through">
                          ${currentProduct.price}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BUY NOW & WHATSAPP BUTTONS */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleWhatsAppOrder(currentProduct)}
                      className="flex items-center justify-center p-3 rounded-full bg-[rgba(37,211,102,0.15)] text-[#25D366] border border-[rgba(37,211,102,0.3)] hover:bg-[#25D366] hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                      title="Order via WhatsApp"
                    >
                      <FaWhatsapp size={16} />
                    </button>
                    
                    <button
                      onClick={handleBuyNow}
                      disabled={isAdding}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-[#e8c97a] via-[#D4AF37] to-[#b8892f] text-[#0B0B0B] hover:scale-105 active:scale-95 shadow-[0_4px_15px_rgba(212,168,83,0.4)] transition-all shrink-0 cursor-pointer tracking-wide"
                    >
                      <ShoppingBag size={16} strokeWidth={2.2} />
                      {isAdding ? 'Adding...' : 'Buy Now'}
                    </button>
                  </div>
                </div>

                {/* SMART 7-SECOND PROGRESS BAR INDICATOR */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                  <motion.div
                    key={currentProduct._id}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 7, ease: 'linear' }}
                    className="h-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)]"
                  />
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* NAVIGATION DOTS & SLIDER CONTROLS */}
          <div className="flex items-center gap-4 mt-6 z-10">
            <button
              onClick={() => setCurrentIndex((prev) => (prev === 0 ? bestSellers.length - 1 : prev - 1))}
              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-gold)] hover:bg-[var(--color-gold-muted)] transition-colors cursor-pointer"
              aria-label="Previous product"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex gap-2">
              {bestSellers.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex ? 'w-6 bg-[var(--color-gold)]' : 'w-2 bg-[var(--color-border)]'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % bestSellers.length)}
              className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-gold)] hover:bg-[var(--color-gold-muted)] transition-colors cursor-pointer"
              aria-label="Next product"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>

      </div>
    </section>
  );
}

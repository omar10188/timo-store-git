'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCcw, Sparkles } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(src: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, categoriesRes, newRes, trendingRes] = await Promise.all([
          productsAPI.getAll({ isFeatured: 'true', limit: 4 }),
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 8, sort: 'newest' }),
          productsAPI.getTrending(),
        ]);
        setFeatured(featuredRes.data.products || []);
        setCategories(categoriesRes.data || []);
        setNewArrivals(newRes.data.products || []);
        setTrending(trendingRes.data || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="transition-colors duration-500">
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-[90vh] flex items-center overflow-hidden"
        style={{
          /* Navy = ambient atmosphere layer */
          background: 'radial-gradient(ellipse 90% 80% at 50% 110%, rgba(28,43,82,0.22) 0%, transparent 70%), var(--color-bg)',
        }}
      >
        {/* Single gold glow focal point — right side, soft */}
        <div
          aria-hidden="true"
          className="absolute top-[8%] right-[4%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(212,168,83,0.11) 0%, transparent 68%)',
            filter: 'blur(1px)',
          }}
        />
        {/* Navy ambient orb — bottom-left, barely visible */}
        <div
          aria-hidden="true"
          className="absolute bottom-[-5%] left-[-8%] w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(28,43,82,0.18) 0%, transparent 70%)',
          }}
        />

        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-[620px] animate-fade-in">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
              style={{
                background: 'var(--color-gold-muted)',
                border: '1px solid var(--color-border-gold)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--color-gold)' }} />
              <span
                className="text-xs font-bold tracking-[0.08em] uppercase"
                style={{ color: 'var(--color-gold)' }}
              >
                New Collection 2025
              </span>
            </div>

            <h1
              className="font-serif text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] mb-6 font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Discover Your
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(125deg, var(--color-gold-light) 0%, var(--color-gold) 60%, var(--color-gold-dark) 100%)' }}
              >
                Signature Scent
              </span>
            </h1>

            <p
              className="text-lg leading-relaxed mb-10 max-w-[500px]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Explore an exclusive collection of luxury fragrances crafted by master perfumers. From rare oud to fresh florals — find the scent that tells your story.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold"
                style={{
                  background: 'linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 50%, var(--color-gold-dark) 100%)',
                  color:     '#0a0b10',
                  boxShadow: 'var(--shadow-gold)',
                  transition: 'box-shadow 0.38s cubic-bezier(0.16,1,0.3,1), transform 0.38s cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold-lg)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link
                href="/products?featured=true"
                className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold"
                style={{
                  background:  'transparent',
                  border:      '1px solid var(--color-border-gold)',
                  color:       'var(--color-gold)',
                  transition: 'background 0.38s cubic-bezier(0.16,1,0.3,1), border-color 0.38s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,83,0.09)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(212,168,83,0.5)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-gold)';
                }}
              >

                Featured Picks
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 mt-12">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full ${i > 1 ? '-ml-2.5' : ''}`}
                    style={{
                      background: `hsl(${30 + i * 20}, 60%, 40%)`,
                      border: '2px solid var(--color-bg)',
                    }}
                  />
                ))}
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={12} style={{ fill: 'var(--color-gold)', color: 'var(--color-gold)' }} />
                  ))}
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>2,400+</strong> happy customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ──────────────────────────────────────────────── */}
      <section
        className="py-8"
        style={{
          background: 'var(--color-bg-secondary)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine luxury fragrances' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Star, title: 'Premium Quality', desc: 'Curated by experts' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4">
                <div
                  className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'var(--color-gold-muted)',
                    border: '1px solid var(--color-border-gold)',
                    color: 'var(--color-gold)',
                  }}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <p
                className="text-xs tracking-[0.15em] uppercase mb-3 font-semibold"
                style={{ color: 'var(--color-gold)' }}
              >
                Browse By
              </p>
              <h2
                className="font-serif text-[clamp(1.8rem,4vw,2.8rem)]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Shop Categories
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className="group flex flex-col items-center justify-center rounded-3xl p-6 text-center transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border-gold)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {cat.image ? (
                    <img
                      src={getImageUrl(cat.image)}
                      alt={cat.name}
                      className="w-16 h-16 rounded-full object-cover mb-4 transition-transform duration-500 group-hover:scale-110 shadow-sm"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background: 'var(--color-gold-muted)',
                        border: '1px solid var(--color-border-gold)',
                      }}
                    >
                      <span
                        className="font-bold text-xl"
                        style={{ color: 'var(--color-gold)' }}
                      >
                        {cat.name[0]}
                      </span>
                    </div>
                  )}
                  <p
                    className="font-semibold text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {cat.name}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-20" style={{ background: 'var(--color-bg-secondary)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2 font-semibold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Editor&apos;s Choice
                </p>
                <h2
                  className="font-serif text-[clamp(1.8rem,4vw,2.5rem)]"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products?featured=true"
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--color-gold)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
              >
                View All <ArrowRight size={15} />
              </Link>
            </div>
            {loading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
            <div>
              <p
                className="text-xs tracking-[0.15em] uppercase mb-2 font-semibold"
                style={{ color: 'var(--color-gold)' }}
              >
                Just In
              </p>
              <h2
                className="font-serif text-[clamp(1.8rem,4vw,2.5rem)]"
                style={{ color: 'var(--color-text-primary)' }}
              >
                New Arrivals
              </h2>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm transition-colors"
              style={{ color: 'var(--color-gold)' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
            >
              View All <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Trending Now ──────────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="py-20" style={{ background: 'var(--color-bg-secondary)' }}>
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-end justify-between mb-10 gap-4">
              <div>
                <p
                  className="text-xs tracking-[0.15em] uppercase mb-2 font-semibold"
                  style={{ color: 'var(--color-gold)' }}
                >
                  Most Loved
                </p>
                <h2
                  className="font-serif text-[clamp(1.8rem,4vw,2.5rem)] flex items-center gap-3"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Trending Now <Sparkles size={28} style={{ color: 'var(--color-gold)' }} />
                </h2>
              </div>
            </div>
            {loading ? <LoadingSpinner /> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {trending.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section
        className="py-20 text-center transition-colors duration-500"
        style={{
          background: 'linear-gradient(135deg, var(--color-gold-muted) 0%, transparent 50%, var(--color-gold-muted) 100%)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <p
            className="text-xs tracking-[0.15em] uppercase mb-4 font-semibold"
            style={{ color: 'var(--color-gold)' }}
          >
            Exclusive Offer
          </p>
          <h2
            className="font-serif text-[clamp(2rem,5vw,3.5rem)] mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Get 15% Off Your First Order
          </h2>
          <p className="mb-8 text-base" style={{ color: 'var(--color-text-secondary)' }}>
            Use code <strong style={{ color: 'var(--color-gold)' }}>WELCOME15</strong> at checkout
          </p>
          <Link
            href="/auth/register"
            className="inline-flex rounded-xl px-10 py-4 text-base font-bold transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
              color: 'var(--color-bg)',
              boxShadow: 'var(--shadow-gold)',
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold-lg)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold)')}
          >
            Join Now — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
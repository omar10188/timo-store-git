'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck, RefreshCcw, Sparkles, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard, { Product } from '@/components/ProductCard';
import MobileProductCard from '@/components/mobile/MobileProductCard';
import MobileHeader from '@/components/mobile/MobileHeader';
import MobileFilterSheet, { FilterState } from '@/components/mobile/MobileFilterSheet';
import LoadingSpinner from '@/components/LoadingSpinner';
import Hero from '@/components/Hero';

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
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Mobile Filter Sheet & Search State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState('');
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    gender: '',
    accords: [],
    season: [],
    minPrice: '',
    maxPrice: '',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, categoriesRes, newRes, trendingRes, allRes] = await Promise.all([
          productsAPI.getAll({ isFeatured: 'true', limit: 4 }),
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 8, sort: 'newest' }),
          productsAPI.getTrending(),
          productsAPI.getAll({ limit: 20 }),
        ]);
        setFeatured(featuredRes.data.products || []);
        setCategories(categoriesRes.data || []);
        setNewArrivals(newRes.data.products || []);
        setTrending(trendingRes.data || []);
        setAllProducts(allRes.data.products || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleApplyMobileFilters = (filters: FilterState) => {
    setAppliedFilters(filters);
    // Refresh products based on filters
    const params: Record<string, string> = { limit: '20' };
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (mobileSearch) params.search = mobileSearch;
    
    productsAPI.getAll(params).then((res) => {
      setAllProducts(res.data.products || []);
    }).catch(() => {});
  };

  // Filter products by search
  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(mobileSearch.toLowerCase())
  );

  return (
    <div className="transition-colors duration-500">
      
      {/* ── RESPONSIVE HERO SECTION (ALL SIZES) ──────────────────────── */}
      <Hero />

      {/* ── MOBILE HOME VIEW (< 768px) ── Screen #1 ──────────────────────── */}
      <div className="md:hidden">
        {/* Sticky Top Header */}
        <MobileHeader title="Scent Sphere" />

        <div className="px-4 pt-3 pb-4">
          {/* Row below header: Filter pill button (left) + Search input (right) */}
          <div className="flex items-center gap-3 mb-5">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-xs font-semibold shrink-0 transition-transform active:scale-95"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <span>Filter by</span>
              <ChevronDown size={14} className="text-[var(--color-gold)]" />
            </button>

            <div className="flex-1 flex items-center gap-2 rounded-full px-3.5 py-2.5 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
              <Search size={15} className="text-[var(--color-text-muted)] shrink-0" />
              <input
                type="text"
                placeholder="Search perfumes..."
                value={mobileSearch}
                onChange={(e) => setMobileSearch(e.target.value)}
                className="w-full bg-transparent text-xs font-medium outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]"
              />
            </div>
          </div>

          {/* Section Title */}
          <div className="mb-4">
            <h2 className="font-serif text-xl font-bold tracking-wide text-[var(--color-text-primary)]">
              Popular Perfumes
            </h2>
          </div>

          {/* 2-Column Product Grid */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-xs text-[var(--color-text-muted)]">
              No perfumes match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <MobileProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile Filter Sheet Drawer */}
        <MobileFilterSheet
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          onApply={handleApplyMobileFilters}
          initialFilters={appliedFilters}
        />
      </div>

      {/* ── DESKTOP HOME VIEW (>= 768px) ────────────────────────────────── */}
      <div className="hidden md:block">

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
                    <div className="text-4xl sm:text-5xl mb-4 transition-transform duration-500 group-hover:scale-110 drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 10px rgba(212,175,55,0.2))' }}>
                      {cat.name.split(' ')[0]}
                    </div>
                  )}
                  <p
                    className="font-bold text-[13px] tracking-wide"
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

      </div>
    </div>
  );
}
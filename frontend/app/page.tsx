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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [featuredRes, categoriesRes, newRes] = await Promise.all([
          productsAPI.getAll({ isFeatured: 'true', limit: 4 }),
          categoriesAPI.getAll(),
          productsAPI.getAll({ limit: 8, sort: 'newest' }),
        ]);
        setFeatured(featuredRes.data.products || []);
        setCategories(categoriesRes.data || []);
        setNewArrivals(newRes.data.products || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <>
      {/* ── Hero Section ─────────────────────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 70% 50%, rgba(212,168,83,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(212,168,83,0.05) 0%, transparent 50%)',
      }}>
        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container">
          <div style={{ maxWidth: '620px', animation: 'fadeIn 0.8s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-gold-muted)', border: '1px solid var(--color-border-gold)', borderRadius: 'var(--radius-full)', padding: '0.4rem 1rem', marginBottom: '1.5rem' }}>
              <Sparkles size={14} color="var(--color-gold)" />
              <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>New Collection 2025</span>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1.5rem', fontWeight: 700 }}>
              Discover Your
              <br />
              <span className="text-gold">Signature Scent</span>
            </h1>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '500px' }}>
              Explore an exclusive collection of luxury fragrances crafted by master perfumers. From rare oud to fresh florals — find the scent that tells your story.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/products" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Shop Collection <ArrowRight size={18} />
              </Link>
              <Link href="/products?featured=true" className="btn btn-secondary" style={{ fontSize: '1rem', padding: '0.875rem 2rem' }}>
                Featured Picks
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
              <div style={{ display: 'flex' }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', background: `hsl(${30 + i * 20}, 60%, 40%)`, border: '2px solid var(--color-bg)', marginLeft: i > 1 ? '-10px' : 0 }} />
                ))}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--color-gold)" color="var(--color-gold)" />)}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                  <strong style={{ color: 'var(--color-text-primary)' }}>2,400+</strong> happy customers
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ──────────────────────────────────────────────── */}
      <section style={{ padding: '2rem 0', background: 'var(--color-bg-secondary)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            {[
              { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine luxury fragrances' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
              { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Star, title: 'Premium Quality', desc: 'Curated by experts' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--color-gold-muted)', border: '1px solid var(--color-border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={20} color="var(--color-gold)" />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</p>
                  <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section style={{ padding: '5rem 0' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <p style={{ color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 600 }}>Browse By</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>Shop Categories</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
              {categories.map((cat) => (
                <Link key={cat._id} href={`/products?category=${cat._id}`} className="card" style={{ padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer', textDecoration: 'none' }}>
                  {cat.image && (
                    <img src={getImageUrl(cat.image)} alt={cat.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
                  )}
                  {!cat.image && (
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--color-gold-muted)', border: '1px solid var(--color-border-gold)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.2rem' }}>{cat.name[0]}</span>
                    </div>
                  )}
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section style={{ padding: '5rem 0', background: 'var(--color-bg-secondary)' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Editor's Choice</p>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>Featured Products</h2>
              </div>
              <Link href="/products?featured=true" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
                View All <ArrowRight size={15} />
              </Link>
            </div>
            {loading ? <LoadingSpinner /> : (
              <div className="products-grid">
                {featured.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 600 }}>Just In</p>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)' }}>New Arrivals</h2>
            </div>
            <Link href="/products" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              View All <ArrowRight size={15} />
            </Link>
          </div>
          {loading ? <LoadingSpinner /> : (
            <div className="products-grid">
              {newArrivals.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section style={{
        padding: '5rem 0',
        background: 'linear-gradient(135deg, rgba(212,168,83,0.1) 0%, transparent 50%, rgba(212,168,83,0.05) 100%)',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
      }}>
        <div className="container">
          <p style={{ color: 'var(--color-gold)', fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '1rem', fontWeight: 600 }}>Exclusive Offer</p>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginBottom: '1rem' }}>
            Get 15% Off Your First Order
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
            Use code <strong style={{ color: 'var(--color-gold)' }}>WELCOME15</strong> at checkout
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.875rem 2.5rem' }}>
            Join Now — It's Free
          </Link>
        </div>
      </section>
    </>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { wishlistAPI } from '@/lib/api';
import { useAuthStore, useWishlistStore } from '@/lib/store';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setWishlist } = useWishlistStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    wishlistAPI.get()
      .then((r) => {
        setProducts(r.data || []);
        setWishlist((r.data || []).map((p: Product) => p._id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) return <div style={{ paddingTop: '3rem' }}><LoadingSpinner /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Heart size={24} color="var(--color-gold)" fill="var(--color-gold)" />
        My Wishlist
        {products.length > 0 && <span className="badge badge-gold">{products.length}</span>}
      </h1>

      {products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Heart size={64} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1rem', display: 'block' }} />
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>Your wishlist is empty.</p>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="products-grid fade-in">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
}

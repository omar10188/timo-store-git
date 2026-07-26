'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { productsAPI, categoriesAPI } from '@/lib/api';
import ProductCard, { Product } from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Category { _id: string; name: string; }

import { Suspense } from 'react';

// Rename the existing component
function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  useEffect(() => {
    categoriesAPI.getAll().then((r) => setCategories(r.data || [])).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sortBy === 'price_asc') params.sort = 'price';
      else if (sortBy === 'price_desc') params.sort = '-price';
      else if (sortBy === 'rating') params.sort = '-rating';
      else params.sort = '-createdAt';

      const { data } = await productsAPI.getAll(params);
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, category, minPrice, maxPrice, sortBy, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const clearFilters = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setSortBy('newest'); setPage(1);
  };

  const hasFilters = search || category || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.5rem' }}>
          Shop All Fragrances
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          {total > 0 ? `${total} products found` : 'Discover our premium collection'}
        </p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search fragrances..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {/* Sort */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <select
            className="input"
            style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', minWidth: '160px' }}
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          >
            <option value="newest">Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
          <ChevronDown size={14} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--color-text-muted)' }} />
        </div>

        {/* Filter toggle */}
        <button
          className={`btn ${filtersOpen ? 'btn-primary' : 'btn-secondary'}`}
          style={{ flexShrink: 0 }}
          onClick={() => setFiltersOpen(!filtersOpen)}
        >
          <SlidersHorizontal size={16} /> Filters
          {hasFilters && <span className="badge badge-gold" style={{ marginLeft: '0.25rem', padding: '0 0.4rem' }}>!</span>}
        </button>

        {hasFilters && (
          <button className="btn btn-ghost" style={{ fontSize: '0.8rem', color: 'var(--color-error)' }} onClick={clearFilters}>
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {/* Category */}
          <div style={{ minWidth: '160px' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Category</label>
            <select className="input" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Price Range</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input className="input" style={{ width: '90px' }} placeholder="Min $" value={minPrice} onChange={(e) => { setMinPrice(e.target.value); setPage(1); }} type="number" min="0" />
              <span style={{ color: 'var(--color-text-muted)' }}>–</span>
              <input className="input" style={{ width: '90px' }} placeholder="Max $" value={maxPrice} onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }} type="number" min="0" />
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <LoadingSpinner text="Loading products..." />
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>No products found</p>
          <button className="btn btn-secondary" onClick={clearFilters}>Clear filters</button>
        </div>
      ) : (
        <div className="products-grid fade-in">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '3rem' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: '40px', height: '40px', borderRadius: 'var(--radius-md)',
                border: '1px solid',
                borderColor: p === page ? 'var(--color-gold)' : 'var(--color-border)',
                background: p === page ? 'var(--color-gold-muted)' : 'transparent',
                color: p === page ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                cursor: 'pointer', fontWeight: p === page ? 700 : 400, fontSize: '0.875rem',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading products..." />}>
      <ProductsContent />
    </Suspense>
  );
}

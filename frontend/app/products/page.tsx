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

      {/* Category Pills Bar (Horizontal Scrollable) */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <button
          onClick={() => { setCategory(''); setPage(1); }}
          className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all duration-200"
          style={{
            background: category === '' ? 'var(--color-accent, #ffffff)' : 'var(--color-bg-elevated)',
            color: category === '' ? '#0f0f0f' : 'var(--color-text-secondary)',
            border: `1px solid ${category === '' ? '#ffffff' : 'var(--color-border)'}`,
            boxShadow: category === '' ? '0 4px 12px rgba(255,255,255,0.15)' : 'none',
          }}
        >
          All Categories
        </button>
        {categories.map((c) => {
          const isSelected = category === c._id;
          return (
            <button
              key={c._id}
              onClick={() => { setCategory(isSelected ? '' : c._id); setPage(1); }}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shrink-0 transition-all duration-200"
              style={{
                background: isSelected ? 'var(--color-accent, #ffffff)' : 'var(--color-bg-elevated)',
                color: isSelected ? '#0f0f0f' : 'var(--color-text-secondary)',
                border: `1px solid ${isSelected ? '#ffffff' : 'var(--color-border)'}`,
                boxShadow: isSelected ? '0 4px 12px rgba(255,255,255,0.15)' : 'none',
              }}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      {/* Toolbar — Mobile responsive flex wrap */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
          <input
            className="input w-full"
            style={{ paddingLeft: '2.5rem', height: 44 }}
            placeholder="Search fragrances..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              className="input w-full sm:w-auto"
              style={{ paddingRight: '2rem', cursor: 'pointer', appearance: 'none', minWidth: '150px', height: 44 }}
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--color-text-muted)' }} />
          </div>

          {/* Filter toggle */}
          <button
            className={`btn ${filtersOpen ? 'btn-primary' : 'btn-secondary'} shrink-0`}
            style={{ height: 44, padding: '0 1.25rem' }}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <SlidersHorizontal size={16} /> Filters
            {hasFilters && <span className="badge badge-gold ml-1 px-1.5 font-bold">!</span>}
          </button>

          {hasFilters && (
            <button
              className="btn btn-ghost shrink-0"
              style={{ fontSize: '0.8rem', color: 'var(--color-error)', height: 44 }}
              onClick={clearFilters}
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Filters Panel — Mobile responsive vertical stack */}
      {filtersOpen && (
        <div className="card p-4 sm:p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:gap-6 flex-wrap">
          {/* Price Range */}
          <div>
            <label className="block text-[11px] font-bold text-[var(--color-gold)] uppercase tracking-wider mb-2">
              Price Range (EGP)
            </label>
            <div className="flex items-center gap-2">
              <input
                className="input w-28"
                style={{ height: 40 }}
                placeholder="Min EGP"
                value={minPrice}
                onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                type="number"
                min="0"
              />
              <span style={{ color: 'var(--color-text-muted)' }}>–</span>
              <input
                className="input w-28"
                style={{ height: 40 }}
                placeholder="Max EGP"
                value={maxPrice}
                onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                type="number"
                min="0"
              />
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

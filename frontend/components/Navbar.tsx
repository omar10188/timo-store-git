'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, User, Search, Menu, X, Package } from 'lucide-react';
import { useAuthStore, useCartStore, useCartCount } from '@/lib/store';
import { authAPI } from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleCart } = useCartStore();
  const cartCount = useCartCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Shop' },
    ...(user?.role === 'admin' ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 'var(--z-sticky)' as never,
        background: scrolled ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
        transition: 'all var(--transition-slow)',
      }}
    >
      <nav className="container" style={{ display: 'flex', alignItems: 'center', height: '72px', gap: '1rem' }}>
        {/* Logo */}
        <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, flexShrink: 0 }}>
          <span className="text-gold">TIMO</span>
          <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginLeft: '4px' }}>STORE</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', gap: '2rem', marginLeft: '2rem', flex: 1 }} className="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.05em',
                color: pathname === link.href ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                transition: 'color var(--transition-fast)',
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = pathname === link.href ? 'var(--color-gold)' : 'var(--color-text-secondary)')}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                className="input"
                style={{ width: '200px', padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <button type="button" className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setSearchOpen(false)}>
                <X size={18} />
              </button>
            </form>
          ) : (
            <button className="btn btn-ghost" style={{ padding: '0.5rem' }} onClick={() => setSearchOpen(true)} aria-label="Search">
              <Search size={20} />
            </button>
          )}

          {/* Wishlist */}
          {isAuthenticated && (
            <Link href="/wishlist" className="btn btn-ghost" style={{ padding: '0.5rem' }} aria-label="Wishlist">
              <Heart size={20} />
            </Link>
          )}

          {/* Cart */}
          <button
            className="btn btn-ghost"
            style={{ padding: '0.5rem', position: 'relative' }}
            onClick={toggleCart}
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute', top: '2px', right: '2px',
                background: 'var(--color-gold)', color: '#0a0a0a',
                borderRadius: '50%', width: '16px', height: '16px',
                fontSize: '0.65rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ position: 'relative', display: 'flex', gap: '0.25rem' }}>
              <Link href="/orders" className="btn btn-ghost" style={{ padding: '0.5rem' }} title="My Orders">
                <Package size={20} />
              </Link>
              <button className="btn btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="btn btn-ghost mobile-menu-btn"
            style={{ padding: '0.5rem' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{ display: 'block', padding: '0.75rem 0', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </header>
  );
}

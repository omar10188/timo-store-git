'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, Heart, Search, Menu, X, Package, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore, useCartStore, useCartCount } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleCart } = useCartStore();
  const cartCount = useCartCount();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'dark:bg-[#0a0a0a]/90 light:bg-white/90 bg-[var(--color-bg)]/90 backdrop-blur-md border-b border-[var(--color-border)]'
          : 'bg-transparent border-b border-transparent'
      }`}
      style={scrolled ? {
        background: 'color-mix(in srgb, var(--color-bg) 92%, transparent)',
        borderBottomColor: 'var(--color-border)',
      } : {}}
    >
      <nav className="container mx-auto px-4 sm:px-6 flex items-center h-20 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center font-serif text-2xl font-bold tracking-wider shrink-0">
          <span style={{ color: 'var(--color-gold)' }}>TIMO</span>
          <span className="ml-1 text-sm font-sans tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>STORE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center gap-8 ml-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[13px] font-medium tracking-widest uppercase transition-colors duration-300"
              style={{
                color: pathname === link.href ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (pathname !== link.href) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                if (pathname !== link.href) (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Search */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                className="w-48 sm:w-64 rounded-xl px-4 py-2 text-sm focus:outline-none transition-all"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                onClick={() => setSearchOpen(false)}
              >
                <X size={18} />
              </button>
            </form>
          ) : (
            <button
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
            >
              <Search size={20} />
            </button>
          )}

          {/* Theme Toggle — premium animated switch */}
          <button
            id="theme-toggle"
            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 relative overflow-hidden"
            style={{
              color: 'var(--color-text-secondary)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg-elevated)',
            }}
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            aria-pressed={mounted ? theme === 'dark' : false}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
              (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
            }}
          >
            {mounted ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  style={{ display: 'flex' }}
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            ) : (
              <span style={{ width: 18, height: 18, display: 'inline-block' }} />
            )}
          </button>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link
              href="/wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
              style={{ color: 'var(--color-text-secondary)' }}
              aria-label="Wishlist"
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
            >
              <Heart size={20} />
            </Link>
          )}

          {/* Cart with animated badge and bounce feedback */}
          <motion.button
            key={cartCount}
            initial={cartCount > 0 ? { scale: 1.25 } : false}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            id="cart-toggle"
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors relative"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={toggleCart}
            aria-label="Cart"
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-gold)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full text-[9px] font-bold shadow-md border border-[var(--color-bg)]"
                style={{ background: 'var(--color-gold)', color: 'var(--color-bg)', minWidth: '18px', height: '18px' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </motion.button>

          {/* Auth */}
          {isAuthenticated ? (
            <div
              className="hidden sm:flex items-center gap-2 ml-2 pl-2"
              style={{ borderLeft: '1px solid var(--color-border)' }}
            >
              <Link
                href="/orders"
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors"
                style={{ color: 'var(--color-text-secondary)' }}
                title="My Orders"
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
              >
                <Package size={20} />
              </Link>
              <button
                className="rounded-xl px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={handleLogout}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex ml-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                color: 'var(--color-bg)',
              }}
            >
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl transition-colors ml-1"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-96' : 'max-h-0'}`}
        style={mobileOpen ? {
          borderTop: '1px solid var(--color-border)',
          background: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
          backdropFilter: 'blur(12px)',
        } : {}}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-colors"
              style={{
                background: pathname === link.href ? 'var(--color-gold-muted)' : 'transparent',
                color: pathname === link.href ? 'var(--color-gold)' : 'var(--color-text-secondary)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile theme toggle */}
          <button
            onClick={() => { toggleTheme(); setMobileOpen(false); }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium tracking-wide transition-colors text-left"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {mounted ? (
              <>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.25 }}
                    style={{ display: 'flex' }}
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </motion.span>
                </AnimatePresence>
                {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </>
            ) : (
              <span>Toggle Theme</span>
            )}
          </button>

          {!isAuthenticated ? (
            <Link
              href="/auth/login"
              className="mt-2 block w-full rounded-xl px-4 py-3 text-center text-sm font-bold tracking-wide shadow-sm"
              style={{
                background: 'linear-gradient(135deg, var(--color-gold), var(--color-gold-dark))',
                color: 'var(--color-bg)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
          ) : (
            <div className="mt-2 flex gap-2">
              <Link
                href="/orders"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={() => setMobileOpen(false)}
              >
                <Package size={16} /> Orders
              </Link>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors"
                style={{
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)',
                }}
                onClick={() => { handleLogout(); setMobileOpen(false); }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

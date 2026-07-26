'use client';

import Link from 'next/link';
import { Instagram, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-secondary)',
      borderTop: '1px solid var(--color-border)',
      marginTop: '4rem',
      padding: '3rem 0 2rem',
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <span className="text-gold">TIMO</span>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}> STORE</span>
            </div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.7 }}>
              Premium fragrances curated for the discerning connoisseur. Experience luxury in every drop.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Shop</h4>
            {['All Products', 'New Arrivals', 'Best Sellers', 'Gift Sets'].map((item) => (
              <Link key={item} href="/products" style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}>
                {item}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Account</h4>
            {[
              { label: 'My Orders', href: '/orders' },
              { label: 'Wishlist', href: '/wishlist' },
              { label: 'Sign In', href: '/auth/login' },
              { label: 'Register', href: '/auth/register' },
            ].map((item) => (
              <Link key={item.href} href={item.href} style={{ display: 'block', color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '0.5rem', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}>
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gold)', marginBottom: '1rem', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Connect</h4>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              {[Instagram, Twitter, Mail].map((Icon, i) => (
                <button key={i} className="btn btn-ghost" style={{ padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>support@timostore.com</p>
          </div>
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Timo Store. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <Link key={item} href="#" style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', transition: 'color var(--transition-fast)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted)')}>
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

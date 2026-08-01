'use client';

import Link from 'next/link';
import { Globe, MessageCircle, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="mt-16 pt-16 pb-8 transition-colors duration-500"
      style={{
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="font-serif text-3xl font-bold mb-4 flex items-center">
              <span style={{ color: 'var(--color-gold)' }}>TIMO</span>
              <span
                className="text-sm ml-2 font-sans tracking-widest uppercase"
                style={{ color: 'var(--color-text-muted)' }}
              >
                STORE
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Premium fragrances curated for the discerning connoisseur. Experience luxury in every drop.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.15em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Shop
            </h4>
            <div className="flex flex-col gap-3">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Gift Sets'].map((item) => (
                <Link
                  key={item}
                  href="/products"
                  className="text-sm transition-colors duration-300 w-fit"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.15em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Account
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'My Orders', href: '/orders' },
                { label: 'Wishlist', href: '/wishlist' },
                { label: 'Sign In', href: '/auth/login' },
                { label: 'Register', href: '/auth/register' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm transition-colors duration-300 w-fit"
                  style={{ color: 'var(--color-text-secondary)' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)')}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-xs uppercase tracking-[0.15em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Connect
            </h4>
            <div className="flex gap-4 mb-6">
              {[Globe, MessageCircle, Mail].map((Icon, i) => (
                <button
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300"
                  style={{
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-gold)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)';
                  }}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              support@timostore.com
            </p>
          </div>
        </div>

        <div className="h-px w-full mb-8" style={{ background: 'var(--color-border)' }} />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            © {new Date().getFullYear()} Timo Store. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs sm:text-sm transition-colors duration-300"
                style={{ color: 'var(--color-text-muted)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)')}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

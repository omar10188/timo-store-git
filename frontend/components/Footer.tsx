'use client';

import Link from 'next/link';
import { Globe, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';

// ─── Luxury Navy Footer ────────────────────────────────────────────────────────
// Background: deep navy gradient (structural color — not competing with gold)
// Gold used only for headings, hover states, and logo
// Transitions: premium pace (0.38s easeOut)

const LINK_HOVER_GOLD = 'var(--color-gold)';
const LINK_IDLE = 'rgba(200, 196, 188, 0.65)';

export default function Footer() {
  return (
    <footer
      className="mt-16 relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1c2b52 0%, #16213f 100%)',
        borderTop: '1px solid rgba(212, 168, 83, 0.14)',
        boxShadow: 'inset 0 1px 0 rgba(212, 168, 83, 0.08)',
      }}
    >
      {/* ── Subtle noise texture overlay ── */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          opacity: 0.028,
          mixBlendMode: 'overlay',
        }}
      />

      {/* ── Top gold rule — depth line ── */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(212,168,83,0.35) 30%, rgba(212,168,83,0.55) 50%, rgba(212,168,83,0.35) 70%, transparent 100%)',
        }}
      />

      <div className="relative container mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="font-serif text-3xl font-bold mb-5 flex items-center gap-2">
              <span style={{ color: 'var(--color-gold)' }}>TIMO</span>
              <span
                className="text-xs font-sans tracking-[0.22em] uppercase pt-1"
                style={{ color: 'rgba(200,196,188,0.45)' }}
              >
                STORE
              </span>
            </div>
            <p
              className="text-sm leading-relaxed max-w-[220px]"
              style={{ color: LINK_IDLE }}
            >
              Premium fragrances curated for the discerning connoisseur. Experience luxury in every drop.
            </p>

            {/* Gold divider line */}
            <div
              className="mt-6 mb-0 h-px w-10"
              style={{ background: 'rgba(212,168,83,0.45)' }}
            />
          </div>

          {/* Shop column */}
          <div>
            <h4
              className="text-[10px] uppercase tracking-[0.20em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Shop
            </h4>
            <div className="flex flex-col gap-3">
              {['All Products', 'New Arrivals', 'Best Sellers', 'Gift Sets'].map((item) => (
                <FooterLink key={item} href="/products" label={item} />
              ))}
            </div>
          </div>

          {/* Account column */}
          <div>
            <h4
              className="text-[10px] uppercase tracking-[0.20em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Account
            </h4>
            <div className="flex flex-col gap-3">
              {[
                { label: 'My Orders',  href: '/orders' },
                { label: 'Wishlist',   href: '/wishlist' },
                { label: 'Sign In',    href: '/auth/login' },
                { label: 'Register',   href: '/auth/register' },
              ].map((item) => (
                <FooterLink key={item.href} href={item.href} label={item.label} />
              ))}
            </div>
          </div>

          {/* Connect column */}
          <div>
            <h4
              className="text-[10px] uppercase tracking-[0.20em] mb-6 font-semibold"
              style={{ color: 'var(--color-gold)' }}
            >
              Connect
            </h4>

            {/* Social icon buttons */}
            <div className="flex gap-3 mb-7">
              {[
                { Icon: Globe,         label: 'Website'  },
                { Icon: MessageCircle, label: 'WhatsApp' },
                { Icon: Mail,          label: 'Email'    },
              ].map(({ Icon, label }) => (
                <button
                  key={label}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-[380ms]"
                  style={{
                    border:     '1px solid rgba(212,168,83,0.20)',
                    background: 'rgba(28,43,82,0.50)',
                    color:      LINK_IDLE,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(212,168,83,0.55)';
                    el.style.color       = 'var(--color-gold)';
                    el.style.background  = 'rgba(212,168,83,0.10)';
                    el.style.transform   = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'rgba(212,168,83,0.20)';
                    el.style.color       = LINK_IDLE;
                    el.style.background  = 'rgba(28,43,82,0.50)';
                    el.style.transform   = 'translateY(0)';
                  }}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>

            <p className="text-xs" style={{ color: 'rgba(200,196,188,0.50)' }}>
              support@timostore.com
            </p>
          </div>
        </div>

        {/* ── Divider ── */}
        <div
          className="h-px w-full mb-7"
          style={{ background: 'rgba(212,168,83,0.12)' }}
        />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
          <p className="text-xs" style={{ color: 'rgba(200,196,188,0.38)' }}>
            © {new Date().getFullYear()} Timo Store. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((item) => (
              <Link
                key={item}
                href="#"
                className="text-xs transition-colors duration-[380ms]"
                style={{ color: 'rgba(200,196,188,0.38)' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = LINK_HOVER_GOLD)}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(200,196,188,0.38)')}
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

// ─── Reusable footer link atom ─────────────────────────────────────────────────
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-1.5 text-sm w-fit transition-colors duration-[380ms]"
      style={{ color: LINK_IDLE }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.color = LINK_IDLE;
      }}
    >
      <span>{label}</span>
      <ArrowUpRight
        size={11}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-[380ms] -translate-y-0.5"
      />
    </Link>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Tag, Ticket, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';

const adminLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/categories', label: 'Categories', icon: Tag },
  { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    logout();
  };

  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      background: 'var(--color-bg-secondary)',
      borderRight: '1px solid var(--color-border)',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700 }}>
          <span className="text-gold">TIMO</span>
        </Link>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Panel</p>
      </div>

      {/* User info */}
      <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--color-gold-muted)', border: '1px solid var(--color-border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
          <span style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.875rem' }}>
            {user?.name?.[0]?.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.1rem' }}>{user?.name}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{user?.email}</p>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '0.75rem', flex: 1 }}>
        {adminLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '0.15rem',
                background: isActive ? 'var(--color-gold-muted)' : 'transparent',
                color: isActive ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                transition: 'all var(--transition-fast)',
                fontSize: '0.875rem', fontWeight: isActive ? 600 : 400,
                border: isActive ? '1px solid var(--color-border-gold)' : '1px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'var(--color-text-primary)'; }}}
              onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}}
            >
              <Icon size={17} />
              {label}
              {isActive && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={handleLogout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.65rem 0.75rem', borderRadius: 'var(--radius-md)', background: 'transparent', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '0.875rem', transition: 'background var(--transition-fast)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(224,92,92,0.1)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  );
}

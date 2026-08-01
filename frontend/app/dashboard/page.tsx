'use client';

import { useAuthStore } from '@/lib/store';
import Link from 'next/link';
import { User, Package, Heart, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          My Account
        </h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Welcome back, {user?.name || 'Customer'}!
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {/* Profile Card */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gold)' }}>
              <User size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{user?.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{user?.email}</p>
            </div>
          </div>
          <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: user?.role === 'admin' ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255,255,255,0.05)', color: user?.role === 'admin' ? 'var(--color-gold)' : 'var(--color-text-secondary)' }}>
            Role: {user?.role || 'user'}
          </span>
        </div>

        {/* Quick Links */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link href="/orders" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <Package size={18} /> My Orders
            </Link>
            <Link href="/wishlist" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
              <Heart size={18} /> My Wishlist
            </Link>
            {user?.role === 'admin' && (
              <Link href="/admin" className="btn btn-primary" style={{ justifyContent: 'flex-start', gap: '0.75rem' }}>
                Admin Portal
              </Link>
            )}
            <button onClick={logout} className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: '0.75rem', color: '#ff4d4f' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

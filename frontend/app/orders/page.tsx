'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronRight } from 'lucide-react';
import { ordersAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Order {
  _id: string;
  items: { name: string; price: number; quantity: number; image: string }[];
  totalPrice: number;
  status: string;
  paymentStatus: string;
  isPaid: boolean;
  createdAt: string;
}

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'var(--color-warning)', bg: 'rgba(240,160,75,0.12)' },
  processing: { icon: Package, color: 'var(--color-info)', bg: 'rgba(75,156,240,0.12)' },
  shipped: { icon: Truck, color: 'var(--color-gold)', bg: 'var(--color-gold-muted)' },
  delivered: { icon: CheckCircle, color: 'var(--color-success)', bg: 'rgba(76,175,125,0.12)' },
  cancelled: { icon: XCircle, color: 'var(--color-error)', bg: 'rgba(224,92,92,0.12)' },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    ordersAPI.getMyOrders()
      .then((res) => setOrders(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) return <div style={{ paddingTop: '3rem' }}><LoadingSpinner text="Loading orders..." /></div>;

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)', minHeight: '70vh' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Package size={24} color="var(--color-gold)" />
        My Orders
        {orders.length > 0 && <span className="badge badge-gold">{orders.length}</span>}
      </h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <Package size={72} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem', display: 'block' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            You haven't placed any orders yet.
          </p>
          <Link href="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            return (
              <div key={order._id} className="card" style={{ padding: '1.5rem', transition: 'all var(--transition-base)' }}>
                {/* Header */}
                <div className="flex-between" style={{ marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Order ID</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: config.bg, color: config.color }}>
                        <StatusIcon size={12} />
                        {order.status}
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', background: order.isPaid ? 'rgba(76,175,125,0.12)' : 'rgba(224,92,92,0.12)', color: order.isPaid ? 'var(--color-success)' : 'var(--color-error)' }}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', position: 'relative' }}>
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.src = `https://placehold.co/52x52/161616/d4a853?text=${item.name?.[0] || '?'}`; }}
                      />
                      {item.quantity > 1 && (
                        <span style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--color-gold)', color: '#0a0a0a', fontSize: '0.55rem', fontWeight: 800, padding: '0 0.25rem', borderRadius: '4px 0 0 0' }}>
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex-center" style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)' }}>
                    ${order.totalPrice.toFixed(2)}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

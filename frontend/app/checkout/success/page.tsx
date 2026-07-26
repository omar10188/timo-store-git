'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ShoppingBag } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <>
      <div style={{
        width: '100px', height: '100px',
        background: 'rgba(76,175,125,0.12)', border: '2px solid var(--color-success)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 2rem',
        animation: 'fadeIn 0.6s ease',
      }}>
        <CheckCircle size={50} color="var(--color-success)" />
      </div>

      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', marginBottom: '0.75rem' }}>
        Payment Successful!
      </h1>

      <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: '400px' }}>
        Thank you for your purchase. Your order has been confirmed and will be processed shortly.
      </p>

      {sessionId && (
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '2rem', fontFamily: 'monospace', padding: '0.5rem 1rem', background: 'var(--color-bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          Session: {sessionId.slice(0, 20)}...
        </p>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/orders" className="btn btn-primary" style={{ padding: '0.875rem 1.75rem' }}>
          <Package size={18} /> Track My Orders
        </Link>
        <Link href="/products" className="btn btn-secondary" style={{ padding: '0.875rem 1.75rem' }}>
          <ShoppingBag size={18} /> Continue Shopping
        </Link>
      </div>
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="container" style={{ padding: '5rem var(--container-padding)', textAlign: 'center', maxWidth: '540px', margin: '0 auto', minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Suspense fallback={<LoadingSpinner />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}

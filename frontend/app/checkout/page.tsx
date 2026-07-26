'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ordersAPI, couponsAPI, cartAPI } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { CheckCircle, Tag, X } from 'lucide-react';

type Step = 'address' | 'payment' | 'confirm';

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();

  const [step, setStep] = useState<Step>('address');
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'stripe'>('cash_on_delivery');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number; finalTotal: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (items.length === 0 && !orderId) { router.push('/cart'); }
  }, [isAuthenticated, items.length]);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate(couponCode, totalPrice);
      setCouponApplied({ code: data.code, discountAmount: data.discountAmount, finalTotal: data.finalTotal });
      toast.success(`Coupon applied! You save $${data.discountAmount.toFixed(2)}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    try {
      const { data } = await ordersAPI.create({
        shippingAddress: { street, city, country, postalCode },
        paymentMethod,
        couponCode: couponApplied?.code,
      });
      setOrderId(data._id);
      clearCart();
      // Also clear server-side cart
      await cartAPI.clear().catch(() => {});
      setStep('confirm');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const finalTotal = couponApplied?.finalTotal ?? totalPrice;
  const steps: Step[] = ['address', 'payment', 'confirm'];

  if (orderId && step === 'confirm') {
    return (
      <div className="container" style={{ padding: '4rem var(--container-padding)', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(76,175,125,0.15)', border: '2px solid var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="var(--color-success)" />
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.75rem' }}>Order Placed!</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
          Thank you for your purchase. Your order <strong style={{ color: 'var(--color-gold)' }}>#{orderId.slice(-8).toUpperCase()}</strong> has been confirmed.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/orders" className="btn btn-primary">Track Order</Link>
          <Link href="/products" className="btn btn-secondary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '2rem' }}>Checkout</h1>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2.5rem' }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: step === s ? 'var(--color-gold)' : (steps.indexOf(step) > i ? 'var(--color-success)' : 'var(--color-bg-elevated)'),
              border: `2px solid ${step === s ? 'var(--color-gold)' : (steps.indexOf(step) > i ? 'var(--color-success)' : 'var(--color-border)')}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: step === s ? '#0a0a0a' : 'var(--color-text-muted)',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0,
              transition: 'all var(--transition-base)',
            }}>{i + 1}</div>
            <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', fontWeight: 600, color: step === s ? 'var(--color-text-primary)' : 'var(--color-text-muted)', textTransform: 'capitalize' }}>{s}</span>
            {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', background: 'var(--color-border)', margin: '0 1rem' }} />}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Left: Form */}
        <div>
          {/* Step 1: Address */}
          {step === 'address' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Shipping Address</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>Street Address *</label>
                  <input className="input" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Main Street" required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>City *</label>
                    <input className="input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dubai" required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>Postal Code</label>
                    <input className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="12345" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>Country *</label>
                  <input className="input" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="UAE" required />
                </div>
                <button
                  className="btn btn-primary"
                  disabled={!street || !city || !country}
                  onClick={() => setStep('payment')}
                  style={{ marginTop: '0.5rem', justifyContent: 'center' }}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 'payment' && (
            <div className="card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {(['cash_on_delivery', 'stripe'] as const).map((method) => (
                  <label key={method} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: `1px solid ${paymentMethod === method ? 'var(--color-gold)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === method ? 'var(--color-gold-muted)' : 'transparent', transition: 'all var(--transition-fast)' }}>
                    <input type="radio" value={method} checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} style={{ accentColor: 'var(--color-gold)' }} />
                    <div>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{method === 'cash_on_delivery' ? '💵 Cash on Delivery' : '💳 Credit Card (Stripe)'}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{method === 'cash_on_delivery' ? 'Pay when you receive your order' : 'Secure payment via Stripe'}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>Coupon Code</label>
                {couponApplied ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(76,175,125,0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                    <Tag size={16} color="var(--color-success)" />
                    <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-success)' }}>{couponApplied.code} — Save ${couponApplied.discountAmount.toFixed(2)}</span>
                    <button onClick={() => setCouponApplied(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><X size={16} /></button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input className="input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="WELCOME15" />
                    <button className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Apply'}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost" onClick={() => setStep('address')}>Back</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={handlePlaceOrder} disabled={submitting}>
                  {submitting ? <div className="spinner" style={{ width: '16px', height: '16px' }} /> : null}
                  Place Order — ${finalTotal.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
              {items.map((item) => (
                <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-gold)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>×{item.quantity}</span>
                    <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              <span>Subtotal</span><span>${totalPrice.toFixed(2)}</span>
            </div>
            {couponApplied && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                <span>Discount</span><span>-${couponApplied.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)', marginTop: '0.5rem' }}>
              <span>Total</span><span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

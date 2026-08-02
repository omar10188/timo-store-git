'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ordersAPI, couponsAPI } from '@/lib/api';
import { useAuthStore, useCartStore } from '@/lib/store';
import toast from 'react-hot-toast';
import LuxuryWhatsAppButton from '@/components/ui/LuxuryWhatsAppButton';
import { CheckCircle, Tag, X, MessageSquare, ShoppingBag, ArrowRight } from 'lucide-react';
import { trackInitiateCheckout, trackPurchase } from '@/lib/analytics';

export default function CheckoutPage() {
  const { user } = useAuthStore();
  const { items, totalPrice, clearCart } = useCartStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    whatsappUrl: string;
    whatsappMessage: string;
    totalPrice: number;
    itemsCount: number;
  } | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number; finalTotal: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Auto-fill customer info from localStorage or user session
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timo-customer-info');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !name) setName(parsed.name);
        if (parsed.phone && !phone) setPhone(parsed.phone);
        if (parsed.address && !address) setAddress(parsed.address);
      }
    } catch {}
    if (user?.name && !name) setName(user.name);
    if (user?.phone && !phone) setPhone(user.phone);
  }, [user]);

  // Track InitiateCheckout on page mount
  useEffect(() => {
    if (items.length > 0) {
      trackInitiateCheckout(
        items.map((i) => ({ id: i.product, name: i.name, price: i.price, quantity: i.quantity })),
        totalPrice
      );
    }
  }, []);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponsAPI.validate(couponCode, totalPrice);
      setCouponApplied({ code: data.code, discountAmount: data.discountAmount, finalTotal: data.finalTotal });
      toast.success(`Coupon applied! Saved EGP ${data.discountAmount.toFixed(2)} 🎉`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your name'); return; }
    if (!phone.trim()) { toast.error('Please enter your phone number'); return; }
    if (!address.trim()) { toast.error('Please enter your delivery address'); return; }
    if (items.length === 0) { toast.error('Your cart is empty'); return; }

    setSubmitting(true);
    try {
      // 1. Send Order Invoice to Backend
      const { data } = await ordersAPI.create({
        customer: { name, phone, address },
        items: items.map((i) => ({
          product: i.product,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          image: i.image,
        })),
        shippingAddress: { street: address, city: 'Local', country: 'Egypt' },
        paymentMethod: 'whatsapp',
        couponCode: couponApplied?.code,
        notes: notes,
      });

      const responsePayload = data.data || data;
      const order = responsePayload.order || responsePayload;
      const whatsappUrl = responsePayload.whatsappUrl;
      const whatsappMessage = responsePayload.whatsappMessage;

      // Save customer info to localStorage for auto-fill on next visit
      try {
        localStorage.setItem('timo-customer-info', JSON.stringify({ name, phone, address }));
      } catch {}

      // Track purchase event
      trackPurchase(order._id, order.totalPrice || totalPrice);

      // 2. Clear Cart
      clearCart();

      // 3. Store Order Result for Confirmation
      setOrderResult({
        orderId: order._id,
        whatsappUrl,
        whatsappMessage,
        totalPrice: order.totalPrice || totalPrice,
        itemsCount: items.length,
      });

      toast.success('Order placed successfully! Redirecting to WhatsApp...');

      // 4. Auto-Open WhatsApp in new tab / window
      if (whatsappUrl) {
        try {
          window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } catch {
          // Fallback to location redirect if popup blocked
          window.location.href = whatsappUrl;
        }
      }
    } catch (err: any) {
      console.error('Order placement error:', err);
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const finalTotal = couponApplied?.finalTotal ?? totalPrice;

  // Confirmation View
  if (orderResult) {
    return (
      <div className="container" style={{ padding: '4rem var(--container-padding)', textAlign: 'center', maxWidth: '540px', margin: '0 auto' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(76,175,125,0.15)', border: '2px solid var(--color-success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={40} color="var(--color-success)" />
        </div>

        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.75rem' }}>Order Submitted!</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Your order <strong style={{ color: 'var(--color-gold)' }}>#{orderResult.orderId.slice(-6).toUpperCase()}</strong> has been saved in our system.
        </p>

        {/* WhatsApp Invoice Box */}
        <div className="card" style={{ padding: '1.5rem', textAlign: 'left', marginBottom: '2rem', background: 'rgba(37, 211, 102, 0.05)', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#25D366', fontWeight: 700 }}>
            <MessageSquare size={20} />
            <span>Complete Order via WhatsApp</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
            Click the button below to send your order invoice directly to our sales agent on WhatsApp to confirm delivery!
          </p>

          <div className="mt-2">
            <LuxuryWhatsAppButton 
              text="Confirm Order on WhatsApp" 
              onClick={() => window.open(orderResult.whatsappUrl, '_blank', 'noopener,noreferrer')} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/products" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)', maxWidth: '960px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.5rem' }}>
          Checkout — Quick WhatsApp Order
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          No account required! Enter your details below to place your order directly via WhatsApp.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Left: Customer Info Form */}
        <div>
          <form onSubmit={handleOrderSubmit} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-heading)' }}>Customer Information</h2>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Full Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Phone Number (WhatsApp) <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                className="input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 01224623561"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Delivery Address <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                className="input"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="City, Street, Apartment / Landmark"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem', fontWeight: 500 }}>
                Notes <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>(Optional)</span>
              </label>
              <textarea
                className="input"
                style={{ minHeight: '60px', resize: 'vertical' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or delivery instructions?"
              />
            </div>

            {/* Coupon Code */}
            <div style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
                Coupon Code
              </label>
              {couponApplied ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(76,175,125,0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-md)' }}>
                  <Tag size={16} color="var(--color-success)" />
                  <span style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-success)' }}>
                    {couponApplied.code} — Save ${couponApplied.discountAmount.toFixed(2)}
                  </span>
                  <button type="button" onClick={() => setCouponApplied(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    className="input"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="WELCOME15"
                  />
                  <button type="button" className="btn btn-secondary" style={{ flexShrink: 0 }} onClick={applyCoupon} disabled={couponLoading}>
                    {couponLoading ? <div className="spinner" style={{ width: '14px', height: '14px' }} /> : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || items.length === 0}
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '0.875rem',
                fontSize: '1rem',
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
              }}
            >
              {submitting ? (
                <div className="spinner" style={{ width: '18px', height: '18px' }} />
              ) : (
                <>
                  <MessageSquare size={18} /> Order Now via WhatsApp — EGP {finalTotal.toFixed(2)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Order Invoice Summary */}
        <div>
          <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              Order Summary ({items.length} items)
            </h3>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--color-text-muted)' }}>
                <p style={{ marginBottom: '1rem' }}>Your cart is empty.</p>
                <Link href="/products" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                  Browse Products
                </Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {items.map((item) => (
                    <div key={item.product} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                        <span style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-gold)', borderRadius: 'var(--radius-sm)', padding: '0.1rem 0.4rem', fontSize: '0.75rem', fontWeight: 700 }}>
                          ×{item.quantity}
                        </span>
                        <span style={{ fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, flexShrink: 0, color: 'var(--color-gold)' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="divider" style={{ margin: '1rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>

                {couponApplied && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                    <span>Discount ({couponApplied.code})</span>
                    <span>-${couponApplied.discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-gold)', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-border)' }}>
                  <span>Total</span>
                  <span>EGP {finalTotal.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

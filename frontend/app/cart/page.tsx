'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, X } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { cartAPI, couponsAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
function getImageUrl(src: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
}

export default function CartPage() {
  const { items, totalPrice, removeItem, updateQuantity, setCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ code: string; discountAmount: number; finalTotal: number } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);

  // Sync cart from server on mount
  useEffect(() => {
    if (!isAuthenticated) { setSyncing(false); return; }
    cartAPI.get()
      .then((res) => {
        const cart = res.data;
        if (cart && cart.items) {
          setCart(
            cart.items.map((i: any) => ({
              product: i.product?._id || i.product,
              name: i.name,
              price: i.price,
              image: i.image,
              quantity: i.quantity,
            })),
            cart.totalPrice || 0
          );
        }
      })
      .catch(() => {})
      .finally(() => setSyncing(false));
  }, [isAuthenticated]);

  const handleQuantityChange = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      await cartAPI.update(productId, newQty);
      updateQuantity(productId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await cartAPI.remove(productId);
      removeItem(productId);
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

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

  const finalTotal = couponApplied?.finalTotal ?? totalPrice;

  if (syncing) {
    return (
      <div className="container flex-center" style={{ padding: '6rem 0' }}>
        <div className="spinner" style={{ width: '40px', height: '40px' }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem var(--container-padding)', minHeight: '70vh' }}>
      <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <ShoppingBag size={24} color="var(--color-gold)" />
        Your Cart
        {items.length > 0 && <span className="badge badge-gold">{items.length} items</span>}
      </h1>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <ShoppingBag size={72} style={{ color: 'var(--color-text-muted)', margin: '0 auto 1.5rem', display: 'block' }} />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Your cart is empty
          </p>
          <Link href="/products" className="btn btn-primary">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {items.map((item) => (
              <div key={item.product} className="card" style={{ padding: '1.25rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                {/* Image */}
                <div style={{ width: '90px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-elevated)' }}>
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.src = `https://placehold.co/90x90/161616/d4a853?text=${item.name[0]}`; }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/products/${item.product}`} style={{ fontSize: '1rem', fontWeight: 600, fontFamily: 'var(--font-heading)', display: 'block', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.name}
                  </Link>
                  <p style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.75rem' }}>
                    ${item.price.toFixed(2)}
                  </p>

                  {/* Quantity */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                      <button
                        onClick={() => handleQuantityChange(item.product, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{ width: '34px', height: '34px', background: 'var(--color-bg-elevated)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: item.quantity <= 1 ? 0.4 : 1 }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ width: '42px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product, item.quantity + 1)}
                        style={{ width: '34px', height: '34px', background: 'var(--color-bg-elevated)', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                      = <strong style={{ color: 'var(--color-text-primary)' }}>${(item.price * item.quantity).toFixed(2)}</strong>
                    </span>

                    <button
                      onClick={() => handleRemove(item.product)}
                      style={{ marginLeft: 'auto', color: 'var(--color-error)', background: 'rgba(224,92,92,0.1)', border: '1px solid rgba(224,92,92,0.2)', borderRadius: 'var(--radius-md)', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <div className="card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'var(--font-heading)', marginBottom: '1.5rem' }}>
                Order Summary
              </h3>

              {/* Coupon */}
              <div style={{ marginBottom: '1.5rem' }}>
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

              <div className="divider" />

              {/* Totals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                <span>Subtotal ({items.length} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                <span>Shipping</span>
                <span style={{ color: 'var(--color-success)' }}>Free</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                  <span>Discount</span>
                  <span>-${couponApplied.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}>
                Proceed to Checkout <ArrowRight size={18} />
              </Link>

              <Link href="/products" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', fontSize: '0.85rem' }}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

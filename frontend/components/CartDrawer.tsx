'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import LuxuryWhatsAppButton from './ui/LuxuryWhatsAppButton';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(src: string) {
  if (!src) return '';
  const decoded = src.startsWith('http') ? src : `${API_BASE}${src}`;
  return encodeURI(decoded);
}

export default function CartDrawer() {
  const { items, totalPrice, isOpen, closeCart, removeItem, updateQuantity, setCart } = useCartStore();

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeCart]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = async (productId: string) => {
    try {
      await cartAPI.remove(productId);
      removeItem(productId);
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleQuantityChange = async (productId: string, delta: number, currentQty: number) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;
    try {
      await cartAPI.update(productId, newQty);
      updateQuantity(productId, newQty);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleWhatsAppOrder = () => {
    const message = `🛒 New Order - TIMO Store\n\nItems:\n${items
      .map((i) => `- ${i.name} x${i.quantity} (EGP ${(i.price * i.quantity).toFixed(0)})`)
      .join('\n')}\n\n💰 Total: EGP ${totalPrice.toFixed(0)}`;
    const url = `https://wa.me/201008313604?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 'calc(var(--z-modal) - 1)' as never,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'all' : 'none',
          transition: 'opacity var(--transition-base)',
        }}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: '420px',
          background: 'var(--color-bg-secondary)',
          borderLeft: '1px solid var(--color-border)',
          zIndex: 'var(--z-modal)' as never,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--transition-slow)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShoppingBag size={20} color="var(--color-gold)" />
            <h2 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>Your Cart</h2>
            {items.length > 0 && (
              <span className="badge badge-gold">{items.length}</span>
            )}
          </div>
          <button className="btn btn-ghost" style={{ padding: '0.4rem' }} onClick={closeCart} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--color-text-secondary)' }}>
              <ShoppingBag size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your cart is empty</p>
              <p style={{ fontSize: '0.875rem' }}>Explore our luxury fragrances and find your scent.</p>
              <Link href="/products" className="btn btn-primary" style={{ marginTop: '1.5rem', display: 'inline-flex' }} onClick={closeCart}>
                Browse Products
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div
                  key={item.product}
                  style={{
                    display: 'flex', gap: '1rem', padding: '0.75rem',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.name}
                    style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ color: 'var(--color-gold)', fontWeight: 700, fontSize: '0.875rem', marginTop: '0.2rem' }}>
                      EGP {item.price.toFixed(0)}
                    </p>

                    {/* Quantity controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => handleQuantityChange(item.product, -1, item.quantity)}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product, 1, item.quantity)}
                        style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1px solid var(--color-border)', background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        onClick={() => handleRemove(item.product)}
                        style={{ marginLeft: 'auto', color: 'var(--color-error)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem' }}
                        aria-label="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-gold)' }}>
                EGP {totalPrice.toFixed(0)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
              onClick={closeCart}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className="mt-2">
              <LuxuryWhatsAppButton onClick={handleWhatsAppOrder} />
            </div>

            <Link
              href="/cart"
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', fontSize: '0.85rem' }}
              onClick={closeCart}
            >
              View Cart Details
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

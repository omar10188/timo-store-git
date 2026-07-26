'use client';

import { useEffect, useCallback } from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { cartAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

function getImageUrl(src: string) {
  if (!src) return '';
  if (src.startsWith('http')) return src;
  return `${API_BASE}${src}`;
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--color-text-muted)' }}>
              <ShoppingBag size={48} />
              <p>Your cart is empty</p>
              <Link href="/products" className="btn btn-secondary" onClick={closeCart} style={{ fontSize: '0.85rem' }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item) => (
                <div key={item.product} style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  {/* Image */}
                  <div style={{ width: '72px', height: '72px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, background: 'var(--color-bg-elevated)' }}>
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.currentTarget.src = `https://placehold.co/72x72/161616/d4a853?text=${item.name[0]}`; }}
                    />
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                      ${(item.price * item.quantity).toFixed(2)}
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
                ${totalPrice.toFixed(2)}
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

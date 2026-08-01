/**
 * Analytics Utility — Facebook Pixel & Google Analytics Event Tracker
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

// ── Track Add To Cart ────────────────────────────────────────────────────────
export function trackAddToCart(product: { id: string; name: string; price: number; quantity?: number }) {
  const qty = product.quantity || 1;
  const val = product.price * qty;

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'AddToCart', {
        content_name: product.name,
        content_ids: [product.id],
        content_type: 'product',
        value: val,
        currency: 'EGP',
      });
      console.log('📊 [FB Pixel] Tracked AddToCart:', product.name, val);
    } catch {}
  }

  // Google Analytics (GA4)
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'add_to_cart', {
        currency: 'EGP',
        value: val,
        items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }],
      });
      console.log('📊 [GA4] Tracked add_to_cart:', product.name, val);
    } catch {}
  }
}

// ── Track Initiate Checkout ──────────────────────────────────────────────────
export function trackInitiateCheckout(items: Array<{ id: string; name: string; price: number; quantity: number }>, totalValue: number) {
  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'InitiateCheckout', {
        content_ids: items.map((i) => i.id),
        num_items: items.reduce((sum, i) => sum + i.quantity, 0),
        value: totalValue,
        currency: 'EGP',
      });
      console.log('📊 [FB Pixel] Tracked InitiateCheckout:', totalValue);
    } catch {}
  }

  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'begin_checkout', {
        currency: 'EGP',
        value: totalValue,
        items: items.map((i) => ({ item_id: i.id, item_name: i.name, price: i.price, quantity: i.quantity })),
      });
      console.log('📊 [GA4] Tracked begin_checkout:', totalValue);
    } catch {}
  }
}

// ── Track Purchase / WhatsApp Order ──────────────────────────────────────────
export function trackPurchase(orderId: string, totalValue: number) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', {
        value: totalValue,
        currency: 'EGP',
        order_id: orderId,
      });
      console.log('📊 [FB Pixel] Tracked Purchase:', orderId, totalValue);
    } catch {}
  }

  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', 'purchase', {
        transaction_id: orderId,
        value: totalValue,
        currency: 'EGP',
      });
      console.log('📊 [GA4] Tracked purchase:', orderId, totalValue);
    } catch {}
  }
}

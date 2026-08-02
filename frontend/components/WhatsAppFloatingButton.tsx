'use client';

import LuxuryWhatsAppButton from './ui/LuxuryWhatsAppButton';

const WHATSAPP_NUMBER = '201008313604';
const WHATSAPP_MESSAGE = 'Hi! I want to order from TIMO Store.';

export default function WhatsAppFloatingButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div
      className="fixed z-50"
      style={{
        right: 'max(1rem, env(safe-area-inset-right))',
        bottom: 'max(1rem, env(safe-area-inset-bottom))',
      }}
    >
      <LuxuryWhatsAppButton 
        text="Order via WhatsApp"
        onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
        fullWidth={false}
        className="shadow-2xl"
      />
    </div>
  );
}

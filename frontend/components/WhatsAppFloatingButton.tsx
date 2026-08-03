'use client';

import LuxuryWhatsAppButton from './ui/LuxuryWhatsAppButton';

const WHATSAPP_NUMBER = '201008313604';
const WHATSAPP_MESSAGE = 'Hi! I want to order from TIMO Store.';

export default function WhatsAppFloatingButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <div
      className="fixed z-[60] pointer-events-auto right-4 md:right-6"
      style={{
        right: 'max(1rem, env(safe-area-inset-right, 0px))',
      }}
    >
      {/* Mobile positioning (above bottom navbar) */}
      <div className="block md:hidden fixed" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 76px)', right: 'max(1rem, env(safe-area-inset-right, 0px))' }}>
        <LuxuryWhatsAppButton 
          text="WhatsApp"
          onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
          fullWidth={false}
          className="shadow-2xl hover:scale-105 transition-transform rounded-full text-xs px-4 py-2.5"
        />
      </div>

      {/* Desktop positioning */}
      <div className="hidden md:block fixed" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))', right: 'max(1.5rem, env(safe-area-inset-right, 0px))' }}>
        <LuxuryWhatsAppButton 
          text="Order via WhatsApp"
          onClick={() => window.open(href, '_blank', 'noopener,noreferrer')}
          fullWidth={false}
          className="shadow-2xl hover:scale-105 transition-transform rounded-full"
        />
      </div>
    </div>
  );
}

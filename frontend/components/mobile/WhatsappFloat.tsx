'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WhatsappFloat() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const whatsappUrl = `https://wa.me/201008313604?text=${encodeURIComponent('Hi! I want to order from TIMO Store.')}`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.7, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-[88px] right-4 md:bottom-8 md:right-8 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-white shadow-lg backdrop-blur-md transition-shadow active:shadow-md"
          style={{
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35), 0 2px 8px rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
          }}
          aria-label="Order on WhatsApp"
        >
          <MessageCircle size={20} className="fill-white text-white shrink-0" />
          <span className="text-xs font-bold tracking-wide">Order via WhatsApp</span>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

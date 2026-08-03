'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore, useAuthStore, useCartCount } from '@/lib/store';
import { motion } from 'framer-motion';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const cartCount = useCartCount();

  const tabs = [
    {
      label: 'Home',
      href: '/',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      isActive: pathname === '/wishlist',
    },
    {
      label: 'Cart',
      onClick: toggleCart,
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: pathname === '/cart',
    },
    {
      label: 'Profile',
      href: isAuthenticated ? '/dashboard' : '/auth/login',
      icon: User,
      isActive: pathname.startsWith('/dashboard') || pathname.startsWith('/auth'),
    },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 bg-[#0B0B0B]/95 backdrop-blur-xl border-t border-[rgba(212,168,83,0.3)] shadow-[0_-5px_25px_rgba(0,0,0,0.6)]"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
        paddingTop: '8px',
      }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const content = (
            <div className="relative flex flex-col items-center gap-1 py-1 px-3">
              <div className="relative">
                <Icon
                  size={20}
                  style={{
                    color: tab.isActive ? '#D4AF37' : '#a3a3a3',
                    strokeWidth: tab.isActive ? 2.2 : 1.7,
                  }}
                />
                {tab.badge !== undefined && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold bg-[#D4AF37] text-[#0B0B0B]"
                  >
                    {tab.badge}
                  </motion.span>
                )}
              </div>
              <span
                className="text-[10px] font-medium tracking-wide"
                style={{
                  color: tab.isActive ? '#D4AF37' : '#a3a3a3',
                }}
              >
                {tab.label}
              </span>
              {tab.isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-1 h-0.5 w-4 rounded-full bg-[#D4AF37]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </div>
          );

          if (tab.onClick) {
            return (
              <button
                key={tab.label}
                onClick={tab.onClick}
                className="focus:outline-none"
                aria-label={tab.label}
              >
                {content}
              </button>
            );
          }

          return (
            <Link key={tab.label} href={tab.href!} aria-label={tab.label}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

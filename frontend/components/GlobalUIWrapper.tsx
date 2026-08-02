'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import MobileBottomNav from './mobile/MobileBottomNav';
import WhatsAppFloatingButton from './WhatsAppFloatingButton';

export default function GlobalUIWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Navbar />}
      {!isAdmin && <CartDrawer />}
      
      <main className={!isAdmin ? "pt-16 md:pt-[96px] lg:pt-[104px]" : ""} style={{ minHeight: '100vh' }}>
        {children}
      </main>

      {!isAdmin && <MobileBottomNav />}
      {!isAdmin && <Footer />}
      {!isAdmin && <WhatsAppFloatingButton />}
    </>
  );
}

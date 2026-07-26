import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Timo Store | Luxury Fragrances',
    template: '%s | Timo Store',
  },
  description: 'Discover premium fragrances curated for the discerning connoisseur. Shop luxury perfumes at Timo Store.',
  keywords: ['perfume', 'fragrance', 'luxury', 'oud', 'arabic perfume'],
  openGraph: {
    siteName: 'Timo Store',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: 'var(--color-gold)', secondary: '#0a0a0a' } },
          }}
        />

        {/* Navbar — always visible */}
        <Navbar />

        {/* Cart Drawer — always mounted, slides in/out */}
        <CartDrawer />

        {/* Main content */}
        <main style={{ minHeight: '100vh', paddingTop: '72px' }}>
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}

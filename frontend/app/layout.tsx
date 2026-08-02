import type { Metadata } from 'next';
import './globals.css';
import GlobalUIWrapper from '@/components/GlobalUIWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = stored === 'light' ? 'light' : stored === 'dark' ? 'dark' : (prefersDark ? 'dark' : 'light');
                  document.documentElement.classList.add(theme);
                  document.documentElement.classList.remove(theme === 'dark' ? 'light' : 'dark');
                } catch (_) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
        <ThemeProvider>
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
              success: { iconTheme: { primary: 'var(--color-gold)', secondary: 'var(--color-bg)' } },
            }}
          />

          {/* Global Storefront UI & Main Content wrapper */}
          <GlobalUIWrapper>
            {children}
          </GlobalUIWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

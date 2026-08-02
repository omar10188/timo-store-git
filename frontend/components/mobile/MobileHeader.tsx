'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export default function MobileHeader({
  title = 'Scent Sphere',
  showBack = false,
  rightAction,
}: MobileHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="md:hidden sticky top-0 z-40 flex h-14 items-center justify-between px-4 transition-colors duration-300"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left slot (Back button or empty) */}
      <div className="w-10 flex items-center justify-start">
        {showBack ? (
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors active:scale-95"
            style={{
              background: 'var(--color-bg-elevated)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
            }}
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
        ) : null}
      </div>

      {/* Centered App Title */}
      <div className="flex-1 text-center">
        <h1
          className="font-serif text-lg font-bold tracking-[0.18em] uppercase"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {title}
        </h1>
      </div>

      {/* Right Action slot */}
      <div className="w-10 flex items-center justify-end">
        {rightAction || null}
      </div>
    </header>
  );
}

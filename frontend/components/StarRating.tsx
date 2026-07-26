'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export default function StarRating({ rating, maxStars = 5, size = 16, interactive = false, onChange }: StarRatingProps) {
  return (
    <div style={{ display: 'inline-flex', gap: '2px' }} role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onChange?.(i + 1)}
            style={{
              background: 'none', border: 'none', padding: '1px',
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform var(--transition-fast)',
            }}
            onMouseEnter={(e) => interactive && ((e.currentTarget.style.transform = 'scale(1.2)'))}
            onMouseLeave={(e) => interactive && ((e.currentTarget.style.transform = 'scale(1)'))}
            aria-label={interactive ? `Rate ${i + 1} stars` : undefined}
          >
            <Star
              size={size}
              fill={filled ? 'var(--color-gold)' : 'none'}
              color={filled ? 'var(--color-gold)' : 'var(--color-border)'}
              strokeWidth={1.5}
            />
          </button>
        );
      })}
    </div>
  );
}

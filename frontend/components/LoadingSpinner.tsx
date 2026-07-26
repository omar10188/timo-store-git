'use client';

export default function LoadingSpinner({ size = 40, text = 'Loading...' }: { size?: number; text?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '3rem' }}>
      <div
        style={{
          width: size, height: size,
          border: '3px solid var(--color-border)',
          borderTop: '3px solid var(--color-gold)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }}
      />
      {text && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{text}</p>}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { X, Sun, Snowflake, Leaf, Flower2, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  gender: string;
  accords: string[];
  season: string[];
  minPrice: string;
  maxPrice: string;
}

interface MobileFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: Partial<FilterState>;
}

const GENDERS = ['Men', 'Women', 'Unisex'];
const ACCORDS = [
  'Woody', 'Amber', 'Gourmand',
  'Spicy', 'Ambergris', 'Musky',
  'Floral', 'Leather', 'Synthetic',
];

const SEASONS = [
  { id: 'Spring', label: 'Spring', icon: Flower2 },
  { id: 'Summer', label: 'Summer', icon: Sun },
  { id: 'Autumn', label: 'Autumn', icon: Leaf },
  { id: 'Winter', label: 'Winter', icon: Snowflake },
];

export default function MobileFilterSheet({
  isOpen,
  onClose,
  onApply,
  initialFilters,
}: MobileFilterSheetProps) {
  const [gender, setGender] = useState(initialFilters?.gender || '');
  const [accords, setAccords] = useState<string[]>(initialFilters?.accords || []);
  const [season, setSeason] = useState<string[]>(initialFilters?.season || []);
  const [minPrice, setMinPrice] = useState(initialFilters?.minPrice || '15');
  const [maxPrice, setMaxPrice] = useState(initialFilters?.maxPrice || '1200');

  const toggleAccord = (item: string) => {
    setAccords((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleSeason = (item: string) => {
    setSeason((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleApply = () => {
    onApply({ gender, accords, season, minPrice, maxPrice });
    onClose();
  };

  const handleReset = () => {
    setGender('');
    setAccords([]);
    setSeason([]);
    setMinPrice('');
    setMaxPrice('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm md:hidden"
          />

          {/* Bottom Sheet Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 32 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl p-5 md:hidden"
            style={{
              background: 'var(--color-bg-card)',
              borderTop: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            {/* Header: Close Button + Title */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--color-border)]">
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors active:scale-95"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-primary)',
                }}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>

              <h2
                className="font-serif text-base font-bold tracking-wider uppercase"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Filter by
              </h2>

              <button
                onClick={handleReset}
                className="text-xs font-semibold underline text-[var(--color-gold)]"
              >
                Reset
              </button>
            </div>

            <div className="space-y-6">
              {/* Gender Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--color-text-secondary)]">
                  Gender
                </h3>
                <div className="flex gap-2">
                  {GENDERS.map((g) => {
                    const isSelected = gender === g;
                    return (
                      <button
                        key={g}
                        onClick={() => setGender(isSelected ? '' : g)}
                        className="flex-1 py-2 px-3 rounded-full text-xs font-semibold transition-all active:scale-95"
                        style={{
                          background: isSelected ? 'var(--color-gold)' : 'var(--color-bg-elevated)',
                          color: isSelected ? 'var(--color-bg)' : 'var(--color-text-primary)',
                          border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Main Accords Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--color-text-secondary)]">
                  Main Accords
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {ACCORDS.map((acc) => {
                    const isSelected = accords.includes(acc);
                    return (
                      <button
                        key={acc}
                        onClick={() => toggleAccord(acc)}
                        className="py-2 px-2 rounded-xl text-xs font-medium text-center transition-all active:scale-95 truncate"
                        style={{
                          background: isSelected ? 'rgba(212, 168, 83, 0.2)' : 'var(--color-bg-elevated)',
                          color: isSelected ? 'var(--color-gold)' : 'var(--color-text-secondary)',
                          border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border)',
                        }}
                      >
                        {acc}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Season Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--color-text-secondary)]">
                  Season
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SEASONS.map((s) => {
                    const Icon = s.icon;
                    const isSelected = season.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSeason(s.id)}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all active:scale-95"
                        style={{
                          background: isSelected ? 'rgba(47, 62, 122, 0.4)' : 'var(--color-bg-elevated)',
                          color: isSelected ? 'var(--color-gold)' : 'var(--color-text-primary)',
                          border: isSelected ? '1px solid var(--color-navy-light)' : '1px solid var(--color-border)',
                        }}
                      >
                        <Icon size={14} className={isSelected ? 'text-[var(--color-gold)]' : 'text-[var(--color-text-secondary)]'} />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Section */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-3 text-[var(--color-text-secondary)]">
                  Price (EGP)
                </h3>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 flex items-center gap-1 rounded-full px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-xs text-[var(--color-text-muted)]">Min</span>
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="15"
                      className="w-full bg-transparent text-xs font-bold outline-none text-right"
                    />
                  </div>
                  <span className="text-[var(--color-text-muted)]">-</span>
                  <div className="flex-1 flex items-center gap-1 rounded-full px-3 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]">
                    <span className="text-xs text-[var(--color-text-muted)]">Max</span>
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="1200"
                      className="w-full bg-transparent text-xs font-bold outline-none text-right"
                    />
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={maxPrice || '5000'}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-[var(--color-gold)]"
                />
              </div>

              {/* Apply Button */}
              <button
                onClick={handleApply}
                className="w-full py-3.5 rounded-full text-sm font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md"
                style={{
                  background: 'var(--color-gold)',
                  color: 'var(--color-bg)',
                }}
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

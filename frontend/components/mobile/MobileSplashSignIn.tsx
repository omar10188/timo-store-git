'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MobileSplashSignIn() {
  return (
    <div className="md:hidden relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#0a0b10]">
      {/* Background full-bleed photo */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80")',
        }}
      />

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

      {/* Top App Name Header */}
      <div className="relative z-10 pt-10 text-center">
        <h1 className="font-serif text-xl font-bold tracking-[0.25em] uppercase text-white drop-shadow-md">
          Scent Sphere
        </h1>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10 px-6 pb-16 text-center space-y-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-3xl font-bold text-white mb-2 leading-tight">
            Discover Your Signature Scent
          </h2>
          <p className="text-xs text-neutral-300 max-w-xs mx-auto mb-6">
            Curated luxury perfumes from world-class perfumers.
          </p>

          <Link
            href="/auth/login"
            className="block w-full py-4 rounded-full text-sm font-bold tracking-widest uppercase text-black bg-white shadow-xl transition-all active:scale-95 mb-4"
          >
            Sign In
          </Link>

          <p className="text-xs text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-bold underline text-[var(--color-gold)]">
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

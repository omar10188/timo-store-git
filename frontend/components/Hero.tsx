import React from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0a0b10] border-b border-[var(--color-border)]">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-gold-muted)] opacity-20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--color-gold-muted)] opacity-10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20 flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-8 z-10">
        
        {/* Left Column: Text & Actions */}
        <div className="flex-1 w-full flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 bg-[rgba(212,168,83,0.1)] border border-[rgba(212,168,83,0.3)] animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <Sparkles size={14} className="text-[var(--color-gold)]" />
            <span className="text-xs font-bold tracking-[0.08em] uppercase text-[var(--color-gold)]">
              New Collection 2025
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6 font-bold text-white animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Discover Your
            <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-gold-light)] via-[var(--color-gold)] to-[var(--color-gold-dark)]">
              {" "}Signature Scent
            </span>
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg leading-relaxed mb-12 max-w-[500px] text-gray-400 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            Explore an exclusive collection of luxury fragrances crafted by master perfumers. From rare oud to fresh florals — find the scent that tells your story.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 animate-fade-in" style={{ animationDelay: '0.4s', marginTop: '1.5rem', marginBottom: '3rem' }}>
            <Link
              href="/products"
              className="group flex items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all duration-300 hover:-translate-y-1 w-full sm:w-auto"
              style={{
                background: 'linear-gradient(135deg, var(--color-gold-light) 0%, var(--color-gold) 50%, var(--color-gold-dark) 100%)',
                color: '#0a0b10', // Explicit black text for contrast
                boxShadow: 'var(--shadow-gold)',
                padding: '1rem 2.5rem', // Force ample padding
                lineHeight: '1.5'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold-lg)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-gold)';
              }}
            >
              Shop Collection <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/products?featured=true"
              className="flex items-center justify-center gap-2 rounded-xl text-base font-semibold transition-all duration-300 w-full sm:w-auto"
              style={{
                background: 'transparent',
                border: '1px solid var(--color-gold)',
                color: 'var(--color-gold)',
                padding: '1rem 2.5rem',
                lineHeight: '1.5'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,83,0.1)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              Featured Picks
            </Link>
          </div>

          {/* Social Proof & Rating */}
          <div className="flex flex-col sm:flex-row items-center gap-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            {/* Scent Profiles (Color Circles) */}
            <div className="flex">
              <div className="w-10 h-10 rounded-full bg-[#8A9A4A] border-2 border-[#0a0b10] z-50"></div>
              <div className="w-10 h-10 rounded-full bg-[#5C8033] border-2 border-[#0a0b10] -ml-3 z-40"></div>
              <div className="w-10 h-10 rounded-full bg-[#3B6620] border-2 border-[#0a0b10] -ml-3 z-30"></div>
              <div className="w-10 h-10 rounded-full bg-[#204C0F] border-2 border-[#0a0b10] -ml-3 z-20"></div>
              <div className="w-10 h-10 rounded-full bg-[#113306] border-2 border-[#0a0b10] -ml-3 z-10"></div>
            </div>

            <div className="flex flex-col items-center sm:items-start">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-[var(--color-gold)] text-[var(--color-gold)]" />
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <strong className="text-white">2,400+</strong> happy customers
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Image */}
        <div className="flex-1 w-full flex justify-center lg:justify-end animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="relative w-full max-w-[500px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-white/5">
            <Image
              src="/hero-perfume.png"
              alt="Timo Luxury Perfume"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Inner vignette shadow to blend with the dark bg */}
            <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(10,11,16,0.8)] pointer-events-none" />
          </div>
        </div>

      </div>
    </section>
  );
}

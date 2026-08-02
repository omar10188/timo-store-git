'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, ShieldCheck, Truck, RefreshCcw, Phone, MapPin, Gift, Shield, CheckCircle2 } from 'lucide-react';

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FacebookIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const TikTokIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const LINK_IDLE = '#a3a3a3';

const FooterLink = ({ href, label, sublabel }: { href: string; label: string; sublabel?: string }) => (
  <Link
    href={href}
    className="group flex flex-col text-sm transition-colors duration-300 w-fit"
    style={{ color: LINK_IDLE }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLElement).style.color = 'var(--color-gold)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLElement).style.color = LINK_IDLE;
    }}
  >
    <span>{label}</span>
    {sublabel && <span className="text-xs opacity-70 mt-0.5">{sublabel}</span>}
  </Link>
);

export default function Footer() {
  return (
    <footer className="relative bg-[#0B0B0B] border-t border-[rgba(212,168,83,0.15)] pt-12 pb-6 overflow-hidden">
      
      {/* ── Background Noise ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* ── Promo Banner ── */}
        <div className="relative mb-16 rounded-2xl overflow-hidden border border-[rgba(212,168,83,0.3)] bg-gradient-to-b from-[#141414] to-[#0a0a0a] shadow-[0_0_40px_rgba(212,168,83,0.05)]">
          <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 text-center md:text-left">
            
            {/* Left Image (hidden on small mobile) */}
            <div className="hidden sm:block relative w-32 h-32 md:w-48 md:h-48 shrink-0">
              <Image src="/hero-perfume.png" alt="Promo Perfume Left" fill className="object-contain drop-shadow-[0_0_15px_rgba(212,168,83,0.2)]" />
            </div>

            {/* Content */}
            <div className="flex flex-col items-center flex-1 mx-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-[var(--color-gold)] opacity-50"></div>
                <span className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase">Exclusive Offer</span>
                <div className="h-px w-8 bg-[var(--color-gold)] opacity-50"></div>
              </div>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Get <span className="text-[var(--color-gold)]">15%</span> Off Your First Order
              </h2>
              <p className="text-[#a3a3a3] text-sm md:text-base mb-8 tracking-wide">
                Use code <strong className="text-[var(--color-gold)] uppercase tracking-wider font-semibold bg-[rgba(212,168,83,0.1)] px-2 py-1 rounded">WELCOME15</strong> at checkout
              </p>
              <button 
                className="group flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--color-gold)',
                  color: 'var(--color-gold)',
                  boxShadow: '0 0 20px rgba(212,168,83,0.1)'
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(212,168,83,0.1)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(212,168,83,0.2)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(212,168,83,0.1)';
                }}
              >
                <Gift size={16} /> Join Now — It's Free
              </button>
            </div>

            {/* Right Image */}
            <div className="hidden md:block relative w-48 h-48 shrink-0">
              <Image src="/hero-perfume.png" alt="Promo Perfume Right" fill className="object-contain drop-shadow-[0_0_15px_rgba(212,168,83,0.2)]" />
            </div>

          </div>
        </div>

        {/* ── Main Footer Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          
          {/* 1. Brand Column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-serif text-3xl font-bold text-[var(--color-gold)] tracking-tighter">
                <span className="border-t-2 border-b-2 border-[var(--color-gold)] px-1">T</span>P
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-xl text-white tracking-widest">TIMO</span>
                <span className="text-[10px] text-[var(--color-gold)] tracking-[0.2em] uppercase">Perfume</span>
              </div>
            </div>
            <p className="text-sm text-[#a3a3a3] mb-6 leading-relaxed">
              Premium fragrances curated for the discerning connoisseur. Experience luxury in every drop.
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-white">100% Authentic Products</span>
                  <span className="text-[10px] text-[#737373]">منتجات أصلية 100%</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-white">Fast & Secure Delivery</span>
                  <span className="text-[10px] text-[#737373]">شحن سريع وآمن</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCcw size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-white">Easy Returns</span>
                  <span className="text-[10px] text-[#737373]">إرجاع سهل ومريح</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Shop Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-6 font-bold">Shop</h4>
            <div className="flex flex-col gap-4">
              <FooterLink href="/products" label="All Perfumes" />
              <FooterLink href="/products?sort=newest" label="New Arrivals" />
              <FooterLink href="/products?sort=popular" label="Best Sellers" />
              <FooterLink href="/products?category=gift-sets" label="Gift Sets" />
              <FooterLink href="/products?category=for-him" label="For Him" />
              <FooterLink href="/products?category=for-her" label="For Her" />
              <FooterLink href="/products?category=unisex" label="Unisex" />
              <FooterLink href="/products?discount=true" label="Offers & Deals" />
            </div>
          </div>

          {/* 3. Account Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-6 font-bold">Account</h4>
            <div className="flex flex-col gap-4">
              <FooterLink href="/orders" label="My Orders" />
              <FooterLink href="/wishlist" label="Wishlist" />
              <FooterLink href="/orders" label="Track Order" />
              <FooterLink href="/profile" label="My Addresses" />
              <FooterLink href="/profile" label="Account Settings" />
              <FooterLink href="/auth/login" label="Sign In" />
              <FooterLink href="/auth/register" label="Register" />
            </div>
          </div>

          {/* 4. Support Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-6 font-bold">Support</h4>
            <div className="flex flex-col gap-4">
              <FooterLink href="/contact" label="Contact Us" />
              <FooterLink href="/faq" label="FAQs" />
              <FooterLink href="/policy/shipping" label="Shipping Policy" sublabel="سياسة الشحن" />
              <FooterLink href="/policy/returns" label="Returns & Refunds" sublabel="الإرجاع والاسترداد" />
              <FooterLink href="/policy/terms" label="Terms & Conditions" sublabel="الشروط والأحكام" />
              <FooterLink href="/policy/privacy" label="Privacy Policy" sublabel="سياسة الخصوصية" />
            </div>
          </div>

          {/* 5. Connect Column */}
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-gold)] mb-6 font-bold">Connect</h4>
            
            {/* Social Icons */}
            <div className="flex gap-3 mb-8">
              {[
                { Icon: InstagramIcon, href: 'https://www.instagram.com/timo__perfume_?igsh=YTI5MG41N2E5anBi' },
                { Icon: FacebookIcon, href: 'https://www.facebook.com/share/1DHFiqkYJW/' },
                { Icon: TikTokIcon, href: 'https://www.tiktok.com/@timo.perfume?_r=1&_t=ZS-98XhATxjeFh' },
                { Icon: WhatsAppIcon, href: 'https://wa.me/201008313604' }
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  className="group flex items-center justify-center w-10 h-10 rounded-full border border-[rgba(212,168,83,0.3)] text-[var(--color-gold)] transition-all duration-300 hover:bg-[rgba(212,168,83,0.15)] hover:-translate-y-1"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>

            <div className="w-full h-px bg-[rgba(212,168,83,0.15)] mb-6"></div>

            {/* Contact Details */}
            <div className="flex flex-col gap-4">
              <a href="mailto:omar0122462356i@gmail.com" className="flex items-center gap-3 text-sm text-[#a3a3a3] hover:text-[var(--color-gold)] transition-colors">
                <Mail size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                omar0122462356i@gmail.com
              </a>
              <a href="tel:+201008313604" className="flex items-center gap-3 text-sm text-[#a3a3a3] hover:text-[var(--color-gold)] transition-colors">
                <Phone size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                +20 100 831 3604
              </a>
              <div className="flex items-center gap-3 text-sm text-[#a3a3a3]">
                <MapPin size={20} className="text-[var(--color-gold)] shrink-0" strokeWidth={1.5} />
                Cairo, Egypt
              </div>
            </div>
          </div>

        </div>

        {/* ── Payments Divider ── */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="h-px flex-1 bg-[rgba(212,168,83,0.2)]"></div>
          <div className="flex items-center gap-2 text-[var(--color-gold)] font-bold text-sm tracking-wide">
            <span className="w-1.5 h-1.5 rotate-45 bg-[var(--color-gold)] block"></span>
            طرق الدفع المتاحة
            <span className="w-1.5 h-1.5 rotate-45 bg-[var(--color-gold)] block"></span>
          </div>
          <div className="h-px flex-1 bg-[rgba(212,168,83,0.2)]"></div>
        </div>

        {/* ── Payment Badges ── */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          {/* Vodafone Cash */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(20,20,20,0.5)] transition-colors hover:border-[var(--color-gold)] w-full sm:w-[280px] h-[72px]">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(230,0,0,0.2)]">
              <div className="w-4 h-4 rounded-full border-[3px] border-[#E60000]"></div>
            </div>
            <div className="flex flex-col flex-1 justify-center">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-white text-xs font-bold leading-none">Vodafone</span>
                <span className="text-[#E60000] text-[11px] font-bold leading-none text-right">فودافون كاش</span>
              </div>
              <span className="text-[var(--color-gold)] text-sm font-mono tracking-wider font-semibold">01008313604</span>
            </div>
          </div>

          <span className="hidden sm:block text-[#a3a3a3] opacity-30 text-xs px-2">•</span>

          {/* InstaPay */}
          <div className="flex items-center gap-3 px-6 py-3 rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(20,20,20,0.5)] transition-colors hover:border-[var(--color-gold)] w-full sm:w-[280px] h-[72px]">
            <div className="flex items-center shrink-0">
              <span className="text-white font-bold text-[22px] italic tracking-tighter">insta</span>
              <span className="text-[#7A2B8F] font-bold text-[22px] italic tracking-tighter">P</span>
              <span className="text-[#E94B3C] font-bold text-[22px] italic tracking-tighter">ay</span>
            </div>
            <div className="flex flex-col flex-1 justify-center items-end">
              <span className="text-[#a3a3a3] text-[10px] font-medium leading-none mb-1">انستا باي</span>
              <span className="text-[var(--color-gold)] text-sm font-mono tracking-wider font-semibold">01008313604</span>
            </div>
          </div>

          <span className="hidden sm:block text-[#a3a3a3] opacity-30 text-xs px-2">•</span>

          {/* Cash on Delivery */}
          <div className="flex items-center gap-4 px-6 py-3 rounded-xl border border-[rgba(212,168,83,0.3)] bg-[rgba(20,20,20,0.5)] transition-colors hover:border-[var(--color-gold)] w-full sm:w-[280px] h-[72px]">
            <div className="relative shrink-0">
              <ShieldCheck size={30} className="text-[var(--color-gold)]" strokeWidth={1.5} />
              <div className="absolute -bottom-1 -right-1 bg-[#0B0B0B] rounded-full p-[2px]">
                <CheckCircle2 size={12} className="text-green-500" />
              </div>
            </div>
            <div className="flex flex-col flex-1 justify-center">
              <span className="text-white text-[13px] font-bold text-right mb-0.5">الدفع عند الاستلام</span>
              <span className="text-[#a3a3a3] text-[11px] text-right leading-none">Cash on Delivery</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-[rgba(212,168,83,0.15)]">
          <p className="text-xs text-[#a3a3a3]">
            © {new Date().getFullYear()} Timo Perfume. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
            <Shield size={14} className="text-[var(--color-gold)]" />
            <div className="flex flex-col text-right">
              <span className="text-white">Secure SSL Encryption</span>
              <span className="text-[10px] opacity-70">اتصال آمن ومشفر</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

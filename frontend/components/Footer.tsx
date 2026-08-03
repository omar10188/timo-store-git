'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ShieldCheck, Truck, RefreshCcw, Phone, MapPin, Gift, Shield, ChevronDown, Check, Award } from 'lucide-react';

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

const FooterLink = ({ href, label, sublabel }: { href: string; label: string; sublabel?: string }) => (
  <Link
    href={href}
    className="group flex flex-col text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] hover:text-[#C59B27] dark:hover:text-[#D4AF37] transition-colors duration-200 w-fit"
  >
    <span className="group-hover:translate-x-1 transition-transform duration-200">{label}</span>
    {sublabel && <span className="text-[10px] opacity-70 mt-0.5">{sublabel}</span>}
  </Link>
);

export default function Footer() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>('cod');

  const toggleSection = (sec: string) => {
    setOpenSection((prev) => (prev === sec ? null : sec));
  };

  return (
    <footer className="relative bg-[#FAF9F6] dark:bg-[#0B0B0B] border-t border-[rgba(212,168,83,0.2)] pt-12 pb-8 overflow-hidden text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Background Ambient Particles & Light */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[rgba(212,168,83,0.04)] blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        
        {/* HERO PROMO BANNER */}
        <div className="relative mt-2 mb-10 sm:mb-14 rounded-2xl overflow-hidden border border-[rgba(212,168,83,0.35)] bg-gradient-to-r from-[#FAF8F5] via-[#FFF8EB] to-[#FAF8F5] dark:from-[#0B0B0B] dark:via-[#16161a] dark:to-[#0B0B0B] shadow-sm dark:shadow-[0_10px_40px_rgba(0,0,0,0.7),inset_0_0_20px_rgba(212,168,83,0.05)] transition-colors duration-300">
          <div className="absolute inset-0 bg-radial from-[rgba(212,168,83,0.08)] to-transparent pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center justify-between p-5 sm:p-8 md:p-10 text-center md:text-left gap-5 sm:gap-6 relative z-10">
            <div className="hidden sm:block relative w-32 h-32 md:w-44 md:h-44 shrink-0 rounded-[16px] overflow-hidden border border-[rgba(212,168,83,0.25)] bg-white dark:bg-[#0d0e12] shadow-md dark:shadow-xl">
              <div className="absolute inset-0 bg-[rgba(212,168,83,0.15)] blur-xl rounded-full pointer-events-none" />
              <Image src="/hero-perfume.png" alt="Promo Perfume Left" fill className="object-contain p-2 drop-shadow-[0_0_20px_rgba(212,168,83,0.35)]" />
            </div>

            <div className="flex flex-col items-center flex-1 w-full">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-px w-6 sm:w-8 bg-[#D4AF37] opacity-60"></div>
                <span className="text-[#C59B27] dark:text-[#D4AF37] text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase">EXCLUSIVE OFFER</span>
                <div className="h-px w-6 sm:w-8 bg-[#D4AF37] opacity-60"></div>
              </div>

              <h2 className="font-serif text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-2.5 tracking-tight leading-snug">
                Get <span className="text-[#C59B27] dark:text-[#D4AF37] drop-shadow-[0_0_12px_rgba(212,168,83,0.4)]">15%</span> Off Your First Order
              </h2>

              <p className="text-gray-600 dark:text-[#a3a3a3] text-xs sm:text-sm md:text-base mb-5 tracking-wide flex flex-wrap items-center justify-center gap-1.5">
                <span>Use code</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold tracking-widest bg-[rgba(212,168,83,0.15)] text-[#C59B27] dark:text-[#D4AF37] border border-[rgba(212,168,83,0.4)] shadow-sm">
                  WELCOME15
                </span>
                <span>at checkout</span>
              </p>

              <button 
                className="group flex items-center justify-center gap-2 rounded-full px-7 sm:px-9 py-3 text-xs sm:text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-lg w-full sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #e8c97a 0%, #D4AF37 50%, #b8892f 100%)',
                  color: '#0B0B0B',
                  boxShadow: '0 4px 24px rgba(212, 168, 83, 0.45)',
                }}
              >
                <Gift size={16} strokeWidth={2.2} /> Join Now — It’s Free
              </button>
            </div>

            <div className="hidden md:block relative w-44 h-44 shrink-0 rounded-[16px] overflow-hidden border border-[rgba(212,168,83,0.25)] bg-white dark:bg-[#0d0e12] shadow-md dark:shadow-xl">
              <div className="absolute inset-0 bg-[rgba(212,168,83,0.15)] blur-xl rounded-full pointer-events-none" />
              <Image src="/hero-perfume.png" alt="Promo Perfume Right" fill className="object-contain p-2 drop-shadow-[0_0_20px_rgba(212,168,83,0.35)]" />
            </div>

          </div>
        </div>

        {/* Section Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(212,168,83,0.3)] to-transparent mb-8 sm:mb-12" />

        {/* FOOTER GRID (5 EQUAL COLUMNS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-1 pb-4 border-b border-[rgba(212,168,83,0.15)] sm:border-none sm:pb-0">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-[#C59B27] dark:text-[#D4AF37] tracking-tighter">
                <span className="border-t-2 border-b-2 border-[#D4AF37] px-1">T</span>P
              </span>
              <div className="flex flex-col leading-none">
                <span className="font-serif text-lg sm:text-xl text-gray-900 dark:text-white tracking-widest">TIMO</span>
                <span className="text-[10px] text-[#C59B27] dark:text-[#D4AF37] tracking-[0.2em] uppercase">Perfume</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-[#a3a3a3] mb-5 leading-relaxed">
              Premium fragrances curated for the discerning connoisseur. Experience luxury in every drop.
            </p>
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-gray-900 dark:text-white font-medium">100% Authentic Products</span>
                  <span className="text-[10px] text-gray-500 dark:text-[#737373]">منتجات أصلية 100% بجودة عالية</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Truck size={18} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-gray-900 dark:text-white font-medium">Fast & Secure Delivery</span>
                  <span className="text-[10px] text-gray-500 dark:text-[#737373]">شحن سريع وآمن</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCcw size={18} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <div className="flex flex-col">
                  <span className="text-[13px] text-gray-900 dark:text-white font-medium">Easy Returns</span>
                  <span className="text-[10px] text-gray-500 dark:text-[#737373]">إرجاع سهل وسريع</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Shop */}
          <div className="border-b border-[rgba(212,168,83,0.15)] sm:border-none pb-3 sm:pb-0">
            <button
              onClick={() => toggleSection('shop')}
              className="w-full flex items-center justify-between sm:justify-start gap-2 py-2 sm:py-0 mb-2 sm:mb-6 cursor-pointer focus:outline-none text-left"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs uppercase tracking-[0.25em] text-[#C59B27] dark:text-[#D4AF37] sm:text-gray-900 sm:dark:text-white font-bold">Shop</h4>
                  <span className="sm:hidden text-[11px] text-[#C59B27] dark:text-[#D4AF37] font-medium">• المتجر والعطور</span>
                </div>
                <span className="sm:hidden text-[10px] text-gray-500 dark:text-[#a3a3a3] mt-0.5 font-normal">
                  (جميع العطور، الأكثر مبيعاً، هدايا، رجالي، حريمي)
                </span>
                <div className="hidden sm:block h-0.5 w-6 bg-[#D4AF37] mt-1.5 rounded-full" />
              </div>
              <ChevronDown size={18} className={`sm:hidden text-[#C59B27] dark:text-[#D4AF37] transition-transform duration-300 shrink-0 ${openSection === 'shop' ? 'rotate-180' : ''}`} />
            </button>
            
            <div className={`sm:flex flex-col gap-3 pb-2 sm:pb-0 ${openSection === 'shop' ? 'flex' : 'hidden'}`}>
              <FooterLink href="/products" label="All Perfumes" sublabel="جميع العطور" />
              <FooterLink href="/products?sort=newest" label="New Arrivals" sublabel="وصل حديثاً" />
              <FooterLink href="/products?sort=popular" label="Best Sellers" sublabel="الأكثر مبيعاً" />
              <FooterLink href="/products?category=gift-sets" label="Gift Sets" sublabel="مجموعات الهدايا" />
              <FooterLink href="/products?category=for-him" label="For Him" sublabel="عطور للرجال" />
              <FooterLink href="/products?category=for-her" label="For Her" sublabel="عطور للنساء" />
              <FooterLink href="/products?category=unisex" label="Unisex" sublabel="عطور للجنسين" />
              <FooterLink href="/products?discount=true" label="Offers & Deals" sublabel="العروض والتخفيضات" />
            </div>
          </div>

          {/* Column 3: Account */}
          <div className="border-b border-[rgba(212,168,83,0.15)] sm:border-none pb-3 sm:pb-0">
            <button
              onClick={() => toggleSection('account')}
              className="w-full flex items-center justify-between sm:justify-start gap-2 py-2 sm:py-0 mb-2 sm:mb-6 cursor-pointer focus:outline-none text-left"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs uppercase tracking-[0.25em] text-[#C59B27] dark:text-[#D4AF37] sm:text-gray-900 sm:dark:text-white font-bold">Account</h4>
                  <span className="sm:hidden text-[11px] text-[#C59B27] dark:text-[#D4AF37] font-medium">• حسابك وطلباتك</span>
                </div>
                <span className="sm:hidden text-[10px] text-gray-500 dark:text-[#a3a3a3] mt-0.5 font-normal">
                  (متابعة الطلبات، قائمة المفضلة، العناوين، الحساب)
                </span>
                <div className="hidden sm:block h-0.5 w-6 bg-[#D4AF37] mt-1.5 rounded-full" />
              </div>
              <ChevronDown size={18} className={`sm:hidden text-[#C59B27] dark:text-[#D4AF37] transition-transform duration-300 shrink-0 ${openSection === 'account' ? 'rotate-180' : ''}`} />
            </button>

            <div className={`sm:flex flex-col gap-3 pb-2 sm:pb-0 ${openSection === 'account' ? 'flex' : 'hidden'}`}>
              <FooterLink href="/orders" label="My Orders" sublabel="طلباتي" />
              <FooterLink href="/wishlist" label="Wishlist" sublabel="قائمة المفضلة" />
              <FooterLink href="/orders" label="Track Order" sublabel="تتبع الطلب" />
              <FooterLink href="/profile" label="My Addresses" sublabel="عناويني" />
              <FooterLink href="/profile" label="Account Settings" sublabel="إعدادات الحساب" />
              <FooterLink href="/auth/login" label="Sign In" sublabel="تسجيل الدخول" />
              <FooterLink href="/auth/register" label="Register" sublabel="إنشاء حساب جديد" />
            </div>
          </div>

          {/* Column 4: Support */}
          <div className="border-b border-[rgba(212,168,83,0.15)] sm:border-none pb-3 sm:pb-0">
            <button
              onClick={() => toggleSection('support')}
              className="w-full flex items-center justify-between sm:justify-start gap-2 py-2 sm:py-0 mb-2 sm:mb-6 cursor-pointer focus:outline-none text-left"
            >
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs uppercase tracking-[0.25em] text-[#C59B27] dark:text-[#D4AF37] sm:text-gray-900 sm:dark:text-white font-bold">Support</h4>
                  <span className="sm:hidden text-[11px] text-[#C59B27] dark:text-[#D4AF37] font-medium">• الدعم والمساعدة</span>
                </div>
                <span className="sm:hidden text-[10px] text-gray-500 dark:text-[#a3a3a3] mt-0.5 font-normal">
                  (تواصل معنا، الأسئلة الشائعة، الشحن والإرجاع)
                </span>
                <div className="hidden sm:block h-0.5 w-6 bg-[#D4AF37] mt-1.5 rounded-full" />
              </div>
              <ChevronDown size={18} className={`sm:hidden text-[#C59B27] dark:text-[#D4AF37] transition-transform duration-300 shrink-0 ${openSection === 'support' ? 'rotate-180' : ''}`} />
            </button>

            <div className={`sm:flex flex-col gap-3 pb-2 sm:pb-0 ${openSection === 'support' ? 'flex' : 'hidden'}`}>
              <FooterLink href="/contact" label="Contact Us" sublabel="تواصل معنا" />
              <FooterLink href="/faq" label="FAQs" sublabel="الأسئلة الشائعة" />
              <FooterLink href="/policy/shipping" label="Shipping Policy" sublabel="سياسة الشحن والتوصيل" />
              <FooterLink href="/policy/returns" label="Returns & Refunds" sublabel="الإرجاع والاسترداد" />
              <FooterLink href="/policy/terms" label="Terms & Conditions" sublabel="الشروط والأحكام" />
              <FooterLink href="/policy/privacy" label="Privacy Policy" sublabel="سياسة الخصوصية" />
            </div>
          </div>

          {/* Column 5: Connect */}
          <div>
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2">
                <h4 className="text-xs uppercase tracking-[0.25em] text-[#C59B27] dark:text-[#D4AF37] sm:text-gray-900 sm:dark:text-white font-bold">Connect</h4>
                <span className="sm:hidden text-[11px] text-[#C59B27] dark:text-[#D4AF37] font-medium">• وسائل التواصل</span>
              </div>
              <div className="hidden sm:block h-0.5 w-6 bg-[#D4AF37] mt-1.5 rounded-full" />
            </div>
            
            <div className="flex gap-3 mb-5">
              {[
                { Icon: InstagramIcon, href: 'https://www.instagram.com/timo__perfume_?igsh=YTI5MG41N2E5anBi' },
                { Icon: FacebookIcon, href: 'https://www.facebook.com/share/1DHFiqkYJW/' },
                { Icon: TikTokIcon, href: 'https://www.tiktok.com/@timo.perfume?_r=1&_t=ZS-98XhATxjeFh' },
                { Icon: WhatsAppIcon, href: 'https://wa.me/201008313604' }
              ].map(({ Icon, href }, idx) => (
                <a
                  key={idx}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center w-10 h-10 rounded-full border border-[rgba(212,168,83,0.3)] text-[#C59B27] dark:text-[#D4AF37] bg-white dark:bg-white/5 transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0B0B0B] hover:border-[#D4AF37] hover:scale-110 shadow-sm hover:shadow-[0_0_15px_rgba(212,168,83,0.5)]"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <div className="w-full h-px bg-[rgba(212,168,83,0.15)] mb-5"></div>

            <div className="flex flex-col gap-3 text-xs text-gray-600 dark:text-[#a3a3a3]">
              <a href="mailto:omar0122462356i@gmail.com" className="flex items-center gap-2.5 hover:text-[#C59B27] dark:hover:text-[#D4AF37] transition-colors overflow-hidden">
                <Mail size={16} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <span className="truncate">omar0122462356i@gmail.com</span>
              </a>
              <a href="tel:+201008313604" className="flex items-center gap-2.5 hover:text-[#C59B27] dark:hover:text-[#D4AF37] transition-colors">
                <Phone size={16} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <span>+20 100 831 3604</span>
              </a>
              <div className="flex items-center gap-2.5">
                <MapPin size={16} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                <span>ههيا - الزقازيق، مصر</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM 4-FEATURE PILL ROW (EXACTLY MATCHING MOCKUP DESIGN) */}
        <div className="mb-10 p-3 sm:p-4 rounded-2xl border border-[rgba(212,168,83,0.25)] bg-[#FAF8F5] dark:bg-[#121216] shadow-sm dark:shadow-none grid grid-cols-4 gap-2 sm:gap-4 text-center">
          <div className="flex flex-col items-center justify-center gap-1 p-1 sm:p-2">
            <ShieldCheck size={20} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-white leading-tight">أصلي 100%</span>
            <span className="hidden sm:inline text-[10px] text-gray-500 dark:text-gray-400">منتجات أصلية عالية</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-1 sm:p-2">
            <Truck size={20} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-white leading-tight">توصيل سريع</span>
            <span className="hidden sm:inline text-[10px] text-gray-500 dark:text-gray-400">شحن سريع وآمن</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-1 sm:p-2">
            <RefreshCcw size={20} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-white leading-tight">إرجاع سهل</span>
            <span className="hidden sm:inline text-[10px] text-gray-500 dark:text-gray-400">إرجاع سهل وسريع</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 p-1 sm:p-2">
            <Award size={20} className="text-[#C59B27] dark:text-[#D4AF37] shrink-0" strokeWidth={1.5} />
            <span className="text-[11px] sm:text-xs font-bold text-gray-800 dark:text-white leading-tight">ضمان الجودة</span>
            <span className="hidden sm:inline text-[10px] text-gray-500 dark:text-gray-400">عطور موثوقة 100%</span>
          </div>
        </div>

        {/* STEP 5: PAYMENT METHODS SECTION (APPLE PAY STYLE HORIZONTAL SCROLL ON MOBILE) */}
        <div className="pt-8 border-t border-[rgba(212,168,83,0.15)] mb-10 pb-16 md:pb-0">
          <p className="text-center text-xs font-bold text-[#C59B27] dark:text-[#D4AF37] tracking-[0.25em] uppercase mb-6">
            طرق الدفع المتاحة • PAYMENT METHODS
          </p>

          <div className="max-w-5xl mx-auto flex flex-row overflow-x-auto md:overflow-visible gap-3 md:gap-5 px-4 md:px-0 snap-x snap-mandatory md:snap-none scroll-smooth scroll-pl-4 md:scroll-pl-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden justify-start md:justify-center items-center pb-4 md:pb-0">
            
            {/* Card 1: Vodafone Cash */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedPayment === 'vodafone'}
              onClick={() => setSelectedPayment('vodafone')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPayment('vodafone');
                }
              }}
              className={`group flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-2xl border transition-all duration-300 ease-out backdrop-blur-sm cursor-pointer shrink-0 md:shrink min-w-[220px] max-w-[240px] md:min-w-0 md:max-w-[320px] flex-1 min-h-[80px] md:min-h-[88px] snap-center md:snap-none relative ${
                selectedPayment === 'vodafone'
                  ? 'ring-2 ring-[#D4AF37]/60 border-[#D4AF37] bg-[#FAF5E8] dark:bg-white/10 shadow-md dark:shadow-[0_0_0_1px_rgba(212,175,55,0.4),0_8px_30px_rgba(0,0,0,0.3)]'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-[#FAF8F5] dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.015]'
              } active:scale-[0.96]`}
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#E60000" />
                  <path d="M12 6.5C9.5 6.5 7.5 8.5 7.5 11C7.5 13.5 9.5 15.5 12 15.5C13.4 15.5 14.6 14.9 15.4 14C14.9 14.4 14.2 14.7 13.4 14.7C11.7 14.7 10.3 13.3 10.3 11.6C10.3 9.9 11.7 8.5 13.4 8.5C14.2 8.5 14.9 8.8 15.4 9.2C14.6 8.3 13.4 7.7 12 7.7" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[13px] md:text-sm font-semibold text-gray-900 dark:text-white leading-tight">Vodafone Cash</span>
                <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-tight">فودافون كاش</span>
              </div>
              {selectedPayment === 'vodafone' && (
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#D4AF37] text-[#0B0B0B] flex items-center justify-center shrink-0 animate-in fade-in zoom-in-75 duration-200">
                  <Check size={10} className="md:hidden" strokeWidth={3} />
                  <Check size={12} className="hidden md:block" strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Card 2: InstaPay */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedPayment === 'instapay'}
              onClick={() => setSelectedPayment('instapay')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPayment('instapay');
                }
              }}
              className={`group flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-2xl border transition-all duration-300 ease-out backdrop-blur-sm cursor-pointer shrink-0 md:shrink min-w-[220px] max-w-[240px] md:min-w-0 md:max-w-[320px] flex-1 min-h-[80px] md:min-h-[88px] snap-center md:snap-none relative ${
                selectedPayment === 'instapay'
                  ? 'ring-2 ring-[#D4AF37]/60 border-[#D4AF37] bg-[#FAF5E8] dark:bg-white/10 shadow-md dark:shadow-[0_0_0_1px_rgba(212,175,55,0.4),0_8px_30px_rgba(0,0,0,0.3)]'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-[#FAF8F5] dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.015]'
              } active:scale-[0.96]`}
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <div className="flex items-center gap-[1px]">
                  <span className="text-[#9B36E6] font-black text-xs md:text-[13px] italic leading-none">i</span>
                  <span className="text-[#FF6B2C] font-black text-[9px] md:text-[11px] leading-none tracking-tighter">»</span>
                  <span className="text-[#9B36E6] font-black text-xs md:text-[13px] italic leading-none">P</span>
                </div>
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[13px] md:text-sm font-semibold text-gray-900 dark:text-white leading-tight">InstaPay</span>
                <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-tight">انستا باي</span>
              </div>
              {selectedPayment === 'instapay' && (
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#D4AF37] text-[#0B0B0B] flex items-center justify-center shrink-0 animate-in fade-in zoom-in-75 duration-200">
                  <Check size={10} className="md:hidden" strokeWidth={3} />
                  <Check size={12} className="hidden md:block" strokeWidth={3} />
                </div>
              )}
            </div>

            {/* Card 3: Cash on Delivery */}
            <div
              role="button"
              tabIndex={0}
              aria-pressed={selectedPayment === 'cod'}
              onClick={() => setSelectedPayment('cod')}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedPayment('cod');
                }
              }}
              className={`group flex items-center gap-2.5 md:gap-3 p-3 md:p-4 rounded-2xl border transition-all duration-300 ease-out backdrop-blur-sm cursor-pointer shrink-0 md:shrink min-w-[220px] max-w-[240px] md:min-w-0 md:max-w-[320px] flex-1 min-h-[80px] md:min-h-[88px] snap-center md:snap-none relative ${
                selectedPayment === 'cod'
                  ? 'ring-2 ring-[#D4AF37]/60 border-[#D4AF37] bg-[#FAF5E8] dark:bg-white/10 shadow-md dark:shadow-[0_0_0_1px_rgba(212,175,55,0.4),0_8px_30px_rgba(0,0,0,0.3)]'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] hover:bg-[#FAF8F5] dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 hover:scale-[1.015]'
              } active:scale-[0.96]`}
            >
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={18} className="text-[#C59B27] dark:text-[#D4AF37] md:hidden" strokeWidth={1.75} />
                <ShieldCheck size={20} className="text-[#C59B27] dark:text-[#D4AF37] hidden md:block" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col flex-1 justify-center">
                <span className="text-[13px] md:text-sm font-semibold text-gray-900 dark:text-white leading-tight">Cash on Delivery</span>
                <span className="text-[11px] md:text-xs text-gray-500 dark:text-gray-400 leading-tight">الدفع عند الاستلام</span>
              </div>
              {selectedPayment === 'cod' && (
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-[#D4AF37] text-[#0B0B0B] flex items-center justify-center shrink-0 animate-in fade-in zoom-in-75 duration-200">
                  <Check size={10} className="md:hidden" strokeWidth={3} />
                  <Check size={12} className="hidden md:block" strokeWidth={3} />
                </div>
              )}
            </div>

          </div>

          {/* EXTRA FOOTER LINE BELOW CARDS */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-5">
            Need help? WhatsApp us: <a href="https://wa.me/201008313604" target="_blank" rel="noopener noreferrer" className="text-[#C59B27] dark:text-[#D4AF37] font-semibold hover:underline">01008313604</a> • للمساعدة؟ تواصل معنا عبر الواتساب
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-[rgba(212,168,83,0.15)]">
          <p className="text-xs text-gray-500 dark:text-[#a3a3a3]">
            © {new Date().getFullYear()} Timo Perfume. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-[#a3a3a3]">
            <Shield size={14} className="text-[#C59B27] dark:text-[#D4AF37]" />
            <div className="flex flex-col text-right">
              <span className="text-gray-900 dark:text-white">Secure SSL Encryption</span>
              <span className="text-[10px] opacity-70">اتصال آمن ومشفر</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

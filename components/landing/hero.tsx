"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function LandingHero() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleCtaClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  };

  return (
    <section
      className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 md:pt-44 md:pb-20 overflow-hidden"
      data-purpose="hero-section"
    >
      {/* Interactive & visual floating objects matching inspiration - strictly hidden on mobile/tablet */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        {/* 1. Floating Vintage Bulldog Binder Clip (Top Left) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute -left-2 md:-left-6 xl:-left-8 top-10 sm:top-14 -rotate-12 pointer-events-none z-20 animate-float-slow select-none"
        >
          <div className="relative w-24 h-24 md:w-28 md:h-28 drop-shadow-2xl">
            <img
              alt="Pince bulldog vintage orange"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg"
              src="/assets/binder-clip.jpg"
              loading="lazy"
            />
          </div>
        </div>

        {/* 2. Floating Real Office Pushpin (Top Right) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-4 md:right-8 xl:right-12 top-6 sm:top-8 pointer-events-none z-20 animate-float-obj select-none"
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20 drop-shadow-xl rotate-12">
            <img
              alt="Punaise de bureau rouge réaliste"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-md"
              src="/assets/pushpin.jpg"
              loading="lazy"
            />
          </div>
        </div>

        {/* 3. Floating Real 3D Gold CFA Lion Coin (Middle Left) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute left-2 lg:left-8 top-56 sm:top-64 -rotate-6 pointer-events-none z-20 animate-float-slow select-none"
        >
          <div className="relative w-20 h-20 lg:w-24 lg:h-24 drop-shadow-2xl">
            <img
              alt="Pièce d'or royale CFA 3D"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl"
              src="/assets/gold-coin.jpg"
              loading="lazy"
            />
          </div>
        </div>

        {/* 4. Floating Real Metallic Paperclip / Trombone (Middle Right) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute right-8 md:right-16 xl:right-24 top-48 sm:top-56 rotate-[28deg] pointer-events-none z-20 animate-float-reverse select-none"
        >
          <div className="w-16 h-28 md:w-20 md:h-32 drop-shadow-2xl rotate-12">
            <img
              alt="Trombone métallique en acier réaliste"
              className="w-full h-full object-contain mix-blend-multiply drop-shadow-lg"
              src="/assets/paperclip.jpg"
              loading="lazy"
            />
          </div>
        </div>

        {/* 5. Floating Real 10 000 FCFA Banknotes Stack (Right edge) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute -right-8 xl:right-2 top-72 rotate-[-8deg] pointer-events-none z-10 opacity-95 select-none"
        >
          <div className="relative w-52 sm:w-64 drop-shadow-[0_25px_35px_rgba(0,0,0,0.22)]">
            <img
              alt="Liasse de billets 10 000 FCFA"
              className="w-full h-auto object-contain mix-blend-multiply rounded-lg"
              src="/assets/cfa-cash.jpg"
              loading="lazy"
            />
            {/* Trombone attaché aux billets */}
            <div className="absolute -top-3 right-6 w-12 h-16 pointer-events-none rotate-12 drop-shadow-md">
              <img
                alt="Trombone sur billets"
                className="w-full h-full object-contain mix-blend-multiply"
                src="/assets/paperclip.jpg"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        {/* 6. Floating Invoice status card (Bottom Left) */}
        <div
          aria-hidden="true"
          className="hidden lg:block absolute -left-8 bottom-4 rotate-[12deg] pointer-events-none z-10 select-none opacity-95"
        >
          <div
            className="w-44 sm:w-52 h-28 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xl flex flex-col justify-between invoice-floating-card-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Facture #840
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Statut encaissement</span>
              <span className="font-mono font-extrabold text-sm text-slate-900">
                450 000 FCFA
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full"></div>
            </div>
          </div>
        </div>

        {/* 7. Floating Live Payment Notification Bubble */}
        <div
          className="inline-flex items-center justify-center mb-6 sm:mb-8 relative z-30 px-2"
          data-purpose="notification-message-capsule"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center gap-3 animate-float-slow hover:shadow-xl transition-all max-w-md mx-auto">
            {/* Avatar with micro badge */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                AD
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>
            {/* Sender & Message text */}
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 leading-tight">
                  Aïcha Diallo
                </span>
                <span className="text-[10px] text-slate-400 font-medium">À l'instant</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-tight mt-0.5">
                « C'était la facture la plus facile et rapide que j'ai jamais payée ! »
              </p>
            </div>
          </div>
        </div>

        {/* Bold Dramatic Centered H1 (Mobile First Responsive) */}
        <h1 className="hero-heading font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-[76px] xl:text-[84px] text-[#110829] tracking-tight max-w-4xl mx-auto mb-4 sm:mb-6 text-center leading-[1.12] sm:leading-[1.04] px-4">
          Faites-vous payer immédiatement !
        </h1>

        {/* Centered Responsive Subtitle */}
        <p className="text-sm sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed text-center px-4 mb-7 sm:mb-10">
          La facture la plus rapide d'Afrique. Zéro relance manuelle, encaissement direct en FCFA.
        </p>

        {/* Main Hero CTA Button (Responsive Size & Touch Target) */}
        <div className="flex items-center justify-center px-4 mb-8 sm:mb-10 relative z-20">
          <Link
            href="#interactive-invoice"
            onClick={handleCtaClick}
            className="hero-cta-btn w-full sm:w-auto inline-flex items-center justify-center text-sm sm:text-base font-semibold px-7 sm:px-8 py-3.5 sm:py-4 rounded-full max-w-xs sm:max-w-none shadow-btn-glow transition-all duration-300 hover:scale-105 active:scale-95 gap-2 group cursor-pointer"
            id="hero-main-cta"
          >
            {/* Dynamic click ripples */}
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="ripple-wave"
                style={{
                  left: ripple.x - 20,
                  top: ripple.y - 20,
                  width: 40,
                  height: 40,
                }}
              />
            ))}

            <span>Commencer gratuitement</span>
            <svg
              className="w-4 h-4 fill-none stroke-current stroke-2 cta-arrow-icon"
              viewBox="0 0 24 24"
            >
              <path
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Centered Social Proof Headline */}
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium mb-6 sm:mb-8 leading-normal text-center px-4">
          Adopté par plus de 5 000 entreprises et professionnels indépendants à Dakar, Abidjan, Douala et Lomé.
        </p>

        {/* Infinite Scrolling Partner Marquee (from right to left) */}
        <div className="marquee-container mb-12 sm:mb-16">
          <div className="marquee-track">
            {/* Set 1 */}
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-indigo-600 transition-colors shrink-0">
              <svg className="w-5 h-5 text-sky-500 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12l2.5 3L16 9" fill="white"></path>
              </svg>
              <span className="font-black tracking-tight">Wave</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-0.5">Business</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-orange-600 transition-colors shrink-0">
              <span className="w-4 h-4 rounded-full bg-orange-500 inline-flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </span>
              <span className="font-black">Orange</span>
              <span className="text-xs font-semibold text-slate-500">Money</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-yellow-600 transition-colors shrink-0">
              <span className="w-4 h-4 rounded bg-yellow-400 inline-flex items-center justify-center text-[10px] font-black text-slate-900">M</span>
              <span className="font-black tracking-wider">MTN</span>
              <span className="text-xs font-semibold text-slate-500">MoMo</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-blue-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-blue-700 fill-current" viewBox="0 0 24 24">
                <path d="M4 6h16v3H4zm2 5h12v3H6zm3 5h6v3H9z"></path>
              </svg>
              <span className="font-black">Ecobank</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-emerald-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-emerald-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="font-black tracking-tight">Teranga</span>
              <span className="text-xs text-slate-500 font-medium">SARL</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-indigo-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-indigo-600 fill-current" viewBox="0 0 24 24">
                <rect height="18" rx="4" width="18" x="3" y="3"></rect>
                <path d="M7 12h10M12 7v10" fill="white"></path>
              </svg>
              <span className="font-black tracking-tight">Kora</span>
              <span className="text-xs text-slate-500 font-medium">Logistics</span>
            </div>

            {/* Set 2 (for seamless infinite loop) */}
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-indigo-600 transition-colors shrink-0">
              <svg className="w-5 h-5 text-sky-500 fill-current" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 12l2.5 3L16 9" fill="white"></path>
              </svg>
              <span className="font-black tracking-tight">Wave</span>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-0.5">Business</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-orange-600 transition-colors shrink-0">
              <span className="w-4 h-4 rounded-full bg-orange-500 inline-flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-white"></span>
              </span>
              <span className="font-black">Orange</span>
              <span className="text-xs font-semibold text-slate-500">Money</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-yellow-600 transition-colors shrink-0">
              <span className="w-4 h-4 rounded bg-yellow-400 inline-flex items-center justify-center text-[10px] font-black text-slate-900">M</span>
              <span className="font-black tracking-wider">MTN</span>
              <span className="text-xs font-semibold text-slate-500">MoMo</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-blue-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-blue-700 fill-current" viewBox="0 0 24 24">
                <path d="M4 6h16v3H4zm2 5h12v3H6zm3 5h6v3H9z"></path>
              </svg>
              <span className="font-black">Ecobank</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-emerald-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-emerald-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="font-black tracking-tight">Teranga</span>
              <span className="text-xs text-slate-500 font-medium">SARL</span>
            </div>

            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm sm:text-base tracking-tight hover:text-indigo-700 transition-colors shrink-0">
              <svg className="w-5 h-5 text-indigo-600 fill-current" viewBox="0 0 24 24">
                <rect height="18" rx="4" width="18" x="3" y="3"></rect>
                <path d="M7 12h10M12 7v10" fill="white"></path>
              </svg>
              <span className="font-black tracking-tight">Kora</span>
              <span className="text-xs text-slate-500 font-medium">Logistics</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

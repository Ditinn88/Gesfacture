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
      className="relative pt-32 pb-14 md:pt-44 md:pb-20 overflow-hidden"
      data-purpose="hero-section"
    >
      {/* Interactive & visual floating objects matching inspiration */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        
        {/* 1. Floating Vintage Bulldog Binder Clip (Top Left) */}
        <div
          aria-hidden="true"
          className="hidden sm:block absolute -left-2 md:-left-6 xl:-left-8 top-10 sm:top-14 -rotate-12 pointer-events-none z-20 animate-float-slow select-none"
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
          className="hidden sm:block absolute right-4 md:right-8 xl:right-12 top-6 sm:top-8 pointer-events-none z-20 animate-float-obj select-none"
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
          className="hidden md:block absolute left-2 lg:left-8 top-56 sm:top-64 -rotate-6 pointer-events-none z-20 animate-float-slow select-none"
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
          className="hidden sm:block absolute right-8 md:right-16 xl:right-24 top-48 sm:top-56 rotate-[28deg] pointer-events-none z-20 animate-float-reverse select-none"
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
          className="hidden md:block absolute -right-8 xl:right-2 top-72 rotate-[-8deg] pointer-events-none z-10 opacity-95 select-none"
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
          className="hidden md:block absolute -left-8 bottom-4 rotate-[12deg] pointer-events-none z-10 select-none opacity-95"
        >
          <div
            className="w-44 sm:w-52 h-28 bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-2xl flex flex-col justify-between"
            style={{ boxShadow: "0 22px 40px -10px rgba(0,0,0,0.18)" }}
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
          className="inline-flex items-center justify-center mb-6 sm:mb-8 relative z-30"
          data-purpose="notification-message-capsule"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-lg px-4 py-2 flex items-center gap-3 animate-float-slow hover:shadow-xl transition-all">
            {/* Avatar with micro badge */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
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
              <p className="text-xs text-slate-600 leading-tight mt-0.5">
                « C'était la facture la plus facile et rapide que j'ai jamais payée ! »
              </p>
            </div>
          </div>
        </div>

        {/* Bold Punchy Centered H1 */}
        <h1 className="hero-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-[76px] text-[#110829] tracking-tight max-w-4xl mx-auto mb-4 sm:mb-5 leading-[1.06]">
          Faites-vous payer <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">immédiatement</span>.
        </h1>

        {/* Centered Punchy Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed mb-7 sm:mb-9 px-2">
          Créez et envoyez des factures professionnelles en 30 secondes. Vos clients règlent en un clic via Wave, Orange Money ou MTN. Encaissez directement, sans relance manuelle.
        </p>

        {/* Single Compact & Sleek Capsule CTA Button */}
        <div className="flex items-center justify-center mb-8 sm:mb-10 relative z-20">
          <Link
            href="#interactive-invoice"
            onClick={handleCtaClick}
            className="hero-cta-btn group"
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
              className="w-3.5 h-3.5 fill-none stroke-current stroke-2 cta-arrow-icon"
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
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto font-medium mb-6 sm:mb-8 leading-normal px-4">
          Adopté par plus de 5 000 entreprises et professionnels indépendants à Dakar, Abidjan, Douala et Lomé.
        </p>

        {/* Partner & Corporate Ecosystem Logos Row (Freshworks, Outreach, Pipedrive, Wave, Orange Money, MTN MoMo, Ecobank) */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-80 hover:opacity-100 transition-opacity duration-300 max-w-5xl mx-auto mb-10 sm:mb-14 px-2">
          
          {/* Freshworks Logo */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors py-1 px-2">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="6" r="4" fill="#F48120" />
              <circle cx="26" cy="16" r="4" fill="#E84855" />
              <circle cx="16" cy="26" r="4" fill="#00A887" />
              <circle cx="6" cy="16" r="4" fill="#1C64F2" />
            </svg>
            <span className="font-bold tracking-tight text-sm sm:text-base">freshworks</span>
          </div>

          {/* Outreach Logo */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-[#5932EA] transition-colors py-1 px-2">
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="8" width="3" height="8" rx="1.5" fill="#5932EA" />
              <rect x="8" y="4" width="3" height="16" rx="1.5" fill="#5932EA" />
              <rect x="14" y="2" width="3" height="20" rx="1.5" fill="#5932EA" />
              <rect x="20" y="7" width="3" height="10" rx="1.5" fill="#5932EA" />
            </svg>
            <span className="font-bold tracking-tight text-sm sm:text-base">outreach</span>
          </div>

          {/* Pipedrive Logo */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-[#017737] transition-colors py-1 px-2">
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#017737" />
              <path
                d="M10 7h3.5a3.5 3.5 0 010 7H10v4H8V7h2zm0 5h3.5a1.5 1.5 0 000-3H10v3z"
                fill="white"
              />
            </svg>
            <span className="font-black tracking-tight text-sm sm:text-base">pipedrive</span>
          </div>

          {/* Wave Business */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-sky-600 transition-colors py-1 px-2">
            <svg className="w-5 h-5 text-sky-500 fill-current flex-shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#00D1FF"></circle>
              <path d="M7 12c1.5-2 3-3 5-3s3.5 1 5 3c-1.5 2-3 3-5 3s-3.5-1-5-3z" fill="white"></path>
            </svg>
            <span className="font-black tracking-tight text-sm sm:text-base">
              Wave{" "}
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Business
              </span>
            </span>
          </div>

          {/* Orange Money */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-[#FF7900] transition-colors py-1 px-2">
            <span className="w-4 h-4 rounded-md bg-[#FF7900] inline-flex items-center justify-center flex-shrink-0">
              <span className="w-2 h-2 rounded-full bg-white"></span>
            </span>
            <span className="font-black text-sm sm:text-base">
              Orange <span className="font-semibold text-xs text-slate-500">Money</span>
            </span>
          </div>

          {/* MTN MoMo */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-yellow-600 transition-colors py-1 px-2">
            <span className="w-5 h-4 rounded bg-[#FFCC00] inline-flex items-center justify-center text-[9px] font-black text-[#002B49] flex-shrink-0">
              MoMo
            </span>
            <span className="font-black tracking-wider text-sm sm:text-base">MTN</span>
          </div>

          {/* Ecobank */}
          <div className="flex items-center gap-2 text-slate-700 hover:text-[#005A9C] transition-colors py-1 px-2">
            <svg className="w-5 h-5 text-[#005A9C] fill-current flex-shrink-0" viewBox="0 0 24 24">
              <path d="M4 6h16v3H4zm2 5h12v3H6zm3 5h6v3H9z"></path>
            </svg>
            <span className="font-black text-sm sm:text-base">Ecobank</span>
          </div>

        </div>

      </div>
    </section>
  );
}

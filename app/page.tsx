"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="bg-brand-bgLight text-slate-800 font-sans antialiased selection:bg-brand-primary selection:text-white relative overflow-x-hidden min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-brand-ink text-white px-5 py-3 rounded-2xl shadow-floating-item flex items-center gap-3 border border-white/10 animate-float-1">
          <i className="fa-solid fa-circle-check text-emerald-400 text-lg"></i>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* BEGIN: Ambient Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-indigo-100/60 via-purple-100/40 to-amber-100/40 blur-3xl rounded-full animate-pulse-glow"></div>
      </div>
      {/* END: Ambient Background Glows */}

      {/* BEGIN: MainHeader (Floating Capsule Nav) */}
      <header className="sticky top-5 z-50 px-4 max-w-7xl mx-auto" data-purpose="global-navigation">
        <nav className="backdrop-blur-md bg-white/85 border border-slate-200/80 rounded-full px-6 py-3 shadow-pill flex items-center justify-between transition-all duration-300 hover:shadow-lg">
          {/* Brand Logo */}
          <Link className="flex items-center gap-2 group" data-purpose="brand-logo" href="/">
            <div className="w-9 h-9 rounded-xl bg-brand-ink flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-receipt text-amber-400 text-sm"></i>
            </div>
            <span className="text-xl font-extrabold text-brand-ink tracking-tight">
              izi<span className="text-brand-primary">Facture</span>
            </span>
            <span className="hidden sm:inline-block ml-1 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-brand-primary px-2 py-0.5 rounded-full border border-indigo-200">
              Afrique
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <a className="hover:text-brand-primary transition-colors" href="#fonctionnalites">
              Fonctionnalités
            </a>
            <a className="hover:text-brand-primary transition-colors" href="#comment-ca-marche">
              Comment ça marche
            </a>
            <a className="hover:text-brand-primary transition-colors" href="#tarifs">
              Tarifs
            </a>
            <a className="hover:text-brand-primary transition-colors" href="#temoignages">
              Témoignages
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-brand-primary bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-full transition-colors"
                href="/dashboard"
              >
                <i className="fa-solid fa-chart-pie text-xs"></i>
                <span>Tableau de bord</span>
              </Link>
            ) : (
              <Link
                className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-brand-primary transition-colors"
                href="/login"
              >
                Connexion
              </Link>
            )}

            <Link
              className="bg-brand-ink hover:bg-brand-deep text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-glow-purple transition-all duration-300 transform hover:-translate-y-0.5"
              href="/invoices/new"
            >
              Créer une facture
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 flex items-center justify-center text-slate-700 hover:text-brand-ink rounded-lg focus:outline-none"
              aria-label="Menu de navigation"
            >
              <i className={`fa-solid ${mobileMenuOpen ? "fa-xmark" : "fa-bars"} text-lg`}></i>
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-3xl shadow-soft-card flex flex-col gap-3 text-sm font-semibold text-slate-700 animate-float-1">
            <a
              className="px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-brand-primary transition-colors"
              href="#fonctionnalites"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fonctionnalités
            </a>
            <a
              className="px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-brand-primary transition-colors"
              href="#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
            >
              Comment ça marche
            </a>
            <a
              className="px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-brand-primary transition-colors"
              href="#tarifs"
              onClick={() => setMobileMenuOpen(false)}
            >
              Tarifs
            </a>
            <a
              className="px-3 py-2 rounded-xl hover:bg-indigo-50 hover:text-brand-primary transition-colors"
              href="#temoignages"
              onClick={() => setMobileMenuOpen(false)}
            >
              Témoignages
            </a>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                className="px-3 py-2 text-center rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200"
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                className="px-3 py-2 text-center rounded-xl bg-brand-ink text-white hover:bg-brand-deep"
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
              >
                Tableau de bord
              </Link>
            </div>
          </div>
        )}
      </header>
      {/* END: MainHeader */}

      {/* BEGIN: HeroSection */}
      <main>
        <section className="pt-16 pb-20 px-4 overflow-hidden" data-purpose="hero-section">
          <div className="max-w-6xl mx-auto text-center relative">
            {/* Floating 3D/Paper Elements & Notification Badges */}
            {/* Floating Binder Clip Graphic Left */}
            <div
              className="hidden lg:block absolute -left-6 top-16 -rotate-12 animate-float-1 z-10 pointer-events-none"
              title="Pince à documents"
            >
              <div className="binder-clip flex items-center justify-center">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">CFA</span>
              </div>
            </div>

            {/* Floating Paperclip Graphic Right */}
            <div
              className="hidden lg:block absolute -right-2 top-36 animate-float-2 z-10 pointer-events-none"
              title="Trombone"
            >
              <div className="paper-clip"></div>
            </div>

            {/* Floating Notification 1: Top WhatsApp Bubble */}
            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-soft-card rounded-2xl px-4 py-2.5 mb-8 animate-float-1 max-w-sm sm:max-w-md mx-auto text-left transition-transform hover:scale-105 cursor-default">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-emerald-200">
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full"></span>
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-brand-ink">Aminata K. (Abidjan)</span>
                  <span className="text-[10px] font-medium text-slate-400">à l&apos;instant</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  « Reçu par Wave en 30 secondes. Facture réglée ! ✨ »
                </p>
              </div>
            </div>

            {/* Hero Headlines (Style ultra imposant dark violet) */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-brand-ink tracking-tight leading-[1.08] max-w-4xl mx-auto">
              Fini les factures sur Excel. <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-indigo-600 to-brand-coral">
                Encaissez plus vite.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
              Le logiciel de facturation conforme normes OHADA adapté à l’Afrique. Générez des devis et factures pros, intégrez{" "}
              <span className="font-semibold text-slate-900">Wave</span>,{" "}
              <span className="font-semibold text-slate-900">Orange Money</span> et relancez sur{" "}
              <span className="font-semibold text-slate-900">WhatsApp</span>.
            </p>

            {/* CTA Buttons Group */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                className="w-full sm:w-auto bg-brand-ink hover:bg-brand-deep text-white font-bold px-8 py-4 rounded-full text-base sm:text-lg shadow-floating-item hover:shadow-glow-purple transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-3"
                href="/invoices/new"
              >
                <span>Créer ma facture en 30s</span>
                <i className="fa-solid fa-arrow-right text-sm"></i>
              </Link>
              <Link
                className="w-full sm:w-auto bg-white hover:bg-slate-50 text-brand-ink border border-slate-200/90 font-semibold px-7 py-4 rounded-full text-base shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2"
                href="/dashboard"
              >
                <i className="fa-regular fa-circle-play text-brand-primary"></i>
                <span>Voir la démo (1 min)</span>
              </Link>
            </div>

            {/* Social Proof Micro-Bar */}
            <div className="mt-8 text-xs font-semibold text-slate-500 tracking-wide flex items-center justify-center gap-2">
              <span className="flex -space-x-2">
                <span className="inline-block w-6 h-6 rounded-full bg-indigo-500 border-2 border-white text-white text-[10px] flex items-center justify-center">
                  SN
                </span>
                <span className="inline-block w-6 h-6 rounded-full bg-emerald-500 border-2 border-white text-white text-[10px] flex items-center justify-center">
                  CI
                </span>
                <span className="inline-block w-6 h-6 rounded-full bg-amber-500 border-2 border-white text-white text-[10px] flex items-center justify-center">
                  CM
                </span>
              </span>
              <span>Utilisé par +5 000 indépendants, agences et PME à Dakar, Abidjan et Douala.</span>
            </div>

            {/* BEGIN: Hero Mockup Section (Interactive Invoice Card OHADA compliant) */}
            <div className="mt-14 relative max-w-4xl mx-auto" data-purpose="invoice-preview-card">
              {/* Background decoration rings */}
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-indigo-200/40 rounded-full blur-2xl -z-10"></div>
              <div className="absolute -bottom-10 -right-6 w-48 h-48 bg-amber-200/40 rounded-full blur-3xl -z-10"></div>

              {/* Notification Wave badge floating on mockup */}
              <div className="absolute -top-5 right-4 sm:-right-4 bg-white border border-slate-200/90 shadow-soft-card rounded-2xl px-4 py-2.5 z-20 flex items-center gap-3 animate-float-2 hidden sm:flex">
                <div className="w-8 h-8 rounded-full bg-[#1AA9E8] flex items-center justify-center text-white text-xs font-extrabold shadow-sm">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="text-left text-xs">
                  <p className="font-bold text-brand-ink">Notification Wave</p>
                  <p className="text-emerald-600 font-semibold">+ 354 000 FCFA reçu</p>
                </div>
              </div>

              {/* Main Invoice Preview Canvas */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-soft-card p-6 sm:p-10 text-left relative overflow-hidden transition-all duration-300 hover:shadow-floating-item">
                {/* Top bar: Header & Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold tracking-wider uppercase px-2.5 py-1 bg-indigo-50 text-brand-primary rounded-lg">
                        Facture PRO N° 2024-0418
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Payée via Wave
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-brand-ink mt-2">Dakar Tech Solutions SARL</h3>
                    <p className="text-xs text-slate-500">NINEA : 006492813 • RCCM : SN-DKR-2022-B-1102</p>
                  </div>

                  {/* Action buttons inside invoice */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <Link
                      href="/invoices/new"
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-file-pdf text-rose-500"></i> Télécharger PDF
                    </Link>
                    <button
                      onClick={() => showToast("Lien de relance WhatsApp prêt avec QR code Wave généré !")}
                      className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                      type="button"
                    >
                      <i className="fa-brands fa-whatsapp"></i> Relance WhatsApp
                    </button>
                  </div>
                </div>

                {/* Client & Dates Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-slate-100 text-xs">
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Facturé à</p>
                    <p className="font-bold text-brand-ink text-sm mt-1">Abidjan Logistics &amp; Trade</p>
                    <p className="text-slate-500">Plateau, Imm. Weblogy 4e étage</p>
                    <p className="text-slate-500">Abidjan, Côte d&apos;Ivoire</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">Dates d&apos;émission</p>
                    <p className="font-medium text-slate-700 mt-1">
                      <span className="text-slate-400">Émise :</span> 18 Octobre 2024
                    </p>
                    <p className="font-medium text-slate-700">
                      <span className="text-slate-400">Échéance :</span> Immédiate (Comptant)
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      Moyens de règlement
                    </p>
                    <div className="mt-1 flex sm:justify-end items-center gap-2 font-medium text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-[#009FE3] font-bold text-[11px]">
                        Wave
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-[#FF6600] font-bold text-[11px]">
                        Orange Money
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-yellow-50 text-[#FFCB05] font-bold text-[11px] text-slate-900">
                        MTN MoMo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Code QR de paiement inclus</p>
                  </div>
                </div>

                {/* Itemized Table (OHADA Standards) */}
                <div className="py-6 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 pb-2">
                        <th className="pb-3 font-semibold">Description de la prestation</th>
                        <th className="pb-3 text-center font-semibold">Qté</th>
                        <th className="pb-3 text-right font-semibold">Prix Unitaire (FCFA)</th>
                        <th className="pb-3 text-right font-semibold">Total HT (FCFA)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      <tr>
                        <td className="py-3.5 pr-2">
                          <p className="font-semibold text-brand-ink">Conception UI/UX Application Mobile</p>
                          <p className="text-[11px] text-slate-400">Figma design system + prototypes interactifs</p>
                        </td>
                        <td className="py-3.5 text-center font-medium">1</td>
                        <td className="py-3.5 text-right font-medium">250 000</td>
                        <td className="py-3.5 text-right font-semibold text-brand-ink">250 000</td>
                      </tr>
                      <tr>
                        <td className="py-3.5 pr-2">
                          <p className="font-semibold text-brand-ink">Intégration API Passerelle Mobile Money</p>
                          <p className="text-[11px] text-slate-400">Webhooks Wave CI et Orange Money CI</p>
                        </td>
                        <td className="py-3.5 text-center font-medium">1</td>
                        <td className="py-3.5 text-right font-medium">50 000</td>
                        <td className="py-3.5 text-right font-semibold text-brand-ink">50 000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Payment QR block */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  {/* QR Code Payment African Mobile Money */}
                  <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-full sm:w-auto">
                    <div className="w-14 h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center p-1 shadow-sm">
                      <i className="fa-solid fa-qrcode text-3xl text-brand-ink"></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-brand-ink">Scannez pour payer instantanément</p>
                      <p className="text-[11px] text-slate-500">Compatible Wave, OM CI, MoMo &amp; Cartes Visa</p>
                      <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                        <i className="fa-solid fa-shield-halved mr-1"></i>Paiement OHADA Sécurisé
                      </p>
                    </div>
                  </div>

                  {/* Grand Total Breakdown */}
                  <div className="w-full sm:w-64 space-y-1.5 text-xs text-right">
                    <div className="flex justify-between text-slate-500">
                      <span>Total Brut HT :</span>
                      <span className="font-medium text-slate-800">300 000 FCFA</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>TVA UEMOA (18%) :</span>
                      <span className="font-medium text-slate-800">54 000 FCFA</span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-brand-ink pt-2 border-t border-slate-200">
                      <span>Total TTC :</span>
                      <span className="text-brand-primary">354 000 FCFA</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* END: Hero Mockup Section */}

            {/* BEGIN: Social Proof & Trusted Partners Bar */}
            <div className="mt-16 pt-10 border-t border-slate-200/60 max-w-4xl mx-auto" data-purpose="social-proof-bar">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
                Compatible avec vos modes de paiement et écosystèmes préférés
              </p>
              <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
                {/* Wave */}
                <div className="flex items-center gap-1.5 font-extrabold text-slate-700 text-lg">
                  <span className="w-6 h-6 rounded-full bg-[#1AA9E8] text-white flex items-center justify-center text-xs">
                    <i className="fa-solid fa-water"></i>
                  </span>{" "}
                  Wave
                </div>
                {/* Orange Money */}
                <div className="flex items-center gap-1.5 font-extrabold text-slate-700 text-lg">
                  <span className="w-6 h-6 rounded bg-[#FF6600] text-white flex items-center justify-center text-xs font-mono font-black">
                    OM
                  </span>{" "}
                  Orange Money
                </div>
                {/* MTN MoMo */}
                <div className="flex items-center gap-1.5 font-extrabold text-slate-700 text-lg">
                  <span className="w-6 h-6 rounded bg-[#FFCB05] text-slate-900 flex items-center justify-center text-xs font-bold">
                    <i className="fa-solid fa-mobile-screen"></i>
                  </span>{" "}
                  MTN MoMo
                </div>
                {/* UEMOA / OHADA compliance stamp */}
                <div className="flex items-center gap-1.5 font-extrabold text-slate-700 text-sm tracking-tight border border-slate-300 px-3 py-1 rounded-full">
                  <i className="fa-solid fa-stamp text-brand-primary"></i> Normes OHADA / UEMOA
                </div>
              </div>
            </div>
            {/* END: Social Proof & Trusted Partners Bar */}
          </div>
        </section>
        {/* END: HeroSection */}

        {/* BEGIN: ProblemSection (Pourquoi abandonner Excel) */}
        <section className="py-20 bg-white border-y border-slate-100" data-purpose="problem-section">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-extrabold text-brand-coral bg-orange-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Le cauchemar des créateurs
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mt-3 tracking-tight">
                Pourquoi vos factures Word et Excel vous font perdre de l&apos;argent
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Gérer sa comptabilité sur des tableurs en Afrique est le moyen le plus sûr de se faire oublier par ses débiteurs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl mb-6 font-bold">
                  <i className="fa-solid fa-file-excel"></i>
                </div>
                <h3 className="text-lg font-bold text-brand-ink mb-2">Modèles Excel non crédibles</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Mises en page cassées sur smartphone, logo étiré, oubli des mentions légales sénégalaises ou ivoiriennes. Vos clients tardent à vous prendre au sérieux.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl mb-6 font-bold">
                  <i className="fa-solid fa-calculator"></i>
                </div>
                <h3 className="text-lg font-bold text-brand-ink mb-2">Erreurs TVA 18% &amp; acomptes</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Calcul manuel erroné des taxes locales (TVA, AIRSI, BRS, précomptes fiscaux). Résultat : des redressements évitables et des conflits lors des déclarations.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xl mb-6 font-bold">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <h3 className="text-lg font-bold text-brand-ink mb-2">Impayés &amp; relances oubliées</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Vous avez honte de réclamer ou vous oubliez quelle facture est échue. Sans lien Wave direct, le client repousse toujours le virement à demain.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: ProblemSection */}

        {/* BEGIN: FeaturesSection */}
        <section className="py-24 px-4 bg-brand-bgLight" data-purpose="features-section" id="fonctionnalites">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold text-brand-primary bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Fonctionnalités Clés
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mt-3 tracking-tight">
                Pensé exclusivement pour la réalité des affaires en Afrique
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Toutes les options indispensables pour éditer, envoyer et encaisser en FCFA sans prise de tête.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card hover:shadow-floating-item transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-primary flex items-center justify-center text-xl mb-5 font-bold">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <h3 className="text-xl font-bold text-brand-ink mb-3">Factures professionnelles en 2 clics</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Créez un devis, transformez-le en facture définitive dès accord client. Vos couleurs d&apos;entreprise, votre logo, le tampon numérique et vos coordonnées bancaires &amp; Mobile Money intégrés.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Export PDF haute définition
                  </span>
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Multi-devises (XOF, XAF, EUR, USD)
                  </span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card hover:shadow-floating-item transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-brand-emerald flex items-center justify-center text-xl mb-5 font-bold">
                    <i className="fa-solid fa-percent"></i>
                  </div>
                  <h3 className="text-xl font-bold text-brand-ink mb-3">Calcul automatique TVA 18% &amp; taxes OHADA</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Ne vous trompez plus jamais. Définissez si vous êtes assujetti ou non, iziFacture gère automatiquement la TVA à 18% (zone UEMOA / CEMAC), les retenues à la source et les timbres fiscaux.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Conforme DGI Sénégal &amp; CI
                  </span>
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Rapports exports comptables
                  </span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card hover:shadow-floating-item transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-xl mb-5 font-bold">
                    <i className="fa-solid fa-qrcode"></i>
                  </div>
                  <h3 className="text-xl font-bold text-brand-ink mb-3">Paiement Mobile Money direct (Wave, OM, MoMo)</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    Chaque facture génère automatiquement un QR Code et un lien cliquable de paiement Wave et Orange Money. Votre client clique sur son smartphone et règle en un clin d’œil.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Confirmation instantanée
                  </span>
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>0% commission prélevée
                  </span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card hover:shadow-floating-item transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl mb-5 font-bold">
                    <i className="fa-brands fa-whatsapp"></i>
                  </div>
                  <h3 className="text-xl font-bold text-brand-ink mb-3">Envoi &amp; relances automatiques sur WhatsApp</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    En Afrique, personne ne consulte ses emails le week-end. Envoyez le lien de facture directement sur WhatsApp et programmez des rappels amicaux avant l’échéance.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Taux d&apos;ouverture 98%
                  </span>
                  <span className="font-semibold">
                    <i className="fa-solid fa-check text-emerald-500 mr-2"></i>Messages pré-rédigés courtois
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: FeaturesSection */}

        {/* BEGIN: HowItWorksSection */}
        <section className="py-24 bg-white border-y border-slate-100" data-purpose="how-it-works-section" id="comment-ca-marche">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold text-brand-primary bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Simplicité Absolue
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mt-3 tracking-tight">
                Comment ça marche ? En 3 étapes chrono.
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Aucune compétence en comptabilité n&apos;est requise. Prise en main en 2 minutes.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Step 1 */}
              <div className="relative bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 text-left">
                <div className="w-12 h-12 rounded-2xl bg-brand-ink text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md">
                  1
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-2">Créez votre profil pro</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Renseignez votre nom commercial, votre NINEA ou RCCM, téléchargez votre logo et précisez vos numéros Wave / Mobile Money.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 text-left">
                <div className="w-12 h-12 rounded-2xl bg-brand-primary text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-indigo-200">
                  2
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-2">Éditez votre facture</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Sélectionnez votre client, ajoutez vos prestations en FCFA. La TVA (18%) et les totaux se calculent instantanément sans formule complexe.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative bg-brand-bgLight rounded-3xl p-8 border border-slate-200/80 text-left">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-extrabold text-lg flex items-center justify-center mb-6 shadow-md shadow-emerald-200">
                  3
                </div>
                <h3 className="text-xl font-bold text-brand-ink mb-2">Partagez et encaissez</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Envoyez le lien interactif par WhatsApp ou téléchargez le PDF conforme. Votre client règle par Wave ou virement et vous recevez une alerte.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* END: HowItWorksSection */}

        {/* BEGIN: TestimonialsSection */}
        <section className="py-24 bg-brand-bgLight" data-purpose="testimonials-section" id="temoignages">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold text-brand-emerald bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Avis Clients
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mt-3 tracking-tight">
                Ils ont divisé par 3 leurs délais de paiement
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Découvrez les retours d&apos;expérience d&apos;entrepreneurs locaux satisfaits.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 text-sm mb-4">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    « Avant, je perdais des demi-journées à recalculer la TVA sur Excel pour mes clients aux Almadies. Avec iziFacture, j&apos;envoie le lien WhatsApp avec QR code Wave directement après le shooting. Mes règlements arrivent le jour même. »
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-brand-primary text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    AD
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-ink text-sm">Aminata Diallo</h4>
                    <p className="text-xs text-slate-500">Photographe &amp; Directrice Créative • Dakar</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 text-sm mb-4">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    « Notre cabinet de conseil à Abidjan devait sans cesse justifier des retenues AIRSI et des acomptes. iziFacture intègre parfaitement le droit OHADA. Le support est ultra réactif et comprend nos enjeux en Afrique de l&apos;Ouest. »
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    KJ
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-ink text-sm">Kouamé Jean-Yves</h4>
                    <p className="text-xs text-slate-500">Fondateur, Ivoire Consult • Abidjan</p>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft-card flex flex-col justify-between">
                <div>
                  <div className="flex text-amber-400 text-sm mb-4">
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                    <i className="fa-solid fa-star"></i>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                    « Finis les impayés qui traînent 3 mois à Douala ! La fonctionnalité de relance automatique WhatsApp polie et sans agressivité fait toute la différence. On a récupéré plus d&apos;un million de FCFA d&apos;impayés le premier mois. »
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-11 h-11 rounded-full bg-brand-coral text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    MN
                  </div>
                  <div>
                    <h4 className="font-bold text-brand-ink text-sm">Marcelle Nguemo</h4>
                    <p className="text-xs text-slate-500">Gérante, Digital Boost Agency • Douala</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END: TestimonialsSection */}

        {/* BEGIN: PricingSection */}
        <section className="py-24 bg-white border-y border-slate-100" data-purpose="pricing-section" id="tarifs">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-extrabold text-brand-primary bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Tarification Claire en FCFA
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-ink mt-3 tracking-tight">
                Un abonnement rentable dès votre première facture
              </h2>
              <p className="text-slate-600 mt-3 text-base">
                Payable par Wave, Orange Money ou Carte Bancaire locale. Zéro mauvaise surprise.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Plan 1: Gratuit */}
              <div className="bg-brand-bgLight rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-ink">Gratuit</h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      Démarrage
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-brand-ink">0</span>
                    <span className="text-slate-500 font-semibold text-sm"> FCFA / mois</span>
                    <p className="text-xs text-slate-400 mt-1">Pour tester et facturer occasionnellement.</p>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Jusqu&apos;à 3 factures par mois
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Export PDF standard
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Calcul automatique TVA 18%
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-400">
                      <i className="fa-solid fa-xmark text-slate-300"></i> QR Code Wave &amp; Mobile Money
                    </li>
                    <li className="flex items-center gap-2.5 text-slate-400">
                      <i className="fa-solid fa-xmark text-slate-300"></i> Relances automatiques WhatsApp
                    </li>
                  </ul>
                </div>
                <Link
                  className="w-full text-center py-3.5 px-6 rounded-full border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm transition-colors block"
                  href="/invoices/new"
                >
                  Commencer gratuitement
                </Link>
              </div>

              {/* Plan 2: Pro (Featured - Dark Contrast) */}
              <div className="relative bg-brand-ink text-white rounded-3xl p-8 shadow-floating-item flex flex-col justify-between transform md:-translate-y-4 border-2 border-brand-primary">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-primary to-indigo-500 text-white text-[11px] font-extrabold uppercase tracking-wider px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                  Plus Populaire 🔥
                </div>
                <div>
                  <div className="flex justify-between items-center mb-4 mt-2">
                    <h3 className="text-xl font-bold text-white">Pro Entrepreneur</h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/10 text-emerald-400 rounded-full">
                      Recommandé
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-white">5 000</span>
                    <span className="text-slate-300 font-semibold text-sm"> FCFA / mois</span>
                    <p className="text-xs text-slate-300 mt-1">Idéal pour freelances, consultants &amp; artisans.</p>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-200 font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-400"></i> <strong>Factures &amp; Devis illimités</strong>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-400"></i> <strong>Lien et QR Code Wave &amp; OM</strong>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-400"></i> Envoi direct sur WhatsApp
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-400"></i> Personnalisation logo &amp; couleurs
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-400"></i> Statut paiement en temps réel
                    </li>
                  </ul>
                </div>
                <Link
                  className="w-full text-center py-4 px-6 rounded-full bg-brand-primary hover:bg-indigo-600 text-white font-bold text-sm shadow-glow-purple transition-all duration-300 block"
                  href="/signup"
                >
                  Essayer 14 jours gratuits
                </Link>
              </div>

              {/* Plan 3: Business */}
              <div className="bg-brand-bgLight rounded-3xl p-8 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-brand-ink">PME / Business</h3>
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      Équipe
                    </span>
                  </div>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-brand-ink">15 000</span>
                    <span className="text-slate-500 font-semibold text-sm"> FCFA / mois</span>
                    <p className="text-xs text-slate-400 mt-1">Pour les structures établies et cabinets.</p>
                  </div>
                  <ul className="space-y-3.5 text-xs text-slate-600 font-medium mb-8">
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Tout ce qui est inclus dans le plan Pro
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Multi-utilisateurs (jusqu&apos;à 5 accès)
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Export comptable OHADA complet
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Relances WhatsApp automatiques programmées
                    </li>
                    <li className="flex items-center gap-2.5">
                      <i className="fa-solid fa-check text-emerald-500"></i> Support téléphonique VIP prioritaire
                    </li>
                  </ul>
                </div>
                <Link
                  className="w-full text-center py-3.5 px-6 rounded-full border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 text-sm transition-colors block"
                  href="/signup"
                >
                  Choisir Business
                </Link>
              </div>
            </div>
          </div>
        </section>
        {/* END: PricingSection */}

        {/* BEGIN: FinalCTASection */}
        <section className="py-20 px-4 bg-brand-bgLight relative" data-purpose="final-cta">
          <div className="max-w-5xl mx-auto rounded-3xl bg-brand-ink text-white p-10 sm:p-16 text-center relative overflow-hidden shadow-floating-item">
            {/* Background radial flare */}
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-primary/40 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl mx-auto">
              <span className="text-xs font-extrabold tracking-wider uppercase px-3 py-1 bg-white/10 text-amber-300 rounded-full">
                Prêt en moins de 60 secondes
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-6 tracking-tight leading-tight">
                Rejoignez les entrepreneurs qui facturent comme des pros.
              </h2>
              <p className="mt-4 text-slate-300 text-base sm:text-lg">
                Créez votre première facture gratuitement, sans carte bancaire requise. Commencez à encaisser en FCFA dès aujourd&apos;hui.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  className="w-full sm:w-auto bg-brand-primary hover:bg-indigo-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-glow-purple transition-all duration-300 transform hover:-translate-y-0.5 block"
                  href="/invoices/new"
                >
                  Commencer gratuitement maintenant
                </Link>
                <a
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-4 rounded-full text-base transition-colors flex items-center justify-center gap-2"
                  href="https://wa.me/221770000000?text=Bonjour%20iziFacture%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20votre%20logiciel."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-whatsapp text-emerald-400 text-lg"></i>
                  <span>Discuter avec notre équipe</span>
                </a>
              </div>
              <p className="mt-6 text-xs text-slate-400">
                <i className="fa-solid fa-lock mr-1"></i> Données hébergées en toute sécurité conformément aux réglementations de protection des données privées.
              </p>
            </div>
          </div>
        </section>
        {/* END: FinalCTASection */}
      </main>

      {/* BEGIN: MainFooter */}
      <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600 text-xs" data-purpose="site-footer">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
            {/* Brand Description */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-ink flex items-center justify-center text-white font-extrabold text-base">
                  <i className="fa-solid fa-receipt text-amber-400 text-xs"></i>
                </div>
                <span className="text-lg font-extrabold text-brand-ink tracking-tight">
                  izi<span className="text-brand-primary">Facture</span>
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed">
                La solution logicielle de facturation et recouvrement nouvelle génération dédiée aux indépendants, agences et PME en Afrique de l&apos;Ouest et Centrale.
              </p>
              <div className="flex items-center gap-3 text-slate-400 pt-2">
                <a
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-primary hover:text-white flex items-center justify-center transition-colors"
                  href="#"
                >
                  <i className="fa-brands fa-linkedin-in text-sm"></i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-primary hover:text-white flex items-center justify-center transition-colors"
                  href="#"
                >
                  <i className="fa-brands fa-x-twitter text-sm"></i>
                </a>
                <a
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-brand-primary hover:text-white flex items-center justify-center transition-colors"
                  href="#"
                >
                  <i className="fa-brands fa-facebook-f text-sm"></i>
                </a>
              </div>
            </div>

            {/* Links Col 1 */}
            <div>
              <h4 className="font-bold text-brand-ink uppercase tracking-wider text-xs mb-4">Produit</h4>
              <ul className="space-y-2.5 font-medium">
                <li>
                  <Link className="hover:text-brand-primary transition-colors" href="/invoices/new">
                    Modèles de factures OHADA
                  </Link>
                </li>
                <li>
                  <a className="hover:text-brand-primary transition-colors" href="#fonctionnalites">
                    Paiement Wave &amp; Mobile Money
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-primary transition-colors" href="#fonctionnalites">
                    Relances WhatsApp
                  </a>
                </li>
                <li>
                  <a className="hover:text-brand-primary transition-colors" href="#fonctionnalites">
                    Calculateur TVA 18%
                  </a>
                </li>
                <li>
                  <Link className="hover:text-brand-primary transition-colors" href="/invoices">
                    Registre des créances
                  </Link>
                </li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h4 className="font-bold text-brand-ink uppercase tracking-wider text-xs mb-4">Pays Supportés</h4>
              <ul className="space-y-2.5 font-medium">
                <li>
                  <span className="text-slate-600">Sénégal (Dakar, Thiès)</span>
                </li>
                <li>
                  <span className="text-slate-600">Côte d&apos;Ivoire (Abidjan, San Pedro)</span>
                </li>
                <li>
                  <span className="text-slate-600">Cameroun (Douala, Yaoundé)</span>
                </li>
                <li>
                  <span className="text-slate-600">Bénin, Togo, Mali, Burkina Faso</span>
                </li>
              </ul>
            </div>

            {/* Links Col 3 */}
            <div>
              <h4 className="font-bold text-brand-ink uppercase tracking-wider text-xs mb-4">Légal &amp; Contact</h4>
              <ul className="space-y-2.5 font-medium">
                <li>
                  <Link className="hover:text-brand-primary transition-colors" href="/login">
                    Espace Membres
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-brand-primary transition-colors" href="/signup">
                    Créer un compte
                  </Link>
                </li>
                <li>
                  <a className="hover:text-brand-primary transition-colors" href="#tarifs">
                    Conformité Fiscale UEMOA
                  </a>
                </li>
                <li>
                  <a
                    className="hover:text-brand-primary transition-colors"
                    href="https://wa.me/221770000000"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Support Client WhatsApp 24/7
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© 2024–2026 iziFacture Technologies. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5 font-medium">
              Fait avec fierté et passion en Afrique <span className="text-base">🌍</span>
            </p>
          </div>
        </div>
      </footer>
      {/* END: MainFooter */}
    </div>
  );
}

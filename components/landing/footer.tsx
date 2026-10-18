"use client";

import React, { useState } from "react";
import Link from "next/link";

export function LandingFooter() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;

    setSubscribed(true);
    setNewsletterEmail("");
    setTimeout(() => setSubscribed(false), 3500);
  };

  return (
    <footer
      className="bg-slate-100 border-t border-slate-200/90 pt-14 sm:pt-16 pb-12 text-slate-600"
      data-purpose="page-footer"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Pre-footer Trust & Security Cards Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12 pb-10 border-b border-slate-200">
          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 leading-tight">Conforme SYSCOHADA</p>
              <p className="text-[11px] text-slate-500">Mentions & QR Code certifiés DGI</p>
            </div>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 leading-tight">Chiffrement SSL 256-bit</p>
              <p className="text-[11px] text-slate-500">Protection bancaire maximale</p>
            </div>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 leading-tight">99.98% Disponibilité</p>
              <p className="text-[11px] text-slate-500">Infrastructure cloud résiliente</p>
            </div>
          </div>

          <div className="bg-white/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
            </div>
            <div>
              <p className="font-bold text-xs text-slate-900 leading-tight">Zone FCFA & Devises</p>
              <p className="text-[11px] text-slate-500">XOF, XAF, EUR (€), USD ($)</p>
            </div>
          </div>
        </div>

        {/* Main Footer Columns Grid (6 columns on lg) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 sm:gap-10 pb-12 border-b border-slate-200">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 pr-0 lg:pr-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-deep flex items-center justify-center text-white font-bold text-sm shadow-sm">
                GF
              </div>
              <span className="font-bold text-xl tracking-tight text-[#110829]">
                Ges<span className="text-indigo-600">Facture</span>
              </span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full ml-1">
                Fintech UEMOA
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-5 max-w-sm">
              La solution de facturation et d'encaissement instantané conçue pour libérer la trésorerie des PME, indépendants et créateurs d'Afrique francophone.
            </p>

            {/* Live system status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-xs mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Tous les systèmes opérationnels</span>
            </div>

            {/* Newsletter Form */}
            <div>
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Veille fiscale & Modèles gratuits
              </span>
              <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="votre-email@entreprise.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400 font-medium"
                  aria-label="Email veille fiscale"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 text-xs font-bold text-white bg-brand-deep hover:bg-brand-primary rounded-xl transition-colors whitespace-nowrap shadow-sm hover:scale-[1.02] active:scale-95"
                >
                  S'abonner
                </button>
              </form>
              {subscribed && (
                <p className="text-[11px] text-emerald-600 font-semibold mt-1.5">
                  ✓ Merci pour votre inscription ! Vous recevrez nos guides fiscaux.
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-1.5">Garanti sans spam. Désinscription en 1 clic.</p>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Produit
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><a className="hover:text-brand-deep transition-colors" href="#interactive-invoice">Générateur de devis & factures</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#fonctionnalites">Paiements Wave & MoMo</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#fonctionnalites">Relances auto WhatsApp</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#tarifs">Tarifs & Devises</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#interactive-invoice">Calculateur TVA 18%</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#fonctionnalites">QR Code certifié DGI</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#fonctionnalites">Suivi des encaissements</a></li>
            </ul>
          </div>

          {/* Use Cases Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Cas d'usage
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Freelances & Indépendants</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Agences de communication</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Cabinets d'avocats & Conseil</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Boutiques & E-commerce</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Transport & Logistique</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">PME & Sociétés SARL</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#temoignages">Artisans & BTP</a></li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Ressources
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><a className="hover:text-brand-deep transition-colors" href="#comment-ca-marche">Guide fiscal UEMOA 2026</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#comment-ca-marche">Modèles Excel téléchargeables</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#comment-ca-marche">Comparatif frais Mobile Money</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#fonctionnalites">Export comptable SYSCOHADA</a></li>
              <li><Link className="hover:text-brand-deep transition-colors" href="/login">API Développeurs & Webhooks</Link></li>
              <li><Link className="hover:text-brand-deep transition-colors" href="/login">Centre d'aide & FAQ</Link></li>
              <li><Link className="hover:text-brand-deep transition-colors" href="/login">Webinaires de formation</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
              Légal & Société
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li><a className="hover:text-brand-deep transition-colors" href="#">Mentions légales</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Protection des données (CDP)</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Sécurité & Conformité PCI</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Conditions Générales (CGU)</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Accord de niveau de service (SLA)</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Nous recrutons 🚀</a></li>
              <li><a className="hover:text-brand-deep transition-colors" href="#">Contact presse</a></li>
            </ul>
          </div>

        </div>

        {/* Payment Methods & Currency Support Strip */}
        <div className="py-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Moyens de paiement acceptés :</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-sky-600 font-bold text-[11px]">Wave</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-orange-600 font-bold text-[11px]">Orange Money</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-yellow-600 font-bold text-[11px]">MTN MoMo</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-blue-700 font-bold text-[11px]">Moov Money</span>
              <span className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">Visa / Mastercard</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Devises :</span>
            <div className="flex items-center gap-1.5 text-slate-600 font-medium text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">XOF (FCFA)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">XAF (FCFA)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">EUR (€)</span>
              <span className="px-2 py-0.5 rounded bg-white border border-slate-200">USD ($)</span>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div className="flex flex-wrap items-center gap-3 text-center md:text-left">
            <span>© 2026 GesFacture Inc. Tous droits réservés.</span>
            <span>•</span>
            <span className="font-medium text-slate-700">
              Fait avec passion pour les bâtisseurs du continent africain 🌍
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1 rounded-lg text-slate-700 font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>BCEAO • BEAC • OHADA</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 font-semibold">
              <a className="hover:text-brand-deep transition-colors" href="#">
                LinkedIn
              </a>
              <span>•</span>
              <a className="hover:text-brand-deep transition-colors" href="#">
                Twitter / X
              </a>
              <span>•</span>
              <a className="hover:text-brand-deep transition-colors" href="#">
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export function Pricing() {
  const { openAuthModal } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section
      className="py-16 sm:py-24 bg-white border-t border-neutral-100"
      data-purpose="pricing-plans"
      id="tarifs"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <span className="text-xs font-bold text-brand-deep uppercase tracking-widest bg-brand-soft px-3 py-1 rounded-full">
            Tarification transparente
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-4 mb-4 tracking-tight">
            Choisissez la formule adaptée à votre activité
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base mb-8">
            Pas de frais cachés. Annulez ou changez de forfait à tout moment.
          </p>

          {/* Billing Period Toggle */}
          <div
            className="inline-flex items-center bg-neutral-100 p-1.5 rounded-full border border-neutral-200"
            data-purpose="pricing-frequency-toggle"
          >
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                !isYearly
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-neutral-500 hover:text-brand-navy"
              }`}
            >
              Facturation mensuelle
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isYearly
                  ? "bg-white text-brand-navy shadow-sm"
                  : "text-neutral-500 hover:text-brand-navy"
              }`}
            >
              <span>Annuel</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-md lg:max-w-none mx-auto">
          
          {/* Plan Gratuit */}
          <div className="bg-brand-surface rounded-3xl p-7 sm:p-8 border border-neutral-200 flex flex-col justify-between card-hover-lift">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Gratuit
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Starter</h3>
              <p className="text-xs text-neutral-500 mb-6">
                Idéal pour les indépendants qui débutent.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-brand-navy">0</span>
                <span className="text-sm font-semibold text-neutral-500">
                  {" "}GNF / mois
                </span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-600">
                <li className="flex items-center gap-2">✓ Jusqu'à 5 factures / mois</li>
                <li className="flex items-center gap-2">✓ 1 compte utilisateur</li>
                <li className="flex items-center gap-2">✓ Calcul auto TVA 18%</li>
                <li className="flex items-center gap-2">✓ Export PDF standard</li>
                <li className="flex items-center gap-2 text-neutral-400">
                  ✕ Liens de paiement Mobile Money
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="block w-full text-center py-3 px-4 rounded-xl font-semibold text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Commencer gratuitement
              </button>
            </div>
          </div>

          {/* Plan Pro (Featured) */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border-2 border-neutral-900 shadow-pro-highlight relative flex flex-col justify-between -translate-y-0 lg:-translate-y-2 card-hover-lift">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-deep text-white text-[11px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-md whitespace-nowrap">
              Recommandé
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-900 block mb-2">
                Professionnel
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">Pro Business</h3>
              <p className="text-xs text-neutral-500 mb-6">
                Pour les freelances actifs et TPE en croissance.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-brand-navy">
                  {isYearly ? "24 000" : "30 000"}
                </span>
                <span className="text-sm font-semibold text-neutral-500">
                  {" "}GNF / mois
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {isYearly
                    ? "288 000 GNF facturés annuellement (économisez 20%)"
                    : "Facturé mensuellement"}
                </p>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-700">
                <li className="flex items-center gap-2 font-medium">
                  ✓ <strong>Factures &amp; Devis illimités</strong>
                </li>
                <li className="flex items-center gap-2 font-medium">
                  ✓ Paiements Wave &amp; Orange Money
                </li>
                <li className="flex items-center gap-2 font-medium">
                  ✓ Relances automatiques WhatsApp
                </li>
                <li className="flex items-center gap-2 font-medium">
                  ✓ Personnalisation totale à votre marque
                </li>
                <li className="flex items-center gap-2 font-medium">
                  ✓ QR Code de validation certifié
                </li>
                <li className="flex items-center gap-2 font-medium">
                  ✓ Support WhatsApp prioritaire
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="block w-full text-center py-3.5 px-4 rounded-xl font-bold text-sm bg-brand-deep hover:bg-brand-primary text-white shadow-btn-glow transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                Essayer 14 jours gratuits
              </button>
            </div>
          </div>

          {/* Plan Business */}
          <div className="bg-brand-surface rounded-3xl p-7 sm:p-8 border border-neutral-200 flex flex-col justify-between card-hover-lift">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2">
                Entreprise
              </span>
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                Cabinet &amp; SARL
              </h3>
              <p className="text-xs text-neutral-500 mb-6">
                Pour les structures établies et équipes commerciales.
              </p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-brand-navy">
                  {isYearly ? "72 000" : "90 000"}
                </span>
                <span className="text-sm font-semibold text-neutral-500">
                  {" "}GNF / mois
                </span>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                  {isYearly
                    ? "864 000 GNF facturés annuellement (économisez 20%)"
                    : "Facturé mensuellement"}
                </p>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-neutral-600">
                <li className="flex items-center gap-2">✓ Tout le forfait Pro inclus</li>
                <li className="flex items-center gap-2">✓ Multi-utilisateurs (jusqu'à 10)</li>
                <li className="flex items-center gap-2">✓ Gestion multi-entreprises</li>
                <li className="flex items-center gap-2">✓ Export comptable SYSCOHADA</li>
                <li className="flex items-center gap-2">✓ Clé API &amp; Webhooks sur mesure</li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <button
                type="button"
                onClick={() => openAuthModal("signup")}
                className="block w-full text-center py-3 px-4 rounded-xl font-semibold text-sm border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Contacter les ventes
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

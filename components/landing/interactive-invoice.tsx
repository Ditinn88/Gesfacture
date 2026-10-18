"use client";

import React, { useState, useMemo } from "react";

interface InvoiceItem {
  id: string;
  title: string;
  subtitle: string;
  quantity: number;
  unitPrice: number;
}

type Currency = "FCFA" | "EUR" | "USD";

const currencySymbols: Record<Currency, string> = {
  FCFA: "FCFA",
  EUR: "€",
  USD: "$",
};

export function InteractiveInvoice() {
  const [currency, setCurrency] = useState<Currency>("FCFA");
  const [copied, setCopied] = useState(false);

  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      title: "Conception identité visuelle & UI Kit",
      subtitle: "Design système Figma, livrables haute résolution",
      quantity: 1,
      unitPrice: 350000,
    },
    {
      id: "item-2",
      title: "Développement Frontend Webflow / Tailwind",
      subtitle: "Intégration responsive & optimisation SEO mobile",
      quantity: 2,
      unitPrice: 150000,
    },
  ]);

  const handleQuantityChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, qty || 1) } : item
      )
    );
  };

  const handlePriceChange = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, unitPrice: Math.max(0, price || 0) } : item
      )
    );
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(val));
  };

  const { subtotal, tva, totalTTC } = useMemo(() => {
    const sub = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
    const tax = sub * 0.18; // 18% UEMOA standard VAT
    return {
      subtotal: sub,
      tva: tax,
      totalTTC: sub + tax,
    };
  }, [items]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText("https://gesfacture.app/pay/inv_2026_084");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <div
      className="mt-6 sm:mt-10 text-left max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-5 sm:p-10 relative invoice-preview-card"
      data-purpose="interactive-dashboard-mockup"
      id="interactive-invoice"
    >
      {/* Real Metallic Paperclip pinned to the top of the invoice */}
      <div
        aria-hidden="true"
        className="absolute -top-5 right-12 w-10 h-20 pointer-events-none rotate-[8deg] z-30 drop-shadow-xl select-none hidden sm:block"
      >
        <img
          alt="Trombone réel fixé sur la facture"
          className="w-full h-full object-contain mix-blend-multiply"
          src="/assets/paperclip.jpg"
          loading="lazy"
        />
      </div>

      {/* Mockup Header Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-5 sm:pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-deep text-white flex items-center justify-center font-bold text-lg shadow-sm">
            GF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                FACTURE N° 2026-084
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                Prête à envoyer
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Émise aujourd'hui • Échéance: à réception
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          {(["FCFA", "EUR", "USD"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`currency-btn px-3 py-1.5 rounded-lg transition-all ${
                currency === c
                  ? "active bg-white text-brand-navy shadow-sm"
                  : "text-slate-500 hover:text-brand-navy"
              }`}
            >
              {c === "FCFA" ? "FCFA (XOF)" : c === "EUR" ? "EUR (€)" : "USD ($)"}
            </button>
          ))}
        </div>
      </div>

      {/* Billing Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-5 sm:my-6 text-sm">
        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Émetteur
          </span>
          <p className="font-bold text-slate-900">Studio Teranga Creatives SARL</p>
          <p className="text-slate-500 text-xs">
            NINEA : 009234812 2V3 • Dakar, Sénégal
          </p>
          <p className="text-slate-500 text-xs">contact@studioteranga.sn</p>
        </div>

        <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Client Facturé
          </span>
          <p className="font-bold text-slate-900">Kora Logistics Côte d'Ivoire</p>
          <p className="text-slate-500 text-xs">Abidjan, Cocody Riviera 3</p>
          <p className="text-slate-500 text-xs">finance@koralogistics.ci</p>
        </div>
      </div>

      {/* Interactive Table with mobile overflow scroll */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <th className="py-3 pr-4">Description de la prestation</th>
              <th className="py-3 px-3 text-center w-24">Quantité</th>
              <th className="py-3 px-3 text-right w-36">Prix Unit. HT</th>
              <th className="py-3 pl-3 text-right w-36">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const rowTotal = item.quantity * item.unitPrice;
              return (
                <tr key={item.id}>
                  <td className="py-3.5 pr-4">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <span className="text-xs text-slate-400">{item.subtitle}</span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 text-center text-sm border-slate-200 rounded-lg p-1 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 font-medium"
                      aria-label="Quantité"
                    />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <input
                      type="number"
                      step={5000}
                      value={item.unitPrice}
                      onChange={(e) =>
                        handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                      }
                      className="w-28 text-right text-sm border-slate-200 rounded-lg p-1 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono font-medium"
                      aria-label="Prix Unitaire"
                    />
                  </td>
                  <td className="py-3.5 pl-3 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                    {formatNumber(rowTotal)} {currencySymbols[currency]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Calculation Breakdown */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        {/* Payment Methods Badges */}
        <div className="w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Options de règlement intégrées
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span> Wave QR Code
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-semibold border border-orange-200">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span> Orange Money
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-lg text-xs font-semibold border border-yellow-200">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> MTN MoMo
            </span>
          </div>
        </div>

        {/* Totals Box */}
        <div className="w-full md:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Total HT</span>
            <span className="font-mono font-medium text-slate-700">
              {formatNumber(subtotal)} {currencySymbols[currency]}
            </span>
          </div>

          <div className="flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              TVA légale (18%)
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1 rounded font-bold">
                Auto
              </span>
            </span>
            <span className="font-mono font-medium text-slate-700">
              {formatNumber(tva)} {currencySymbols[currency]}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-brand-navy">
            <span>Total TTC à payer</span>
            <span className="font-mono text-base text-brand-deep">
              {formatNumber(totalTTC)} {currencySymbols[currency]}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action in Mockup */}
      <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-slate-400">
          💡 Modifiez les quantités ou prix pour voir le calcul automatique en direct.
        </span>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow transition-all duration-200 ${
            copied ? "bg-emerald-600 scale-105" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Lien sécurisé copié !</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                <path
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Copier le lien de paiement direct</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

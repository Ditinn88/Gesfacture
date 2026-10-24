"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useData } from "@/lib/data-context";

interface InvoiceItem {
  id: string;
  title: string;
  quantity: number;
  prices: {
    FCFA: number;
    EUR: number;
    USD: number;
  };
}

type Currency = "FCFA" | "EUR" | "USD";

const currencySymbols: Record<Currency, string> = {
  FCFA: "FCFA",
  EUR: "€",
  USD: "$",
};

export function InteractiveInvoice() {
  const [currency, setCurrency] = useState<Currency>("FCFA");

  // Safe data context hook (in case rendered outside DataProvider)
  let organizationData: any = null;
  try {
    const data = useData();
    if (data?.organization?.name && data.organization.name !== "GESFACTURE") {
      organizationData = data.organization;
    }
  } catch (e) {
    // context not present, fallback cleanly
  }

  // Facture vierge : aucune donnée fictive, le visiteur saisit ses propres lignes
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "item-1", title: "", quantity: 0, prices: { FCFA: 0, EUR: 0, USD: 0 } },
    { id: "item-2", title: "", quantity: 0, prices: { FCFA: 0, EUR: 0, USD: 0 } },
  ]);

  const handleTitleChange = (id: string, title: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)));
  };

  const handleQuantityChange = (id: string, qty: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, qty || 0) } : item
      )
    );
  };

  const handlePriceChange = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              prices: {
                ...item.prices,
                [currency]: Math.max(0, price || 0),
              },
            }
          : item
      )
    );
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat("fr-FR").format(Math.round(val));
  };

  const { subtotal, tva, totalTTC } = useMemo(() => {
    const sub = items.reduce(
      (acc, item) => acc + item.quantity * (item.prices[currency] || 0),
      0
    );
    const tax = Math.round(sub * 0.18); // 18% standard VAT
    return {
      subtotal: sub,
      tva: tax,
      totalTTC: sub + tax,
    };
  }, [items, currency]);

  // Émetteur : les vraies informations de l'organisation si elles sont renseignées, sinon des champs vides
  const issuerName = organizationData?.legalName || organizationData?.name || "";
  const issuerTaxId = [
    organizationData?.taxId && `NINEA : ${organizationData.taxId}`,
    organizationData?.rccm && `RCCM : ${organizationData.rccm}`,
  ]
    .filter(Boolean)
    .join(" • ");
  const issuerAddress = [organizationData?.address, organizationData?.city, organizationData?.country]
    .filter(Boolean)
    .join(", ");
  const issuerEmail = organizationData?.email || "";

  return (
    <div
      className="mt-6 sm:mt-10 text-left max-w-4xl mx-auto bg-white rounded-3xl border border-neutral-200/90 shadow-2xl p-5 sm:p-10 relative invoice-preview-card"
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
      <div className="flex flex-wrap items-center justify-between border-b border-neutral-100 pb-5 sm:pb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-deep text-white flex items-center justify-center font-bold text-lg shadow-sm">
            GF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-neutral-900 text-base sm:text-lg">
                FACTURE N° —
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f3f4] text-[#5f6368] border border-[#e0e0e0]/70">
                Brouillon
              </span>
            </div>
            <p className="text-xs text-neutral-500">
              Émise aujourd'hui • Échéance: à réception
            </p>
          </div>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl text-xs font-semibold text-neutral-600">
          {(["FCFA", "EUR", "USD"] as Currency[]).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCurrency(c)}
              className={`currency-btn px-3 py-1.5 rounded-lg transition-all ${
                currency === c
                  ? "active bg-white text-brand-navy shadow-sm"
                  : "text-neutral-500 hover:text-brand-navy"
              }`}
            >
              {c === "FCFA" ? "FCFA (XOF)" : c === "EUR" ? "EUR (€)" : "USD ($)"}
            </button>
          ))}
        </div>
      </div>

      {/* Billing Info Grid — Real Professional Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 my-5 sm:my-6 text-sm">
        <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-100">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Émetteur
          </span>
          <p className={issuerName ? "font-bold text-neutral-900" : "font-bold text-neutral-300"}>
            {issuerName || "Nom de votre entreprise"}
          </p>
          <p className={issuerTaxId ? "text-neutral-500 text-xs" : "text-neutral-300 text-xs"}>
            {issuerTaxId || "NINEA • RCCM"}
          </p>
          <p className={issuerAddress ? "text-neutral-500 text-xs" : "text-neutral-300 text-xs"}>
            {issuerAddress || "Adresse, ville, pays"}
          </p>
          <p className={issuerEmail ? "text-neutral-900 font-medium text-xs mt-0.5" : "text-neutral-300 text-xs mt-0.5"}>
            {issuerEmail || "Email de facturation"}
          </p>
        </div>

        <div className="bg-neutral-50/70 p-4 rounded-2xl border border-neutral-100">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
            Client Facturé
          </span>
          <p className="font-bold text-neutral-300">Nom du client</p>
          <p className="text-neutral-300 text-xs">Adresse, ville, pays</p>
          <p className="text-neutral-300 text-xs">RCCM • NIF</p>
          <p className="text-neutral-300 text-xs mt-0.5">Email du client</p>
        </div>
      </div>

      {/* Interactive Table with mobile overflow scroll */}
      <div className="overflow-x-auto -mx-2 sm:mx-0">
        <table className="w-full text-left text-sm min-w-[560px]">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <th className="py-3 pr-4">Description de la prestation</th>
              <th className="py-3 px-3 text-center w-24">Quantité</th>
              <th className="py-3 px-3 text-right w-36">Prix Unit. HT</th>
              <th className="py-3 pl-3 text-right w-36">Total HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {items.map((item) => {
              const currentPrice = item.prices[currency] || 0;
              const rowTotal = item.quantity * currentPrice;
              return (
                <tr key={item.id}>
                  <td className="py-3.5 pr-4">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleTitleChange(item.id, e.target.value)}
                      placeholder="Description de la prestation"
                      className="w-full text-sm font-semibold text-neutral-800 placeholder:text-neutral-300 placeholder:font-normal border-neutral-200 rounded-lg p-1 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-700"
                      aria-label="Description de la prestation"
                    />
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.id, parseInt(e.target.value) || 0)
                      }
                      className="w-16 text-center text-sm border-neutral-200 rounded-lg p-1 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-700 font-medium"
                      aria-label="Quantité"
                    />
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <div className="inline-flex items-center gap-1 justify-end">
                      <input
                        type="number"
                        step={currency === "FCFA" ? 5000 : 10}
                        value={currentPrice}
                        onChange={(e) =>
                          handlePriceChange(item.id, parseFloat(e.target.value) || 0)
                        }
                        className="w-24 text-right text-sm border-neutral-200 rounded-lg p-1 bg-neutral-50 focus:bg-white focus:ring-1 focus:ring-neutral-700 font-mono font-medium"
                        aria-label="Prix Unitaire"
                      />
                      <span className="text-xs text-neutral-400 font-mono">{currencySymbols[currency]}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pl-3 text-right font-mono font-semibold text-neutral-900 whitespace-nowrap">
                    {formatNumber(rowTotal)} {currencySymbols[currency]}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total Calculation Breakdown */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        {/* Payment Methods Badges */}
        <div className="w-full md:w-auto">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">
            Options de règlement intégrées
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 text-neutral-800 rounded-lg text-xs font-semibold border border-neutral-200">
              <span className="w-2 h-2 rounded-full bg-neutral-700"></span> Wave QR Code
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
        <div className="w-full md:w-72 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 space-y-2">
          <div className="flex justify-between text-xs text-neutral-500">
            <span>Total HT</span>
            <span className="font-mono font-medium text-neutral-700">
              {formatNumber(subtotal)} {currencySymbols[currency]}
            </span>
          </div>

          <div className="flex justify-between text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              TVA légale (18%)
              <span className="text-[10px] text-neutral-900 bg-neutral-100 px-1 rounded font-bold">
                Auto
              </span>
            </span>
            <span className="font-mono font-medium text-neutral-700">
              {formatNumber(tva)} {currencySymbols[currency]}
            </span>
          </div>

          <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-extrabold text-brand-navy">
            <span>Total TTC à payer</span>
            <span className="font-mono text-base text-brand-deep">
              {formatNumber(totalTTC)} {currencySymbols[currency]}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Action in Mockup */}
      <div className="mt-8 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs text-neutral-400">
          💡 Saisissez une prestation, une quantité et un prix pour voir le calcul automatique en direct.
        </span>

        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2.5 rounded-xl shadow transition-all duration-200 bg-neutral-900 hover:bg-neutral-800"
        >
          <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Créer ma facture</span>
        </Link>
      </div>
    </div>
  );
}

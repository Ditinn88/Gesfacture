"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Wallet, ArrowUpRight } from "lucide-react";
import { useData } from "@/lib/data-context";
import { paidAmountOf, resolveInvoicesCurrency, sumByCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyTotals } from "@/components/ui/currency-totals";

const METHODS = ["Wave", "Orange Money", "MTN MoMo", "Virement Bancaire", "Espèces"] as const;

export default function WalletPage() {
  const { invoices, organization, isLoading } = useData();

  const currency = useMemo(
    () => resolveInvoicesCurrency(invoices, organization.currency || "XOF"),
    [invoices, organization.currency]
  );

  const accounts: Record<(typeof METHODS)[number], string> = {
    Wave: organization.waveNumber || "",
    "Orange Money": organization.omNumber || "",
    "MTN MoMo": "",
    "Virement Bancaire": [organization.bankName, organization.iban].filter(Boolean).join(" · "),
    Espèces: "",
  };

  const totals = useMemo(() => {
    const paid = invoices.filter((i) => paidAmountOf(i) > 0);
    return METHODS.map((method) => {
      const list = paid.filter((i) => i.paymentMethod === method);
      const totals = list.length
        ? sumByCurrency(list.map((i) => ({ amount: paidAmountOf(i), currency: i.currency })), currency)
        : [];
      return { method, count: list.length, totals };
    });
  }, [invoices, currency]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Portefeuille & Trésorerie
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Total encaissé par moyen de paiement, d&apos;après vos factures payées.
          </p>
        </div>
        <Link
          href="/settings?tab=paiements"
          className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-all duration-200 active:scale-95 shrink-0"
        >
          <span>Comptes</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white dark:group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {totals.map(({ method, count, totals: methodTotals }) =>
          isLoading ? (
            <Skeleton key={method} className="h-28 rounded-2xl" />
          ) : (
            <div
              key={method}
              className="group p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
                  <Wallet className="w-3.5 h-3.5" />
                </span>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{method}</p>
              </div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                <CurrencyTotals totals={methodTotals} fallbackCurrency={currency} />
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                {count} facture(s) réglée(s)
                {accounts[method] ? ` · ${accounts[method]}` : ""}
              </p>
            </div>
          )
        )}
      </div>

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        Les soldes réels de vos comptes Wave, Orange Money ou bancaires ne sont pas connectés à GESFACTURE :
        ces montants reflètent uniquement les factures que vous avez marquées comme payées.
      </p>
    </div>
  );
}

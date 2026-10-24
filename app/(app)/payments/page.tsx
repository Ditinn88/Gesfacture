"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatCurrency, formatDate, resolveInvoicesCurrency, sumByCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { CurrencyTotals } from "@/components/ui/currency-totals";
import { Invoice } from "@/lib/mock-data";

// Reste à encaisser sur une facture (montant TTC moins ce qui a déjà été réglé)
const remainingOf = (inv: Invoice) => Math.max(0, inv.amount - (inv.paidAmount || 0));

export default function PaymentsPage() {
  const { invoices, organization, updateInvoiceStatus, isLoading } = useData();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currency = useMemo(
    () => resolveInvoicesCurrency(invoices, organization.currency || "XOF"),
    [invoices, organization.currency]
  );

  // Encaissements = factures marquées comme payées
  const paidInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "payee")
        .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1)),
    [invoices]
  );

  // À encaisser = factures envoyées ou en retard (les brouillons ne sont pas encore dus)
  const pendingInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "envoyee" || inv.status === "en_retard")
        .sort((a, b) => (a.dueDate < b.dueDate ? -1 : 1)),
    [invoices]
  );

  const collectedTotals = paidInvoices.length ? sumByCurrency(paidInvoices, currency) : [];
  const pendingTotals = pendingInvoices.length
    ? sumByCurrency(
        pendingInvoices.map((inv) => ({ amount: remainingOf(inv), currency: inv.currency })),
        currency
      )
    : [];

  const markAsPaid = (inv: Invoice) => {
    updateInvoiceStatus(inv.id, "payee");
    setToastMessage(`Facture ${inv.number} marquée comme payée (${formatCurrency(inv.amount, inv.currency)}).`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const summaryCards = [
    {
      title: "Encaissé",
      totals: collectedTotals,
      subtitle: `${paidInvoices.length} facture(s) réglée(s)`,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    {
      title: "À encaisser",
      totals: pendingTotals,
      subtitle: `${pendingInvoices.length} facture(s) envoyée(s) ou en retard`,
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  ];

  const tableHead = (amountLabel: string, lastLabel: string) => (
    <thead>
      <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-[#fafaf9] dark:bg-neutral-900/50 text-[11px] font-medium text-neutral-400">
        <th className="py-3 px-4 sm:px-6">Échéance</th>
        <th className="py-3 px-4">Client</th>
        <th className="py-3 px-4">Facture</th>
        <th className="py-3 px-4">Moyen de paiement</th>
        <th className="py-3 px-4 text-right">{amountLabel}</th>
        <th className="py-3 px-4 sm:px-6 text-right">{lastLabel}</th>
      </tr>
    </thead>
  );

  const invoiceLink = (inv: Invoice) => (
    <Link
      href={`/invoices/${inv.id}`}
      className="group inline-flex items-center gap-1 font-mono text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
    >
      {inv.number}
      <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
    </Link>
  );

  const emptyState = (title: string, text: string) => (
    <div className="py-12 px-4 text-center space-y-2">
      <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center">
        <CreditCard className="w-5 h-5" />
      </div>
      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{title}</p>
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{text}</p>
    </div>
  );

  const loadingRows = (
    <div className="p-4 sm:p-6 space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-between shadow-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white dark:hover:text-neutral-900">
            ✕
          </button>
        </div>
      )}

      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Transactions & Encaissements
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
          Factures à encaisser et historique des factures réglées, par moyen de paiement.
        </p>
      </div>

      {/* Totaux encaissé / à encaisser, une ligne par devise */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {summaryCards.map((card) =>
          isLoading ? (
            <Skeleton key={card.title} className="h-28 rounded-2xl" />
          ) : (
            <div
              key={card.title}
              className="group p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 space-y-2"
            >
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
                  {card.icon}
                </span>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.title}</p>
              </div>
              <p className="text-lg font-bold text-neutral-900 dark:text-white">
                <CurrencyTotals totals={card.totals} fallbackCurrency={currency} />
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{card.subtitle}</p>
            </div>
          )
        )}
      </div>

      {/* En attente d'encaissement */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">En attente d&apos;encaissement</h2>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none overflow-hidden">
          {isLoading ? (
            loadingRows
          ) : pendingInvoices.length === 0 ? (
            emptyState("Rien à encaisser", "Les factures envoyées et non réglées apparaîtront ici.")
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {tableHead("Reste à encaisser", "Action")}
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {pendingInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-all duration-150">
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-neutral-400 dark:text-neutral-500">{formatDate(inv.dueDate)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">{inv.client.name}</td>
                      <td className="py-3.5 px-4">{invoiceLink(inv)}</td>
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {inv.paymentMethod || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(remainingOf(inv), inv.currency)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={() => markAsPaid(inv)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marquer payée</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Encaissements reçus */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Encaissements reçus</h2>
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none overflow-hidden">
          {isLoading ? (
            loadingRows
          ) : paidInvoices.length === 0 ? (
            emptyState("Aucun encaissement", "Les factures marquées « Payée » apparaîtront ici.")
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                {tableHead("Montant", "Statut")}
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                  {paidInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-all duration-150">
                      <td className="py-3.5 px-4 sm:px-6 text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">{inv.client.name}</td>
                      <td className="py-3.5 px-4">{invoiceLink(inv)}</td>
                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
                        {inv.paymentMethod || "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-neutral-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(inv.amount, inv.currency)}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <StatusBadge status="payee" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

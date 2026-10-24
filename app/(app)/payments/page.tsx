"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { CreditCard, ArrowUpRight } from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";

export default function PaymentsPage() {
  const { invoices, isLoading } = useData();

  // Encaissements = factures marquées comme payées
  const paidInvoices = useMemo(
    () =>
      invoices
        .filter((inv) => inv.status === "payee")
        .sort((a, b) => (a.issueDate < b.issueDate ? 1 : -1)),
    [invoices]
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Transactions & Encaissements
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
          Historique des factures réglées, par moyen de paiement.
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none overflow-hidden">
        {isLoading ? (
          <div className="p-4 sm:p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : paidInvoices.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-900 dark:text-white">Aucun encaissement</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Les factures marquées « Payée » apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-[#fafaf9] dark:bg-neutral-900/50 text-[11px] font-medium text-neutral-400">
                  <th className="py-3 px-4 sm:px-6">Date d&apos;émission</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Facture</th>
                  <th className="py-3 px-4">Moyen de paiement</th>
                  <th className="py-3 px-4 text-right">Montant</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
                {paidInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-all duration-150">
                    <td className="py-3.5 px-4 sm:px-6 text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                      {formatDate(inv.issueDate)}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-white">{inv.client.name}</td>
                    <td className="py-3.5 px-4">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="group inline-flex items-center gap-1 font-mono text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
                      >
                        {inv.number}
                        <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                      </Link>
                    </td>
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
  );
}

"use client";

import React from "react";
import { CreditCard, ArrowDownLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function PaymentsPage() {
  const transactions = [
    {
      id: "tx-1",
      date: "14/10/2026",
      client: "Teranga Digital Labs",
      invoice: "FAC-2026-0042",
      amount: 3200000,
      method: "Wave Business",
      status: "Succès",
    },
    {
      id: "tx-2",
      date: "05/10/2026",
      client: "Sahel Agrobusiness Group",
      invoice: "FAC-2026-0039",
      amount: 2600000,
      method: "Wave Business",
      status: "Succès",
    },
    {
      id: "tx-3",
      date: "24/09/2026",
      client: "Kmer Logistics Hub",
      invoice: "FAC-2026-0035",
      amount: 1500000,
      method: "Orange Money",
      status: "Succès",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Transactions & Encaissements
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Historique en direct des règlements reçus par Mobile Money et virements bancaires.
        </p>
      </div>

      <div className="bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 font-semibold uppercase text-[11px]">
              <th className="py-3 px-6">Date</th>
              <th className="py-3 px-4">Client</th>
              <th className="py-3 px-4">Facture</th>
              <th className="py-3 px-4">Moyen de paiement</th>
              <th className="py-3 px-4">Montant (FCFA)</th>
              <th className="py-3 px-6 text-right">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-6 font-medium text-slate-700 dark:text-slate-300">
                  {tx.date}
                </td>
                <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                  {tx.client}
                </td>
                <td className="py-3.5 px-4 text-blue-600 dark:text-blue-400 font-medium">
                  {tx.invoice}
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-medium">
                    {tx.method}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {formatFCFA(tx.amount)}
                </td>
                <td className="py-3.5 px-6 text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {tx.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

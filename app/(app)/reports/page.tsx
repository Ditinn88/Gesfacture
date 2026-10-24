"use client";

import React, { useMemo } from "react";
import { Download, Receipt, Clock, AlertTriangle } from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatDate, paidAmountOf, remainingAmountOf, resolveInvoicesCurrency, sumByCurrency, toLocalYMD } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyTotals } from "@/components/ui/currency-totals";
import { Invoice } from "@/lib/mock-data";

const STATUS_LABELS: Record<Invoice["status"], string> = {
  payee: "Payée",
  envoyee: "Envoyée",
  brouillon: "Brouillon",
  en_retard: "En retard",
};

const DAY_MS = 86400000;

function csvCell(value: string | number | undefined): string {
  const str = value === undefined || value === null ? "" : String(value);
  return /[";\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export default function ReportsPage() {
  const { invoices, organization, isLoading } = useData();

  const currency = useMemo(
    () => resolveInvoicesCurrency(invoices, organization.currency || "XOF"),
    [invoices, organization.currency]
  );

  const stats = useMemo(() => {
    const today = toLocalYMD(new Date());
    const monthPrefix = today.slice(0, 7);
    const paid = invoices.filter((i) => i.status === "payee");
    const unpaid = invoices.filter((i) => i.status === "envoyee" || i.status === "en_retard");

    // Montants regroupés par devise : jamais de GNF additionnés à des FCFA
    const totalsBy = (list: Invoice[], amountOf: (i: Invoice) => number) =>
      list.length ? sumByCurrency(list.map((i) => ({ amount: amountOf(i), currency: i.currency })), currency) : [];

    const vatCollectedMonth = totalsBy(
      paid.filter((i) => i.issueDate.startsWith(monthPrefix)),
      (i) => i.taxAmount || 0
    );

    const daysLate = (i: Invoice) =>
      Math.floor((new Date(today).getTime() - new Date(i.dueDate).getTime()) / DAY_MS);

    const notDue = unpaid.filter((i) => i.dueDate >= today);
    const late0to30 = unpaid.filter((i) => i.dueDate < today && daysLate(i) <= 30);
    const late30plus = unpaid.filter((i) => i.dueDate < today && daysLate(i) > 30);
    const sum = (list: Invoice[]) => totalsBy(list, remainingAmountOf);

    return {
      vatCollectedMonth,
      notDue: { count: notDue.length, amount: sum(notDue) },
      late0to30: { count: late0to30.length, amount: sum(late0to30) },
      late30plus: { count: late30plus.length, amount: sum(late30plus) },
    };
  }, [invoices, currency]);

  const handleExportCsv = () => {
    const header = [
      "Numéro",
      "Client",
      "Email client",
      "Date d'émission",
      "Échéance",
      "Statut",
      "Montant HT",
      "Taux TVA (%)",
      "TVA",
      "Montant TTC",
      "Montant payé",
      "Devise",
      "Moyen de paiement",
    ];
    const rows = invoices.map((i) => [
      i.number,
      i.client.name,
      i.client.email,
      formatDate(i.issueDate),
      formatDate(i.dueDate),
      STATUS_LABELS[i.status] || i.status,
      i.subtotal ?? "",
      i.taxRate ?? "",
      i.taxAmount ?? "",
      i.amount,
      paidAmountOf(i),
      i.currency || organization.currency || "XOF",
      i.paymentMethod || "",
    ]);
    // Séparateur « ; » + BOM UTF-8 : ouverture directe dans Excel en français
    const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `factures-${toLocalYMD(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cards = [
    {
      title: "TVA collectée",
      amount: <CurrencyTotals totals={stats.vatCollectedMonth} fallbackCurrency={currency} />,
      subtitle: `Factures payées émises en ${monthLabel}`,
      icon: <Receipt className="w-3.5 h-3.5" />,
      alert: false,
    },
    {
      title: "Créances non échues",
      amount: <CurrencyTotals totals={stats.notDue.amount} fallbackCurrency={currency} />,
      subtitle: `${stats.notDue.count} facture(s) avant échéance`,
      icon: <Clock className="w-3.5 h-3.5" />,
      alert: false,
    },
    {
      title: "Retard 1 à 30 jours",
      amount: <CurrencyTotals totals={stats.late0to30.amount} fallbackCurrency={currency} />,
      subtitle: `${stats.late0to30.count} facture(s) à relancer`,
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      alert: stats.late0to30.count > 0,
    },
    {
      title: "Retard de plus de 30 jours",
      amount: <CurrencyTotals totals={stats.late30plus.amount} fallbackCurrency={currency} />,
      subtitle: `${stats.late30plus.count} facture(s) en souffrance`,
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      alert: stats.late30plus.count > 0,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Rapports & Déclarations de TVA
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            TVA collectée, balance âgée des créances et export comptable.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExportCsv}
          disabled={isLoading || invoices.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Exporter les factures (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cards.map((card) =>
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
                {card.alert && (
                  <span className="relative flex h-2 w-2 ml-auto">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5221f] opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5221f]" />
                  </span>
                )}
              </div>
              <p
                className={
                  card.alert
                    ? "text-lg font-bold text-[#c5221f] dark:text-rose-400"
                    : "text-lg font-bold text-neutral-900 dark:text-white"
                }
              >
                {card.amount}
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500">{card.subtitle}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

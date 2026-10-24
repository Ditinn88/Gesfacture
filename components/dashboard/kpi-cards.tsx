"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Invoice, Client } from "@/lib/mock-data";
import { resolveInvoicesCurrency, sumByCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { CurrencyTotals } from "@/components/ui/currency-totals";
import { useData } from "@/lib/data-context";

interface KpiCardsProps {
  isLoading?: boolean;
  invoices?: Invoice[];
  clients?: Client[];
}

export function KpiCards({
  isLoading = false,
  invoices: propInvoices,
  clients: propClients,
}: KpiCardsProps) {
  const { invoices: contextInvoices, clients: contextClients, organization } = useData();
  const invoices = propInvoices ?? contextInvoices;
  const clients = propClients ?? contextClients;

  // Resolve active currency (GNF, XOF, EUR, etc.) based on invoices or organization setting
  const activeCurrency = useMemo(() => {
    return resolveInvoicesCurrency(invoices, organization?.currency || "XOF");
  }, [invoices, organization?.currency]);

  // Montants regroupés par devise : jamais de GNF additionnés à des FCFA
  const paidInvoices = invoices.filter((i) => i.status === "payee");
  const pendingInvoices = invoices.filter((i) => i.status === "envoyee");
  const overdueInvoices = invoices.filter((i) => i.status === "en_retard");
  const totalsOf = (list: Invoice[]) => (
    <CurrencyTotals totals={list.length ? sumByCurrency(list, activeCurrency) : []} fallbackCurrency={activeCurrency} />
  );

  const cards = [
    {
      title: "Total Encaissé",
      amount: totalsOf(paidInvoices),
      // Seules les factures « Payée » comptent : sans encaissement, on indique où les marquer payées
      subtitle:
        paidInvoices.length > 0 ? (
          `${paidInvoices.length} ${paidInvoices.length > 1 ? "factures réglées" : "facture réglée"}`
        ) : pendingInvoices.length + overdueInvoices.length > 0 ? (
          <Link href="/payments" className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-white">
            Aucune facture payée • marquez-les payées dans Paiements
          </Link>
        ) : (
          "Aucun encaissement pour le moment"
        ),
      amountColor: "text-neutral-900 dark:text-neutral-100",
      icon: (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      ),
    },
    {
      title: "Factures en Attente",
      amount: totalsOf(pendingInvoices),
      subtitle:
        pendingInvoices.length > 0
          ? `${pendingInvoices.length} ${pendingInvoices.length > 1 ? "factures envoyées" : "facture envoyée"}`
          : "Aucune facture en attente",
      amountColor: "text-neutral-900 dark:text-neutral-100",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <line x1="10" x2="8" y1="9" y2="9" />
        </svg>
      ),
    },
    {
      title: "En Retard",
      amount: totalsOf(overdueInvoices),
      subtitle:
        overdueInvoices.length > 0
          ? `${overdueInvoices.length} ${overdueInvoices.length > 1 ? "factures en retard" : "facture en retard"}`
          : "Aucun retard de paiement",
      amountColor: overdueInvoices.length > 0 ? "text-[#dc2626] dark:text-red-400 font-bold" : "text-neutral-900 dark:text-neutral-100 font-bold",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
    {
      title: "Nouveaux Clients",
      amount: clients.length > 0 ? `+${clients.length}` : "0",
      subtitle:
        clients.length > 0
          ? `${clients.length} ${clients.length > 1 ? "clients enregistrés" : "client enregistré"}`
          : "Aucun client enregistré",
      amountColor: "text-neutral-900 dark:text-neutral-100",
      icon: (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
        </svg>
      ),
    },
  ];

  // Skeleton Loader for KPI cards
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none flex flex-col justify-between h-[126px]"
          >
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-3.5 w-24 bg-neutral-200/80 dark:bg-neutral-800" />
              <Skeleton className="h-7 w-7 rounded-lg bg-neutral-200/80 dark:bg-neutral-800" />
            </div>
            <Skeleton className="h-7 w-36 my-1 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-44 mt-2 bg-neutral-200/80 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="group p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 dark:hover:border-neutral-600 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 flex flex-col justify-between cursor-default"
        >
          {/* Top row: Label on left, Monochrome Notion icon on right */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 flex items-center">
              {card.title}
              {card.title === "En Retard" && overdueInvoices.length > 0 && (
                <span className="relative flex h-2 w-2 ml-2 inline-flex">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
              )}
            </span>
            {/* Notion Monochrome Icon Container with subtle hover tilt */}
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
              {card.icon}
            </div>
          </div>

          {/* Main Amount */}
          <h3 className={`text-xl sm:text-2xl font-bold tracking-tight ${card.amountColor} transition-transform duration-200 group-hover:translate-x-0.5`}>
            {card.amount}
          </h3>

          {/* Subtitle */}
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2 font-normal">
            {card.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}

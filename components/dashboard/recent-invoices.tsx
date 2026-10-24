"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Search, X } from "lucide-react";
import { Invoice } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn, isPartiallyPaid } from "@/lib/utils";
import { StatusBadge, InvoiceStatusType } from "@/components/ui/status-badge";
import { useSearch } from "@/lib/search-context";
import { useData } from "@/lib/data-context";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface RecentInvoicesProps {
  selectedInvoiceId?: string;
  onSelectInvoice?: (invoice: Invoice) => void;
  isLoading?: boolean;
  invoices?: Invoice[];
}

export function RecentInvoices({
  selectedInvoiceId,
  onSelectInvoice,
  isLoading = false,
  invoices: propInvoices,
}: RecentInvoicesProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  const { invoices: contextInvoices, organization } = useData();

  const sourceInvoices = propInvoices ?? contextInvoices;

  const filteredInvoices = sourceInvoices.filter((inv) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      inv.number.toLowerCase().includes(query) ||
      inv.client.name.toLowerCase().includes(query) ||
      inv.client.email?.toLowerCase().includes(query) ||
      inv.amount.toString().includes(query)
    );
  });

  const displayedInvoices = searchQuery ? filteredInvoices : filteredInvoices.slice(0, 5);

  // Skeleton Loader for Recent Invoices Table matching user requirement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none overflow-hidden p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3.5 w-64 bg-neutral-200/80 dark:bg-neutral-800" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg bg-neutral-200/80 dark:bg-neutral-800" />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
            <Skeleton className="h-3 w-20 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-20 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-16 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-16 bg-neutral-200/80 dark:bg-neutral-800" />
            <Skeleton className="h-3 w-20 bg-neutral-200/80 dark:bg-neutral-800" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between items-center py-3.5 border-b border-neutral-100 dark:border-neutral-800/60">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32 bg-neutral-200/80 dark:bg-neutral-800" />
                <Skeleton className="h-3 w-24 bg-neutral-200/80 dark:bg-neutral-800" />
              </div>
              <Skeleton className="h-3.5 w-28 bg-neutral-200/80 dark:bg-neutral-800" />
              <Skeleton className="h-3.5 w-20 bg-neutral-200/80 dark:bg-neutral-800" />
              <Skeleton className="h-6 w-20 rounded-full bg-neutral-200/80 dark:bg-neutral-800" />
              <Skeleton className="h-4 w-28 bg-neutral-200/80 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none overflow-hidden">
      {/* Table Header: Factures Récentes + Tout voir ↗ with Inverted Hover & Responsive Sizing */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100">
            Factures Récentes
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400 dark:text-neutral-500 mt-0.5 hidden xs:block">
            Aperçu de vos 5 dernières factures générées.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Active Search Filter Badge */}
          {searchQuery && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] sm:text-xs">
              <Search className="w-3 h-3 text-neutral-500" />
              <span className="text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[90px] sm:max-w-[120px]">
                « {searchQuery} »
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="p-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 ml-0.5"
                title="Effacer le filtre"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Professional "Tout voir ↗" Button with Inverted Colors Hover Animation */}
          <Link
            href="/invoices"
            className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-all duration-200 active:scale-95 shrink-0"
          >
            <span>Tout voir</span>
            <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 group-hover:text-white dark:group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
          </Link>
        </div>
      </div>

      {/* Invoices Table - Flat, Clean, 1:1 match with user screenshot */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-neutral-200/90 dark:border-neutral-800 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 bg-[#fafaf9] dark:bg-neutral-900/50">
              <th className="py-3 pl-6 pr-3">Client</th>
              <th className="py-3 px-3">Numéro</th>
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3 text-center">Statut</th>
              <th className="py-3 pl-3 pr-6 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
            {displayedInvoices.length > 0 ? (
              displayedInvoices.map((inv) => {
                const isSelected = selectedInvoiceId === inv.id;
                return (
                  <tr
                    key={inv.id}
                    onClick={() => {
                      if (onSelectInvoice) {
                        onSelectInvoice(inv);
                      } else {
                        router.push(`/invoices/${inv.id}`);
                      }
                    }}
                    className={cn(
                      "group cursor-pointer transition-all duration-150",
                      isSelected
                        ? "bg-neutral-100/90 dark:bg-neutral-800/80"
                        : "hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50"
                    )}
                  >
                    {/* Column 1: Client (Name in bold black + email below) */}
                    <td className="py-4 pl-6 pr-3 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-neutral-900 dark:text-white text-xs">
                          {inv.client.name}
                        </p>
                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                          {inv.client.email}
                        </p>
                      </div>
                    </td>

                    {/* Column 2: Numéro (INV-345442-xxx) */}
                    <td className="py-4 px-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400 text-xs font-normal">
                      {inv.number}
                    </td>

                    {/* Column 3: Date (DD/MM/YYYY) */}
                    <td className="py-4 px-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400 text-xs font-normal">
                      {formatDate(inv.issueDate)}
                    </td>

                    {/* Column 4: Statut (Rounded-full Flat Pastel Pills) */}
                    <td className="py-4 px-3 whitespace-nowrap text-center">
                      <StatusBadge status={inv.status as InvoiceStatusType} size="sm" partial={isPartiallyPaid(inv)} />
                    </td>

                    {/* Column 5: Montant (Bold black text aligned right) */}
                    <td className="py-4 pl-3 pr-6 text-right whitespace-nowrap font-bold text-neutral-900 dark:text-white text-xs">
                      {formatCurrency(inv.amount, inv.currency || organization?.currency)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="max-w-xs mx-auto text-center space-y-2">
                    {searchQuery ? (
                      <>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                          Aucune facture trouvée pour « {searchQuery} »
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Vérifiez le numéro ou effacez la recherche dans la barre en haut.
                        </p>
                        <button
                          onClick={() => setSearchQuery("")}
                          className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:underline pt-1"
                        >
                          Effacer la recherche
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                          Aucune facture émise pour le moment
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Créez votre première facture réelle pour commencer à suivre vos encaissements.
                        </p>
                        <Link
                          href="/invoices/new"
                          className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 rounded-xl transition-colors"
                        >
                          <span>+ Nouvelle Facture</span>
                        </Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

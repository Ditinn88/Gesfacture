"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatCurrency, resolveInvoicesCurrency, toLocalYMD } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetingPage() {
  const { invoices, organization, isLoading } = useData();

  const currency = useMemo(
    () => resolveInvoicesCurrency(invoices, organization.currency || "XOF"),
    [invoices, organization.currency]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = toLocalYMD(now).slice(0, 7);
    const lastMonth = toLocalYMD(new Date(now.getFullYear(), now.getMonth() - 1, 1)).slice(0, 7);
    const issued = invoices.filter((i) => i.status !== "brouillon");
    const sumFor = (prefix: string, onlyPaid: boolean) =>
      issued
        .filter((i) => i.issueDate.startsWith(prefix) && (!onlyPaid || i.status === "payee"))
        .reduce((s, i) => s + i.amount, 0);

    const invoicedThis = sumFor(thisMonth, false);
    const invoicedLast = sumFor(lastMonth, false);
    const collectedThis = sumFor(thisMonth, true);
    const variation = invoicedLast > 0 ? ((invoicedThis - invoicedLast) / invoicedLast) * 100 : null;
    const collectionRate = invoicedThis > 0 ? (collectedThis / invoicedThis) * 100 : null;

    return { invoicedThis, invoicedLast, collectedThis, variation, collectionRate };
  }, [invoices]);

  const monthLabel = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Budget & Prévisions
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
          Chiffre d&apos;affaires de {monthLabel} comparé au mois précédent.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
                {stats.variation !== null && stats.variation < 0 ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : (
                  <TrendingUp className="w-3.5 h-3.5" />
                )}
              </span>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">CA facturé ce mois</p>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.invoicedThis, currency)}
            </p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Mois précédent : {formatCurrency(stats.invoicedLast, currency)}
              {stats.variation !== null && (
                <span
                  className={
                    stats.variation < 0
                      ? " font-bold text-[#c5221f] dark:text-rose-400"
                      : " font-bold text-[#137333] dark:text-emerald-300"
                  }
                >
                  {" "}
                  ({stats.variation > 0 ? "+" : ""}
                  {stats.variation.toFixed(1).replace(".", ",")} %)
                </span>
              )}
            </p>
          </div>

          <div className="group p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
                <PiggyBank className="w-3.5 h-3.5" />
              </span>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Encaissé ce mois</p>
            </div>
            <p className="text-2xl font-bold text-neutral-900 dark:text-white">
              {formatCurrency(stats.collectedThis, currency)}
            </p>
            <div className="w-full h-2 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-700"
                style={{ width: `${Math.min(100, stats.collectionRate ?? 0)}%` }}
              />
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {stats.collectionRate !== null
                ? `${stats.collectionRate.toFixed(1).replace(".", ",")} % du CA facturé ce mois`
                : "Aucune facture émise ce mois"}
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        La définition d&apos;objectifs de chiffre d&apos;affaires et le suivi des charges ne sont pas encore disponibles.
      </p>
    </div>
  );
}

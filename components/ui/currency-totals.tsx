import React from "react";
import { formatCurrency } from "@/lib/utils";

interface CurrencyTotalsProps {
  // Totaux déjà regroupés par devise (voir sumByCurrency) : une ligne par devise
  totals?: { currency: string; total: number }[];
  // Devise affichée avec « 0 » quand il n'y a aucun total
  fallbackCurrency: string;
}

export function CurrencyTotals({ totals, fallbackCurrency }: CurrencyTotalsProps) {
  const lines = totals && totals.length > 0 ? totals : [{ currency: fallbackCurrency, total: 0 }];
  return (
    <>
      {lines.map((t) => (
        <span key={t.currency} className="block">
          {formatCurrency(t.total, t.currency)}
        </span>
      ))}
    </>
  );
}

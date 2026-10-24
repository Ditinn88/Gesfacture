import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalise and return display currency symbol / code:
 * - XOF / FCFA -> "FCFA"
 * - GNF -> "GNF"
 * - XAF -> "FCFA"
 * - EUR -> "€"
 * - USD -> "$"
 * - CAD -> "CAD"
 * - GBP -> "£"
 */
export function getCurrencySymbol(currency?: string): string {
  if (!currency) return "FCFA";
  const clean = currency.toUpperCase().trim();
  if (clean === "XOF" || clean.includes("FCFA")) return "FCFA";
  if (clean === "GNF" || clean.includes("GUINÉEN") || clean.includes("GUINEEN")) return "GNF";
  if (clean === "XAF") return "FCFA";
  if (clean === "EUR" || clean === "EURO" || clean === "€") return "€";
  if (clean === "USD" || clean === "DOLLAR" || clean === "$") return "$";
  if (clean === "CAD") return "CAD";
  if (clean === "GBP" || clean === "£") return "£";
  return clean;
}

/**
 * Libellé complet d'une devise pour l'en-tête de facture : "FCFA (XOF)", "GNF", "€ (EUR)"
 */
export function getCurrencyLabel(currency?: string): string {
  const code = (currency || "XOF").toUpperCase().trim();
  const symbol = getCurrencySymbol(code);
  return symbol === code ? code : `${symbol} (${code})`;
}

/**
 * Joint uniquement les morceaux renseignés (évite ", Dakar" ou "Tél :  · Email :" quand un champ est vide)
 */
export function joinParts(parts: (string | false | null | undefined)[], separator = " · "): string {
  return parts
    .map((p) => (typeof p === "string" ? p.trim() : ""))
    .filter(Boolean)
    .join(separator);
}

/**
 * Les trois lignes de coordonnées de l'organisation en en-tête de facture (lignes vides omises)
 */
export function organizationHeaderLines(org: {
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  rccm?: string;
  phone?: string;
  email?: string;
}): string[] {
  return [
    joinParts([joinParts([org.address, org.city], ", "), org.country]),
    joinParts([org.taxId && `NINEA ${org.taxId}`, org.rccm && `RCCM ${org.rccm}`]),
    joinParts([org.phone && `Tél : ${org.phone}`, org.email && `Email : ${org.email}`]),
  ].filter(Boolean);
}

/**
 * Format any currency with standard spacing (fr-FR), intelligent decimal handling,
 * and the appropriate currency suffix/symbol.
 *
 * Example:
 * formatCurrency(13300000, "GNF") -> "13 300 000 GNF"
 * formatCurrency(250000, "XOF") -> "250 000 FCFA"
 * formatCurrency(500, "EUR") -> "500 €"
 * formatCurrency(500.5, "EUR") -> "500,50 €"
 */
export function formatCurrency(amount: number | string | undefined | null, currency?: string): string {
  // Accepte aussi les montants enregistrés en texte ("5000") par d'anciennes versions
  const parsed = typeof amount === "string" ? Number(amount) : amount;
  const num = typeof parsed === "number" && !isNaN(parsed) ? parsed : 0;
  const symbol = getCurrencySymbol(currency);
  const isZeroDecimal = ["XOF", "GNF", "XAF", "FCFA"].includes(symbol) || (num % 1 === 0);

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(num);

  return `${formatted} ${symbol}`;
}

/**
 * Backward-compatible formatFCFA helper that seamlessly supports any currency parameter
 */
export function formatFCFA(amount: number | string | undefined | null, currency?: string): string {
  return formatCurrency(amount, currency);
}

/**
 * Helper to determine the representative currency for a list of invoices or fallback to default
 */
export function resolveInvoicesCurrency(
  invoices: { currency?: string }[],
  defaultCurrency: string = "XOF"
): string {
  if (!invoices || invoices.length === 0) return defaultCurrency;
  // Look for the first invoice with a defined currency
  const withCurrency = invoices.find((inv) => inv.currency && inv.currency.trim().length > 0);
  if (withCurrency?.currency) {
    return withCurrency.currency;
  }
  return defaultCurrency;
}

/**
 * Totaux d'une liste de factures regroupés par devise (on n'additionne jamais
 * des GNF et des FCFA). Toujours au moins une entrée, triée par montant décroissant.
 */
export function sumByCurrency(
  invoices: { amount: number | string; currency?: string }[],
  defaultCurrency: string = "XOF"
): { currency: string; total: number }[] {
  const totals = new Map<string, number>();
  for (const inv of invoices) {
    const currency = inv.currency?.trim().toUpperCase() || defaultCurrency;
    const amount = Number(inv.amount);
    totals.set(currency, (totals.get(currency) ?? 0) + (isNaN(amount) ? 0 : amount));
  }
  if (totals.size === 0) return [{ currency: defaultCurrency, total: 0 }];
  return Array.from(totals, ([currency, total]) => ({ currency, total })).sort((a, b) => b.total - a.total);
}

/**
 * Date locale au format YYYY-MM-DD (toISOString() donnerait la date UTC, décalée selon le fuseau)
 */
export function toLocalYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Format date in DD/MM/YYYY format
 */
export function formatDate(dateString: string | Date | undefined | null): string {
  if (!dateString) return "—";
  try {
    // "YYYY-MM-DD" est lu comme minuit UTC par new Date() : on le lit en date locale
    const ymd = typeof dateString === "string" ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString) : null;
    const d = ymd
      ? new Date(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]))
      : typeof dateString === "string"
      ? new Date(dateString)
      : dateString;
    if (isNaN(d.getTime())) return String(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return String(dateString);
  }
}

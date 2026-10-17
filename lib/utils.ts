import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AVAILABLE_CURRENCIES = [
  { code: "XOF", symbol: "FCFA", label: "FCFA — Franc CFA (XOF / XAF)" },
  { code: "EUR", symbol: "€", label: "EUR (€) — Euro" },
  { code: "USD", symbol: "$", label: "USD ($) — Dollar US" },
  { code: "GNF", symbol: "GNF", label: "GNF — Franc Guinéen" },
  { code: "MAD", symbol: "DH", label: "MAD (DH) — Dirham Marocain" },
  { code: "GBP", symbol: "£", label: "GBP (£) — Livre Sterling" },
  { code: "CAD", symbol: "$ CA", label: "CAD ($) — Dollar Canadien" },
  { code: "CHF", symbol: "CHF", label: "CHF — Franc Suisse" },
] as const;

export function getCurrencySymbol(currencyCode?: string): string {
  if (!currencyCode) return "FCFA";
  const normalized = currencyCode.trim().toUpperCase();
  const found = AVAILABLE_CURRENCIES.find(
    (c) =>
      c.code === normalized ||
      c.symbol.toUpperCase() === normalized ||
      normalized.includes(c.code)
  );
  return found ? found.symbol : currencyCode;
}

/**
 * Format any currency with appropriate symbol and decimals
 * Example:
 *   formatCurrency(250000, "XOF") -> "250 000 FCFA"
 *   formatCurrency(1500, "EUR")   -> "1 500 €"
 *   formatCurrency(1500.5, "USD") -> "1 500,50 $"
 */
export function formatCurrency(amount: number, currencyCode: string = "XOF"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const normalized = (currencyCode || "XOF").trim().toUpperCase();
  const isDecimal = ["EUR", "USD", "GBP", "CAD", "CHF"].some((c) => normalized.includes(c));

  const formatted = new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: isDecimal ? 2 : 0,
    minimumFractionDigits: isDecimal && amount % 1 !== 0 ? 2 : 0,
  }).format(amount || 0);

  return `${formatted} ${symbol}`;
}

/**
 * Format currency with backwards compatibility for formatFCFA
 */
export function formatFCFA(amount: number, currency: string = "XOF"): string {
  return formatCurrency(amount, currency);
}

/**
 * Format date in DD/MM/YYYY format
 */
export function formatDate(dateString: string | Date): string {
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

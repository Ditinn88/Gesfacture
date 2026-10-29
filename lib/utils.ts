import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CountryDetail {
  name: string;
  iso2: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  label: string;
  iso2: string;
  flag: string;
  flags: string[];
  countries: string[];
  countriesText: string;
  countryList: CountryDetail[];
  region: "Zone Franc CFA" | "Afrique" | "International";
}

export const AVAILABLE_CURRENCIES: CurrencyInfo[] = [
  {
    code: "XOF",
    symbol: "FCFA",
    name: "Franc CFA (UEMOA)",
    label: "FCFA — Franc CFA UEMOA (XOF)",
    iso2: "sn",
    flag: "🇸🇳",
    flags: ["🇸🇳", "🇨🇮", "🇲🇱", "🇧🇫", "🇧🇯", "🇹🇬", "🇳🇪", "🇬🇼"],
    countries: ["Sénégal", "Côte d'Ivoire", "Mali", "Burkina Faso", "Bénin", "Togo", "Niger", "Guinée-Bissau"],
    countriesText: "Sénégal, Côte d'Ivoire, Mali, Burkina Faso, Bénin, Togo, Niger, Guinée-Bissau",
    countryList: [
      { name: "Sénégal", iso2: "sn" },
      { name: "Côte d'Ivoire", iso2: "ci" },
      { name: "Mali", iso2: "ml" },
      { name: "Burkina Faso", iso2: "bf" },
      { name: "Bénin", iso2: "bj" },
      { name: "Togo", iso2: "tg" },
      { name: "Niger", iso2: "ne" },
      { name: "Guinée-Bissau", iso2: "gw" },
    ],
    region: "Zone Franc CFA",
  },
  {
    code: "XAF",
    symbol: "FCFA",
    name: "Franc CFA (CEMAC)",
    label: "FCFA — Franc CFA CEMAC (XAF)",
    iso2: "cm",
    flag: "🇨🇲",
    flags: ["🇨🇲", "🇬🇦", "🇨🇬", "🇹🇩", "🇨🇫", "🇬🇶"],
    countries: ["Cameroun", "Gabon", "Congo-Brazzaville", "Tchad", "Centrafrique (RCA)", "Guinée Équatoriale"],
    countriesText: "Cameroun, Gabon, Congo, Tchad, Centrafrique, Guinée Équatoriale",
    countryList: [
      { name: "Cameroun", iso2: "cm" },
      { name: "Gabon", iso2: "ga" },
      { name: "Congo", iso2: "cg" },
      { name: "Tchad", iso2: "td" },
      { name: "Centrafrique", iso2: "cf" },
      { name: "Guinée Équatoriale", iso2: "gq" },
    ],
    region: "Zone Franc CFA",
  },
  {
    code: "GNF",
    symbol: "GNF",
    name: "Franc Guinéen",
    label: "GNF — Franc Guinéen",
    iso2: "gn",
    flag: "🇬🇳",
    flags: ["🇬🇳"],
    countries: ["Guinée (Conakry)"],
    countriesText: "Guinée (Conakry)",
    countryList: [{ name: "Guinée (Conakry)", iso2: "gn" }],
    region: "Afrique",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    label: "EUR (€) — Euro",
    iso2: "eu",
    flag: "🇪🇺",
    flags: ["🇪🇺", "🇫🇷", "🇧🇪", "🇩🇪", "🇪🇸", "🇮🇹"],
    countries: ["France", "Belgique", "Allemagne", "Espagne", "Italie", "Luxembourg", "Zone Euro (20 pays)"],
    countriesText: "France, Belgique, Allemagne, Espagne, Italie & Zone Euro",
    countryList: [
      { name: "France", iso2: "fr" },
      { name: "Belgique", iso2: "be" },
      { name: "Allemagne", iso2: "de" },
      { name: "Espagne", iso2: "es" },
      { name: "Italie", iso2: "it" },
      { name: "Luxembourg", iso2: "lu" },
    ],
    region: "International",
  },
  {
    code: "USD",
    symbol: "$",
    name: "Dollar US",
    label: "USD ($) — Dollar US",
    iso2: "us",
    flag: "🇺🇸",
    flags: ["🇺🇸"],
    countries: ["États-Unis", "Commerce International"],
    countriesText: "États-Unis, Commerce International",
    countryList: [
      { name: "États-Unis", iso2: "us" },
      { name: "International", iso2: "un" },
    ],
    region: "International",
  },
  {
    code: "MAD",
    symbol: "DH",
    name: "Dirham Marocain",
    label: "MAD (DH) — Dirham Marocain",
    iso2: "ma",
    flag: "🇲🇦",
    flags: ["🇲🇦"],
    countries: ["Maroc"],
    countriesText: "Maroc",
    countryList: [{ name: "Maroc", iso2: "ma" }],
    region: "Afrique",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "Livre Sterling",
    label: "GBP (£) — Livre Sterling",
    iso2: "gb",
    flag: "🇬🇧",
    flags: ["🇬🇧"],
    countries: ["Royaume-Uni", "Angleterre", "Écosse"],
    countriesText: "Royaume-Uni",
    countryList: [{ name: "Royaume-Uni", iso2: "gb" }],
    region: "International",
  },
  {
    code: "CAD",
    symbol: "$ CA",
    name: "Dollar Canadien",
    label: "CAD ($) — Dollar Canadien",
    iso2: "ca",
    flag: "🇨🇦",
    flags: ["🇨🇦"],
    countries: ["Canada"],
    countriesText: "Canada",
    countryList: [{ name: "Canada", iso2: "ca" }],
    region: "International",
  },
  {
    code: "CHF",
    symbol: "CHF",
    name: "Franc Suisse",
    label: "CHF — Franc Suisse",
    iso2: "ch",
    flag: "🇨🇭",
    flags: ["🇨🇭"],
    countries: ["Suisse", "Liechtenstein"],
    countriesText: "Suisse, Liechtenstein",
    countryList: [
      { name: "Suisse", iso2: "ch" },
      { name: "Liechtenstein", iso2: "li" },
    ],
    region: "International",
  },
  {
    code: "CDF",
    symbol: "FC",
    name: "Franc Congolais",
    label: "CDF (FC) — Franc Congolais",
    iso2: "cd",
    flag: "🇨🇩",
    flags: ["🇨🇩"],
    countries: ["RD Congo (Kinshasa)"],
    countriesText: "RD Congo (Kinshasa)",
    countryList: [{ name: "RD Congo (Kinshasa)", iso2: "cd" }],
    region: "Afrique",
  },
  {
    code: "NGN",
    symbol: "₦",
    name: "Naira Nigérian",
    label: "NGN (₦) — Naira Nigérian",
    iso2: "ng",
    flag: "🇳🇬",
    flags: ["🇳🇬"],
    countries: ["Nigéria"],
    countriesText: "Nigéria",
    countryList: [{ name: "Nigéria", iso2: "ng" }],
    region: "Afrique",
  },
  {
    code: "MRU",
    symbol: "MRU",
    name: "Ouguiya Mauritanien",
    label: "MRU — Ouguiya Mauritanien",
    iso2: "mr",
    flag: "🇲🇷",
    flags: ["🇲🇷"],
    countries: ["Mauritanie"],
    countriesText: "Mauritanie",
    countryList: [{ name: "Mauritanie", iso2: "mr" }],
    region: "Afrique",
  },
  {
    code: "RWF",
    symbol: "FRw",
    name: "Franc Rwandais",
    label: "RWF (FRw) — Franc Rwandais",
    iso2: "rw",
    flag: "🇷🇼",
    flags: ["🇷🇼"],
    countries: ["Rwanda"],
    countriesText: "Rwanda",
    countryList: [{ name: "Rwanda", iso2: "rw" }],
    region: "Afrique",
  },
  {
    code: "TND",
    symbol: "DT",
    name: "Dinar Tunisien",
    label: "TND (DT) — Dinar Tunisien",
    iso2: "tn",
    flag: "🇹🇳",
    flags: ["🇹🇳"],
    countries: ["Tunisie"],
    countriesText: "Tunisie",
    countryList: [{ name: "Tunisie", iso2: "tn" }],
    region: "Afrique",
  },
  {
    code: "AED",
    symbol: "AED",
    name: "Dirham des Émirats",
    label: "AED — Dirham des Émirats",
    iso2: "ae",
    flag: "🇦🇪",
    flags: ["🇦🇪"],
    countries: ["Émirats Arabes Unis", "Dubaï", "Abu Dhabi"],
    countriesText: "Émirats Arabes Unis (Dubaï)",
    countryList: [{ name: "Émirats Arabes Unis", iso2: "ae" }],
    region: "International",
  },
];

export function getCurrencyInfo(currencyCode?: string): CurrencyInfo {
  if (!currencyCode) return AVAILABLE_CURRENCIES[0];
  const normalized = currencyCode.trim().toUpperCase();
  const found = AVAILABLE_CURRENCIES.find(
    (c) =>
      c.code === normalized ||
      c.symbol.toUpperCase() === normalized ||
      normalized.includes(c.code)
  );
  return found || AVAILABLE_CURRENCIES[0];
}

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
  const isZeroDecimal =
    ["XOF", "GNF", "XAF", "FCFA", "CDF", "RWF", "FC", "FRW"].includes(symbol.toUpperCase()) ||
    (num % 1 === 0);

  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  })
    .format(num)
    // fr-FR sépare les milliers par une espace fine (U+202F), peu visible en gras : espace insécable classique
    .replace(/ /g, " ");

  return `${formatted} ${symbol}`;
}

/**
 * Backward-compatible formatFCFA helper that seamlessly supports any currency parameter
 */
export function formatFCFA(amount: number | string | undefined | null, currency?: string): string {
  return formatCurrency(amount, currency);
}

/**
 * Devise la plus utilisée dans une liste de factures (celle des graphiques et des taux),
 * ou la devise par défaut si la liste est vide
 */
export function resolveInvoicesCurrency(
  invoices: { currency?: string }[],
  defaultCurrency: string = "XOF"
): string {
  const counts = new Map<string, number>();
  for (const inv of invoices || []) {
    const currency = inv.currency?.trim().toUpperCase() || defaultCurrency;
    counts.set(currency, (counts.get(currency) ?? 0) + 1);
  }
  let best = defaultCurrency;
  let bestCount = 0;
  counts.forEach((count, currency) => {
    // À égalité, la devise par défaut (celle de l'organisation) l'emporte
    if (count > bestCount || (count === bestCount && currency === defaultCurrency)) {
      best = currency;
      bestCount = count;
    }
  });
  return best;
}

/**
 * Vrai si la facture est dans la devise donnée (devise absente = devise par défaut)
 */
export function isInCurrency(inv: { currency?: string }, currency: string, defaultCurrency: string = "XOF"): boolean {
  return (inv.currency?.trim().toUpperCase() || defaultCurrency) === currency.trim().toUpperCase();
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

type PayableInvoice = { amount: number | string; paidAmount?: number | string; status: string };

/**
 * Montant réellement encaissé sur une facture : tout si elle est payée, rien si c'est un
 * brouillon, sinon les acomptes déjà reçus (paiements partiels), plafonnés au total
 */
export function paidAmountOf(inv: PayableInvoice): number {
  const amount = Number(inv.amount) || 0;
  if (inv.status === "payee") return amount;
  if (inv.status === "brouillon") return 0;
  return Math.min(amount, Math.max(0, Number(inv.paidAmount) || 0));
}

/**
 * Reste à payer sur une facture (total TTC moins les acomptes reçus)
 */
export function remainingAmountOf(inv: PayableInvoice): number {
  return Math.max(0, (Number(inv.amount) || 0) - paidAmountOf(inv));
}

/**
 * Vrai si le client a payé une partie de la facture, mais pas la totalité
 */
export function isPartiallyPaid(inv: PayableInvoice): boolean {
  return inv.status !== "payee" && paidAmountOf(inv) > 0 && remainingAmountOf(inv) > 0;
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

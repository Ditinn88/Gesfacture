export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: {
    id?: string; // id du client source (absent sur les anciennes factures)
    name: string;
    email: string;
    city?: string;
    country?: string;
    phone?: string;
    address?: string;
    avatar?: string;
  };
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  currency?: string; // Currency code (e.g. XOF, EUR, USD, GNF, etc.)
  amount: number;    // Total TTC
  subtotal?: number; // Total HT
  taxRate?: number;  // 18% standard
  taxAmount?: number;
  discountPercent?: number; // Remise commerciale appliquée au total HT
  paidAmount: number;
  status: "payee" | "envoyee" | "brouillon" | "en_retard";
  paymentMethod?: "Wave" | "Orange Money" | "MTN MoMo" | "Virement Bancaire" | "Espèces";
  items?: InvoiceItem[];
  notes?: string;
}

export interface CurrencyOption {
  code: string;
  label: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "GNF", label: "Franc Guinéen (GNF)", symbol: "GNF" },
  { code: "XOF", label: "Franc CFA UEMOA (XOF)", symbol: "FCFA" },
  { code: "XAF", label: "Franc CFA CEMAC (XAF)", symbol: "FCFA" },
  { code: "EUR", label: "Euro (€)", symbol: "€" },
  { code: "USD", label: "Dollar US ($)", symbol: "$" },
];

export interface Client {
  id: string;
  name: string;
  email: string;
  city: string;
  country: string;
  phone?: string;
  address?: string;
  totalInvoiced: number;
  invoicesCount: number;
  totalsByCurrency?: { currency: string; total: number }[]; // dérivé, jamais stocké
  status: "actif" | "inactif";
  percentage?: number;
}

export interface KpiSummary {
  totalInvoiced: {
    amount: number;
    count: number;
    growthPercent: number;
  };
  totalCollected: {
    amount: number;
    collectionRate: number;
    growthPercent: number;
  };
  pending: {
    amount: number;
    count: number;
  };
  overdue: {
    amount: number;
    count: number;
    alertText: string;
  };
  newClients: {
    count: number;
    growthPercent: number;
  };
}

export interface Organization {
  name: string;
  legalName: string;
  rccm: string;
  taxId: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  currency?: string;
  invoicePrefix?: string;
  paymentDelay?: number;
  defaultVatRate?: number;
  waveNumber?: string;
  omNumber?: string;
  iban?: string;
  bankName?: string;
  bankSwift?: string;
}

// Membres de l'entreprise (table organization_members) : accès aux données du chef d'entreprise
export type MemberRole = "admin" | "comptable" | "lecteur";
// Rôle de l'utilisateur connecté dans l'espace affiché : « owner » = chef d'entreprise (propriétaire du compte)
export type WorkspaceRole = "owner" | MemberRole;

export interface Member {
  id: string;
  email: string;
  name: string;
  role: MemberRole;
}

export const WORKSPACE_ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: "Chef d'entreprise",
  admin: "Administrateur",
  comptable: "Comptable",
  lecteur: "Lecteur",
};

export const MEMBER_ROLE_DESCRIPTIONS: Record<MemberRole, string> = {
  admin: "Tout gérer, y compris les paramètres de l'entreprise",
  comptable: "Créer et modifier factures, clients et paiements",
  lecteur: "Consulter uniquement, sans rien modifier",
};

// Coordonnées vides par défaut : elles s'impriment sur les factures, l'utilisateur les saisit dans Paramètres
export const DEFAULT_ORGANIZATION: Organization = {
  name: "GESFACTURE",
  legalName: "GESFACTURE SAS",
  rccm: "",
  taxId: "",
  address: "",
  city: "Dakar",
  country: "Sénégal",
  phone: "",
  email: "",
  website: "",
  currency: "XOF",
  invoicePrefix: "FAC-2026-",
  paymentDelay: 15,
  defaultVatRate: 18,
  waveNumber: "",
  omNumber: "",
  iban: "",
  bankName: "",
  bankSwift: "",
};

// Anciennes coordonnées fictives livrées par défaut : effacées si elles sont encore en cache
export const PLACEHOLDER_ORGANIZATION_VALUES = [
  "SN-DKR-2026-B-1420",
  "009842103 2V3",
  "Plateau, Boulevard de la République",
  "+221 33 820 40 50",
  "contact@gesfacture.sn",
  "https://gesfacture.vercel.app",
  "+221 77 820 40 50",
  "+221 78 820 40 50",
  "SN08 SN01 0100 2345 6789 01",
  "Société Générale Sénégal (SGS)",
  "SGESDAKA",
];

export const CURRENT_USER = {
  name: "Administrateur",
  email: "admin@gesfacture.sn",
  role: "Directeur Général",
  avatar: "AD",
  organization: DEFAULT_ORGANIZATION,
};

export const KPI_DATA: KpiSummary = {
  totalInvoiced: {
    amount: 4720000,
    count: 5,
    growthPercent: 24.2,
  },
  totalCollected: {
    amount: 2419000,
    collectionRate: 51.2,
    growthPercent: 18.5,
  },
  pending: {
    amount: 708000,
    count: 1,
  },
  overdue: {
    amount: 590000,
    count: 1,
    alertText: "1 facture en retard (590 000 FCFA)",
  },
  newClients: {
    count: 5,
    growthPercent: 12.0,
  },
};

export const TOP_CLIENTS: Client[] = [
  {
    id: "cli-real-001",
    name: "Société Africaine de Distribution & Services (SADS SA)",
    email: "comptabilite@sads-afrique.com",
    city: "Abidjan",
    country: "Côte d'Ivoire",
    phone: "+225 27 22 40 80",
    address: "Immeuble Horizon, Boulevard VGE",
    totalInvoiced: 767000,
    invoicesCount: 1,
    status: "actif",
    percentage: 35,
  },
  {
    id: "cli-real-002",
    name: "Sahel Agro Industries SARL",
    email: "direction.finances@sahelagro.sn",
    city: "Dakar",
    country: "Sénégal",
    phone: "+221 33 864 12 30",
    address: "Zone Industrielle de Yoff",
    totalInvoiced: 708000,
    invoicesCount: 1,
    status: "actif",
    percentage: 30,
  },
  {
    id: "cli-real-003",
    name: "BatiPro Construction & BTP SA",
    email: "facturation@batipro-cm.com",
    city: "Douala",
    country: "Cameroun",
    phone: "+237 233 42 19 80",
    address: "Boulevard de la Liberté, Akwa",
    totalInvoiced: 1652000,
    invoicesCount: 1,
    status: "actif",
    percentage: 45,
  },
  {
    id: "cli-real-004",
    name: "Groupe Scolaire Excellence & Avenir",
    email: "tresorerie@excellence-lome.tg",
    city: "Lomé",
    country: "Togo",
    phone: "+228 22 21 45 60",
    address: "Quartier Tokoin, Boulevard Circulaire",
    totalInvoiced: 590000,
    invoicesCount: 1,
    status: "actif",
    percentage: 20,
  },
  {
    id: "cli-real-005",
    name: "Dakar Transit & Fret International",
    email: "compta@dakartransit.sn",
    city: "Dakar",
    country: "Sénégal",
    phone: "+221 33 822 55 70",
    address: "Zone Portuaire Môle 2",
    totalInvoiced: 1003000,
    invoicesCount: 1,
    status: "actif",
    percentage: 25,
  },
];

export const RECENT_INVOICES: Invoice[] = [
  {
    id: "inv-real-001",
    number: "FAC-2026-001",
    client: {
      name: "Société Africaine de Distribution & Services (SADS SA)",
      email: "comptabilite@sads-afrique.com",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      phone: "+225 27 22 40 80",
      address: "Immeuble Horizon, Boulevard VGE",
    },
    issueDate: "2026-10-10",
    dueDate: "2026-10-25",
    currency: "XOF",
    amount: 767000,
    subtotal: 650000,
    taxRate: 18,
    taxAmount: 117000,
    paidAmount: 767000,
    status: "payee",
    paymentMethod: "Wave",
    items: [
      {
        id: "item-real-001-1",
        description: "Abonnement Annuel GesFacture Enterprise — Licence Équipe",
        quantity: 1,
        unitPrice: 350000,
        total: 350000,
      },
      {
        id: "item-real-001-2",
        description: "Pack Intégration Passerelle Mobile Money & Formation Comptable",
        quantity: 2,
        unitPrice: 150000,
        total: 300000,
      },
    ],
    notes: "Règlement intégral perçu avec succès via Wave QR Code instantané.",
  },
  {
    id: "inv-real-002",
    number: "FAC-2026-002",
    client: {
      name: "Sahel Agro Industries SARL",
      email: "direction.finances@sahelagro.sn",
      city: "Dakar",
      country: "Sénégal",
      phone: "+221 33 864 12 30",
      address: "Zone Industrielle de Yoff",
    },
    issueDate: "2026-10-14",
    dueDate: "2026-10-29",
    currency: "XOF",
    amount: 708000,
    subtotal: 600000,
    taxRate: 18,
    taxAmount: 108000,
    paidAmount: 0,
    status: "envoyee",
    paymentMethod: "Orange Money",
    items: [
      {
        id: "item-real-002-1",
        description: "Module de Facturation Certifiée OHADA & Rapprochement Bancaire",
        quantity: 1,
        unitPrice: 480000,
        total: 480000,
      },
      {
        id: "item-real-002-2",
        description: "Support Technique Dédié & SLA Garantie 24h/7j (Trimestre 4)",
        quantity: 1,
        unitPrice: 120000,
        total: 120000,
      },
    ],
    notes: "Facture transmise à la direction financière. Lien de paiement direct actif.",
  },
  {
    id: "inv-real-003",
    number: "FAC-2026-003",
    client: {
      name: "BatiPro Construction & BTP SA",
      email: "facturation@batipro-cm.com",
      city: "Douala",
      country: "Cameroun",
      phone: "+237 233 42 19 80",
      address: "Boulevard de la Liberté, Akwa",
    },
    issueDate: "2026-10-02",
    dueDate: "2026-10-17",
    currency: "XOF",
    amount: 1652000,
    subtotal: 1400000,
    taxRate: 18,
    taxAmount: 252000,
    paidAmount: 1652000,
    status: "payee",
    paymentMethod: "Virement Bancaire",
    items: [
      {
        id: "item-real-003-1",
        description: "Licence GesFacture Multi-chantiers & Suivi Budgétaire Acomptes",
        quantity: 1,
        unitPrice: 950000,
        total: 950000,
      },
      {
        id: "item-real-003-2",
        description: "Sessions de Formation Avancée Équipes Chantier & Comptabilité (3 jours)",
        quantity: 3,
        unitPrice: 150000,
        total: 450000,
      },
    ],
    notes: "Virement bancaire certifié et rapproché.",
  },
  {
    id: "inv-real-004",
    number: "FAC-2026-004",
    client: {
      name: "Groupe Scolaire Excellence & Avenir",
      email: "tresorerie@excellence-lome.tg",
      city: "Lomé",
      country: "Togo",
      phone: "+228 22 21 45 60",
      address: "Quartier Tokoin, Boulevard Circulaire",
    },
    issueDate: "2026-09-15",
    dueDate: "2026-09-30",
    currency: "XOF",
    amount: 590000,
    subtotal: 500000,
    taxRate: 18,
    taxAmount: 90000,
    paidAmount: 0,
    status: "en_retard",
    paymentMethod: "MTN MoMo",
    items: [
      {
        id: "item-real-004-1",
        description: "Plateforme d'Encaissement des Frais Scolaires via Mobile Money (Wave / MoMo)",
        quantity: 1,
        unitPrice: 500000,
        total: 500000,
      },
    ],
    notes: "Relance automatique WhatsApp envoyée. Paiement attendu sous 48h.",
  },
  {
    id: "inv-real-005",
    number: "FAC-2026-005",
    client: {
      name: "Dakar Transit & Fret International",
      email: "compta@dakartransit.sn",
      city: "Dakar",
      country: "Sénégal",
      phone: "+221 33 822 55 70",
      address: "Zone Portuaire Môle 2",
    },
    issueDate: "2026-10-18",
    dueDate: "2026-11-02",
    currency: "XOF",
    amount: 1003000,
    subtotal: 850000,
    taxRate: 18,
    taxAmount: 153000,
    paidAmount: 0,
    status: "brouillon",
    paymentMethod: "Wave",
    items: [
      {
        id: "item-real-005-1",
        description: "Déploiement GesFacture Douane & Export PDF Factures de Débarquement",
        quantity: 1,
        unitPrice: 850000,
        total: 850000,
      },
    ],
    notes: "En attente de validation du bon de commande définitif.",
  },
];

export const REVENUE_CHART_DATA = [
  { month: "Mai", encaisse: 1850000, facture: 2100000 },
  { month: "Juin", encaisse: 2400000, facture: 2600000 },
  { month: "Juil", encaisse: 2150000, facture: 2400000 },
  { month: "Août", encaisse: 2900000, facture: 3100000 },
  { month: "Sept", encaisse: 3450000, facture: 3800000 },
  { month: "Oct", encaisse: 2419000, facture: 4720000 },
];


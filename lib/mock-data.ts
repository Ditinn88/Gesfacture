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
  amount: number;    // Total TTC in FCFA
  subtotal?: number; // Total HT in FCFA
  taxRate?: number;  // 18% standard
  taxAmount?: number;
  paidAmount: number;
  status: "payee" | "envoyee" | "brouillon" | "en_retard";
  paymentMethod?: "Wave" | "Orange Money" | "MTN MoMo" | "Virement Bancaire" | "Espèces";
  items?: InvoiceItem[];
  notes?: string;
}

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
  paymentDelay: 30,
  defaultVatRate: 18,
  waveNumber: "",
  omNumber: "",
  iban: "",
  bankName: "",
  bankSwift: "",
};

export const CURRENT_USER = {
  name: "Administrateur",
  email: "admin@gesfacture.sn",
  role: "Directeur Général",
  avatar: "AD",
  organization: DEFAULT_ORGANIZATION,
};

export const KPI_DATA: KpiSummary = {
  totalCollected: {
    amount: 0,
    collectionRate: 0,
    growthPercent: 0,
  },
  pending: {
    amount: 0,
    count: 0,
  },
  overdue: {
    amount: 0,
    count: 0,
    alertText: "0 facture en retard",
  },
  newClients: {
    count: 0,
    growthPercent: 0,
  },
  totalInvoiced: {
    amount: 0,
    count: 0,
    growthPercent: 0,
  },
};

// Pure real data: No hardcoded demo clients or demo invoices
export const TOP_CLIENTS: Client[] = [];
export const RECENT_INVOICES: Invoice[] = [];
export const REVENUE_CHART_DATA: { month: string; encaisse: number; facture: number }[] = [];

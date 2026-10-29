"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Invoice,
  InvoiceItem,
  Client,
  Member,
  MemberRole,
  Organization,
  WorkspaceRole,
  WORKSPACE_ROLE_LABELS,
  DEFAULT_ORGANIZATION,
  PLACEHOLDER_ORGANIZATION_VALUES,
  RECENT_INVOICES,
  TOP_CLIENTS,
} from "@/lib/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { paidAmountOf, sumByCurrency, toLocalYMD } from "@/lib/utils";

interface DataContextType {
  invoices: Invoice[];
  clients: Client[];
  organization: Organization;
  isLoading: boolean;
  isCloudSynced: boolean;
  syncError: string | null;
  dismissSyncError: () => void;
  addInvoice: (invoiceData: Omit<Invoice, "id"> & { id?: string }) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => boolean;
  getInvoice: (id: string) => Invoice | undefined;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  recordPayment: (id: string, amount: number) => Invoice | undefined;
  addClient: (clientData: Omit<Client, "id"> & { id?: string }) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;
  getClient: (id: string) => Client | undefined;
  updateOrganization: (updates: Partial<Organization>) => void;
  resetOrganization: () => void;
  resetAllData: () => void;
  clearDemoData: () => Promise<void>;
  // Espace partagé : rôle de l'utilisateur connecté et droits qui en découlent
  workspaceRole: WorkspaceRole;
  isSharedWorkspace: boolean;
  canEdit: boolean;
  canManageOrganization: boolean;
  // Membres de l'entreprise (compte Supabase uniquement). membersAvailable = false tant que
  // supabase/schema.sql n'a pas été relancé (table organization_members absente)
  members: Member[];
  membersAvailable: boolean;
  // Renvoient un message d'erreur en français, ou null en cas de succès
  addMember: (data: { email: string; name: string; role: MemberRole }) => Promise<string | null>;
  updateMemberRole: (id: string, role: MemberRole) => Promise<string | null>;
  removeMember: (id: string) => Promise<string | null>;
  // Compte Supabase encore vide alors que l'appareil contient des factures / clients saisis sans compte
  localImport: { invoices: number; clients: number } | null;
  importLocalData: () => Promise<string | null>;
  dismissLocalImport: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INVOICES_STORAGE_KEY = "gesfacture_invoices_v8";
const CLIENTS_STORAGE_KEY = "gesfacture_clients_v8";
const ORGANIZATION_STORAGE_KEY = "gesfacture_organization_v8";

// Cache local séparé par compte Supabase : un utilisateur ne voit jamais le cache d'un autre
const storageKey = (base: string, cloudUserId: string | null) =>
  cloudUserId ? `${base}_${cloudUserId}` : base;

// Helper to detect and reject legacy mock / fixture data only
const isMockInvoice = (inv: any): boolean => {
  if (!inv) return true;
  return (
    inv.id === "inv-001" ||
    inv.id === "inv-002" ||
    inv.id === "inv-003" ||
    inv.id === "inv-004" ||
    inv.id === "inv-005" ||
    inv.id === "fac-001" ||
    inv.id === "fac-002" ||
    inv.id === "fac-003" ||
    inv.client?.name === "Alpha Diallo" ||
    inv.client?.name === "Cansaas Agency" ||
    inv.client?.name === "TechDakar SARL"
  );
};

const isMockClient = (c: any): boolean => {
  if (!c) return true;
  // Reject legacy mock IDs (cli-01 through cli-25 or short dummy IDs)
  // Real created clients have timestamp IDs (cli-17...) or UUIDs
  if (typeof c.id === "string") {
    if (
      c.id.startsWith("cli-0") ||
      (c.id.startsWith("cli-") && c.id.length <= 6 && !c.id.startsWith("cli-17"))
    ) {
      return true;
    }
  }
  return (
    c.name === "Alpha Diallo" ||
    c.name === "Fatou Ndiaye" ||
    c.name === "Cansaas Agency" ||
    c.name === "TechDakar SARL" ||
    c.name === "Cabinet Sylla & Associés" ||
    c.name === "Ngoné Fall Créations" ||
    c.name === "Sékou Traoré Consulting"
  );
};

// Efface les coordonnées fictives livrées par d'anciennes versions (elles s'imprimeraient sur les factures)
const stripPlaceholders = (org: Organization): Organization => {
  const cleaned = { ...org } as Record<string, unknown>;
  for (const [key, value] of Object.entries(cleaned)) {
    if (typeof value === "string" && PLACEHOLDER_ORGANIZATION_VALUES.includes(value.trim())) cleaned[key] = "";
  }
  return cleaned as unknown as Organization;
};

const parseOrgRow = (row: any): Organization => stripPlaceholders(parseOrgRowFields(row));

const parseOrgRowFields = (row: any): Organization => {
  if (!row) return DEFAULT_ORGANIZATION;

  // Filter out legacy dummy numbers
  const cleanWave = (row.wave_number === "+221 77 123 45 67" || !row.wave_number) ? "" : String(row.wave_number).trim();
  const cleanOm = (row.om_number === "+221 78 987 65 43" || !row.om_number) ? "" : String(row.om_number).trim();

  let parsedIban = (row.iban || "").trim();
  let parsedBankName = "";
  let parsedBankSwift = "";

  if (parsedIban.startsWith("{")) {
    try {
      const bObj = JSON.parse(parsedIban);
      parsedIban = bObj.iban || "";
      parsedBankName = bObj.bankName || "";
      parsedBankSwift = bObj.bankSwift || "";
    } catch (e) {}
  }

  // Filter out legacy dummy bank defaults
  if (parsedIban === "SN08 SN01 0012 3456 7890 12") parsedIban = "";
  if (parsedBankName === "CBAO Groupe Attijariwafa Bank") parsedBankName = "";
  if (parsedBankSwift === "CBAOSNDA") parsedBankSwift = "";

  return {
    name: row.name || DEFAULT_ORGANIZATION.name,
    legalName: row.legal_name || DEFAULT_ORGANIZATION.legalName,
    rccm: (row.rccm === "SN-DKR-2024-B-12845" ? "" : row.rccm) || "",
    taxId: (row.tax_id === "NINEA 007293842 2V3" ? "" : row.tax_id) || "",
    address: (row.address === "Immeuble Tamaro, Avenue Pasteur" ? "" : row.address) || "",
    city: row.city || "Dakar",
    country: row.country || "Sénégal",
    phone: (row.phone === "+221 33 821 00 11" ? "" : row.phone) || "",
    email: (row.email === "contact@gesfacture.sn" ? "" : row.email) || "",
    website: (row.website === "https://gesfacture.sn" ? "" : row.website) || "",
    currency: row.currency || "XOF",
    waveNumber: cleanWave,
    omNumber: cleanOm,
    iban: parsedIban,
    bankName: parsedBankName,
    bankSwift: parsedBankSwift,
    invoicePrefix: row.invoice_prefix || "FAC-2026-",
    paymentDelay: row.payment_delay ?? 30,
    defaultVatRate: row.default_vat_rate ?? 18,
  };
};

// Les quantités / prix saisis étaient parfois enregistrés en texte : on les remet en nombres
const normalizeItems = (items: any): InvoiceItem[] =>
  Array.isArray(items)
    ? items.map((it: any) => ({
        ...it,
        quantity: Number(it.quantity) || 0,
        unitPrice: Number(it.unitPrice) || 0,
        total: Number(it.total) || 0,
      }))
    : [];

const rowToInvoice = (row: any): Invoice => ({
  id: row.id,
  number: row.number,
  client: typeof row.client === "string" ? JSON.parse(row.client) : row.client,
  issueDate: row.issue_date,
  dueDate: row.due_date,
  amount: Number(row.amount),
  subtotal: Number(row.subtotal || 0),
  taxRate: row.tax_rate === null || row.tax_rate === undefined ? 18 : Number(row.tax_rate),
  taxAmount: Number(row.tax_amount || 0),
  discountPercent: Number(row.discount_percent || 0),
  paidAmount: Number(row.paid_amount || 0),
  status: row.status,
  paymentMethod: row.payment_method,
  items: normalizeItems(row.items),
  notes: row.notes || "",
  currency: row.currency || "XOF",
});

const rowToMember = (row: any): Member => ({
  id: row.id,
  email: row.email,
  name: row.name || "",
  role: row.role,
});

// Lignes à insérer dans Supabase (user_id = chef d'entreprise propriétaire, même si un membre crée la ligne)
const invoiceToInsertRow = (inv: Invoice, ownerId: string | null) => ({
  id: inv.id,
  user_id: ownerId,
  number: inv.number,
  client: inv.client,
  currency: inv.currency || "XOF",
  issue_date: inv.issueDate,
  due_date: inv.dueDate,
  amount: inv.amount,
  subtotal: inv.subtotal || 0,
  tax_rate: inv.taxRate ?? 18,
  tax_amount: inv.taxAmount || 0,
  discount_percent: inv.discountPercent || 0,
  paid_amount: inv.paidAmount || 0,
  status: inv.status,
  payment_method: inv.paymentMethod,
  items: inv.items || [],
  notes: inv.notes || "",
});

const clientToInsertRow = (c: Client, ownerId: string | null) => ({
  id: c.id,
  user_id: ownerId,
  name: c.name,
  email: c.email,
  city: c.city,
  country: c.country,
  phone: c.phone,
  address: c.address,
  total_invoiced: 0,
  invoices_count: 0,
  status: c.status,
  percentage: c.percentage,
});

// Exemples chargés au premier lancement en mode local (RECENT_INVOICES / TOP_CLIENTS) : jamais importés
const isExampleRecord = (r: { id?: string }) => typeof r.id === "string" && /^(inv|cli)-real-/.test(r.id);

const rowToClient = (row: any): Client => ({
  id: row.id,
  name: row.name,
  email: row.email,
  city: row.city || "Dakar",
  country: row.country || "Sénégal",
  phone: row.phone,
  address: row.address,
  totalInvoiced: Number(row.total_invoiced || 0),
  invoicesCount: Number(row.invoices_count || 0),
  status: row.status,
  percentage: Number(row.percentage || 10),
});

const invoiceUpdatesToRow = (updates: Partial<Invoice>): Record<string, any> => {
  const mapped: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (updates.number) mapped.number = updates.number;
  if (updates.client) mapped.client = updates.client;
  if (updates.issueDate) mapped.issue_date = updates.issueDate;
  if (updates.dueDate) mapped.due_date = updates.dueDate;
  if (updates.amount !== undefined) mapped.amount = updates.amount;
  if (updates.subtotal !== undefined) mapped.subtotal = updates.subtotal;
  if (updates.taxRate !== undefined) mapped.tax_rate = updates.taxRate;
  if (updates.taxAmount !== undefined) mapped.tax_amount = updates.taxAmount;
  if (updates.discountPercent !== undefined) mapped.discount_percent = updates.discountPercent;
  if (updates.paidAmount !== undefined) mapped.paid_amount = updates.paidAmount;
  if (updates.status) mapped.status = updates.status;
  if (updates.paymentMethod) mapped.payment_method = updates.paymentMethod;
  if (updates.items) mapped.items = updates.items;
  if (updates.notes !== undefined) mapped.notes = updates.notes;
  if (updates.currency) mapped.currency = updates.currency;
  return mapped;
};

const readCache = <T,>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch (e) {
    console.warn("Could not load from localStorage cache", e);
    return null;
  }
};

const writeCache = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Could not persist to localStorage", e);
  }
};

// Comparaison insensible à la casse et aux espaces (doubles espaces, insécables…)
const normalizeText = (s: string) => s.normalize("NFC").replace(/\s+/g, " ").trim().toLowerCase();
const sameText = (a?: string, b?: string) => Boolean(a && b && normalizeText(a) === normalizeText(b));

// Une facture appartient au client dont elle porte l'id ; à défaut (anciennes factures), nom ou email
const invoiceBelongsTo = (inv: Invoice, c: Client) =>
  inv.client.id ? inv.client.id === c.id : sameText(inv.client.name, c.name) || sameText(inv.client.email, c.email);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { session, isLoading: authLoading } = useAuth();
  // Synchronisation cloud uniquement avec une vraie session Supabase (pas en mode démo)
  const cloudUserId = isSupabaseConfigured && supabase && session?.user ? session.user.id : null;
  const cloud = cloudUserId ? supabase : null;
  const userEmail = (session?.user?.email || "").trim().toLowerCase();

  // Espace affiché : celui du compte connecté, ou celui d'un chef d'entreprise qui l'a ajouté comme membre
  const [workspace, setWorkspace] = useState<{ userId: string; ownerId: string; role: WorkspaceRole } | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [membersAvailable, setMembersAvailable] = useState(true);
  const [localImportData, setLocalImportData] = useState<{ invoices: Invoice[]; clients: Client[] } | null>(null);
  const activeWorkspace = workspace && workspace.userId === cloudUserId ? workspace : null;
  // Propriétaire des données affichées (null en mode local, ou tant que l'espace n'est pas résolu)
  const ownerId = cloudUserId ? activeWorkspace?.ownerId ?? null : null;
  const workspaceRole: WorkspaceRole = activeWorkspace?.role ?? "owner";
  const canEdit = workspaceRole !== "lecteur";
  const canManageOrganization = workspaceRole === "owner" || workspaceRole === "admin";
  // Cache local par compte et par espace : un membre retiré ne garde pas les données de l'entreprise
  const cacheId = cloudUserId && ownerId && ownerId !== cloudUserId ? `${cloudUserId}_${ownerId}` : cloudUserId;

  const [rawInvoices, setRawInvoices] = useState<Invoice[]>([]);
  const [rawClients, setRawClients] = useState<Client[]>([]);
  const [organization, setOrganization] = useState<Organization>(DEFAULT_ORGANIZATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const previousCloudUserId = useRef<string | null>(null);
  const previousCacheId = useRef<string | null>(null);

  const reportSyncError = useCallback((action: string, error: any) => {
    console.error(`${action} — Supabase:`, error);
    const detail = error?.message ? ` (${error.message})` : "";
    setSyncError(
      `${action} n'a pas pu être enregistré(e) dans Supabase${detail}. La modification est conservée sur cet appareil uniquement.`
    );
  }, []);

  const dismissSyncError = useCallback(() => setSyncError(null), []);

  const denyAction = (what: string) =>
    setSyncError(
      `Votre rôle « ${WORKSPACE_ROLE_LABELS[workspaceRole]} » ne permet pas de ${what}. Demandez au chef d'entreprise de modifier votre rôle.`
    );

  // Le compte connecté est-il membre de l'espace d'un chef d'entreprise ? (le plus ancien s'il y en a plusieurs)
  const resolveWorkspace = useCallback(async () => {
    if (!cloudUserId || !supabase) return;
    const own = { userId: cloudUserId, ownerId: cloudUserId, role: "owner" as WorkspaceRole };
    let next = own;
    try {
      const { data, error } = await supabase
        .from("organization_members")
        .select("owner_id, role")
        .eq("email", userEmail)
        .neq("owner_id", cloudUserId)
        .order("created_at", { ascending: true })
        .limit(1);
      // Table absente (schema.sql pas encore relancé) : chacun reste dans son propre espace
      setMembersAvailable(!error);
      const row = !error && data ? data[0] : null;
      if (row) next = { userId: cloudUserId, ownerId: String(row.owner_id), role: row.role as MemberRole };
    } catch (e) {
      // Réseau indisponible : son propre espace
    }
    setWorkspace((prev) =>
      prev && prev.userId === next.userId && prev.ownerId === next.ownerId && prev.role === next.role ? prev : next
    );
  }, [cloudUserId, userEmail]);

  useEffect(() => {
    if (authLoading) return;
    resolveWorkspace();
  }, [authLoading, resolveWorkspace]);

  // Mise à jour de l'état + du cache local, via des updaters fonctionnels (pas de closure périmée)
  const saveInvoices = (updater: (prev: Invoice[]) => Invoice[]) => {
    setRawInvoices((prev) => {
      const next = updater(prev).filter((i) => !isMockInvoice(i));
      writeCache(storageKey(INVOICES_STORAGE_KEY, cacheId), next);
      return next;
    });
  };

  const saveClients = (updater: (prev: Client[]) => Client[]) => {
    setRawClients((prev) => {
      const next = updater(prev).filter((c) => !isMockClient(c));
      writeCache(storageKey(CLIENTS_STORAGE_KEY, cacheId), next);
      return next;
    });
  };

  // Chargement des données : cache local du compte courant, puis Supabase si une session existe
  useEffect(() => {
    if (authLoading) return;

    let isMounted = true;
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;

    // Déconnexion : on efface le cache du compte précédent, espaces partagés compris (appareil partagé)
    const previous = previousCloudUserId.current;
    if (previous && previous !== cloudUserId) {
      try {
        const bases = [INVOICES_STORAGE_KEY, CLIENTS_STORAGE_KEY, ORGANIZATION_STORAGE_KEY];
        Object.keys(localStorage)
          .filter((k) => bases.some((base) => k.startsWith(storageKey(base, previous))))
          .forEach((k) => localStorage.removeItem(k));
      } catch (e) {}
    }
    previousCloudUserId.current = cloudUserId;

    // Membre retiré d'un espace partagé : son cache de cet espace est effacé
    const previousCache = previousCacheId.current;
    if (previousCache && previousCache !== cacheId && previousCache.includes("_")) {
      try {
        [INVOICES_STORAGE_KEY, CLIENTS_STORAGE_KEY, ORGANIZATION_STORAGE_KEY].forEach((key) =>
          localStorage.removeItem(storageKey(key, previousCache))
        );
      } catch (e) {}
    }
    previousCacheId.current = cacheId;

    // Nettoyage immédiat des anciennes clés de localStorage contenant des mocks
    try {
      const legacyKeys = [
        "gesfacture_invoices",
        "gesfacture_invoices_v1",
        "gesfacture_invoices_v2",
        "gesfacture_invoices_v3",
        "gesfacture_invoices_v4",
        "gesfacture_invoices_v5",
        "gesfacture_invoices_v6",
        "gesfacture_clients",
        "gesfacture_clients_v2",
        "gesfacture_clients_v3",
        "gesfacture_clients_v4",
        "gesfacture_clients_v5",
        "gesfacture_clients_v6",
      ];
      legacyKeys.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      // Ignorer si non disponible
    }

    setIsLoading(true);
    setIsCloudSynced(false);

    // Compte connecté : on attend de savoir quel espace afficher (le sien ou celui de son chef d'entreprise)
    if (cloudUserId && !ownerId) return;

    // 1. Cache local du compte courant (vide si aucun : jamais les données d'un autre compte).
    // Les données saisies sous les clés v7 sont reprises telles quelles.
    const readVersioned = <T,>(base: string): T | null =>
      readCache<T>(storageKey(base, cacheId)) ??
      readCache<T>(storageKey(base.replace(/_v8$/, "_v7"), cacheId));
    const cachedInvoices = readVersioned<Invoice[]>(INVOICES_STORAGE_KEY);
    const cachedClients = readVersioned<Client[]>(CLIENTS_STORAGE_KEY);
    const cachedOrg = readVersioned<Organization>(ORGANIZATION_STORAGE_KEY);

    // Premier lancement en mode local (aucune donnée, même ancienne) : factures et clients d'exemple,
    // enregistrés tout de suite pour que factures et clients restent cohérents au rechargement
    const seedExamples = !cloudUserId && cachedInvoices === null && cachedClients === null;
    if (seedExamples) {
      writeCache(INVOICES_STORAGE_KEY, RECENT_INVOICES);
      writeCache(CLIENTS_STORAGE_KEY, TOP_CLIENTS);
    }

    setRawInvoices(
      Array.isArray(cachedInvoices)
        ? cachedInvoices
            .filter((i) => !isMockInvoice(i))
            .map((i) => ({ ...i, items: normalizeItems(i.items) }))
        : seedExamples
        ? RECENT_INVOICES
        : []
    );
    setRawClients(
      Array.isArray(cachedClients)
        ? cachedClients.filter((c) => !isMockClient(c))
        : seedExamples
        ? TOP_CLIENTS
        : []
    );
    setOrganization(
      cachedOrg && typeof cachedOrg === "object"
        ? stripPlaceholders({ ...DEFAULT_ORGANIZATION, ...cachedOrg })
        : DEFAULT_ORGANIZATION
    );

    if (!cloudUserId || !ownerId || !supabase) {
      setMembers([]);
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    const client = supabase;
    const workspaceOwner = ownerId;
    const workspaceCache = cacheId;

    // Filtre explicite sur le propriétaire : un membre qui a aussi ses propres données ne les mélange pas
    const fetchInvoices = () =>
      client.from("invoices").select("*").eq("user_id", workspaceOwner).order("created_at", { ascending: false });
    const fetchClients = () =>
      client.from("clients").select("*").eq("user_id", workspaceOwner).order("created_at", { ascending: false });
    const fetchOrganization = () =>
      client.from("organizations").select("*").eq("id", workspaceOwner).maybeSingle();
    const fetchMembers = () =>
      client
        .from("organization_members")
        .select("*")
        .eq("owner_id", workspaceOwner)
        .order("created_at", { ascending: true });

    const applyInvoices = (rows: any[]) => {
      const mapped = rows.map(rowToInvoice).filter((inv) => !isMockInvoice(inv));
      setRawInvoices(mapped);
      writeCache(storageKey(INVOICES_STORAGE_KEY, workspaceCache), mapped);
    };
    const applyClients = (rows: any[]) => {
      const mapped = rows.map(rowToClient).filter((c) => !isMockClient(c));
      setRawClients(mapped);
      writeCache(storageKey(CLIENTS_STORAGE_KEY, workspaceCache), mapped);
    };
    const applyOrganization = (row: any) => {
      const mapped = parseOrgRow(row);
      setOrganization(mapped);
      writeCache(storageKey(ORGANIZATION_STORAGE_KEY, workspaceCache), mapped);
    };
    const applyMembers = (res: { data: any[] | null; error: any }) => {
      setMembersAvailable(!res.error);
      setMembers(res.error || !res.data ? [] : res.data.map(rowToMember));
    };

    async function loadCloudData() {
      try {
        const [invoicesRes, clientsRes, orgRes, membersRes] = await Promise.all([
          fetchInvoices(),
          fetchClients(),
          fetchOrganization(),
          fetchMembers(),
        ]);
        if (!isMounted) return;

        applyMembers(membersRes);

        if (invoicesRes.error) reportSyncError("Le chargement des factures", invoicesRes.error);
        else if (invoicesRes.data) applyInvoices(invoicesRes.data);

        if (clientsRes.error) reportSyncError("Le chargement des clients", clientsRes.error);
        else if (clientsRes.data) applyClients(clientsRes.data);

        if (orgRes.error) reportSyncError("Le chargement des paramètres", orgRes.error);
        else if (orgRes.data) applyOrganization(orgRes.data);

        setIsCloudSynced(!invoicesRes.error && !clientsRes.error && !orgRes.error);

        // Compte vide (le sien, pas un espace partagé) : propose d'y importer les données saisies sans compte
        const cloudEmpty =
          !invoicesRes.error && !clientsRes.error && !invoicesRes.data?.length && !clientsRes.data?.length;
        if (cloudEmpty && workspaceOwner === cloudUserId) {
          const fromDevice = <T extends { id?: string },>(base: string): T[] => {
            const list = readCache<T[]>(base) ?? readCache<T[]>(base.replace(/_v8$/, "_v7"));
            return Array.isArray(list) ? list.filter((r) => !isExampleRecord(r)) : [];
          };
          const localInvoices = fromDevice<Invoice>(INVOICES_STORAGE_KEY).filter((i) => !isMockInvoice(i));
          const localClients = fromDevice<Client>(CLIENTS_STORAGE_KEY).filter((c) => !isMockClient(c));
          setLocalImportData(
            localInvoices.length || localClients.length
              ? { invoices: localInvoices.map((i) => ({ ...i, items: normalizeItems(i.items) })), clients: localClients }
              : null
          );
        } else {
          setLocalImportData(null);
        }
      } catch (err) {
        if (isMounted) reportSyncError("Le chargement des données", err);
      }

      if (!isMounted) return;

      // 2. Écoute Realtime : rechargement de la table modifiée
      channel = client
        .channel(`gesfacture-realtime-${workspaceCache}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "invoices" }, async () => {
          const { data } = await fetchInvoices();
          if (data && isMounted) applyInvoices(data);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, async () => {
          const { data } = await fetchClients();
          if (data && isMounted) applyClients(data);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, async () => {
          const { data } = await fetchOrganization();
          if (data && isMounted) applyOrganization(data);
        })
        // Membres ajoutés, retirés ou changés de rôle : liste et droits du compte connecté mis à jour
        .on("postgres_changes", { event: "*", schema: "public", table: "organization_members" }, async () => {
          const res = await fetchMembers();
          if (!isMounted) return;
          applyMembers(res);
          resolveWorkspace();
        })
        .subscribe();

      setIsLoading(false);
    }

    loadCloudData();

    return () => {
      isMounted = false;
      if (channel) client.removeChannel(channel);
    };
  }, [authLoading, cloudUserId, ownerId, cacheId, reportSyncError, resolveWorkspace]);

  // Une facture envoyée dont l'échéance est dépassée est en retard
  const invoices = useMemo(() => {
    const today = toLocalYMD(new Date());
    return rawInvoices.map((inv) =>
      inv.status === "envoyee" && inv.dueDate && inv.dueDate < today
        ? { ...inv, status: "en_retard" as const }
        : inv
    );
  }, [rawInvoices]);

  // Totaux clients calculés à partir des factures émises (jamais désynchronisés)
  const clients = useMemo(
    () =>
      rawClients.map((c) => {
        const own = rawInvoices.filter((inv) => inv.status !== "brouillon" && invoiceBelongsTo(inv, c));
        return {
          ...c,
          totalInvoiced: own.reduce((sum, inv) => sum + (inv.amount || 0), 0),
          invoicesCount: own.length,
          totalsByCurrency: sumByCurrency(own, organization.currency || "XOF"),
        };
      }),
    [rawClients, rawInvoices, organization.currency]
  );

  // Gestion Organisation
  const persistOrganization = (updated: Organization) => {
    if (!canManageOrganization) {
      denyAction("modifier les paramètres de l'entreprise");
      return;
    }
    setOrganization(updated);
    writeCache(storageKey(ORGANIZATION_STORAGE_KEY, cacheId), updated);

    if (cloud && ownerId) {
      // Enregistrer l'IBAN avec les métadonnées bancaires
      const ibanPayload = JSON.stringify({
        iban: updated.iban || "",
        bankName: updated.bankName || "",
        bankSwift: updated.bankSwift || "",
      });

      cloud
        .from("organizations")
        .upsert({
          id: ownerId,
          user_id: ownerId,
          name: updated.name,
          legal_name: updated.legalName,
          rccm: updated.rccm,
          tax_id: updated.taxId,
          address: updated.address,
          city: updated.city,
          country: updated.country,
          phone: updated.phone,
          email: updated.email,
          website: updated.website,
          currency: updated.currency,
          wave_number: updated.waveNumber,
          om_number: updated.omNumber,
          iban: ibanPayload,
          invoice_prefix: updated.invoicePrefix,
          payment_delay: updated.paymentDelay,
          default_vat_rate: updated.defaultVatRate,
          updated_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) reportSyncError("La mise à jour des paramètres", error);
        });
    }
  };

  const updateOrganization = (updates: Partial<Organization>) => {
    persistOrganization({ ...organization, ...updates });
  };

  const resetOrganization = () => {
    persistOrganization(DEFAULT_ORGANIZATION);
  };

  // CRUD Factures
  const addInvoice = (invoiceData: Omit<Invoice, "id"> & { id?: string }): Invoice => {
    const id = invoiceData.id || `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      items: normalizeItems(invoiceData.items),
      currency: invoiceData.currency || organization.currency || "XOF",
      id,
    };
    if (!canEdit) {
      denyAction("créer une facture");
      return newInvoice;
    }
    saveInvoices((prev) => [newInvoice, ...prev]);

    // Sauvegarder dans Supabase
    if (cloud) {
      cloud
        .from("invoices")
        .insert(invoiceToInsertRow(newInvoice, ownerId))
        .then(({ error }) => {
          if (error) reportSyncError(`La facture ${newInvoice.number}`, error);
        });
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    if (!canEdit) {
      denyAction("modifier une facture");
      return;
    }
    const normalized = updates.items ? { ...updates, items: normalizeItems(updates.items) } : updates;
    saveInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...normalized } : inv)));

    if (cloud) {
      cloud
        .from("invoices")
        .update(invoiceUpdatesToRow(normalized))
        .eq("id", id)
        .then(({ error }) => {
          if (error) reportSyncError("La modification de la facture", error);
        });
    }
  };

  const deleteInvoice = (id: string): boolean => {
    if (!canEdit) {
      denyAction("supprimer une facture");
      return false;
    }
    saveInvoices((prev) => prev.filter((inv) => inv.id !== id));

    if (cloud) {
      cloud
        .from("invoices")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) reportSyncError("La suppression de la facture", error);
        });
    }

    return true;
  };

  const getInvoice = (id: string): Invoice | undefined => {
    return invoices.find((inv) => inv.id === id);
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    const current = getInvoice(id);
    // « Payée » solde la facture ; repasser une facture payée (ou en brouillon) efface l'encaissement ;
    // entre « Envoyée » et « En retard », les acomptes déjà reçus sont conservés
    const paidAmount =
      status === "payee"
        ? current?.amount || 0
        : status === "brouillon" || current?.status === "payee"
        ? 0
        : current
        ? paidAmountOf(current)
        : 0;
    updateInvoice(id, { status, paidAmount });
  };

  // Paiement partiel : l'acompte s'ajoute à la même facture, qui passe en « Payée » une fois soldée
  const recordPayment = (id: string, amount: number): Invoice | undefined => {
    if (!canEdit) {
      denyAction("enregistrer un paiement");
      return undefined;
    }
    const current = getInvoice(id);
    if (!current || !(amount > 0)) return undefined;
    const paidAmount = Math.min(current.amount, paidAmountOf(current) + amount);
    const status: Invoice["status"] =
      paidAmount >= current.amount ? "payee" : current.status === "brouillon" ? "envoyee" : current.status;
    // Statut inchangé (dont « En retard », dérivé de l'échéance) : seul le montant payé est écrit
    updateInvoice(id, status === current.status ? { paidAmount } : { paidAmount, status });
    return { ...current, paidAmount, status };
  };

  // CRUD Clients
  const addClient = (clientData: Omit<Client, "id"> & { id?: string }): Client => {
    const id = clientData.id || `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      totalInvoiced: 0,
      invoicesCount: 0,
      status: clientData.status || "actif",
      percentage: clientData.percentage || 10,
    };
    if (!canEdit) {
      denyAction("créer un client");
      return newClient;
    }
    saveClients((prev) => [newClient, ...prev]);

    if (cloud) {
      cloud
        .from("clients")
        .insert(clientToInsertRow(newClient, ownerId))
        .then(({ error }) => {
          if (error) reportSyncError(`Le client ${newClient.name}`, error);
        });
    }

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    if (!canEdit) {
      denyAction("modifier un client");
      return;
    }
    saveClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (cloud) {
      const mapped: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) mapped.name = updates.name;
      if (updates.email) mapped.email = updates.email;
      if (updates.city) mapped.city = updates.city;
      if (updates.country) mapped.country = updates.country;
      if (updates.phone !== undefined) mapped.phone = updates.phone;
      if (updates.address !== undefined) mapped.address = updates.address;
      if (updates.status) mapped.status = updates.status;
      if (updates.percentage !== undefined) mapped.percentage = updates.percentage;

      cloud
        .from("clients")
        .update(mapped)
        .eq("id", id)
        .then(({ error }) => {
          if (error) reportSyncError("La modification du client", error);
        });
    }
  };

  const deleteClient = (id: string): boolean => {
    if (!canEdit) {
      denyAction("supprimer un client");
      return false;
    }
    saveClients((prev) => prev.filter((c) => c.id !== id));

    if (cloud) {
      cloud
        .from("clients")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) reportSyncError("La suppression du client", error);
        });
    }

    return true;
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  const resetAllData = () => {
    if (workspaceRole !== "owner") {
      denyAction("effacer toutes les données");
      return;
    }
    saveInvoices(() => []);
    saveClients(() => []);
    resetOrganization();
  };

  const clearDemoData = async () => {
    if (workspaceRole !== "owner") {
      denyAction("effacer toutes les données");
      return;
    }
    saveInvoices(() => []);
    saveClients(() => []);
    if (cloud && ownerId) {
      const [invoicesRes, clientsRes] = await Promise.all([
        cloud.from("invoices").delete().eq("user_id", ownerId),
        cloud.from("clients").delete().eq("user_id", ownerId),
      ]);
      if (invoicesRes.error) reportSyncError("La suppression des factures", invoicesRes.error);
      if (clientsRes.error) reportSyncError("La suppression des clients", clientsRes.error);
    }
  };

  // Import des données saisies sur l'appareil sans compte : copiées dans le compte Supabase, puis
  // effacées de l'appareil (elles sont désormais dans le cache du compte)
  const importLocalData = async (): Promise<string | null> => {
    if (!cloud || !ownerId || !localImportData) return null;
    const { invoices: localInvoices, clients: localClients } = localImportData;
    if (localClients.length) {
      const { error } = await cloud.from("clients").upsert(localClients.map((c) => clientToInsertRow(c, ownerId)));
      if (error) return `Les clients n'ont pas pu être importés (${error.message}).`;
    }
    if (localInvoices.length) {
      const { error } = await cloud.from("invoices").upsert(localInvoices.map((i) => invoiceToInsertRow(i, ownerId)));
      if (error) return `Les factures n'ont pas pu être importées (${error.message}).`;
    }
    saveClients((prev) => [...localClients, ...prev.filter((c) => !localClients.some((l) => l.id === c.id))]);
    saveInvoices((prev) => [...localInvoices, ...prev.filter((i) => !localInvoices.some((l) => l.id === i.id))]);
    try {
      [INVOICES_STORAGE_KEY, CLIENTS_STORAGE_KEY].forEach((base) => {
        localStorage.removeItem(base);
        localStorage.removeItem(base.replace(/_v8$/, "_v7"));
      });
    } catch (e) {}
    setLocalImportData(null);
    return null;
  };

  const dismissLocalImport = () => setLocalImportData(null);

  // Gestion des membres : réservée au chef d'entreprise, enregistrée directement dans Supabase
  const memberError = (error: any) =>
    error?.code === "23505"
      ? "Cette adresse email fait déjà partie de l'équipe."
      : `L'opération n'a pas pu être enregistrée dans Supabase (${error?.message || "erreur inconnue"}).`;

  const ensureMemberAdmin = (): string | null => {
    if (!cloud || !ownerId) return "Connectez-vous avec votre compte GESFACTURE pour gérer les membres.";
    if (workspaceRole !== "owner") return "Seul le chef d'entreprise peut gérer les membres.";
    if (!membersAvailable) return "La base Supabase doit d'abord être mise à jour (supabase/schema.sql).";
    return null;
  };

  const addMember = async (data: { email: string; name: string; role: MemberRole }): Promise<string | null> => {
    const denied = ensureMemberAdmin();
    if (denied || !cloud) return denied;
    const email = data.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Adresse email invalide.";
    if (email === userEmail) return "C'est l'adresse de votre propre compte.";
    if (members.some((m) => m.email === email)) return "Cette adresse email fait déjà partie de l'équipe.";
    const member: Member = { id: `mem-${Date.now()}`, email, name: data.name.trim(), role: data.role };
    const { error } = await cloud
      .from("organization_members")
      .insert({ id: member.id, owner_id: ownerId, email, name: member.name, role: member.role });
    if (error) return memberError(error);
    setMembers((prev) => [...prev.filter((m) => m.id !== member.id), member]);
    return null;
  };

  const updateMemberRole = async (id: string, role: MemberRole): Promise<string | null> => {
    const denied = ensureMemberAdmin();
    if (denied || !cloud) return denied;
    const { error } = await cloud.from("organization_members").update({ role }).eq("id", id);
    if (error) return memberError(error);
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role } : m)));
    return null;
  };

  const removeMember = async (id: string): Promise<string | null> => {
    const denied = ensureMemberAdmin();
    if (denied || !cloud) return denied;
    const { error } = await cloud.from("organization_members").delete().eq("id", id);
    if (error) return memberError(error);
    setMembers((prev) => prev.filter((m) => m.id !== id));
    return null;
  };

  return (
    <DataContext.Provider
      value={{
        invoices,
        clients,
        organization,
        isLoading,
        isCloudSynced,
        syncError,
        dismissSyncError,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        updateInvoiceStatus,
        recordPayment,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        updateOrganization,
        resetOrganization,
        resetAllData,
        clearDemoData,
        workspaceRole,
        isSharedWorkspace: Boolean(ownerId && ownerId !== cloudUserId),
        canEdit,
        canManageOrganization,
        members,
        membersAvailable,
        addMember,
        updateMemberRole,
        removeMember,
        localImport: localImportData
          ? { invoices: localImportData.invoices.length, clients: localImportData.clients.length }
          : null,
        importLocalData,
        dismissLocalImport,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

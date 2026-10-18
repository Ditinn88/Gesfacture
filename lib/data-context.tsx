"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Invoice, Client, Organization, DEFAULT_ORGANIZATION, RECENT_INVOICES, TOP_CLIENTS } from "@/lib/mock-data";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface DataContextType {
  invoices: Invoice[];
  clients: Client[];
  organization: Organization;
  isLoading: boolean;
  isCloudSynced: boolean;
  addInvoice: (invoiceData: Omit<Invoice, "id"> & { id?: string }) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => boolean;
  getInvoice: (id: string) => Invoice | undefined;
  updateInvoiceStatus: (id: string, status: Invoice["status"]) => void;
  addClient: (clientData: Omit<Client, "id"> & { id?: string }) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;
  getClient: (id: string) => Client | undefined;
  updateOrganization: (updates: Partial<Organization>) => void;
  resetOrganization: () => void;
  resetAllData: () => void;
  clearDemoData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const INVOICES_STORAGE_KEY = "gesfacture_invoices_v8";
const CLIENTS_STORAGE_KEY = "gesfacture_clients_v8";
const ORGANIZATION_STORAGE_KEY = "gesfacture_organization_v8";

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

const parseOrgRow = (row: any): Organization => {
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

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [organization, setOrganization] = useState<Organization>(DEFAULT_ORGANIZATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Helper de synchronisation avec localStorage
  const saveInvoicesLocally = (newInvoices: Invoice[]) => {
    const cleanInvoices = newInvoices.filter((i) => !isMockInvoice(i));
    setInvoices(cleanInvoices);
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(cleanInvoices));
    } catch (e) {
      console.warn("Could not persist invoices", e);
    }
  };

  const saveClientsLocally = (newClients: Client[]) => {
    const cleanClients = newClients.filter((c) => !isMockClient(c));
    setClients(cleanClients);
    try {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(cleanClients));
    } catch (e) {
      console.warn("Could not persist clients", e);
    }
  };

  // Chargement des données : Supabase si configuré, sinon LocalStorage propre
  useEffect(() => {
    let isMounted = true;

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

    async function loadData() {
      // 1. D'abord charger le cache localStorage v5 (uniquement de vraies données saisies)
      try {
        const storedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
        const storedClients = localStorage.getItem(CLIENTS_STORAGE_KEY);
        const storedOrg = localStorage.getItem(ORGANIZATION_STORAGE_KEY);

        if (storedInvoices) {
          const parsed = JSON.parse(storedInvoices);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const clean = parsed.filter((i) => !isMockInvoice(i));
            setInvoices(clean.length > 0 ? clean : RECENT_INVOICES);
          } else {
            setInvoices(RECENT_INVOICES);
          }
        } else {
          setInvoices(RECENT_INVOICES);
          try {
            localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(RECENT_INVOICES));
          } catch (e) {}
        }

        if (storedClients) {
          const parsed = JSON.parse(storedClients);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const clean = parsed.filter((c) => !isMockClient(c));
            setClients(clean.length > 0 ? clean : TOP_CLIENTS);
          } else {
            setClients(TOP_CLIENTS);
          }
        } else {
          setClients(TOP_CLIENTS);
          try {
            localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(TOP_CLIENTS));
          } catch (e) {}
        }

        if (storedOrg) {
          const parsed = JSON.parse(storedOrg);
          if (parsed && typeof parsed === "object") {
            setOrganization((prev) => ({ ...prev, ...parsed }));
          }
        }
      } catch (e) {
        console.warn("Could not load from localStorage cache", e);
      }

      // 2. Si Supabase est configuré, synchroniser en direct avec la base distante
      if (isSupabaseConfigured && supabase) {
        try {
          const [invoicesRes, clientsRes, orgRes] = await Promise.all([
            supabase.from("invoices").select("*").order("created_at", { ascending: false }),
            supabase.from("clients").select("*").order("created_at", { ascending: false }),
            supabase.from("organizations").select("*").limit(1).maybeSingle(),
          ]);

          if (isMounted) {
            if (invoicesRes.data) {
              const mappedInvoices: Invoice[] = invoicesRes.data
                .map((row: any) => ({
                  id: row.id,
                  number: row.number,
                  client: typeof row.client === "string" ? JSON.parse(row.client) : row.client,
                  issueDate: row.issue_date,
                  dueDate: row.due_date,
                  currency: row.currency || "XOF",
                  amount: Number(row.amount),
                  subtotal: Number(row.subtotal || 0),
                  taxRate: Number(row.tax_rate || 18),
                  taxAmount: Number(row.tax_amount || 0),
                  paidAmount: Number(row.paid_amount || 0),
                  status: row.status,
                  paymentMethod: row.payment_method,
                  items: Array.isArray(row.items) ? row.items : [],
                  notes: row.notes || "",
                }))
                .filter((inv) => !isMockInvoice(inv));

              setInvoices(mappedInvoices);
              localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(mappedInvoices));
            }

            if (clientsRes.data) {
              const mappedClients: Client[] = clientsRes.data
                .map((row: any) => ({
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
                }))
                .filter((c) => !isMockClient(c));

              setClients(mappedClients);
              localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(mappedClients));
            }

            if (orgRes.data) {
              const mappedOrg = parseOrgRow(orgRes.data);
              setOrganization(mappedOrg);
              localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(mappedOrg));
            }

            if (!invoicesRes.error && !clientsRes.error) {
              setIsCloudSynced(true);
            }
          }
        } catch (err) {
          console.warn("Supabase fetch failed, continuing with local cache:", err);
        }

        // 3. Écoute Realtime sur les changements de la base de données
        try {
          const activeClient = supabase;
          const channel = activeClient
            .channel("gesfacture-realtime")
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "invoices" },
              async () => {
                const { data } = await activeClient.from("invoices").select("*").order("created_at", { ascending: false });
                if (data && isMounted) {
                  const mapped: Invoice[] = data.map((row: any) => ({
                    id: row.id,
                    number: row.number,
                    client: typeof row.client === "string" ? JSON.parse(row.client) : row.client,
                    issueDate: row.issue_date,
                    dueDate: row.due_date,
                    amount: Number(row.amount),
                    subtotal: Number(row.subtotal || 0),
                    taxRate: Number(row.tax_rate || 18),
                    taxAmount: Number(row.tax_amount || 0),
                    paidAmount: Number(row.paid_amount || 0),
                    status: row.status,
                    paymentMethod: row.payment_method,
                    items: Array.isArray(row.items) ? row.items : [],
                    notes: row.notes || "",
                  }));
                  setInvoices(mapped);
                  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(mapped));
                }
              }
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "clients" },
              async () => {
                const { data } = await activeClient.from("clients").select("*").order("created_at", { ascending: false });
                if (data && isMounted) {
                  const mapped: Client[] = data.map((row: any) => ({
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
                  }));
                  setClients(mapped);
                  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(mapped));
                }
              }
            )
            .on(
              "postgres_changes",
              { event: "*", schema: "public", table: "organizations" },
              async () => {
                const { data } = await activeClient.from("organizations").select("*").limit(1).maybeSingle();
                if (data && isMounted) {
                  const mapped = parseOrgRow(data);
                  setOrganization(mapped);
                  localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(mapped));
                }
              }
            )
            .subscribe();

          return () => {
            activeClient.removeChannel(channel);
          };
        } catch (subErr) {
          console.warn("Realtime subscription warning:", subErr);
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Gestion Organisation
  const updateOrganization = (updates: Partial<Organization>) => {
    setOrganization((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not persist organization", e);
      }

      if (isSupabaseConfigured && supabase) {
        // Enregistrer l'IBAN avec les métadonnées bancaires
        const ibanPayload = JSON.stringify({
          iban: updated.iban || "",
          bankName: updated.bankName || "",
          bankSwift: updated.bankSwift || "",
        });

        supabase
          .from("organizations")
          .upsert({
            id: "default",
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
            if (error) console.error("Error updating organization in Supabase:", error);
          });
      }

      return updated;
    });
  };

  const resetOrganization = () => {
    setOrganization(DEFAULT_ORGANIZATION);
    try {
      localStorage.setItem(ORGANIZATION_STORAGE_KEY, JSON.stringify(DEFAULT_ORGANIZATION));
    } catch (e) {
      console.warn("Could not reset organization", e);
    }
  };

  // CRUD Factures
  const addInvoice = (invoiceData: Omit<Invoice, "id"> & { id?: string }): Invoice => {
    const id = invoiceData.id || `inv-${Date.now()}`;
    const newInvoice: Invoice = {
      ...invoiceData,
      currency: invoiceData.currency || organization.currency || "XOF",
      id,
    };
    const updated = [newInvoice, ...invoices];
    saveInvoicesLocally(updated);

    // Mettre à jour les stats du client
    setClients((prev) =>
      prev.map((c) => {
        if (c.name.toLowerCase() === newInvoice.client.name.toLowerCase()) {
          const updatedClient = {
            ...c,
            totalInvoiced: c.totalInvoiced + newInvoice.amount,
            invoicesCount: c.invoicesCount + 1,
          };

          if (isSupabaseConfigured && supabase) {
            supabase
              .from("clients")
              .update({
                total_invoiced: updatedClient.totalInvoiced,
                invoices_count: updatedClient.invoicesCount,
              })
              .eq("id", c.id)
              .then();
          }

          return updatedClient;
        }
        return c;
      })
    );

    // Sauvegarder dans Supabase
    if (isSupabaseConfigured && supabase) {
      supabase
        .from("invoices")
        .insert({
          id: newInvoice.id,
          number: newInvoice.number,
          client: newInvoice.client,
          currency: newInvoice.currency || "XOF",
          issue_date: newInvoice.issueDate,
          due_date: newInvoice.dueDate,
          amount: newInvoice.amount,
          subtotal: newInvoice.subtotal || 0,
          tax_rate: newInvoice.taxRate || 18,
          tax_amount: newInvoice.taxAmount || 0,
          paid_amount: newInvoice.paidAmount || 0,
          status: newInvoice.status,
          payment_method: newInvoice.paymentMethod,
          items: newInvoice.items || [],
          notes: newInvoice.notes || "",
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting invoice in Supabase:", error);
        });
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    const updated = invoices.map((inv) => (inv.id === id ? { ...inv, ...updates } : inv));
    saveInvoicesLocally(updated);

    if (isSupabaseConfigured && supabase) {
      const mapped: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.number) mapped.number = updates.number;
      if (updates.client) mapped.client = updates.client;
      if (updates.currency) mapped.currency = updates.currency;
      if (updates.issueDate) mapped.issue_date = updates.issueDate;
      if (updates.dueDate) mapped.due_date = updates.dueDate;
      if (updates.amount !== undefined) mapped.amount = updates.amount;
      if (updates.subtotal !== undefined) mapped.subtotal = updates.subtotal;
      if (updates.taxRate !== undefined) mapped.tax_rate = updates.taxRate;
      if (updates.taxAmount !== undefined) mapped.tax_amount = updates.taxAmount;
      if (updates.paidAmount !== undefined) mapped.paid_amount = updates.paidAmount;
      if (updates.status) mapped.status = updates.status;
      if (updates.paymentMethod) mapped.payment_method = updates.paymentMethod;
      if (updates.items) mapped.items = updates.items;
      if (updates.notes !== undefined) mapped.notes = updates.notes;

      supabase
        .from("invoices")
        .update(mapped)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating invoice in Supabase:", error);
        });
    }
  };

  const deleteInvoice = (id: string): boolean => {
    const updated = invoices.filter((inv) => inv.id !== id);
    saveInvoicesLocally(updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("invoices")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error deleting invoice in Supabase:", error);
        });
    }

    return true;
  };

  const getInvoice = (id: string): Invoice | undefined => {
    return invoices.find((inv) => inv.id === id);
  };

  const updateInvoiceStatus = (id: string, status: Invoice["status"]) => {
    const current = getInvoice(id);
    updateInvoice(id, {
      status,
      paidAmount: status === "payee" ? current?.amount || 0 : 0,
    });
  };

  // CRUD Clients
  const addClient = (clientData: Omit<Client, "id"> & { id?: string }): Client => {
    const id = clientData.id || `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      totalInvoiced: clientData.totalInvoiced || 0,
      invoicesCount: clientData.invoicesCount || 0,
      status: clientData.status || "actif",
      percentage: clientData.percentage || 10,
    };
    const updated = [newClient, ...clients];
    saveClientsLocally(updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("clients")
        .insert({
          id: newClient.id,
          name: newClient.name,
          email: newClient.email,
          city: newClient.city,
          country: newClient.country,
          phone: newClient.phone,
          address: newClient.address,
          total_invoiced: newClient.totalInvoiced,
          invoices_count: newClient.invoicesCount,
          status: newClient.status,
          percentage: newClient.percentage,
        })
        .then(({ error }) => {
          if (error) console.error("Error inserting client in Supabase:", error);
        });
    }

    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clients.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveClientsLocally(updated);

    if (isSupabaseConfigured && supabase) {
      const mapped: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name) mapped.name = updates.name;
      if (updates.email) mapped.email = updates.email;
      if (updates.city) mapped.city = updates.city;
      if (updates.country) mapped.country = updates.country;
      if (updates.phone !== undefined) mapped.phone = updates.phone;
      if (updates.address !== undefined) mapped.address = updates.address;
      if (updates.totalInvoiced !== undefined) mapped.total_invoiced = updates.totalInvoiced;
      if (updates.invoicesCount !== undefined) mapped.invoices_count = updates.invoicesCount;
      if (updates.status) mapped.status = updates.status;
      if (updates.percentage !== undefined) mapped.percentage = updates.percentage;

      supabase
        .from("clients")
        .update(mapped)
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error updating client in Supabase:", error);
        });
    }
  };

  const deleteClient = (id: string): boolean => {
    const updated = clients.filter((c) => c.id !== id);
    saveClientsLocally(updated);

    if (isSupabaseConfigured && supabase) {
      supabase
        .from("clients")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (error) console.error("Error deleting client in Supabase:", error);
        });
    }

    return true;
  };

  const getClient = (id: string): Client | undefined => {
    return clients.find((c) => c.id === id);
  };

  const resetAllData = () => {
    saveInvoicesLocally([]);
    saveClientsLocally([]);
    resetOrganization();
  };

  const clearDemoData = async () => {
    saveInvoicesLocally([]);
    saveClientsLocally([]);
    if (isSupabaseConfigured && supabase) {
      try {
        await Promise.all([
          supabase.from("invoices").delete().neq("id", "none"),
          supabase.from("clients").delete().neq("id", "none"),
        ]);
      } catch (e) {
        console.warn("Could not delete from Supabase:", e);
      }
    }
  };

  return (
    <DataContext.Provider
      value={{
        invoices,
        clients,
        organization,
        isLoading,
        isCloudSynced,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getInvoice,
        updateInvoiceStatus,
        addClient,
        updateClient,
        deleteClient,
        getClient,
        updateOrganization,
        resetOrganization,
        resetAllData,
        clearDemoData,
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

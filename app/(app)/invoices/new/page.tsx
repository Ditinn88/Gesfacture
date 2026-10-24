"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Plus,
  Trash2,
  Mail,
  Send,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  Hash,
  Coins,
  FileText,
  Printer,
  X,
  CreditCard,
  Download,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { Invoice, InvoiceItem } from "@/lib/mock-data";
import {
  formatFCFA,
  formatCurrency,
  formatDate,
  toLocalYMD,
  getCurrencyLabel,
  getCurrencySymbol,
  joinParts,
  organizationHeaderLines,
  AVAILABLE_CURRENCIES,
} from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { CustomDropdown, DropdownItem } from "@/components/ui/custom-dropdown";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { StatusBadge } from "@/components/ui/status-badge";
import { printInvoice, downloadInvoicePdf, downloadInvoiceDocument } from "@/lib/print-invoice";

const STATUS_LABELS: Record<Invoice["status"], string> = {
  brouillon: "Brouillon",
  envoyee: "Envoyée",
  payee: "Payée",
  en_retard: "En retard",
};

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { user } = useAuth();
  const { invoices, clients, addInvoice, updateInvoice, getInvoice, addClient, organization } = useData();

  // Modal feedback state
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  // Mode: "standard" | "acompte" | "recurrente"
  const [invoiceType, setInvoiceType] = useState<"standard" | "acompte" | "recurrente">("standard");

  // Client Selection - Clean initial state without mock client
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [newClientModalOpen, setNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientCity, setNewClientCity] = useState("Dakar");
  const [newClientAddress, setNewClientAddress] = useState("");

  // Dates & Metadata
  const todayStr = toLocalYMD(new Date());
  const defaultDue = toLocalYMD(new Date(Date.now() + (organization.paymentDelay ?? 30) * 86400000));
  const [issueDate, setIssueDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(defaultDue);

  const currentYear = new Date().getFullYear();

  // Numéro suivant = plus grand numéro existant pour ce préfixe + 1
  // (invoices.length + 1 recréait un numéro déjà utilisé après une suppression)
  const computeNextNumber = (prefix: string) => {
    const maxUsed = invoices.reduce((max, inv) => {
      if (!inv.number.startsWith(prefix)) return max;
      const n = parseInt(inv.number.slice(prefix.length), 10);
      return isNaN(n) ? max : Math.max(max, n);
    }, 0);
    return `${prefix}${String(maxUsed + 1).padStart(3, "0")}`;
  };

  const [invoiceNumber, setInvoiceNumber] = useState(
    computeNextNumber(organization.invoicePrefix || `FAC-${currentYear}-`)
  );

  useEffect(() => {
    if (!editId) {
      setInvoiceNumber(computeNextNumber(organization.invoicePrefix || `FAC-${currentYear}-`));
    }
  }, [editId, invoices, organization.invoicePrefix, currentYear]);

  const [currency, setCurrency] = useState(organization.currency || "XOF");

  useEffect(() => {
    if (!editId && organization.currency) {
      setCurrency(organization.currency);
    }
  }, [editId, organization.currency]);
  const [paymentMethod, setPaymentMethod] = useState<
    "Wave" | "Orange Money" | "MTN MoMo" | "Virement Bancaire" | "Espèces"
  >("Wave");
  const [notes, setNotes] = useState(
    "Paiement attendu sous 15 jours. Tout retard donnera lieu à application des pénalités selon les normes OHADA."
  );

  // Line items - Clean single row with 0 FCFA (no mock values)
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: "item-1",
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    },
  ]);

  // Tax & Discount
  const [taxRate, setTaxRate] = useState<number>(organization.defaultVatRate ?? 18);
  const [applyDiscount, setApplyDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Preview Toggle (Mobile & Desktop)
  const [showPreview, setShowPreview] = useState(true);

  // Feedback states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);
  // Le formulaire n'est pré-rempli qu'une fois : un rafraîchissement des données
  // (Realtime, nouveau client) ne doit pas écraser la saisie en cours
  const loadedEditId = React.useRef<string | null>(null);


  // Load existing invoice if edit mode
  useEffect(() => {
    if (editId && loadedEditId.current !== editId) {
      const existing = getInvoice(editId);
      if (existing) {
        loadedEditId.current = editId;
        setExistingInvoice(existing);
        setInvoiceNumber(existing.number);
        setIssueDate(existing.issueDate);
        setDueDate(existing.dueDate);
        if (existing.paymentMethod) {
          setPaymentMethod(existing.paymentMethod as any);
        }
        if (existing.currency) {
          setCurrency(existing.currency);
        }
        if (existing.notes) {
          setNotes(existing.notes);
        }
        if (existing.items && existing.items.length > 0) {
          setItems(existing.items);
        }
        if (existing.taxRate !== undefined) {
          setTaxRate(existing.taxRate);
        }
        if (existing.discountPercent) {
          setApplyDiscount(true);
          setDiscountPercent(existing.discountPercent);
        }
        // Match client by id, then by exact or fuzzy name
        const qName = existing.client.name.toLowerCase();
        const matched = clients.find(
          (c) =>
            c.id === existing.client.id ||
            c.name.toLowerCase() === qName ||
            c.name.toLowerCase().includes(qName) ||
            qName.includes(c.name.toLowerCase())
        );
        if (matched) {
          setSelectedClientId(matched.id);
        }
      }
    }
  }, [editId, clients, getInvoice]);

  // Active client object - strictly null if not chosen (no fake mock client)
  const activeClient = clients.find((c) => c.id === selectedClientId) || null;

  // Signatures and emitter identity
  const signatureName = user?.user_metadata?.full_name || organization.legalName || "Direction";
  const signatureRole = "Direction Générale";
  const emitterDisplay = user?.user_metadata?.full_name
    ? `${user.user_metadata.full_name} (${organization.legalName || organization.name})`
    : (organization.legalName || organization.name);

  // Convert clients to DropdownItem[] format
  const clientDropdownItems: DropdownItem[] = clients.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: `${c.city}, ${c.country}`,
    badge: c.status === "actif" ? "Actif" : "Inactif",
    icon: (
      <div className="w-5 h-5 rounded-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-[9px]">
        {c.name.slice(0, 2).toUpperCase()}
      </div>
    ),
  }));

  // Line item manipulation
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        const qty = field === "quantity" ? Number(value) : current.quantity;
        const price = field === "unitPrice" ? Number(value) : current.unitPrice;
        current.total = Math.max(0, qty) * Math.max(0, price);
      }
      updated[index] = current;
      return updated;
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Financial calculations
  const rawSubtotal = items.reduce((acc, it) => acc + (it.total || 0), 0);
  const discountAmount = applyDiscount ? Math.round((rawSubtotal * discountPercent) / 100) : 0;
  const subtotal = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalTTC = subtotal + taxAmount;

  // Active preview invoice object for direct printing
  const currentPreviewInvoice: Invoice = {
    id: editId || "preview",
    number: invoiceNumber,
    client: {
      name: activeClient?.name || "Client Destinataire",
      email: activeClient?.email || "",
      city: activeClient?.city || "",
      country: activeClient?.country || "Sénégal",
      address: activeClient?.address || "",
      phone: activeClient?.phone || "",
    },
    currency,
    issueDate,
    dueDate,
    subtotal,
    taxRate,
    taxAmount,
    discountPercent: applyDiscount ? discountPercent : 0,
    amount: totalTTC,
    paidAmount: 0,
    status: "envoyee",
    paymentMethod,
    items,
    notes,
  };

  // Handle Save (Draft or Send)
  const handleSave = (status: Invoice["status"]) => {
    if (!activeClient || !activeClient.name.trim()) {
      alert("Veuillez sélectionner ou créer un client destinataire avant d'enregistrer.");
      return;
    }

    const validItems = items.filter((it) => it.description.trim().length > 0 || it.unitPrice > 0);
    if (validItems.length === 0) {
      alert("Veuillez renseigner au moins une prestation avec une description.");
      return;
    }

    setIsSubmitting(true);

    // En édition, « Enregistrer » ne doit pas faire repasser une facture payée en « Envoyée »
    const finalStatus: Invoice["status"] =
      editId && status === "envoyee" && existingInvoice?.status === "payee" ? "payee" : status;

    const invoicePayload: Omit<Invoice, "id"> & { id?: string } = {
      id: editId || undefined,
      number: invoiceNumber,
      client: {
        id: activeClient.id,
        name: activeClient.name,
        email: activeClient.email,
        city: activeClient.city,
        country: activeClient.country,
        address: activeClient.address || "",
        phone: activeClient.phone || "",
      },
      currency,
      issueDate,
      dueDate,
      subtotal,
      taxRate,
      taxAmount,
      discountPercent: applyDiscount ? discountPercent : 0,
      amount: totalTTC,
      paidAmount: finalStatus === "payee" ? totalTTC : 0,
      status: finalStatus,
      paymentMethod,
      items,
      notes,
    };

    let resultInvoice: Invoice;

    if (editId) {
      updateInvoice(editId, invoicePayload);
      resultInvoice = {
        ...invoicePayload,
        id: editId,
      } as Invoice;
      setFeedbackMessage("Facture mise à jour avec succès !");
    } else {
      resultInvoice = addInvoice(invoicePayload);
      setFeedbackMessage(
        status === "envoyee"
          ? "Facture créée avec succès !"
          : "Facture enregistrée comme brouillon !"
      );
    }

    setCreatedInvoice(resultInvoice);
    setIsSubmitting(false);
    setSuccessModalOpen(true);
  };

  // Quick Client Creation handler
  const handleCreateQuickClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientEmail.trim()) return;

    const created = addClient({
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      city: newClientCity,
      country: "Sénégal",
      address: newClientAddress,
      totalInvoiced: 0,
      invoicesCount: 0,
      status: "actif",
    });

    setSelectedClientId(created.id);
    setNewClientModalOpen(false);
    setNewClientName("");
    setNewClientEmail("");
    setNewClientPhone("");
    setNewClientAddress("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {feedbackMessage && (
        <div className="p-4 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-between shadow-none transition-all">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{feedbackMessage}</span>
          </div>
          <span className="text-[11px] text-neutral-400">Redirection en cours...</span>
        </div>
      )}

      {/* Top Breadcrumb & Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 shadow-none transition-all"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-neutral-900 dark:hover:text-neutral-400 transition-colors font-medium">
                Accueil
              </Link>
              <span>/</span>
              <Link href="/invoices" className="hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors">
                Factures
              </Link>
              <span>/</span>
              <span className="text-neutral-900 dark:text-white font-medium">
                {editId ? "Modifier la Facture" : "Créer une Facture"}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mt-0.5">
              {editId ? `Modifier ${invoiceNumber}` : "Créer une Facture"}
            </h1>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Show Preview Toggle */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all"
          >
            {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden xs:inline">
              {showPreview ? "Masquer Aperçu" : "Aperçu en Direct"}
            </span>
          </button>

          {/* Save Draft Button - Notion Invert Style */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("brouillon")}
            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-neutral-500" />
            <span>Sauvegarder brouillon</span>
          </button>

          {/* Primary Create / Save Button */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSave("envoyee")}
            className="inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all active:scale-95"
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{isSubmitting ? "Enregistrement..." : editId ? "Enregistrer modifications" : "Créer la facture"}</span>
          </button>
        </div>
      </div>

      {/* Edit Mode Notice Banner */}
      {editId && (
        <div className="p-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 no-print">
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse shrink-0" />
            <span className="font-semibold text-neutral-900 dark:text-white">
              Mode Édition : Facture {invoiceNumber}
            </span>
            {activeClient && (
              <span className="text-neutral-500 hidden sm:inline">· Client : {activeClient.name}</span>
            )}
          </div>
          <Link
            href={`/invoices/${editId}`}
            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline font-medium"
          >
            Annuler et retourner au détail
          </Link>
        </div>
      )}

      {/* 2-Column Split View: Form (Left) & Real-time Live Preview (Right) */}
      <div className={`grid grid-cols-1 ${showPreview ? "lg:grid-cols-12" : "max-w-4xl mx-auto"} gap-6 no-print`}>
        {/* Left Form Column */}
        <div className={`${showPreview ? "lg:col-span-7" : "w-full"} space-y-6`}>
          {/* Segmented Type Controller */}
          <div className="flex items-center p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60 max-w-sm">
            {(["standard", "acompte", "recurrente"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setInvoiceType(type)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                  invoiceType === type
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-none border border-neutral-200/60 dark:border-neutral-700"
                    : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {type === "standard" ? "Standard" : type === "acompte" ? "Acompte" : "Récurrente"}
              </button>
            ))}
          </div>

          {/* CARD 1: Informations Générales */}
          <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-500" />
                <span>Informations Générales</span>
              </h2>
              <span className="text-[11px] font-mono text-neutral-400">
                {organization.name}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field 1: Émetteur (Read-only company brand) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Émetteur (Votre Entreprise)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    disabled
                    value={emitterDisplay}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-100 dark:bg-neutral-800/60 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-xl cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              {/* Field 2: Client Destinataire - Custom Notion Dropdown */}
              <div>
                <CustomDropdown
                  label="Client Destinataire *"
                  items={clientDropdownItems}
                  value={selectedClientId}
                  onChange={(val) => setSelectedClientId(val)}
                  placeholder="Sélectionner un client..."
                  actionLabel="+ Nouveau Client"
                  onAction={() => setNewClientModalOpen(true)}
                  icon={<Building2 className="w-4 h-4" />}
                />
              </div>

              {/* Fields 3 & 4: Date d'émission et Date d'échéance sur la même ligne (Mobile & Desktop) */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-2.5 sm:gap-4">
                <div>
                  <CustomDatePicker
                    label="Date d'émission *"
                    value={issueDate}
                    onChange={(d) => setIssueDate(d)}
                    align="left"
                  />
                </div>
                <div>
                  <CustomDatePicker
                    label="Date d'échéance *"
                    value={dueDate}
                    onChange={(d) => setDueDate(d)}
                    align="right"
                  />
                </div>
              </div>

              {/* Field 5: Numéro de Facture */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Numéro de Facture *
                </label>
                <div className="relative">
                  <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Field 6: Mode de Règlement */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                  Moyen de Règlement Prévu
                </label>
                <div className="relative">
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full pl-3 pr-8 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  >
                    <option value="Wave">Wave (Paiement instantané mobile)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN MoMo">MTN MoMo</option>
                    <option value="Virement Bancaire">Virement Bancaire (CBAO / BOA)</option>
                    <option value="Espèces">Règlement en Espèces</option>
                  </select>
                </div>
              </div>

              {/* Field 7: Devise de Facturation Variable */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5 flex items-center justify-between">
                  <span>Devise de Facturation *</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    Symbole actif : <strong className="font-mono text-neutral-900 dark:text-white">{getCurrencySymbol(currency)}</strong>
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      type="button"
                      onClick={() => setCurrency(curr.code)}
                      className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-all flex flex-col gap-0.5 ${
                        currency === curr.code
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs"
                          : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                      }`}
                    >
                      <span className="font-bold text-xs">{curr.symbol}</span>
                      <span className="text-[10px] opacity-75 truncate">{curr.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: Lignes de Facture (Items / Prestations) */}
          <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Lignes de Prestations / Services
                </h2>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Détaillez chaque prestation avec son prix unitaire en {getCurrencySymbol(currency)}.
                </p>
              </div>

              {/* Rappel de la devise (choisie dans « Devise de Facturation ») */}
              <span className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                {getCurrencyLabel(currency)}
              </span>
            </div>

            {/* Dynamic Items List */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3.5 sm:p-4 rounded-xl bg-[#fafaf9] dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/60 space-y-3 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                      Ligne #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-neutral-400 hover:text-[#c5221f] dark:hover:text-rose-400 p-1 rounded transition-colors"
                        title="Supprimer cette ligne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Description Input */}
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                      Description du service ou produit *
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Développement API Wave & Mobile Money"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, "description", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                    />
                  </div>

                  {/* Qty, Unit Price, Total Row */}
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-4 sm:col-span-3">
                      <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-center focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-4">
                      <label className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Prix Unitaire HT ({getCurrencySymbol(currency)})
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-right focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white font-mono"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-5 text-right">
                      <span className="block text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mb-1">
                        Total Ligne
                      </span>
                      <div className="px-3 py-1.5 text-xs font-bold text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-700/60 rounded-lg font-mono">
                        {formatCurrency(item.total || 0, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Line Item Button - Notion Light Style */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-500 bg-white dark:bg-neutral-800 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center gap-1.5 shadow-none transition-all active:scale-[0.99]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Ajouter une ligne de prestation</span>
            </button>
          </div>

          {/* CARD 3: Paramètres Financiers & Récapitulatif */}
          <div className="p-5 sm:p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white pb-2 border-b border-neutral-100 dark:border-neutral-800">
              Paramètres Financiers & Récapitulatif
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* TVA Rate */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Taux de TVA (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-24 px-3 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-center font-mono focus:outline-none"
                  />
                  <span className="text-xs text-neutral-400">
                    (Standard CEDEAO / OHADA : 18%)
                  </span>
                </div>
              </div>

              {/* Optional Discount Toggle */}
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                  Remise commerciale
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="discountCheckbox"
                    checked={applyDiscount}
                    onChange={(e) => setApplyDiscount(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0"
                  />
                  <label htmlFor="discountCheckbox" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                    Appliquer remise (%)
                  </label>
                  {applyDiscount && (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-center font-mono focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800/80 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Sous-total Brut HT :</span>
                <span className="font-mono">{formatCurrency(rawSubtotal, currency)}</span>
              </div>

              {applyDiscount && discountAmount > 0 && (
                <div className="flex justify-between text-[#c5221f] dark:text-rose-400">
                  <span>Remise ({discountPercent}%) :</span>
                  <span className="font-mono">- {formatCurrency(discountAmount, currency)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>TVA ({taxRate}%) :</span>
                <span className="font-mono">{formatCurrency(taxAmount, currency)}</span>
              </div>

              <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-baseline font-bold text-neutral-900 dark:text-white">
                <span className="text-sm">Total TTC à Payer :</span>
                <span className="text-base sm:text-lg font-extrabold font-mono text-neutral-900 dark:text-white">
                  {formatCurrency(totalTTC, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes & Mentions Légales */}
          <div className="p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-2">
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              Conditions de Règlement & Mentions Légales
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-700 dark:text-neutral-300"
            />
          </div>

          {/* Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave("brouillon")}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all active:scale-95"
            >
              <Save className="w-3.5 h-3.5 text-neutral-500" />
              <span>Sauvegarder comme brouillon</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSave("envoyee")}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? "Enregistrement..." : editId ? "Enregistrer modifications" : "Créer la facture"}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Real-time Live Document Preview (FIXED: Generous spacing, no text collision) */}
        {showPreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="sticky top-24 space-y-4">
              {/* Preview Header bar */}
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Aperçu
                  </h3>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 dark:bg-emerald-950/40 dark:text-emerald-300 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En direct
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => printInvoice(createdInvoice || currentPreviewInvoice, organization)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Imprimer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const inv = createdInvoice || currentPreviewInvoice;
                      const subject = `Facture ${inv.number} — ${organization.name}`;
                      const body = `Bonjour,\n\nVeuillez trouver ci-joint la facture ${inv.number} d'un montant de ${formatFCFA(inv.amount, inv.currency || organization.currency)}, à régler avant le ${formatDate(inv.dueDate)}.\n\nCordialement,\n${organization.legalName || organization.name}`;
                      window.location.href = `mailto:${encodeURIComponent(inv.client.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                    }}
                    title="Ouvrir un email pré-rempli pour le client (joignez le PDF téléchargé)"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Email</span>
                  </button>
                </div>
              </div>

              {/* The Realistic A4 Sheet (Notion Light Flat Design) */}
              <div className="p-6 sm:p-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none flex flex-col space-y-6 text-xs text-neutral-700 dark:text-neutral-300 transition-all">
                {/* 1. Header & Logo Monogram */}
                <div className="flex items-start justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                      FACTURE
                    </h2>
                    <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">
                      N° <span className="text-neutral-900 dark:text-white font-mono font-bold">{invoiceNumber}</span>
                    </p>
                  </div>

                  {/* Monogram Brand Squircle */}
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-serif font-bold text-sm shadow-none">
                    G
                  </div>
                </div>

                {/* 2. Billed By & Billed To Columns */}
                <div className="grid grid-cols-2 gap-4 text-[11px] leading-relaxed">
                  <div>
                    <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-0.5">
                      Émetteur :
                    </span>
                    <p className="font-bold text-neutral-900 dark:text-white">
                      {organization.legalName}
                    </p>
                    <p className="text-neutral-500">{organization.email}</p>
                    <p className="text-neutral-400">{joinParts([organization.address, organization.city], ", ")}</p>
                    <p className="text-neutral-400 font-mono text-[10px]">
                      {joinParts([organization.taxId, organization.rccm && `RCCM ${organization.rccm}`])}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-0.5">
                      Facturé à :
                    </span>
                    {activeClient ? (
                      <>
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {activeClient.name}
                        </p>
                        {activeClient.email && <p className="text-neutral-500">{activeClient.email}</p>}
                        <p className="text-neutral-400">
                          {activeClient.address ? `${activeClient.address}, ` : ""}
                          {activeClient.city}{activeClient.country ? `, ${activeClient.country}` : ""}
                        </p>
                        {activeClient.phone && (
                          <p className="text-neutral-400 text-[10px]">{activeClient.phone}</p>
                        )}
                      </>
                    ) : (
                      <div className="py-1">
                        <p className="text-neutral-400 italic text-[11px]">Aucun client sélectionné</p>
                        <p className="text-neutral-400 text-[10px]">Sélectionnez ou créez un client</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Dates row */}
                <div className="grid grid-cols-2 gap-4 py-2.5 border-y border-neutral-100 dark:border-neutral-800 text-[11px]">
                  <div>
                    <span className="text-neutral-400">Date d&apos;émission :</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatDate(issueDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-400">Date d&apos;échéance :</span>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {formatDate(dueDate)}
                    </p>
                  </div>
                </div>

                {/* 4. Items Table */}
                <div>
                  <div className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider mb-2">
                    Prestations & Services :
                  </div>
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 text-[10px]">
                        <th className="pb-1.5 font-medium">Description</th>
                        <th className="pb-1.5 text-center font-medium">Qté</th>
                        <th className="pb-1.5 text-right font-medium">P.U HT</th>
                        <th className="pb-1.5 text-right font-medium">Total HT</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
                      {items.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="py-2.5 text-neutral-800 dark:text-neutral-200 max-w-[170px] truncate">
                            {item.description || <span className="text-neutral-400 italic">Prestation à définir...</span>}
                          </td>
                          <td className="py-2.5 text-center text-neutral-500 font-mono">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 text-right text-neutral-500 font-mono">
                            {formatCurrency(item.unitPrice, currency)}
                          </td>
                          <td className="py-2.5 text-right font-semibold text-neutral-900 dark:text-white font-mono">
                            {formatCurrency(item.total, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 5. DEDICATED TOTALS CARD (Completely isolated, generous padding, zero collision) */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>Sous-total Brut HT :</span>
                    <span className="font-mono font-medium">{formatCurrency(subtotal, currency)}</span>
                  </div>

                  {applyDiscount && discountAmount > 0 && (
                    <div className="flex justify-between text-[#c5221f] dark:text-rose-400">
                      <span>Remise ({discountPercent}%) :</span>
                      <span className="font-mono font-medium">- {formatCurrency(discountAmount, currency)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                    <span>TVA ({taxRate}%) :</span>
                    <span className="font-mono font-medium">{formatCurrency(taxAmount, currency)}</span>
                  </div>

                  <div className="pt-2.5 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-baseline font-bold text-neutral-900 dark:text-white">
                    <span className="text-xs uppercase tracking-wide">Total TTC Net :</span>
                    <span className="text-base sm:text-lg font-extrabold font-mono text-neutral-900 dark:text-white">
                      {formatCurrency(totalTTC, currency)}
                    </span>
                  </div>
                </div>

                {/* 6. Notes section (Independent block with proper top margin) */}
                <div className="pt-2 text-[10px] text-neutral-400 italic leading-relaxed border-t border-neutral-100 dark:border-neutral-800">
                  {notes}
                </div>

                {/* 7. Footer: Payment & Signature (Completely separated, clearly spaced) */}
                <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
                      Moyen de Règlement
                    </p>
                    <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px] mt-0.5">
                      {paymentMethod}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      {paymentMethod === "Wave" && organization.waveNumber
                        ? `Wave : ${organization.waveNumber}`
                        : paymentMethod === "Orange Money" && organization.omNumber
                        ? `OM : ${organization.omNumber}`
                        : paymentMethod === "Virement Bancaire" && (organization.iban || organization.bankName)
                        ? `${organization.bankName ? organization.bankName + " · " : ""}IBAN : ${organization.iban || ""}`
                        : organization.waveNumber
                        ? `Wave : ${organization.waveNumber}`
                        : "Règlement standard"}
                    </p>
                  </div>

                  {/* Signature */}
                  <div className="text-right">
                    <div className="font-serif italic text-base text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-neutral-700 pb-0.5 px-2">
                      {signatureName}
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{signatureRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Add Client Modal */}
      {newClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in no-print" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                Ajouter un Nouveau Client
              </h3>
              <button
                type="button"
                onClick={() => setNewClientModalOpen(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom ou Raison Sociale *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Teranga Digital SARL"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Email de Facturation *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@teranga.sn"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="+221 77 000 00 00"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={newClientCity}
                    onChange={(e) => setNewClientCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse (Quartier / Rue)
                </label>
                <input
                  type="text"
                  placeholder="Almadies, Villa 12"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setNewClientModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl"
                >
                  Ajouter & Sélectionner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Creation Success Modal */}
      {successModalOpen && createdInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in no-print" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl relative">
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => {
                setSuccessModalOpen(false);
                router.push("/invoices");
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon and Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shrink-0 shadow-none">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {editId ? "Modifications enregistrées !" : "Facture créée avec succès !"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  La facture a été enregistrée avec succès dans votre espace et est disponible sur vos tableaux de bord.
                </p>
              </div>
            </div>

            {/* Invoice Summary Card */}
            <div className="p-4 rounded-xl bg-[#fafaf9] dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-neutral-700">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-neutral-900 dark:text-white text-sm">
                    {createdInvoice.number}
                  </span>
                  <StatusBadge status={createdInvoice.status} size="sm" />
                </div>
                <span className="text-[11px] text-neutral-400 font-medium">
                  {formatDate(createdInvoice.issueDate)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Client</span>
                  <span className="font-semibold text-neutral-900 dark:text-white truncate block">
                    {createdInvoice.client.name}
                  </span>
                  <span className="text-neutral-400 text-[10px] truncate block">
                    {createdInvoice.client.email}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-400 block text-[10px] uppercase font-semibold">Échéance</span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200 block">
                    {formatDate(createdInvoice.dueDate)}
                  </span>
                  <span className="text-neutral-400 text-[10px] block">
                    Règlement : {createdInvoice.paymentMethod || "Wave"}
                  </span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-neutral-200/60 dark:border-neutral-700 flex justify-between items-baseline">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                  Total TTC Net :
                </span>
                <span className="font-mono font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white">
                  {formatFCFA(createdInvoice.amount, createdInvoice.currency)}
                </span>
              </div>
            </div>

            {/* Action Buttons: Télécharger la facture / Retourner aux factures / Voir détail */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Direct PDF Download to Computer */}
                <button
                  type="button"
                  onClick={() => downloadInvoicePdf(createdInvoice, organization)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4 stroke-[2]" />
                  <span>Télécharger en PDF</span>
                </button>

                {/* Return to Invoices list */}
                <button
                  type="button"
                  onClick={() => {
                    setSuccessModalOpen(false);
                    router.push("/invoices");
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all active:scale-95"
                >
                  <span>Retourner aux factures</span>
                </button>
              </div>

              {/* Auxiliary actions: physical print, direct file download & detail link */}
              <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-neutral-500">
                <button
                  type="button"
                  onClick={() => printInvoice(createdInvoice, organization)}
                  className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white underline decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
                >
                  <Printer className="w-3 h-3" />
                  <span>Imprimer sur papier</span>
                </button>
                <span className="text-neutral-300 dark:text-neutral-700">·</span>
                <Link
                  href={`/invoices/${createdInvoice.id}`}
                  className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-white underline decoration-neutral-300 hover:decoration-neutral-900 transition-colors"
                >
                  <span>Consulter la page détaillée</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          DEDICATED PRINT-ONLY A4 INVOICE (Guaranteed zero modal, zero app chrome)
          ===================================================================== */}
      <div
        id="printable-invoice"
        className="hidden print:block bg-white text-neutral-900 p-8 space-y-6 max-w-4xl mx-auto"
      >
        {/* Document Header */}
        <div className="flex justify-between items-start pb-6 border-b border-neutral-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-serif font-bold text-base">
                {organization.name.slice(0, 1) || "G"}
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-none">
                  {organization.name}
                </h1>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  {organization.legalName}
                </p>
              </div>
            </div>
            {organizationHeaderLines(organization).map((line, i) => (
              <p key={i} className={i === 0 ? "text-xs text-neutral-600 mt-2" : "text-xs text-neutral-500"}>
                {line}
              </p>
            ))}
          </div>

          <div className="text-right space-y-1">
            <span className="text-2xl font-black tracking-tight text-neutral-900">
              FACTURE
            </span>
            <p className="text-sm font-mono font-bold text-neutral-800">
              {createdInvoice?.number || invoiceNumber}
            </p>
            <p className="text-xs text-neutral-500">Devise : {getCurrencyLabel(createdInvoice?.currency || currency)}</p>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mt-1 border-neutral-300 text-neutral-700">
              Statut : {STATUS_LABELS[createdInvoice?.status || "envoyee"].toUpperCase()}
            </div>
          </div>
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed py-2">
          <div>
            <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-1">
              Facturé à :
            </span>
            <h3 className="text-sm font-bold text-neutral-900">
              {createdInvoice?.client.name || activeClient?.name || "Client Destinataire"}
            </h3>
            <p className="text-neutral-600 mt-0.5">
              {createdInvoice?.client.email || activeClient?.email || ""}
            </p>
            <p className="text-neutral-600">
              {joinParts(
                [
                  createdInvoice?.client.address || activeClient?.address,
                  createdInvoice?.client.city || activeClient?.city,
                  createdInvoice?.client.country || activeClient?.country,
                ],
                ", "
              )}
            </p>
            {(createdInvoice?.client.phone || activeClient?.phone) && (
              <p className="text-neutral-500 font-mono mt-0.5">
                {createdInvoice?.client.phone || activeClient?.phone}
              </p>
            )}
          </div>

          <div className="text-right space-y-1">
            <p>
              <span className="text-neutral-500">Date d&apos;émission : </span>
              <span className="font-semibold text-neutral-900">
                {formatDate(createdInvoice?.issueDate || issueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">Date d&apos;échéance : </span>
              <span className="font-semibold text-neutral-900">
                {formatDate(createdInvoice?.dueDate || dueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">Moyen de règlement : </span>
              <span className="font-semibold text-neutral-900">
                {createdInvoice?.paymentMethod || paymentMethod}
              </span>
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] text-neutral-500 uppercase text-[10px] font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2.5 px-4">Description</th>
                <th className="py-2.5 px-3 text-center">Qté</th>
                <th className="py-2.5 px-3 text-right">Prix Unitaire HT</th>
                <th className="py-2.5 px-4 text-right">Total HT ({getCurrencySymbol(createdInvoice?.currency || currency)})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(createdInvoice?.items || items).map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    {item.description || "Prestation de services"}
                  </td>
                  <td className="py-3 px-3 text-center text-neutral-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-3 text-right text-neutral-600 font-mono">
                    {formatCurrency(item.unitPrice, createdInvoice?.currency || currency)}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-neutral-900 font-mono">
                    {formatCurrency(item.total, createdInvoice?.currency || currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown */}
        <div className="flex justify-end pt-4">
          <div className="w-72 p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total Brut HT :</span>
              <span className="font-mono font-medium">
                {formatCurrency(createdInvoice?.subtotal || subtotal, createdInvoice?.currency || currency)}
              </span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>TVA ({createdInvoice?.taxRate ?? taxRate}%) :</span>
              <span className="font-mono font-medium">
                {formatCurrency(createdInvoice?.taxAmount || taxAmount, createdInvoice?.currency || currency)}
              </span>
            </div>
            <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline font-bold text-neutral-900">
              <span className="text-xs uppercase tracking-wide">Total TTC Net :</span>
              <span className="font-extrabold font-mono text-base text-neutral-900">
                {formatCurrency(createdInvoice?.amount || totalTTC, createdInvoice?.currency || currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes & Legal */}
        <div className="pt-4 border-t border-neutral-200 space-y-1 text-[11px] text-neutral-500">
          <p className="font-semibold text-neutral-800">Conditions de règlement :</p>
          <p className="italic leading-relaxed">
            {createdInvoice?.notes || notes}
          </p>
        </div>

        {/* Signature Footer */}
        <div className="pt-6 border-t border-neutral-200 flex justify-between items-end gap-4">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
              Coordonnées de Règlement
            </span>
            <p className="font-semibold text-neutral-900">
              {paymentMethod === "Wave" && organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : paymentMethod === "Orange Money" && organization.omNumber
                ? `Orange Money : ${organization.omNumber}`
                : paymentMethod === "Virement Bancaire" && (organization.iban || organization.bankName)
                ? `${organization.bankName ? organization.bankName + " · " : ""}IBAN : ${organization.iban || ""}`
                : organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : "Règlement à réception"}
            </p>
            <p className="text-[11px] text-neutral-500 font-mono">
              {joinParts([organization.legalName, joinParts([organization.city, organization.country], ", ")])}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic text-base text-neutral-900 border-b border-neutral-300 pb-0.5 px-3">
              {signatureName}
            </div>
            <p className="text-[10px] text-neutral-500">{signatureRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm animate-pulse">
              G
            </div>
            <p className="text-xs text-neutral-400">Chargement de la page de facturation...</p>
          </div>
        </div>
      }
    >
      <CreateInvoiceContent />
    </React.Suspense>
  );
}

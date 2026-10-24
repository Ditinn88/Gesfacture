"use client";

import React, { useState, useEffect } from "react";
import {
  Building2,
  Sliders,
  CreditCard,
  Bell,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Upload,
  Mail,
  Phone,
  MapPin,
  FileText,
  Smartphone,
  Landmark,
  Check,
  Eye,
  Info,
  Lock,
  ChevronDown,
  QrCode,
} from "lucide-react";
import { cn, AVAILABLE_CURRENCIES } from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";

type SettingsSection = "entreprise" | "facturation" | "paiements" | "notifications" | "securite";

export default function SettingsPage() {
  const { organization, updateOrganization, resetOrganization } = useData();
  const [activeSection, setActiveSection] = useState<SettingsSection>(() => {
    if (typeof window !== "undefined") {
      const p = new URLSearchParams(window.location.search).get("tab") as SettingsSection | null;
      if (p && ["entreprise", "facturation", "paiements", "notifications", "securite"].includes(p)) {
        return p;
      }
    }
    return "entreprise";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Read URL search params for deep linking (e.g. ?tab=paiements)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab") as SettingsSection | null;
      if (tab && ["entreprise", "facturation", "paiements", "notifications", "securite"].includes(tab)) {
        setActiveSection(tab);
      }
    }
  }, []);

  // --- SECTION 1: Entreprise & Identité ---
  const [companyName, setCompanyName] = useState(organization.name);
  const [legalName, setLegalName] = useState(organization.legalName);
  const [taxId, setTaxId] = useState(organization.taxId);
  const [rccm, setRccm] = useState(organization.rccm);
  const [address, setAddress] = useState(organization.address);
  const [city, setCity] = useState(organization.city);
  const [country, setCountry] = useState(organization.country);
  const [phone, setPhone] = useState(organization.phone);
  const [companyEmail, setCompanyEmail] = useState(organization.email);
  const [website, setWebsite] = useState(organization.website || "");

  // Synchronize when organization changes
  React.useEffect(() => {
    setCompanyName(organization.name);
    setLegalName(organization.legalName);
    setTaxId(organization.taxId);
    setRccm(organization.rccm);
    setAddress(organization.address);
    setCity(organization.city);
    setCountry(organization.country);
    setPhone(organization.phone);
    setCompanyEmail(organization.email);
    if (organization.website) setWebsite(organization.website);
    if (organization.currency) setCurrency(organization.currency);
    if (organization.waveNumber !== undefined) {
      setWaveNumber(organization.waveNumber || "");
      setWaveEnabled(Boolean(organization.waveNumber));
    }
    if (organization.omNumber !== undefined) {
      setOmNumber(organization.omNumber || "");
      setOrangeMoneyEnabled(Boolean(organization.omNumber));
    }
    if (organization.iban !== undefined) setBankIban(organization.iban || "");
    if (organization.bankName !== undefined) setBankName(organization.bankName || "");
    if (organization.bankSwift !== undefined) setBankSwift(organization.bankSwift || "");
    if (organization.invoicePrefix) setInvoicePrefix(organization.invoicePrefix);
    if (organization.paymentDelay) setPaymentTermsDays(organization.paymentDelay);
    // !== undefined : une TVA à 0 % (exonération) doit aussi être reprise
    if (organization.defaultVatRate !== undefined) setDefaultTaxRate(organization.defaultVatRate);
  }, [organization]);

  // --- SECTION 2: Modèle de Facture & Taxes ---
  const [currency, setCurrency] = useState(organization.currency || "XOF");
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(organization.defaultVatRate ?? 18);
  const [invoicePrefix, setInvoicePrefix] = useState(organization.invoicePrefix || "FAC-2026-");
  const [paymentTermsDays, setPaymentTermsDays] = useState<number>(organization.paymentDelay ?? 15);
  const [footerNotes, setFooterNotes] = useState(
    "Facture payable à réception ou sous 15 jours. En cas de retard, des pénalités au taux légal OHADA seront exigées."
  );

  // --- SECTION 3: Coordonnées Bancaires & Mobile Money ---
  const [waveEnabled, setWaveEnabled] = useState(Boolean(organization.waveNumber));
  const [waveNumber, setWaveNumber] = useState(organization.waveNumber || "");
  const [orangeMoneyEnabled, setOrangeMoneyEnabled] = useState(Boolean(organization.omNumber));
  const [omNumber, setOmNumber] = useState(organization.omNumber || "");
  const [bankName, setBankName] = useState(organization.bankName || "");
  const [bankIban, setBankIban] = useState(organization.iban || "");
  const [bankSwift, setBankSwift] = useState(organization.bankSwift || "");

  // --- SECTION 4: Notifications & Relances ---
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [overdueReminder3Days, setOverdueReminder3Days] = useState(true);
  const [overdueReminder7Days, setOverdueReminder7Days] = useState(true);
  const [smsPaymentReceipt, setSmsPaymentReceipt] = useState(false);

  // --- SECTION 5: Sécurité & Administrateur ---
  const { user, session, updateUserProfile, resetPasswordForEmail } = useAuth();
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsSendingReset(true);
    const { error } = await resetPasswordForEmail(user.email);
    setIsSendingReset(false);
    setToastMessage(
      error ? error.message : `Un lien de réinitialisation a été envoyé à ${user.email}.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("Directeur Général");

  useEffect(() => {
    if (user) {
      setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setUserEmail(user.email || "");
      setUserRole(user.user_metadata?.role || "Directeur Général");
    } else {
      try {
        const savedName = localStorage.getItem("gesfacture_admin_name");
        const savedEmail = localStorage.getItem("gesfacture_admin_email");
        if (savedName) setUserName(savedName);
        if (savedEmail) setUserEmail(savedEmail);
      } catch (e) {}
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganization({
      name: companyName,
      legalName: legalName,
      taxId: taxId,
      rccm: rccm,
      address: address,
      city: city,
      country: country,
      phone: phone,
      email: companyEmail,
      website: website,
      currency: currency,
      waveNumber: waveEnabled ? waveNumber.trim() : "",
      omNumber: orangeMoneyEnabled ? omNumber.trim() : "",
      iban: bankIban.trim(),
      bankName: bankName.trim(),
      bankSwift: bankSwift.trim(),
      invoicePrefix: invoicePrefix,
      paymentDelay: paymentTermsDays,
      defaultVatRate: defaultTaxRate,
    });
    if (userName.trim()) {
      await updateUserProfile(userName.trim());
      try {
        localStorage.setItem("gesfacture_admin_name", userName.trim());
      } catch (e) {}
    }
    if (userEmail.trim()) {
      try {
        localStorage.setItem("gesfacture_admin_email", userEmail.trim());
      } catch (e) {}
    }
    setToastMessage("Paramètres et coordonnées Wave / Mobile Money enregistrés avec succès !");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReset = () => {
    resetOrganization();
    setToastMessage("Paramètres réinitialisés aux valeurs d'origine.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navItems = [
    {
      id: "entreprise" as const,
      label: "Identité de l'Entreprise",
      shortLabel: "Entreprise",
      sublabel: "Raison sociale, NINEA, coordonnées",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: "facturation" as const,
      label: "Modèle de Facture & TVA",
      shortLabel: "Facturation & Taxes",
      sublabel: "Devise, préfixe, taux de taxe, délais",
      icon: <Sliders className="w-4 h-4" />,
    },
    {
      id: "paiements" as const,
      label: "Paiements & Mobile Money",
      shortLabel: "Wave & OM",
      sublabel: "Wave, Orange Money, virement bancaire",
      icon: <CreditCard className="w-4 h-4" />,
    },
    {
      id: "notifications" as const,
      label: "Relances & Notifications",
      shortLabel: "Notifications",
      sublabel: "Alertes retards, accusés de réception",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      id: "securite" as const,
      label: "Profil & Administrateur",
      shortLabel: "Sécurité & Profil",
      sublabel: "Compte principal, rôle et accès",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  const currentNavItem = navItems.find((n) => n.id === activeSection) || navItems[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-between shadow-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 border-b border-neutral-200/80 dark:border-neutral-800/80">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Paramètres de l&apos;Organisation
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 shrink-0">
              Système Actif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Configurez vos informations légales, votre modèle de facture et vos coordonnées de règlement.
          </p>
        </div>

        {/* Global Save Actions */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-all shadow-none active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Réinitialiser</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-95 shadow-none"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Main Settings Layout: Navigation Sidebar + Form Content Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Navigation Column / Mobile Section Selector */}
        <div className="lg:col-span-4 space-y-3">
          {/* MOBILE ONLY (lg:hidden): Dual Mode Dropdown Selector + Horizontal Chips */}
          <div className="lg:hidden space-y-2.5">
            {/* Active Section Header with Dropdown Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 shadow-none text-left transition-all active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shrink-0 font-bold text-xs">
                    {currentNavItem.icon}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono uppercase font-semibold text-neutral-400 block">
                      Rubrique ({navItems.findIndex((n) => n.id === activeSection) + 1}/{navItems.length})
                    </span>
                    <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                      {currentNavItem.label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pl-2 text-neutral-500 shrink-0">
                  <span className="text-[11px] font-medium hidden xs:inline">Changer</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      mobileMenuOpen && "transform rotate-180 text-neutral-900 dark:text-white"
                    )}
                  />
                </div>
              </button>

              {/* Mobile Section Dropdown List */}
              {mobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-40 p-1.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                    Choisir une rubrique
                  </p>
                  {navItems.map((item) => {
                    const isSelected = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-colors",
                          isSelected
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold"
                            : "hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/60 text-neutral-600 dark:text-neutral-400"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={cn(isSelected ? "text-neutral-900 dark:text-white" : "text-neutral-400")}>
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.5] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick 1-Tap Pills for Instant Mobile Switching */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 -mx-1 px-1 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {navItems.map((item) => {
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveSection(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shadow-none shrink-0 active:scale-95",
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border border-neutral-900 dark:border-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-white dark:text-neutral-900" : "text-neutral-400")}>
                      {item.icon}
                    </span>
                    <span>{item.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP ONLY (hidden lg:flex): Rich Vertical Navigation Cards */}
          <div className="hidden lg:flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  className={cn(
                    "w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 select-none",
                    isActive
                      ? "bg-white dark:bg-neutral-900 border-neutral-900 dark:border-white ring-1 ring-neutral-900/10 dark:ring-white/10 shadow-xs"
                      : "bg-[#fafaf9] dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-900"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p
                      className={cn(
                        "text-xs font-semibold leading-tight",
                        isActive
                          ? "text-neutral-900 dark:text-white"
                          : "text-neutral-700 dark:text-neutral-300"
                      )}
                    >
                      {item.label}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                      {item.sublabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Invoice Branding Live Preview Card */}
          <div className="hidden lg:block p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                Aperçu En-tête Facture
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Modèle Officiel</span>
            </div>

            <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700 text-[11px] space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-neutral-900 text-white flex items-center justify-center font-serif text-[10px] font-bold">
                    G
                  </div>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {companyName || "Entreprise"}
                  </span>
                </div>
                <span className="font-mono text-[10px] text-neutral-500">
                  {invoicePrefix}-XXXX
                </span>
              </div>
              <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                {legalName || companyName || "Raison sociale non renseignée"} {taxId ? `· NINEA ${taxId}` : ""}
              </p>
              <p className="text-[10px] text-neutral-400">
                {address ? `${address}, ${city} (${country})` : `${city} (${country})`}
              </p>
              <div className="pt-1 border-t border-neutral-200 dark:border-neutral-700 flex justify-between text-[10px]">
                <span className="text-neutral-500">
                  Paiement : {
                    waveEnabled && orangeMoneyEnabled
                      ? "Wave / OM"
                      : waveEnabled
                      ? "Wave"
                      : orangeMoneyEnabled
                      ? "Orange Money"
                      : bankIban
                      ? "Virement Bancaire"
                      : "Non configuré"
                  }
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">TVA {defaultTaxRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: ENTREPRISE & IDENTITÉ */}
            {activeSection === "entreprise" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Identité Juridique & Siège Social
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Ces mentions apparaissent en en-tête et en pied de page de chaque facture émise.
                  </p>
                </div>

                {/* Logo & Monogramme Block - Compact & Mobile Ergonomic */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-serif text-lg font-bold border border-neutral-300 dark:border-neutral-700 shrink-0 shadow-none">
                      G
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        Logo de Facturation
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate">
                        Bientôt disponible : PNG, SVG ou JPG (format carré, max 2 Mo)
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled
                    title="L'import de logo sera bientôt disponible"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-none shrink-0 opacity-40 cursor-not-allowed"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>
                </div>

                {/* 2-Column Responsive Inputs Grid */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  {/* Nom entreprise */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Nom entreprise *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ex: GESFACTURE"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Raison sociale */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Raison sociale *
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="SARL, SAS, SUARL..."
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* NINEA / Numéro Fiscal */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      NINEA / Fiscal *
                    </label>
                    <input
                      type="text"
                      required
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="007293842 2V3"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Registre de Commerce (RCCM) */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      RCCM
                    </label>
                    <input
                      type="text"
                      value={rccm}
                      onChange={(e) => setRccm(e.target.value)}
                      placeholder="SN-DKR-2024-B-..."
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Adresse du siège (pleine largeur sur 2 colonnes) */}
                  <div className="col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      Adresse du siège *
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Boulevard de la République, Immeuble Tamaro"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Ville */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Ville *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Dakar"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Pays */}
                  <div className="col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Pays *
                    </label>
                    <input
                      type="text"
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Ex: Sénégal"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Téléphone / WhatsApp */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Téléphone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+221 33 821 00 11"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  {/* Email officiel */}
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1 truncate">
                      Email officiel *
                    </label>
                    <input
                      type="email"
                      required
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                      placeholder="contact@gesfacture.sn"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: FACTURATION & TAXES */}
            {activeSection === "facturation" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Modèle de Facture, Numérotation & Taxes
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Définissez la devise monétaire, le taux de TVA et la séquence de numérotation automatique.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Currency Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Devise Principale du Compte
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AVAILABLE_CURRENCIES.map((curr) => (
                        <button
                          key={curr.code}
                          type="button"
                          onClick={() => setCurrency(curr.code)}
                          className={cn(
                            "px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all",
                            currency === curr.code
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs"
                              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                          )}
                        >
                          <span className="block font-bold">{curr.symbol}</span>
                          <span className="text-[10px] opacity-75">{curr.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Default VAT */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Taux de TVA Standard OHADA
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 18, 20].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => setDefaultTaxRate(rate)}
                          className={cn(
                            "px-2.5 py-2 rounded-xl text-xs font-semibold border text-center transition-all",
                            defaultTaxRate === rate
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                          )}
                        >
                          {rate}% {rate === 18 && "(Sénégal)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Prefix */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Préfixe de Numérotation
                    </label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value.toUpperCase())}
                      className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white font-mono focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">Exemple généré : {invoicePrefix}-2026-0042</p>
                  </div>

                  {/* Payment Terms Days */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Délai de Paiement par Défaut
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[7, 15, 30, 45].map((days) => (
                        <button
                          key={days}
                          type="button"
                          onClick={() => setPaymentTermsDays(days)}
                          className={cn(
                            "py-2 rounded-xl text-xs font-semibold border text-center transition-all",
                            paymentTermsDays === days
                              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                              : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                          )}
                        >
                          {days} j
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
                      Mentions Légales & Conditions de Vente en bas de page
                    </label>
                    <textarea
                      rows={3}
                      value={footerNotes}
                      onChange={(e) => setFooterNotes(e.target.value)}
                      className="w-full p-3 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: PAIEMENTS & MOBILE MONEY */}
            {activeSection === "paiements" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-neutral-100 dark:border-neutral-800">
                  <div>
                    <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                      Canaux de Règlement & Coordonnées Bancaires
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Activez les coordonnées qui figurent automatiquement sur les factures remises aux clients.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 self-start sm:self-auto shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Paiements Instantanés
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Wave Digital Finance - Mobile First Responsive Card */}
                  <div
                    className={cn(
                      "p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 space-y-3",
                      waveEnabled
                        ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-none"
                        : "bg-[#fafaf9] dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 opacity-80"
                    )}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-none">
                          W
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                              Wave Digital Finance
                            </p>
                            {waveEnabled ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
                                Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 shrink-0">
                                Inactif
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight mt-0.5">
                            Paiement instantané par QR Code / Numéro Marchand
                          </p>
                        </div>
                      </div>

                      {/* Ergonomic Switch Toggle with 44px min tap zone */}
                      <label className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer shrink-0 select-none">
                        <input
                          type="checkbox"
                          checked={waveEnabled}
                          onChange={(e) => setWaveEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 sm:w-11 sm:h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] sm:after:top-[11px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-neutral-900" />
                      </label>
                    </div>

                    {waveEnabled && (
                      <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
                          <label className="block text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                            Numéro Marchand ou Téléphone Wave *
                          </label>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Format : +221 77 XXX XX XX
                          </span>
                        </div>

                        {/* Input with icon */}
                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            inputMode="tel"
                            value={waveNumber}
                            onChange={(e) => setWaveNumber(e.target.value)}
                            placeholder="+221 77 000 00 00 (Votre numéro Wave)"
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                          />
                        </div>

                        {/* Quick Prefix Buttons for Senegal & Ivory Coast */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-neutral-400 font-medium">Préfixe rapide :</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = waveNumber.replace(/^\+\d+\s*/, "");
                              setWaveNumber("+221 " + cleaned);
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all"
                          >
                            🇸🇳 +221 (Sénégal)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = waveNumber.replace(/^\+\d+\s*/, "");
                              setWaveNumber("+225 " + cleaned);
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all"
                          >
                            🇨🇮 +225 (RCI)
                          </button>
                        </div>

                        {/* Live Mini Preview for Wave on Invoices */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-[#fafaf9] dark:bg-neutral-800/60 border border-neutral-200/90 dark:border-neutral-700/80 flex items-start gap-2.5 text-xs">
                          <div className="w-6 h-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5 text-neutral-700 dark:text-neutral-200">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="text-[11px] font-bold text-neutral-900 dark:text-white">
                                Aperçu sur vos factures A4
                              </span>
                              <span className="text-[9px] font-mono text-[#137333] dark:text-emerald-400 font-medium">
                                ✓ Rendu direct
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono break-all sm:truncate">
                              Wave : {waveNumber.trim() ? waveNumber : "Non configuré (aucun numéro sur facture)"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Orange Money */}
                  <div
                    className={cn(
                      "p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 space-y-3",
                      orangeMoneyEnabled
                        ? "bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 shadow-none"
                        : "bg-[#fafaf9] dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 opacity-80"
                    )}
                  >
                    <div className="flex items-start sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-none">
                          OM
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white truncate">
                              Orange Money Sénégal / CI
                            </p>
                            {orangeMoneyEnabled ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
                                Actif
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700 shrink-0">
                                Inactif
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 leading-tight mt-0.5">
                            Transfert direct vers portefeuille marchand
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer shrink-0 select-none">
                        <input
                          type="checkbox"
                          checked={orangeMoneyEnabled}
                          onChange={(e) => setOrangeMoneyEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5.5 sm:w-11 sm:h-6 bg-neutral-300 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] sm:after:top-[11px] after:left-[4px] after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-white dark:peer-checked:after:bg-neutral-900" />
                      </label>
                    </div>

                    {orangeMoneyEnabled && (
                      <div className="pt-3 border-t border-neutral-200/80 dark:border-neutral-700/70 space-y-2.5 animate-in fade-in duration-150">
                        <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
                          <label className="block text-[11px] font-semibold text-neutral-800 dark:text-neutral-200">
                            Numéro Orange Money officiel *
                          </label>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            Format : +221 78 XXX XX XX
                          </span>
                        </div>

                        <div className="relative">
                          <Smartphone className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            inputMode="tel"
                            value={omNumber}
                            onChange={(e) => setOmNumber(e.target.value)}
                            placeholder="+221 78 000 00 00 (Votre numéro Orange Money)"
                            className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10 transition-colors"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="text-[10px] text-neutral-400 font-medium">Préfixe rapide :</span>
                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = omNumber.replace(/^\+\d+\s*/, "");
                              setOmNumber("+221 " + cleaned);
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all"
                          >
                            🇸🇳 +221 (Sénégal)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const cleaned = omNumber.replace(/^\+\d+\s*/, "");
                              setOmNumber("+225 " + cleaned);
                            }}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 active:scale-95 transition-all"
                          >
                            🇨🇮 +225 (RCI)
                          </button>
                        </div>

                        {/* Live Mini Preview for OM on Invoices */}
                        <div className="p-2.5 sm:p-3 rounded-xl bg-[#fafaf9] dark:bg-neutral-800/60 border border-neutral-200/90 dark:border-neutral-700/80 flex items-start gap-2.5 text-xs">
                          <div className="w-6 h-6 rounded-lg bg-neutral-200/80 dark:bg-neutral-700 flex items-center justify-center shrink-0 mt-0.5 text-neutral-700 dark:text-neutral-200">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <span className="text-[11px] font-bold text-neutral-900 dark:text-white">
                                Aperçu sur vos factures A4
                              </span>
                              <span className="text-[9px] font-mono text-[#137333] dark:text-emerald-400 font-medium">
                                ✓ Rendu direct
                              </span>
                            </div>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono break-all sm:truncate">
                              Orange Money : {omNumber.trim() ? omNumber : "Non configuré (aucun numéro sur facture)"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bank Account */}
                  <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[#fafaf9] dark:bg-neutral-800/50 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center shrink-0">
                        <Landmark className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                          Virement Bancaire (RIB / IBAN OHADA)
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-neutral-400">
                          Pour les règlements interbancaires d&apos;entreprises
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Nom de la Banque
                        </label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="Ex: CBAO, Ecobank, BOA, Société Générale..."
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          IBAN / Numéro de Compte
                        </label>
                        <input
                          type="text"
                          value={bankIban}
                          onChange={(e) => setBankIban(e.target.value)}
                          placeholder="Ex: SN08 SN01 0012 3456 7890 12"
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                          Code BIC / SWIFT
                        </label>
                        <input
                          type="text"
                          value={bankSwift}
                          onChange={(e) => setBankSwift(e.target.value)}
                          placeholder="Code BIC / SWIFT (ex: CBAOSNDA)"
                          className="w-full px-3.5 py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: NOTIFICATIONS & RELANCES */}
            {activeSection === "notifications" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Système d&apos;Alertes & Relances Clients
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Automatisez le suivi des paiements pour réduire les impayés et sécuriser votre trésorerie.
                  </p>
                </div>

                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Notifications par email pour factures en retard
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Recevoir un rapport quotidien des factures ayant dépassé la date d&apos;échéance
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailAlerts}
                      onChange={(e) => setEmailAlerts(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 cursor-pointer"
                    />
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Relance automatique client à J+3 après échéance
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Envoie un email de rappel poli avec lien de paiement au client
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={overdueReminder3Days}
                      onChange={(e) => setOverdueReminder3Days(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 cursor-pointer"
                    />
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Relance ferme à J+7 avec calcul des pénalités
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Transmet un avis formel de mise en demeure amiable
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={overdueReminder7Days}
                      onChange={(e) => setOverdueReminder7Days(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 cursor-pointer"
                    />
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Notification SMS Mobile Money lors de la réception
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Confirme instantanément la réception du paiement par SMS au client
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsPaymentReceipt}
                      onChange={(e) => setSmsPaymentReceipt(e.target.checked)}
                      className="w-4 h-4 accent-neutral-900 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 5: SÉCURITÉ & PROFIL */}
            {activeSection === "securite" && (
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 space-y-5">
                <div>
                  <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Profil Administrateur & Authentification
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Gérez vos informations de connexion et le niveau de permissions sur GESFACTURE.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Ex: Prénom & Nom"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      Rôle & Statut
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${userRole || "Administrateur"} (Droits complets)`}
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-600 dark:text-neutral-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] sm:text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                      Email de connexion *
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="admin@votre-entreprise.com"
                      className="w-full px-3 py-2 sm:py-2.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                    />
                  </div>
                </div>

                {/* Password / 2FA Card */}
                <div className="p-3.5 sm:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center shrink-0">
                      <Lock className="w-4 h-4 text-neutral-500" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white">
                        Mot de passe et Clés d&apos;accès
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {session
                          ? "Un lien de réinitialisation sera envoyé à votre adresse email"
                          : "Disponible avec un compte Supabase connecté"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={!session || isSendingReset}
                    onClick={handlePasswordReset}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl transition-all shadow-none text-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-neutral-800"
                  >
                    Changer le mot de passe
                  </button>
                </div>
              </div>
            )}

            {/* Sticky / Bottom Action Bar - Fully Mobile-Responsive */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-none flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="flex items-start sm:items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 min-w-0">
                <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5 sm:mt-0" />
                <span className="leading-relaxed">
                  Les modifications sont appliquées immédiatement sur vos prochaines factures.
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 sm:py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-xl transition-colors text-center active:scale-95"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-[2] sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-95 shadow-none"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les paramètres</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

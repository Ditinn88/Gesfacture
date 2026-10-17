"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Plus,
  X,
  Settings,
  User as UserIcon,
  LogOut,
  FileText,
  Users,
  ArrowUpRight,
} from "lucide-react";
import { useSearch } from "@/lib/search-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { formatFCFA } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface TopbarProps {
  onToggleSidebar: () => void;
}

export function Topbar({ onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const { searchQuery, setSearchQuery } = useSearch();
  const { invoices, clients, isCloudSynced } = useData();
  const { user, openAuthModal, signOut } = useAuth();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const cleanQuery = searchQuery.toLowerCase().trim();

  // Search invoices from database
  const matchingInvoices = useMemo(() => {
    if (!cleanQuery) return [];
    return invoices
      .filter((inv) => {
        return (
          inv.number.toLowerCase().includes(cleanQuery) ||
          inv.client.name.toLowerCase().includes(cleanQuery) ||
          inv.client.email.toLowerCase().includes(cleanQuery) ||
          inv.amount.toString().includes(cleanQuery) ||
          (inv.client.city && inv.client.city.toLowerCase().includes(cleanQuery))
        );
      })
      .slice(0, 5);
  }, [invoices, cleanQuery]);

  // Search clients from database
  const matchingClients = useMemo(() => {
    if (!cleanQuery) return [];
    return clients
      .filter((c) => {
        return (
          c.name.toLowerCase().includes(cleanQuery) ||
          c.email.toLowerCase().includes(cleanQuery) ||
          (c.phone && c.phone.includes(cleanQuery)) ||
          (c.city && c.city.toLowerCase().includes(cleanQuery))
        );
      })
      .slice(0, 5);
  }, [clients, cleanQuery]);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectInvoice = (id: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/invoices/${id}`);
  };

  const handleSelectClient = () => {
    setShowDropdown(false);
    router.push("/clients");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#fafaf9]/90 dark:bg-[#121212]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between border-b border-neutral-200/60 dark:border-neutral-800/60 transition-colors gap-2">
      {/* Left: Mobile Menu Trigger + Uniform Black Brand Logo */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          aria-label="Ouvrir le menu"
          className="lg:hidden p-1.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Uniform Black Logo matching Desktop 1:1 */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 lg:hidden group focus:outline-none"
        >
          <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-bold text-xs shadow-none">
            <span className="font-serif">G</span>
          </div>
          <span className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white font-sans hidden xs:inline">
            GESFACTURE
          </span>
        </Link>
      </div>

      {/* Right: Search Bar & Notion Light Actions */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Flat Notion Search Bar with dynamic animated magnifying glass on focus */}
        <div
          ref={searchContainerRef}
          className="relative"
        >
          <div
            onClick={() => inputRef.current?.focus()}
            className={`relative group flex items-center transition-all duration-300 ease-out cursor-text rounded-xl border bg-white dark:bg-neutral-900 ${
              isFocused || showDropdown
                ? "w-44 xs:w-56 sm:w-80 md:w-96 border-neutral-400 dark:border-neutral-600 ring-2 ring-neutral-200/60 dark:ring-neutral-800"
                : "w-36 xs:w-48 sm:w-72 md:w-80 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
            }`}
          >
            {/* Animated Loupe on focus */}
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300 ease-out ${
                isFocused
                  ? "text-neutral-900 dark:text-neutral-100 animate-loupe"
                  : "text-neutral-400 dark:text-neutral-500"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={() => {
                setIsFocused(true);
                if (searchQuery.trim().length > 0) setShowDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              placeholder="Rechercher client, facture..."
              className="w-full pl-8 sm:pl-9 pr-9 sm:pr-12 py-1.5 sm:py-2 text-xs bg-transparent text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none shadow-none"
            />

            {/* Right side controls: Clear button or Notion-style shortcut badge */}
            {searchQuery ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setShowDropdown(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                title="Effacer la recherche"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <span>⌘</span>
                <span>K</span>
              </div>
            )}
          </div>

          {/* Live Database Search Results Dropdown */}
          {showDropdown && cleanQuery.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto space-y-2">
              {matchingInvoices.length === 0 && matchingClients.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Aucun résultat trouvé pour « <span className="font-semibold text-neutral-800 dark:text-neutral-200">{searchQuery}</span> »
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                    Vérifiez l&apos;orthographe ou effectuez une recherche par nom de client, numéro ou montant.
                  </p>
                </div>
              ) : (
                <>
                  {/* Matching Invoices */}
                  {matchingInvoices.length > 0 && (
                    <div>
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span>Factures ({matchingInvoices.length})</span>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {matchingInvoices.map((inv) => (
                          <div
                            key={inv.id}
                            onClick={() => handleSelectInvoice(inv.id)}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                {inv.number} • {inv.client.name}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {inv.issueDate} • {inv.paymentMethod || "Règlement"}
                              </p>
                            </div>
                            <div className="text-right shrink-0 flex items-center gap-2">
                              <span className="text-xs font-bold font-mono text-neutral-900 dark:text-white">
                                {formatFCFA(inv.amount)}
                              </span>
                              <StatusBadge status={inv.status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Clients */}
                  {matchingClients.length > 0 && (
                    <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        <span>Clients ({matchingClients.length})</span>
                      </div>
                      <div className="space-y-0.5 mt-0.5">
                        {matchingClients.map((client) => (
                          <div
                            key={client.id}
                            onClick={handleSelectClient}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                                {client.name}
                              </p>
                              <p className="text-[10px] text-neutral-400 truncate">
                                {client.email} {client.phone ? `• ${client.phone}` : ""}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                                {client.city || "Client"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Status Pill: Supabase Cloud vs Local Cache */}
        <div
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 shrink-0 select-none"
          title={
            isCloudSynced
              ? "Connecté en temps réel à Supabase PostgreSQL"
              : "Mode local actif (renseignez .env.local pour synchroniser avec Supabase)"
          }
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isCloudSynced ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider">
            {isCloudSynced ? "Cloud" : "Local"}
          </span>
        </div>

        {/* Settings Shortcut */}
        <Link
          href="/settings"
          className="p-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
          title="Paramètres de l'application"
          aria-label="Paramètres"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* Auth Button: Login modal trigger or User Initial Pill */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-0.5">
            <div
              className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold text-[10px] flex items-center justify-center shrink-0 cursor-default"
              title={user.email || "Utilisateur connecté"}
            >
              {(user.user_metadata?.full_name || user.email || "U")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#c5221f] dark:hover:text-rose-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={openAuthModal}
            className="group inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all duration-150 shrink-0 cursor-pointer"
            title="Se connecter ou créer un compte avec email"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Connexion</span>
          </button>
        )}

        {/* Action Button: Nouvelle Facture - Notion Light Style with Inverted Hover Animation */}
        <Link
          href="/invoices/new"
          className="group inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-900 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all duration-200 active:scale-95 shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.2] group-hover:rotate-90 transition-transform duration-200" />
          <span className="hidden sm:inline">Facture</span>
        </Link>
      </div>
    </header>
  );
}

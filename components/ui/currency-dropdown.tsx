"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, ChevronUp, Search, Check, Globe, MapPin, X } from "lucide-react";
import { cn, AVAILABLE_CURRENCIES, CurrencyInfo, getCurrencyInfo } from "@/lib/utils";

export interface CurrencyDropdownProps {
  value: string;
  onChange: (currencyCode: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
  showActiveSymbol?: boolean;
  showCountriesPreview?: boolean;
}

type RegionFilter = "TOUTES" | "Zone Franc CFA" | "Afrique" | "International";

/**
 * FlagImage: Displays crisp official flag images via flagcdn with graceful fallback,
 * completely solving the issue of Windows rendering emoji flags as plain text letters (e.g. "SN", "NG").
 */
function FlagImage({
  iso2,
  fallback,
  className,
}: {
  iso2: string;
  fallback?: string;
  className?: string;
}) {
  const [hasError, setHasError] = useState(false);
  const code = (iso2 || "un").toLowerCase();

  if (hasError || !code) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center text-[10px] font-mono font-bold uppercase rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 px-1 shrink-0",
          className
        )}
      >
        {fallback || iso2.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
      alt={fallback || iso2}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn(
        "inline-block object-cover rounded-xs border border-neutral-200/60 dark:border-neutral-700/60 shrink-0 shadow-2xs",
        className || "w-5 h-3.5"
      )}
    />
  );
}

export function CurrencyDropdown({
  value,
  onChange,
  label = "Devise de Facturation",
  required = true,
  className,
  disabled = false,
  showActiveSymbol = true,
  showCountriesPreview = true,
}: CurrencyDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState<RegionFilter>("TOUTES");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const selectedCurrency = useMemo(() => getCurrencyInfo(value), [value]);

  // Lock body scroll on mobile drawer open (Per AGENTS.md rule 3)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      // Only lock on mobile / small screen
      if (typeof window !== "undefined" && window.innerWidth < 640) {
        document.body.style.overflow = "hidden";
      }
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Click outside listener for desktop popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input smoothly
      setTimeout(() => {
        if (window.innerWidth < 640) {
          mobileInputRef.current?.focus();
        } else {
          searchInputRef.current?.focus();
        }
      }, 70);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Filtered currencies
  const filteredCurrencies = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return AVAILABLE_CURRENCIES.filter((curr) => {
      // Region filter
      if (activeRegion !== "TOUTES" && curr.region !== activeRegion) {
        return false;
      }
      if (!q) return true;

      // Text matching: code, symbol, name, region, or any country
      const matchCode = curr.code.toLowerCase().includes(q);
      const matchSymbol = curr.symbol.toLowerCase().includes(q);
      const matchName = curr.name.toLowerCase().includes(q);
      const matchRegion = curr.region.toLowerCase().includes(q);
      const matchCountry = curr.countries.some((c) =>
        c
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .includes(q.normalize("NFD").replace(/[\u0300-\u036f]/g, "")) ||
        c.toLowerCase().includes(q)
      );

      return matchCode || matchSymbol || matchName || matchRegion || matchCountry;
    });
  }, [searchQuery, activeRegion]);

  const regionCounts = useMemo(() => {
    return {
      TOUTES: AVAILABLE_CURRENCIES.length,
      "Zone Franc CFA": AVAILABLE_CURRENCIES.filter((c) => c.region === "Zone Franc CFA").length,
      Afrique: AVAILABLE_CURRENCIES.filter((c) => c.region === "Afrique").length,
      International: AVAILABLE_CURRENCIES.filter((c) => c.region === "International").length,
    };
  }, []);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery("");
  };

  // Render the list of items
  const renderCurrencyList = (isMobileView: boolean) => {
    if (filteredCurrencies.length === 0) {
      return (
        <div className="px-4 py-8 text-center space-y-2">
          <Globe className="w-7 h-7 mx-auto text-neutral-300 dark:text-neutral-600 stroke-[1.5]" />
          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Aucun résultat pour « {searchQuery} »
          </p>
          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
            Tapez un nom de pays (ex: Sénégal, Cameroun, France, Maroc) ou un code ISO (ex: XOF, EUR).
          </p>
        </div>
      );
    }

    const queryNormalized = searchQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return filteredCurrencies.map((curr) => {
      const isSelected = curr.code === selectedCurrency.code;
      const countriesToDisplay = isMobileView
        ? curr.countryList.slice(0, 3)
        : curr.countryList;
      const extraCount = curr.countryList.length - 3;

      return (
        <button
          key={curr.code}
          type="button"
          onClick={() => handleSelect(curr.code)}
          role="option"
          aria-selected={isSelected}
          className={cn(
            "w-full text-left rounded-xl transition-all border select-none group",
            isMobileView ? "p-3" : "p-2.5",
            isSelected
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs"
              : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 hover:bg-[#fafaf9] dark:hover:bg-neutral-800/50"
          )}
        >
          {/* Header Row: Flag + Name + ISO code + Symbol + Check */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Flag image */}
              <div className="w-7 h-5 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0 border border-neutral-200/80 dark:border-neutral-700">
                <FlagImage iso2={curr.iso2} fallback={curr.flag} className="w-full h-full object-cover" />
              </div>

              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span
                  className={cn(
                    "text-xs font-bold truncate",
                    isSelected ? "text-white dark:text-neutral-900" : "text-neutral-900 dark:text-white"
                  )}
                >
                  {curr.name}
                </span>

                <span
                  className={cn(
                    "px-1.5 py-0.2 text-[10px] font-mono font-bold rounded shrink-0",
                    isSelected
                      ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                  )}
                >
                  {curr.code}
                </span>

                <span
                  className={cn(
                    "text-[10px] hidden sm:inline truncate",
                    isSelected ? "text-white/60 dark:text-neutral-900/60" : "text-neutral-400 dark:text-neutral-500"
                  )}
                >
                  • {curr.region}
                </span>
              </div>
            </div>

            {/* Right: Symbol Pill + Checkmark */}
            <div className="flex items-center gap-2 shrink-0">
              <span
                className={cn(
                  "px-2 py-0.5 text-xs font-mono font-bold rounded-md",
                  isSelected
                    ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700"
                )}
              >
                {curr.symbol}
              </span>

              {isSelected && (
                <div
                  className={cn(
                    "w-4 h-4 rounded-full flex items-center justify-center shrink-0",
                    "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
                  )}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </div>
          </div>

          {/* Sub Row: Country Tags List */}
          <div className="flex items-center gap-1.5 flex-wrap pt-2">
            <span
              className={cn(
                "text-[10px] font-medium flex items-center gap-1 shrink-0",
                isSelected ? "text-white/70 dark:text-neutral-900/70" : "text-neutral-400 dark:text-neutral-500"
              )}
            >
              <MapPin className="w-2.5 h-2.5" />
              Pays :
            </span>

            {countriesToDisplay.map((country) => {
              const isMatch =
                Boolean(queryNormalized) &&
                country.name
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .includes(queryNormalized);

              return (
                <span
                  key={country.name}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] rounded-md transition-colors",
                    isSelected
                      ? "bg-white/15 text-white dark:bg-neutral-900/15 dark:text-neutral-900 font-medium"
                      : isMatch
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold ring-1 ring-neutral-900 dark:ring-white"
                      : "bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60"
                  )}
                >
                  <FlagImage iso2={country.iso2} className="w-3.5 h-2.5" />
                  <span>{country.name}</span>
                </span>
              );
            })}

            {isMobileView && extraCount > 0 && (
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-mono rounded-md",
                  isSelected
                    ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                    : "bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                )}
              >
                +{extraCount} autres
              </span>
            )}
          </div>
        </button>
      );
    });
  };

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Label and Active Symbol indicator */}
      {(label || showActiveSymbol) && (
        <div className="flex items-center justify-between gap-2 mb-1.5 select-none">
          {label && (
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
              {label} {required && <span className="text-neutral-500">*</span>}
            </label>
          )}
          {showActiveSymbol && (
            <span className="text-[11px] text-neutral-400 font-normal shrink-0">
              Symbole actif :{" "}
              <strong className="font-mono text-neutral-900 dark:text-white font-bold">
                {selectedCurrency.symbol}
              </strong>{" "}
              <span className="text-[10px] text-neutral-400 font-mono">({selectedCurrency.code})</span>
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button - Notion Light Pure Flat & Mobile Ergonomic */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery("");
            setActiveRegion("TOUTES");
          }
        }}
        className={cn(
          "w-full flex items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:px-3.5 sm:py-2.5 rounded-xl border text-left transition-all shadow-none select-none",
          isOpen
            ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-white dark:bg-neutral-900 dark:border-white dark:ring-white/20"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600",
          disabled && "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Left: Flag + Symbol squircle badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 flex flex-col items-center justify-center shrink-0 p-1">
            <FlagImage iso2={selectedCurrency.iso2} fallback={selectedCurrency.flag} className="w-5 h-3.5" />
            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-neutral-900 dark:text-white mt-1 leading-none truncate max-w-full">
              {selectedCurrency.symbol}
            </span>
          </div>

          {/* Center info: Currency name, ISO code & countries */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {selectedCurrency.name}
              </span>
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                {selectedCurrency.code}
              </span>
              <span className="text-[10px] text-neutral-400 hidden md:inline truncate">
                • {selectedCurrency.region}
              </span>
            </div>

            {/* Countries line with pin */}
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400 min-w-0">
              <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
              <span className="truncate">
                {selectedCurrency.countriesText}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Badge + Animated Chevron */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden xs:inline-block px-2 py-0.5 text-[11px] font-mono font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
            {selectedCurrency.symbol}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* DESKTOP POPOVER (≥ 640px) */}
      {isOpen && (
        <div className="hidden sm:flex absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden p-2.5 animate-in fade-in-50 zoom-in-95 duration-150 flex-col max-h-[460px]">
          {/* Search Box */}
          <div className="relative mb-2 shrink-0">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher devise ou pays (ex: Sénégal, France, FCFA, XOF)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none text-[11px] shrink-0">
            {(
              [
                { id: "TOUTES", label: "Toutes" },
                { id: "Zone Franc CFA", label: "Zone Franc CFA" },
                { id: "Afrique", label: "Afrique" },
                { id: "International", label: "International" },
              ] as const
            ).map((tab) => {
              const count = regionCounts[tab.id];
              const isActive = activeRegion === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveRegion(tab.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "text-[10px] px-1 py-0.2 rounded font-mono",
                      isActive
                        ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                        : "bg-neutral-200/60 dark:bg-neutral-800 text-neutral-500"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Currencies List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5" role="listbox">
            {renderCurrencyList(false)}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET MODAL (< 640px) */}
      {isOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

          {/* Bottom Drawer Container */}
          <div className="relative w-full max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-3xl border-t border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
            {/* Top Handle */}
            <div className="w-10 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto my-2 shrink-0" />

            {/* Mobile Header */}
            <div className="px-4 pb-2.5 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Devise de Facturation
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Sélectionnez la monnaie ou cherchez par pays
                </p>
              </div>

              {/* Circular Close Button (Per AGENTS.md rule) */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 flex items-center justify-center text-neutral-500 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4 stroke-[2]" />
              </button>
            </div>

            {/* Search Box on Mobile */}
            <div className="p-3 pb-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="Rechercher pays (Sénégal, France, etc.) ou devise..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-neutral-400"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Region Tabs on Mobile */}
            <div className="px-3 pb-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none border-b border-neutral-100 dark:border-neutral-800 shrink-0">
              {(
                [
                  { id: "TOUTES", label: "Toutes" },
                  { id: "Zone Franc CFA", label: "Zone Franc CFA" },
                  { id: "Afrique", label: "Afrique" },
                  { id: "International", label: "International" },
                ] as const
              ).map((tab) => {
                const count = regionCounts[tab.id];
                const isActive = activeRegion === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveRegion(tab.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                      isActive
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800"
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        "text-[10px] px-1 py-0.2 rounded font-mono",
                        isActive
                          ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                          : "text-neutral-400"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 overscroll-contain pb-6">
              {renderCurrencyList(true)}
            </div>
          </div>
        </div>
      )}

      {/* Selected Countries Quick Tags Preview (under the dropdown) */}
      {showCountriesPreview && (
        <div className="mt-2 p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5 truncate">
              <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
              <span className="truncate">
                Pays couverts par <strong className="font-bold text-neutral-900 dark:text-white">{selectedCurrency.name}</strong> ({selectedCurrency.code}) :
              </span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400 shrink-0">
              {selectedCurrency.countryList.length} pays
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            {selectedCurrency.countryList.map((country) => (
              <span
                key={country.name}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[10px] sm:text-[11px] text-neutral-800 dark:text-neutral-200 font-medium shadow-none"
              >
                <FlagImage iso2={country.iso2} className="w-3.5 h-2.5" />
                <span>{country.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

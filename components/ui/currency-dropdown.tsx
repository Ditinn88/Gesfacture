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

  const selectedCurrency = useMemo(() => getCurrencyInfo(value), [value]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input
      setTimeout(() => searchInputRef.current?.focus(), 50);
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
        c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(
          q.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        ) || c.toLowerCase().includes(q)
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

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Label and Active Symbol indicator */}
      {(label || showActiveSymbol) && (
        <div className="flex items-center justify-between mb-1.5 select-none">
          {label && (
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {label} {required && <span className="text-neutral-500">*</span>}
            </label>
          )}
          {showActiveSymbol && (
            <span className="text-[11px] text-neutral-400 font-normal">
              Symbole actif :{" "}
              <strong className="font-mono text-neutral-900 dark:text-white font-bold">
                {selectedCurrency.symbol}
              </strong>{" "}
              <span className="text-[10px] text-neutral-400">({selectedCurrency.code})</span>
            </span>
          )}
        </div>
      )}

      {/* Main Trigger Button - Notion Light Pure Flat */}
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
          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border text-left transition-all shadow-none select-none",
          isOpen
            ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-white dark:bg-neutral-900 dark:border-white dark:ring-white/20"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600",
          disabled && "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {/* Left: Flag + Symbol squircle badge */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/80 flex flex-col items-center justify-center shrink-0">
            <span className="text-base leading-none">{selectedCurrency.flag}</span>
            <span className="text-[10px] font-mono font-bold text-neutral-900 dark:text-white mt-0.5 leading-none">
              {selectedCurrency.symbol}
            </span>
          </div>

          {/* Center info: Currency name, ISO code & countries */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                {selectedCurrency.name}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 shrink-0">
                {selectedCurrency.code}
              </span>
              <span className="text-[10px] text-neutral-400 hidden sm:inline truncate">
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
          <span className="hidden xs:inline-block px-2 py-1 text-[11px] font-mono font-semibold rounded-lg bg-neutral-50 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
            {selectedCurrency.symbol}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden p-2.5 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Integrated Search Box */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Rechercher une devise ou un pays (ex: Sénégal, France, FCFA, XOF)..."
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

          {/* Category Tabs (Pills) */}
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-neutral-100 dark:border-neutral-800 overflow-x-auto scrollbar-none text-[11px]">
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
          <div className="max-h-80 overflow-y-auto space-y-1.5 pr-0.5" role="listbox">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map((curr) => {
                const isSelected = curr.code === selectedCurrency.code;
                const queryNormalized = searchQuery
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "");

                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => {
                      onChange(curr.code);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    role="option"
                    aria-selected={isSelected}
                    className={cn(
                      "w-full p-2.5 text-left rounded-xl transition-all border flex flex-col gap-1.5",
                      isSelected
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs"
                        : "bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border-transparent hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/60 hover:border-neutral-200 dark:hover:border-neutral-700"
                    )}
                  >
                    {/* Top Row: Flag + Symbol + Name + Code + Check */}
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg leading-none shrink-0">{curr.flag}</span>
                        <div className="flex items-center gap-2 min-w-0">
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
                              "px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded shrink-0",
                              isSelected
                                ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                            )}
                          >
                            {curr.code}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={cn(
                            "px-2 py-0.5 text-xs font-mono font-bold rounded-md",
                            isSelected
                              ? "bg-white/20 text-white dark:bg-neutral-900/20 dark:text-neutral-900"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200"
                          )}
                        >
                          {curr.symbol}
                        </span>
                        {isSelected && (
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                              "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
                            )}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Row: Countries Badges List */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <span
                        className={cn(
                          "text-[10px] font-medium flex items-center gap-1 shrink-0",
                          isSelected
                            ? "text-neutral-300 dark:text-neutral-700"
                            : "text-neutral-400 dark:text-neutral-500"
                        )}
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        Pays :
                      </span>

                      {curr.countries.map((country) => {
                        const isMatch =
                          Boolean(queryNormalized) &&
                          country
                            .toLowerCase()
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")
                            .includes(queryNormalized);

                        return (
                          <span
                            key={country}
                            className={cn(
                              "px-1.5 py-0.5 text-[10px] rounded-md transition-colors",
                              isSelected
                                ? "bg-white/15 text-white/90 dark:bg-neutral-900/15 dark:text-neutral-900 font-medium"
                                : isMatch
                                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700/60"
                            )}
                          >
                            {country}
                          </span>
                        );
                      })}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center space-y-2">
                <Globe className="w-8 h-8 mx-auto text-neutral-300 dark:text-neutral-600 stroke-[1.5]" />
                <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Aucune devise trouvée pour « {searchQuery} »
                </p>
                <p className="text-[11px] text-neutral-400">
                  Essayez avec un nom de pays (ex: Sénégal, France, Guinée, Maroc) ou un code ISO (ex: XOF, EUR, USD).
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Countries Quick Tags Preview (under the dropdown) */}
      {showCountriesPreview && (
        <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-xs">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-neutral-500" />
              <span>
                Pays d&apos;application pour <strong className="font-bold text-neutral-900 dark:text-white">{selectedCurrency.name}</strong> ({selectedCurrency.code}) :
              </span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400">
              {selectedCurrency.countries.length} pays
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {selectedCurrency.countries.map((country, idx) => {
              const flag = selectedCurrency.flags && selectedCurrency.flags[idx] ? selectedCurrency.flags[idx] : selectedCurrency.flag;
              return (
                <span
                  key={country}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] text-neutral-800 dark:text-neutral-200 font-medium shadow-none"
                >
                  <span className="text-xs">{flag}</span>
                  <span>{country}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

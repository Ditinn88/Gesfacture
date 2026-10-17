"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, Search, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomDropdownProps {
  items: DropdownItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  disabled?: boolean;
}

export function CustomDropdown({
  items,
  value,
  onChange,
  placeholder = "Sélectionner...",
  label,
  icon,
  searchable = true,
  searchPlaceholder = "Rechercher...",
  actionLabel,
  onAction,
  className,
  disabled = false,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedItem = items.find((item) => item.id === value);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      if (searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 60);
      }
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, searchable]);

  // Handle escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.label.toLowerCase().includes(q) ||
      (item.sublabel && item.sublabel.toLowerCase().includes(q))
    );
  });

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {/* Label above input */}
      {label && (
        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* Trigger Box - Notion Flat with Crisp Black Outline on Active (as in Image 1) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            setSearchQuery("");
          }
        }}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs rounded-xl border transition-all text-left shadow-none select-none",
          isOpen
            ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-white dark:bg-neutral-900 dark:border-white dark:ring-white/20"
            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-500",
          disabled && "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {icon && <span className="text-neutral-400 shrink-0">{icon}</span>}
          {selectedItem ? (
            <div className="flex items-center gap-2.5 min-w-0">
              {selectedItem.icon && <span className="shrink-0">{selectedItem.icon}</span>}
              <div className="min-w-0">
                <span className="font-semibold text-neutral-900 dark:text-white truncate block text-xs">
                  {selectedItem.label}
                </span>
                {selectedItem.sublabel && (
                  <span className="text-neutral-400 dark:text-neutral-500 truncate block text-[11px]">
                    {selectedItem.sublabel}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <span className="text-neutral-400 text-xs">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedItem && !isOpen && (
            <span className="w-4 h-4 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-neutral-900 dark:text-white stroke-[3]" />
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-neutral-900 dark:text-white shrink-0 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Floating Popover Card - Image 1 Style (rounded-2xl, shadow-xl, clean items, checkmark on right) */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden p-2 animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Integrated Search Box if searchable */}
          {searchable && (
            <div className="mb-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/10"
                />
              </div>
            </div>
          )}

          {/* List of items */}
          <div className="max-h-60 overflow-y-auto space-y-1 pr-0.5">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => {
                const isSelected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.id);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2.5 text-left text-xs rounded-xl flex items-center justify-between gap-3 transition-all",
                      isSelected
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold"
                        : "text-neutral-700 dark:text-neutral-300 hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/60"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-neutral-900 dark:text-white">
                          {item.label}
                        </p>
                        {item.sublabel && (
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                            {item.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] rounded-md bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                          {item.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-neutral-900 dark:text-white stroke-[2.5]" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs text-neutral-400">
                Aucun résultat pour « {searchQuery} »
              </div>
            )}
          </div>

          {/* Optional Action Footer (+ Nouveau Client) */}
          {actionLabel && onAction && (
            <div className="pt-2 mt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onAction();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors shadow-none"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{actionLabel}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

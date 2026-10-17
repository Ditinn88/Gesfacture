"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check, X } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";

export type DateFilterPreset = "all" | "this_month" | "last_30_days" | "this_year" | "custom";

export interface DateRange {
  preset: DateFilterPreset;
  startDate: string; // YYYY-MM-DD or ""
  endDate: string;   // YYYY-MM-DD or ""
}

interface DashboardDateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DashboardDateFilter({ value, onChange, className }: DashboardDateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Format today as YYYY-MM-DD
  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSelectPreset = (preset: DateFilterPreset) => {
    if (preset === "all") {
      onChange({ preset: "all", startDate: "", endDate: "" });
      setIsOpen(false);
    } else if (preset === "this_month") {
      const firstDay = new Date(currentYear, currentMonth, 1);
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      onChange({
        preset: "this_month",
        startDate: formatYMD(firstDay),
        endDate: formatYMD(lastDay),
      });
      setIsOpen(false);
    } else if (preset === "last_30_days") {
      const end = new Date();
      const start = new Date(Date.now() - 30 * 86400000);
      onChange({
        preset: "last_30_days",
        startDate: formatYMD(start),
        endDate: formatYMD(end),
      });
      setIsOpen(false);
    } else if (preset === "this_year") {
      const firstDay = new Date(currentYear, 0, 1);
      const lastDay = new Date(currentYear, 11, 31);
      onChange({
        preset: "this_year",
        startDate: formatYMD(firstDay),
        endDate: formatYMD(lastDay),
      });
      setIsOpen(false);
    } else if (preset === "custom") {
      onChange({
        preset: "custom",
        startDate: value.startDate || formatYMD(new Date(Date.now() - 7 * 86400000)),
        endDate: value.endDate || formatYMD(new Date()),
      });
    }
  };

  // Label calculation for display button
  const getDisplayLabel = () => {
    if (value.preset === "all") return "Toutes les dates";
    if (value.preset === "this_month") return "Ce mois";
    if (value.preset === "last_30_days") return "30 derniers jours";
    if (value.preset === "this_year") return `Année ${currentYear}`;
    if (value.preset === "custom") {
      if (value.startDate && value.endDate) {
        return `${formatDate(value.startDate)} - ${formatDate(value.endDate)}`;
      }
      if (value.startDate) return `Depuis le ${formatDate(value.startDate)}`;
      if (value.endDate) return `Jusqu'au ${formatDate(value.endDate)}`;
      return "Période personnalisée";
    }
    return "Filtrer par date";
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      {/* Trigger Button: Notion Style Pill with Calendar Icon */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all duration-150 select-none cursor-pointer shadow-none",
          isOpen
            ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600"
        )}
      >
        <CalendarIcon className="w-3.5 h-3.5 opacity-80" />
        <span>{getDisplayLabel()}</span>
        <ChevronDown
          className={cn(
            "w-3 h-3 opacity-60 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-[11px] font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
              Période d&apos;analyse
            </span>
            {value.preset !== "all" && (
              <button
                type="button"
                onClick={() => handleSelectPreset("all")}
                className="text-[11px] text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>

          {/* Quick Preset Options */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "all", label: "Tout" },
              { id: "this_month", label: "Ce mois" },
              { id: "last_30_days", label: "30 jours" },
              { id: "this_year", label: "Cette année" },
            ].map((p) => {
              const isSelected = value.preset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id as DateFilterPreset)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                    isSelected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <span>{p.label}</span>
                  {isSelected && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Section */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                Plage personnalisée
              </span>
              <button
                type="button"
                onClick={() => handleSelectPreset("custom")}
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                  value.preset === "custom"
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                Activer
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Date début</label>
                <CustomDatePicker
                  value={value.startDate}
                  onChange={(d) => {
                    onChange({
                      preset: "custom",
                      startDate: d,
                      endDate: value.endDate,
                    });
                  }}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-neutral-400">Date fin</label>
                <CustomDatePicker
                  value={value.endDate}
                  onChange={(d) => {
                    onChange({
                      preset: "custom",
                      startDate: value.startDate,
                      endDate: d,
                    });
                  }}
                  className="w-full text-xs"
                />
              </div>
            </div>
          </div>

          {/* Action footer */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Appliquer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

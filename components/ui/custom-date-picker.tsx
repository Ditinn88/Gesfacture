"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

interface CustomDatePickerProps {
  value: string; // "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
  align?: "left" | "right";
}

const MONTH_NAMES = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const WEEKDAY_NAMES = ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"];

export function CustomDatePicker({
  value,
  onChange,
  label,
  className,
  disabled = false,
  align = "left",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or fallback to today
  const selectedDate = value ? new Date(value + "T00:00:00") : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth()); // 0-11

  // Keep view year/month in sync if value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close when clicking outside
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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Days calculations
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  // 0 = Sunday, 1 = Monday, etc. matching WEEKDAY_NAMES ["Di", "Lu", "Ma", "Me", "Je", "Ve", "Sa"]
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  const handleSelectDate = (year: number, month: number, day: number) => {
    const formattedM = String(month + 1).padStart(2, "0");
    const formattedD = String(day).padStart(2, "0");
    onChange(`${year}-${formattedM}-${formattedD}`);
    setIsOpen(false);
  };

  // Quick preset handlers
  const handleQuickPreset = (offsetDays: number) => {
    const target = new Date();
    target.setDate(target.getDate() + offsetDays);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleEndOfMonth = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const y = lastDay.getFullYear();
    const m = String(lastDay.getMonth() + 1).padStart(2, "0");
    const d = String(lastDay.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <div className={cn("relative w-full", className)} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5 select-none">
          {label}
        </label>
      )}

      {/* Input Trigger - Image 2 Reference with Black Outline on Active */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-2 sm:py-2.5 text-xs rounded-xl border transition-all text-left shadow-none select-none",
          isOpen
            ? "border-neutral-900 ring-2 ring-neutral-900/10 bg-white dark:bg-neutral-900 dark:border-white dark:ring-white/20"
            : "border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-500",
          disabled && "opacity-50 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800"
        )}
      >
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <CalendarIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-900 dark:text-white text-xs truncate">
            {value ? formatDate(value) : "Sélectionner..."}
          </span>
        </div>

        <ChevronsUpDown className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-neutral-400 shrink-0" />
      </button>

      {/* Popover Calendar Card - Image 2 Reference with Black Selected Day */}
      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-1.5 w-[300px] sm:w-[320px] max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-3.5 sm:p-4 animate-in fade-in-50 zoom-in-95 duration-150",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {/* Calendar Header with Rounded Square Prev/Next buttons */}
          <div className="flex items-center justify-between pb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-none"
              title="Mois précédent"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="font-bold text-sm text-neutral-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors shadow-none"
              title="Mois suivant"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names Header (Di Lu Ma Me Je Ve Sa) */}
          <div className="grid grid-cols-7 gap-1 pt-1 pb-2 text-center text-xs font-semibold text-neutral-400 dark:text-neutral-500">
            {WEEKDAY_NAMES.map((w, idx) => (
              <span key={idx}>{w}</span>
            ))}
          </div>

          {/* 7-Column Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Trailing days from previous month */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => {
              const day = daysInPrevMonth - firstDayOfWeek + idx + 1;
              const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
              const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
              return (
                <button
                  key={`prev-${idx}`}
                  type="button"
                  onClick={() => handleSelectDate(prevYear, prevMonth, day)}
                  className="h-9 w-9 rounded-xl text-xs font-normal text-neutral-300 dark:text-neutral-600 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                >
                  {day}
                </button>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const formattedM = String(viewMonth + 1).padStart(2, "0");
              const formattedD = String(day).padStart(2, "0");
              const currentIso = `${viewYear}-${formattedM}-${formattedD}`;
              const isSelected = value === currentIso;
              const isToday = currentIso === todayStr;

              return (
                <button
                  key={`curr-${day}`}
                  type="button"
                  onClick={() => handleSelectDate(viewYear, viewMonth, day)}
                  className={cn(
                    "relative h-9 w-9 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all select-none",
                    // Selected state: Fond noir, écriture blanche (Strict user request)
                    isSelected
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold shadow-xs scale-105 z-10"
                      : "text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    // Today indicator (when not selected): subtle background with dot/dash
                    isToday && !isSelected && "bg-neutral-100 dark:bg-neutral-800 font-bold text-neutral-900 dark:text-white"
                  )}
                >
                  <span>{day}</span>
                  {/* Subtle dash indicator for today */}
                  {isToday && !isSelected && (
                    <span className="w-1.5 h-0.5 bg-neutral-900 dark:bg-white rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}

            {/* Trailing days for next month to complete grid */}
            {(() => {
              const totalCells = firstDayOfWeek + daysInMonth;
              const remainingCells = (7 - (totalCells % 7)) % 7;
              return Array.from({ length: remainingCells }).map((_, idx) => {
                const day = idx + 1;
                const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
                const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
                return (
                  <button
                    key={`next-${idx}`}
                    type="button"
                    onClick={() => handleSelectDate(nextYear, nextMonth, day)}
                    className="h-9 w-9 rounded-xl text-xs font-normal text-neutral-300 dark:text-neutral-600 flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    {day}
                  </button>
                );
              });
            })()}
          </div>

          {/* Quick Presets Pills */}
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickPreset(0)}
              className="py-1 px-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold transition-all text-center"
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(15)}
              className="py-1 px-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold transition-all text-center"
            >
              +15 jours
            </button>
            <button
              type="button"
              onClick={() => handleQuickPreset(30)}
              className="py-1 px-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold transition-all text-center"
            >
              +30 jours
            </button>
            <button
              type="button"
              onClick={handleEndOfMonth}
              className="py-1 px-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 text-neutral-700 dark:text-neutral-300 text-[10px] font-semibold transition-all text-center"
            >
              Fin de mois
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
  itemLabel = "éléments",
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) {
      pages.push("...");
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) {
      pages.push("...");
    }
    pages.push(totalPages);
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500",
        className
      )}
    >
      {/* Information text */}
      <div>
        <span>Affichage de </span>
        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
          {startItem}
        </span>
        <span> à </span>
        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
          {endItem}
        </span>
        <span> sur </span>
        <span className="font-semibold text-neutral-900 dark:text-white font-mono">
          {totalItems}
        </span>
        <span> {itemLabel}</span>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-none select-none",
            currentPage <= 1
              ? "border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-transparent"
              : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 active:scale-95"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Précédent</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 py-1 text-xs text-neutral-400 select-none"
                >
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={cn(
                  "w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all shadow-none select-none",
                  isCurrent
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-bold"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn(
            "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-none select-none",
            currentPage >= totalPages
              ? "border-neutral-200 dark:border-neutral-800 text-neutral-300 dark:text-neutral-600 cursor-not-allowed bg-transparent"
              : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 active:scale-95"
          )}
        >
          <span className="hidden xs:inline">Suivant</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

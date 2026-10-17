"use client";

import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionItem {
  label: string;
  icon?: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  destructive?: boolean;
}

interface RowActionsDropdownProps {
  actions: ActionItem[];
  className?: string;
}

export function RowActionsDropdown({ actions, className }: RowActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Options"
        className={cn(
          "p-1.5 rounded-lg border text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all shadow-none select-none",
          isOpen
            ? "border-neutral-900 dark:border-white bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white"
            : "border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        )}
      >
        <MoreHorizontal className="w-4 h-4 stroke-[2]" />
      </button>

      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-1 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl py-1 z-30 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          {actions.map((act, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                act.onClick(e);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs font-medium flex items-center gap-2 transition-colors",
                act.destructive
                  ? "text-[#c5221f] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  : "text-neutral-700 dark:text-neutral-200 hover:bg-[#f6f6f5] dark:hover:bg-neutral-800"
              )}
            >
              {act.icon && (
                <span className={cn("shrink-0", act.destructive ? "text-[#c5221f] dark:text-rose-400" : "text-neutral-400")}>
                  {act.icon}
                </span>
              )}
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

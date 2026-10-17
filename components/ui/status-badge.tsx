import React from "react";
import { cn } from "@/lib/utils";

export type InvoiceStatusType = "payee" | "envoyee" | "brouillon" | "en_retard";

interface StatusBadgeProps {
  status: InvoiceStatusType;
  className?: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  // Flat pastel rounded-full pills (Notion / Modern SaaS style)
  // Perfectly rounded with rounded-full, flat pastel background, zero blue tint
  const configs = {
    payee: {
      label: "Payée",
      containerClass:
        "bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50 font-medium",
    },
    envoyee: {
      label: "Envoyée",
      containerClass:
        "bg-[#fef7e0] text-[#b06000] border border-[#fce8b2]/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50 font-medium",
    },
    en_retard: {
      label: "En retard",
      containerClass:
        "bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50 font-medium",
    },
    brouillon: {
      label: "Brouillon",
      containerClass:
        "bg-[#f1f3f4] text-[#5f6368] border border-[#e0e0e0]/70 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700 font-medium",
    },
  };

  const current = configs[status] || configs.brouillon;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full transition-all duration-150 whitespace-nowrap shadow-none tracking-tight hover:scale-105 cursor-default",
        size === "sm" ? "px-3 py-0.5 text-[11px]" : "px-3.5 py-1 text-xs",
        current.containerClass,
        className
      )}
    >
      {current.label}
    </span>
  );
}

"use client";

import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { useData } from "@/lib/data-context";

/**
 * Bandeau d'alerte affiché quand une écriture vers Supabase échoue.
 * Les données restent enregistrées localement, mais l'utilisateur doit savoir
 * qu'elles ne sont pas sauvegardées dans le cloud.
 */
export function SyncErrorBanner() {
  const { syncError, dismissSyncError } = useData();

  if (!syncError) return null;

  return (
    <div
      role="alert"
      className="mb-4 p-3.5 rounded-xl bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50 flex items-start justify-between gap-3 no-print"
    >
      <div className="flex items-start gap-2.5 text-xs">
        <span className="relative flex h-2 w-2 mt-1 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5221f] dark:bg-rose-400 opacity-60" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5221f] dark:bg-rose-400" />
        </span>
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <div>
          {/* Les refus liés au rôle d'un membre (denyAction dans data-context) commencent par « Votre rôle » */}
          <p className="font-bold">
            {syncError.startsWith("Votre rôle") ? "Action non autorisée" : "Synchronisation Supabase échouée"}
          </p>
          <p className="mt-0.5">{syncError}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={dismissSyncError}
        aria-label="Fermer l'alerte"
        className="w-8 h-8 shrink-0 rounded-full hover:bg-[#fad2cf]/60 dark:hover:bg-rose-900/40 flex items-center justify-center transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

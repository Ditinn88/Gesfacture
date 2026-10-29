"use client";

import React, { useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useData } from "@/lib/data-context";

/**
 * Bandeau proposé quand le compte Supabase connecté est vide alors que l'appareil contient
 * des factures et clients saisis sans compte : un clic les copie dans le compte.
 */
export function LocalImportBanner() {
  const { localImport, importLocalData, dismissLocalImport } = useData();
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!localImport) return null;

  const parts = [
    localImport.invoices > 0 && `${localImport.invoices} facture${localImport.invoices > 1 ? "s" : ""}`,
    localImport.clients > 0 && `${localImport.clients} client${localImport.clients > 1 ? "s" : ""}`,
  ].filter(Boolean);

  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    const result = await importLocalData();
    setIsImporting(false);
    if (result) setError(result);
  };

  return (
    <div className="mb-4 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
      <div className="flex items-start gap-2.5 text-xs min-w-0">
        <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center shrink-0">
          <UploadCloud className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-neutral-900 dark:text-white">Importer vos données dans votre compte</p>
          <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
            Cet appareil contient {parts.join(" et ")} saisis sans compte. Importez-les pour les retrouver partout et
            les partager avec vos membres.
          </p>
          {error && <p className="text-[#c5221f] dark:text-rose-400 mt-1">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl transition-all active:scale-95 shadow-none disabled:opacity-50"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{isImporting ? "Import en cours..." : "Importer"}</span>
        </button>
        <button
          type="button"
          onClick={dismissLocalImport}
          aria-label="Ne pas importer maintenant"
          title="Ne pas importer maintenant"
          className="w-8 h-8 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

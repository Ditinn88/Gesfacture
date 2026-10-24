"use client";

import React from "react";
import { Package, Plus } from "lucide-react";

export default function ProductsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Catalogue Produits & Services
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Gérez vos forfaits et prestations standardisés avec prix et taux de TVA pré-remplis.
          </p>
        </div>
        <button
          type="button"
          disabled
          title="Bientôt disponible"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-xl shadow-none opacity-40 cursor-not-allowed"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Nouveau produit</span>
        </button>
      </div>

      <div className="py-16 px-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none text-center space-y-2">
        <div className="w-10 h-10 mx-auto rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center">
          <Package className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Catalogue bientôt disponible</p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-sm mx-auto">
          En attendant, saisissez vos prestations directement dans les lignes de chaque facture.
        </p>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Package, Plus } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function ProductsPage() {
  const products = [
    { name: "Conseil Stratégique Digital", unit: "jour", price: 350000, tax: "18%" },
    { name: "Développement Application Web / Mobile", unit: "forfait", price: 2500000, tax: "18%" },
    { name: "Maintenance & Hébergement Cloud", unit: "mois", price: 180000, tax: "18%" },
    { name: "Audit de Sécurité & Conformité", unit: "forfait", price: 1200000, tax: "18%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Catalogue Produits & Services
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gérez vos forfaits et prestations standardisés avec prix et taux de TVA pré-remplis.
          </p>
        </div>
        <button
          onClick={() => alert("Ajout de produit bientôt disponible")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Produit</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((p, i) => (
          <div
            key={i}
            className="p-5 bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</h3>
            <p className="text-xs text-slate-400">Unité : Par {p.unit} · TVA {p.tax}</p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
              <span className="text-xs text-slate-400">Tarif unitaire :</span>
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                {formatFCFA(p.price)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

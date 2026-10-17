"use client";

import React from "react";
import { BarChart3, Download, FileSpreadsheet } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Rapports & Déclarations de TVA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Générez vos balances âgées, déclarations fiscales de TVA et récapitulatifs comptables.
          </p>
        </div>
        <button
          onClick={() => alert("Téléchargement de l'export CSV complet...")}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Exporter balance comptable</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">TVA Collectée (18%)</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatFCFA(2814406)}</p>
          <p className="text-xs text-slate-500">Période du 1er au 31 Octobre 2026</p>
        </div>
        <div className="p-6 bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Balance Âgée 0-30 jours</p>
          <p className="text-2xl font-bold text-amber-600">{formatFCFA(3450000)}</p>
          <p className="text-xs text-slate-500">6 factures en attente d&apos;échéance</p>
        </div>
        <div className="p-6 bg-white dark:bg-[#0e1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase">Créances en Retard (+30 j)</p>
          <p className="text-2xl font-bold text-rose-600">{formatFCFA(800000)}</p>
          <p className="text-xs text-slate-500">2 factures à relancer d&apos;urgence</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { Wallet, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export default function WalletPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Portefeuille & Trésorerie (Wallet)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solde disponible en direct sur vos comptes bancaires et passerelles Mobile Money (Wave, Orange Money).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Solde Wave Business
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Instantané
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatFCFA(8450000)}
          </p>
          <p className="text-[11px] text-slate-400">
            Dernier encaissement : il y a 23 min (+3 200 000 FCFA)
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Solde Orange Money
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              Pro
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatFCFA(4200000)}
          </p>
          <p className="text-[11px] text-slate-400">
            Compte marchand lié : +221 77 000 00 00
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Compte Bancaire CBAO / BICIS
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              OHADA
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatFCFA(15500000)}
          </p>
          <p className="text-[11px] text-slate-400">
            RIB : SN012 01234 56789012345 67
          </p>
        </div>
      </div>
    </div>
  );
}

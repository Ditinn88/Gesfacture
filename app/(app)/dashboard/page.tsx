"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { RecentInvoices } from "@/components/dashboard/recent-invoices";
import { DashboardDateFilter, DateRange } from "@/components/dashboard/dashboard-date-filter";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { LogIn, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [isSkeletonPreview, setIsSkeletonPreview] = useState<boolean>(false);
  const { user, openAuthModal } = useAuth();
  const { invoices, isLoading: isDataLoading, isCloudSynced } = useData();
  const isLoading = isDataLoading || isSkeletonPreview;

  const [dateRange, setDateRange] = useState<DateRange>({
    preset: "all",
    startDate: "",
    endDate: "",
  });

  const displayName = user
    ? user.user_metadata?.full_name?.split(" ")[0] || user.email?.split("@")[0] || "Dirigeant"
    : "Dirigeant";

  // Filter invoices strictly according to selected date range
  const filteredInvoices = useMemo(() => {
    if (dateRange.preset === "all" || (!dateRange.startDate && !dateRange.endDate)) {
      return invoices;
    }
    return invoices.filter((inv) => {
      if (!inv.issueDate) return true;
      const invDate = inv.issueDate;
      if (dateRange.startDate && invDate < dateRange.startDate) return false;
      if (dateRange.endDate && invDate > dateRange.endDate) return false;
      return true;
    });
  }, [invoices, dateRange]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Bonjour, {displayName}
            </h1>
            {/* Notion Date Range Filter right next to Greeting */}
            <DashboardDateFilter value={dateRange} onChange={setDateRange} />
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {user
              ? `Connecté avec ${user.email} • ${
                  isCloudSynced ? "Données synchronisées avec Supabase" : "Données enregistrées sur cet appareil"
                }`
              : "Espace local • Connectez-vous pour rattacher vos factures à votre compte"}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Login prompt if not signed in */}
          {!user && (
            <button
              type="button"
              onClick={() => openAuthModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg shadow-none transition-all duration-150 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Se connecter</span>
            </button>
          )}

          {/* Skeleton Loader Tester button */}
          <button
            onClick={() => setIsSkeletonPreview(!isSkeletonPreview)}
            className="text-[11px] font-medium text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 px-2 py-1.5 rounded border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800 transition-colors hidden md:inline-flex"
            title="Cliquez pour basculer entre le skeleton loader et les données réelles"
          >
            {isSkeletonPreview ? "Mode Données" : "Tester Skeletons"}
          </button>
        </div>
      </div>

      {/* Guest Notice Banner if not authenticated */}
      {!user && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3 shadow-none">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                Vous n&apos;êtes pas encore connecté
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Créez un compte ou connectez-vous avec votre adresse email pour sauvegarder vos propres factures dans Supabase.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openAuthModal()}
            className="px-3 py-1.5 text-xs font-medium text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            Connexion / Inscription
          </button>
        </div>
      )}

      {/* 4 Notion-Style Monochrome KPI Cards filtered dynamically */}
      <KpiCards isLoading={isLoading} invoices={filteredInvoices} />

      {/* Factures Récentes Table filtered dynamically */}
      <RecentInvoices isLoading={isLoading} invoices={filteredInvoices} />
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useData } from "@/lib/data-context";
import { formatCurrency, getCurrencySymbol, resolveInvoicesCurrency } from "@/lib/utils";
import { TrendingUp, Layers, CheckCircle } from "lucide-react";

const MONTH_NAMES = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
];

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme } = useTheme();
  const { invoices, clients, organization } = useData();

  const activeCurrency = useMemo(() => {
    return resolveInvoicesCurrency(invoices, organization?.currency || "XOF");
  }, [invoices, organization?.currency]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  // Dynamic monthly aggregation from real invoices
  const chartData = useMemo(() => {
    const now = new Date();
    const months: { month: string; year: number; monthIdx: number; facture: number; encaisse: number }[] = [];

    // Generate last 6 months buckets
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: MONTH_NAMES[d.getMonth()],
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        facture: 0,
        encaisse: 0,
      });
    }

    // Populate with real invoice amounts
    invoices.forEach((inv) => {
      if (!inv.issueDate) return;
      const invDate = new Date(inv.issueDate);
      if (isNaN(invDate.getTime())) return;

      const bucket = months.find(
        (m) => m.year === invDate.getFullYear() && m.monthIdx === invDate.getMonth()
      );

      if (bucket) {
        bucket.facture += inv.amount || 0;
        if (inv.status === "payee") {
          bucket.encaisse += inv.amount || 0;
        }
      }
    });

    return months.map(({ month, facture, encaisse }) => ({
      month,
      facture,
      encaisse,
    }));
  }, [invoices]);

  const totalInvoiced = useMemo(
    () => invoices.reduce((sum, i) => sum + (i.amount || 0), 0),
    [invoices]
  );

  const totalCollected = useMemo(
    () => invoices.filter((i) => i.status === "payee").reduce((sum, i) => sum + (i.amount || 0), 0),
    [invoices]
  );

  const topClients = useMemo(() => {
    if (!clients || clients.length === 0) return [];
    return [...clients]
      .sort((a, b) => (b.totalInvoiced || 0) - (a.totalInvoiced || 0))
      .slice(0, 4)
      .map((c) => ({
        ...c,
        percentage: totalInvoiced > 0 ? Math.round(((c.totalInvoiced || 0) / totalInvoiced) * 100) : 0,
      }));
  }, [clients, totalInvoiced]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-neutral-900 p-3.5 rounded-xl shadow-none border border-neutral-200 dark:border-neutral-800 text-xs">
          <p className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Mois de {label}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-900 dark:text-neutral-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white" />
                Facturé :
              </span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {formatCurrency(payload[0]?.value || 0, activeCurrency)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Encaissé :
              </span>
              <span className="font-bold text-neutral-900 dark:text-white">
                {formatCurrency(payload[1]?.value || 0, activeCurrency)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 2 Cols: Main Revenue Chart */}
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-none flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Chiffre d&apos;Affaires & Encaissements
              </h2>
              {totalInvoiced > 0 ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#137333] dark:text-emerald-300 bg-[#e6f4ea] dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-[#ceead6]/60">
                  <TrendingUp className="w-3 h-3" />
                  {formatCurrency(totalCollected, activeCurrency)} encaissé
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                  {formatCurrency(0, activeCurrency)} facturé
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
              Comparatif mensuel des montants facturés vs réels encaissés ({getCurrencySymbol(activeCurrency)})
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 dark:bg-white" />
              <span className="text-neutral-600 dark:text-neutral-400">Facturé</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-neutral-600 dark:text-neutral-400">Encaissé</span>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-[280px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorFacture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#ffffff" : "#171717"} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={isDark ? "#ffffff" : "#171717"} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorEncaisse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? "#262626" : "#f5f5f5"}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? "#737373" : "#a3a3a3" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: isDark ? "#737373" : "#a3a3a3" }}
                  tickFormatter={(val) => (val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : `${val}`)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="facture"
                  stroke={isDark ? "#ffffff" : "#171717"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFacture)"
                />
                <Area
                  type="monotone"
                  dataKey="encaisse"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEncaisse)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-neutral-400">
              Chargement des statistiques...
            </div>
          )}
        </div>
      </div>

      {/* 1 Col: Top Clients */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 sm:p-6 shadow-none flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Principaux Clients
              </h2>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                Top des contributeurs de trésorerie
              </p>
            </div>
            <span className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
              <Layers className="w-4 h-4" />
            </span>
          </div>

          {/* Client List with Progress */}
          {topClients.length > 0 ? (
            <div className="space-y-4 my-2">
              {topClients.map((client, index) => (
                <div key={client.id || index} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {client.name}
                    </span>
                    <span className="font-bold text-neutral-900 dark:text-white">
                      {formatCurrency(client.totalInvoiced || 0, activeCurrency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{client.city || "Sénégal"}</span>
                    <span>{client.percentage || 0}% du volume</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-neutral-900 dark:bg-white transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, client.percentage || 0))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-1.5">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Aucun client enregistré
              </p>
              <p className="text-[11px] text-neutral-400">
                Vos clients s&apos;afficheront ici dès qu&apos;ils seront créés.
              </p>
            </div>
          )}
        </div>

        {/* African Payments summary box */}
        <div className="mt-5 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Règlements Sécurisés
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
            Vos factures intègrent les paiements Wave, Orange Money et virement bancaire aux normes OHADA.
          </p>
        </div>
      </div>
    </div>
  );
}

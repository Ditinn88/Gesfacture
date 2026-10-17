"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ArrowUpRight,
  Trash2,
  Edit,
  Eye,
  X,
  Printer,
  Download,
  CheckCircle2,
  Send,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatFCFA, formatDate, cn } from "@/lib/utils";
import { StatusBadge, InvoiceStatusType } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { RowActionsDropdown, ActionItem } from "@/components/ui/row-actions-dropdown";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { printInvoice, downloadInvoicePdf } from "@/lib/print-invoice";

type StatusFilter = "tous" | "payee" | "envoyee" | "brouillon" | "en_retard";

const ITEMS_PER_PAGE = 20;

export default function InvoicesListPage() {
  const router = useRouter();
  const { invoices, deleteInvoice, updateInvoiceStatus, organization, isLoading } = useData();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalInvoice, setDeleteModalInvoice] = useState<{ id: string; number: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter calculations
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      // Status filter
      if (statusFilter !== "tous" && inv.status !== statusFilter) {
        return false;
      }
      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        inv.client.name.toLowerCase().includes(query) ||
        inv.client.email.toLowerCase().includes(query) ||
        inv.number.toLowerCase().includes(query) ||
        inv.amount.toString().includes(query) ||
        (inv.client.city && inv.client.city.toLowerCase().includes(query))
      );
    });
  }, [invoices, statusFilter, searchQuery]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE));
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredInvoices.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredInvoices, currentPage]);

  // Reset page when filter or search changes
  const handleFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Dynamic counts for status pills
  const counts = {
    tous: invoices.length,
    payee: invoices.filter((i) => i.status === "payee").length,
    envoyee: invoices.filter((i) => i.status === "envoyee").length,
    brouillon: invoices.filter((i) => i.status === "brouillon").length,
    en_retard: invoices.filter((i) => i.status === "en_retard").length,
  };

  // Financial aggregates
  const totalAmount = invoices.reduce((sum, i) => sum + i.amount, 0);
  const totalPaid = invoices.filter((i) => i.status === "payee").reduce((sum, i) => sum + i.amount, 0);
  const totalPending = invoices.filter((i) => i.status === "envoyee").reduce((sum, i) => sum + i.amount, 0);
  const totalOverdue = invoices.filter((i) => i.status === "en_retard").reduce((sum, i) => sum + i.amount, 0);

  const confirmDelete = () => {
    if (deleteModalInvoice) {
      deleteInvoice(deleteModalInvoice.id);
      setToastMessage(`Facture ${deleteModalInvoice.number} supprimée.`);
      setDeleteModalInvoice(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-60 bg-neutral-200/80 dark:bg-neutral-800" />
          <Skeleton className="h-10 w-36 rounded-xl bg-neutral-200/80 dark:bg-neutral-800" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-2xl bg-neutral-200/80 dark:bg-neutral-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold flex items-center justify-between shadow-none animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Header with Title & CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Factures & Émissions
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
            Générez, suivez et encaissez vos factures conformes aux règles fiscales OHADA.
          </p>
        </div>

        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Créer une facture</span>
        </Link>
      </div>

      {/* 4 Financial Stat Cards (Notion Flat Design) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Facturé */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
            Total Facturé ({counts.tous})
          </p>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            {formatFCFA(totalAmount)}
          </p>
          <p className="text-[10px] text-neutral-400">Toutes émissions confondues</p>
        </div>

        {/* Encaissé (Payé) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              Encaissé ({counts.payee})
            </p>
            <span className="w-2 h-2 rounded-full bg-[#137333]" />
          </div>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            {formatFCFA(totalPaid)}
          </p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Fonds reçus en trésorerie
          </p>
        </div>

        {/* En Attente (Envoyée) */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              En attente ({counts.envoyee})
            </p>
            <span className="w-2 h-2 rounded-full bg-[#b06000]" />
          </div>
          <p className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white font-mono">
            {formatFCFA(totalPending)}
          </p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Échéance non échue
          </p>
        </div>

        {/* En Retard */}
        <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
              En retard ({counts.en_retard})
            </p>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5221f] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c5221f]" />
            </span>
          </div>
          <p className="text-base sm:text-lg font-bold text-[#c5221f] dark:text-rose-400 font-mono">
            {formatFCFA(totalOverdue)}
          </p>
          <p className="text-[10px] text-[#c5221f] dark:text-rose-400 font-medium">
            Relance requise
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="p-4 sm:p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Filter Pills (Flat Notion Style) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "tous", label: "Toutes", count: counts.tous },
              { id: "payee", label: "Payées", count: counts.payee },
              { id: "envoyee", label: "Envoyées", count: counts.envoyee },
              { id: "brouillon", label: "Brouillons", count: counts.brouillon },
              { id: "en_retard", label: "En retard", count: counts.en_retard },
            ].map((tab) => {
              const isActive = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleFilterChange(tab.id as StatusFilter)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-none select-none",
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-semibold"
                      : "text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60"
                  )}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                      isActive
                        ? "bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900"
                        : "bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search by Client, Number, City or Amount */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Rechercher par client, n°..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:border-neutral-400 focus:outline-none text-neutral-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto rounded-xl border border-neutral-200/90 dark:border-neutral-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-neutral-200/90 dark:border-neutral-800 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 bg-[#fafaf9] dark:bg-neutral-900/50">
                <th className="py-3 pl-4 pr-3">Client</th>
                <th className="py-3 px-3">Numéro</th>
                <th className="py-3 px-3">Date d&apos;émission</th>
                <th className="py-3 px-3">Échéance</th>
                <th className="py-3 px-3 text-center">Statut</th>
                <th className="py-3 px-3 text-right">Montant TTC</th>
                <th className="py-3 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80">
              {paginatedInvoices.length > 0 ? (
                paginatedInvoices.map((inv) => {
                  // Safe Row Action items for the 3 dots dropdown
                  const rowActions: ActionItem[] = [
                    {
                      label: "Voir le détail",
                      icon: <Eye className="w-3.5 h-3.5" />,
                      onClick: () => router.push(`/invoices/${inv.id}`),
                    },
                    {
                      label: "Modifier la facture",
                      icon: <Edit className="w-3.5 h-3.5" />,
                      onClick: () => router.push(`/invoices/new?edit=${inv.id}`),
                    },
                    ...(inv.status !== "payee"
                      ? [
                          {
                            label: "Marquer comme Payée",
                            icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
                            onClick: () => {
                              updateInvoiceStatus(inv.id, "payee");
                              setToastMessage(`Facture ${inv.number} marquée comme PAYÉE.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            },
                          },
                        ]
                      : []),
                    ...(inv.status !== "envoyee"
                      ? [
                          {
                            label: "Marquer comme Envoyée",
                            icon: <Send className="w-3.5 h-3.5 text-amber-600" />,
                            onClick: () => {
                              updateInvoiceStatus(inv.id, "envoyee");
                              setToastMessage(`Facture ${inv.number} marquée comme ENVOYÉE.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            },
                          },
                        ]
                      : []),
                    ...(inv.status !== "brouillon"
                      ? [
                          {
                            label: "Passer en Brouillon",
                            icon: <FileText className="w-3.5 h-3.5 text-neutral-500" />,
                            onClick: () => {
                              updateInvoiceStatus(inv.id, "brouillon");
                              setToastMessage(`Facture ${inv.number} passée en BROUILLON.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            },
                          },
                        ]
                      : []),
                    ...(inv.status !== "en_retard"
                      ? [
                          {
                            label: "Marquer En Retard",
                            icon: <AlertTriangle className="w-3.5 h-3.5 text-[#c5221f]" />,
                            onClick: () => {
                              updateInvoiceStatus(inv.id, "en_retard");
                              setToastMessage(`Facture ${inv.number} marquée EN RETARD.`);
                              setTimeout(() => setToastMessage(null), 3000);
                            },
                          },
                        ]
                      : []),
                    {
                      label: "Télécharger en PDF",
                      icon: <Download className="w-3.5 h-3.5" />,
                      onClick: async () => {
                        setToastMessage(`Téléchargement de la facture ${inv.number} en PDF...`);
                        await downloadInvoicePdf(inv, organization);
                        setToastMessage(`Facture ${inv.number} téléchargée au format PDF avec succès.`);
                        setTimeout(() => setToastMessage(null), 3000);
                      },
                    },
                    {
                      label: "Imprimer",
                      icon: <Printer className="w-3.5 h-3.5" />,
                      onClick: () => {
                        printInvoice(inv, organization);
                      },
                    },
                    {
                      label: "Supprimer la facture",
                      icon: <Trash2 className="w-3.5 h-3.5" />,
                      destructive: true,
                      onClick: () => {
                        setDeleteModalInvoice({ id: inv.id, number: inv.number });
                      },
                    },
                  ];

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="group cursor-pointer hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-colors"
                    >
                      {/* Client Name + Email */}
                      <td className="py-3.5 pl-4 pr-3 whitespace-nowrap">
                        <div>
                          <p className="font-semibold text-neutral-900 dark:text-white text-xs group-hover:text-neutral-900">
                            {inv.client.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {inv.client.email}
                          </p>
                        </div>
                      </td>

                      {/* Invoice Number */}
                      <td className="py-3.5 px-3 whitespace-nowrap font-mono text-neutral-600 dark:text-neutral-400 text-xs">
                        {inv.number}
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400 text-xs">
                        {formatDate(inv.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-neutral-500 dark:text-neutral-400 text-xs">
                        {formatDate(inv.dueDate)}
                      </td>

                      {/* Status Pill Badge */}
                      <td className="py-3.5 px-3 whitespace-nowrap text-center">
                        <StatusBadge status={inv.status as InvoiceStatusType} size="sm" />
                      </td>

                      {/* Amount FCFA */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap font-bold text-neutral-900 dark:text-white font-mono text-xs">
                        {formatFCFA(inv.amount)}
                      </td>

                      {/* Crash-Proof Three Dots Menu Options Dropdown */}
                      <td className="py-3.5 pr-4 pl-3 text-right whitespace-nowrap">
                        <RowActionsDropdown actions={rowActions} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-3">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-xs">
                        Aucune facture ne correspond à ces critères
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {searchQuery
                          ? `Aucun résultat pour « ${searchQuery} »`
                          : `Aucune facture dans la catégorie sélectionnée.`}
                      </p>
                      <button
                        onClick={() => {
                          setStatusFilter("tous");
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline"
                      >
                        Réinitialiser les filtres
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Au moins une vingtaine d'éléments par page) */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInvoices.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={(p) => setCurrentPage(p)}
          itemLabel="factures"
        />
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteModalInvoice)}
        onClose={() => setDeleteModalInvoice(null)}
        onConfirm={confirmDelete}
        title="Supprimer la facture ?"
        description={
          deleteModalInvoice ? (
            <span>
              Êtes-vous certain de vouloir supprimer définitivement la facture{" "}
              <strong className="font-bold text-neutral-900 dark:text-white">
                {deleteModalInvoice.number}
              </strong>{" "}
              ? Cette action est irréversible.
            </span>
          ) : null
        }
        confirmText="Confirmer la suppression"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}

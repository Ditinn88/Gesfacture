"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Send,
  CheckCircle2,
  Printer,
  Edit,
  Trash2,
  ChevronDown,
  Mail,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Share2,
  Check,
} from "lucide-react";
import {
  formatFCFA,
  formatDate,
  cn,
  getCurrencyLabel,
  getCurrencySymbol,
  joinParts,
  organizationHeaderLines,
} from "@/lib/utils";
import { StatusBadge, InvoiceStatusType } from "@/components/ui/status-badge";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { printInvoice, downloadInvoicePdf } from "@/lib/print-invoice";

export default function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { invoices, updateInvoiceStatus, deleteInvoice, organization, isLoading } = useData();
  const { user } = useAuth();

  // Find invoice from data context
  const invoice = invoices.find((i) => i.id === params.id);

  const signatureName = user?.user_metadata?.full_name || organization.legalName || "Direction";
  const signatureRole = "Direction Générale";

  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    setIsDownloadingPdf(true);
    setToastMessage("Génération du fichier PDF en cours...");
    try {
      await downloadInvoicePdf(invoice, organization);
      setToastMessage(`Facture ${invoice.number} téléchargée au format PDF avec succès.`);
    } catch (e) {
      console.error("PDF download error:", e);
      setToastMessage("Erreur lors de la génération du PDF. Ouverture de l'impression...");
      printInvoice(invoice, organization);
    } finally {
      setIsDownloadingPdf(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  if (isLoading && !invoice) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[480px] rounded-2xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Facture introuvable
        </h2>
        <p className="text-xs text-neutral-400">
          La facture demandée a peut-être été supprimée ou n&apos;existe plus.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
        >
          Retourner aux factures
        </Link>
      </div>
    );
  }

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: "item-default",
      description: "Prestation technologique & accompagnement numérique",
      quantity: 1,
      unitPrice: invoice.subtotal || Math.round(invoice.amount / 1.18),
      total: invoice.subtotal || Math.round(invoice.amount / 1.18),
    },
  ];

  const subtotal = invoice.subtotal || Math.round(invoice.amount / 1.18);
  const taxAmount = invoice.taxAmount || (invoice.amount - subtotal);
  const currency = invoice.currency || organization.currency;

  const statusLabels = { brouillon: "Brouillon", envoyee: "Envoyée", payee: "Payée", en_retard: "En retard" };

  const handleStatusChange = (newStatus: "brouillon" | "envoyee" | "payee" | "en_retard") => {
    updateInvoiceStatus(invoice.id, newStatus);
    setStatusMenuOpen(false);
    setToastMessage(`Statut de la facture mis à jour : ${statusLabels[newStatus]}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDelete = () => {
    deleteInvoice(invoice.id);
    router.push("/invoices");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
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

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80 no-print">
        <div className="flex items-center gap-3">
          <Link
            href="/invoices"
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 shadow-none transition-all"
            title="Retour à la liste"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono">
                {invoice.number}
              </h1>
              <StatusBadge status={invoice.status as InvoiceStatusType} />
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Émise le {formatDate(invoice.issueDate)} · Échéance au {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Changer Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setStatusMenuOpen(!statusMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:py-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-none transition-all active:scale-95"
            >
              <span>Changer le statut</span>
              <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", statusMenuOpen && "transform rotate-180")} />
            </button>

            {statusMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-30 p-2 animate-in fade-in zoom-in-95 duration-150">
                <p className="px-2.5 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Modifier le statut
                </p>

                <div className="space-y-1 mt-1">
                  {[
                    {
                      id: "payee",
                      label: "Payée",
                      badgeClass: "bg-[#e6f4ea] text-[#137333] border-[#ceead6]/60",
                      desc: "Règlement intégralement perçu",
                    },
                    {
                      id: "envoyee",
                      label: "Envoyée",
                      badgeClass: "bg-[#fef7e0] text-[#b06000] border-[#fce8b2]/60",
                      desc: "Transmise au client, en attente",
                    },
                    {
                      id: "en_retard",
                      label: "En retard",
                      badgeClass: "bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]/60",
                      desc: "Date d'échéance dépassée",
                    },
                    {
                      id: "brouillon",
                      label: "Brouillon",
                      badgeClass: "bg-[#f1f3f4] text-[#5f6368] border-[#e0e0e0]/70",
                      desc: "Facture en cours de rédaction",
                    },
                  ].map((st) => {
                    const isCurrent = invoice.status === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => handleStatusChange(st.id as any)}
                        className={cn(
                          "w-full px-3 py-2 text-left rounded-xl flex items-center justify-between gap-2.5 transition-all",
                          isCurrent
                            ? "bg-neutral-100 dark:bg-neutral-800 font-semibold"
                            : "hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/60"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                st.badgeClass
                              )}
                            >
                              {st.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                            {st.desc}
                          </p>
                        </div>

                        {isCurrent && (
                          <Check className="w-3.5 h-3.5 text-neutral-900 dark:text-white stroke-[2.5] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <Link
            href={`/invoices/new?edit=${invoice.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all"
          >
            <Edit className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Modifier</span>
          </Link>

          {/* Direct PDF Download to Computer/Desktop */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all duration-150 active:scale-95 cursor-pointer disabled:opacity-50"
            title="Enregistrer la facture directement au format PDF sur votre bureau"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>{isDownloadingPdf ? "Téléchargement..." : "Télécharger PDF"}</span>
          </button>

          {/* Physical Print Button */}
          <button
            type="button"
            onClick={() => printInvoice(invoice, organization)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all"
            title="Ouvrir la boîte d'impression papier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Imprimer</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-[#c5221f] dark:text-rose-400 bg-white dark:bg-neutral-800 hover:bg-[#c5221f] hover:text-white border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all"
            title="Supprimer la facture"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline ml-1.5">Supprimer</span>
          </button>
        </div>
      </div>

      {/* Main Official Invoice Sheet (Notion Pure Flat Design) */}
      <div id="printable-invoice" className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 sm:p-10 shadow-none space-y-8">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-6 pb-6 border-b border-neutral-100 dark:border-neutral-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center font-serif font-bold text-sm shadow-none">
                {organization.name.slice(0, 1) || "G"}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white leading-tight">
                  {organization.name}
                </h2>
                <p className="text-xs text-neutral-500 font-medium">
                  {organization.legalName}
                </p>
              </div>
            </div>
            {organizationHeaderLines(organization).map((line, i) => (
              <p key={i} className={cn("text-xs", i === 0 ? "text-neutral-500 mt-1" : "text-neutral-400")}>
                {line}
              </p>
            ))}
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
              FACTURE
            </span>
            <p className="text-sm font-mono font-bold text-neutral-700 dark:text-neutral-300">
              {invoice.number}
            </p>
            <p className="text-xs text-neutral-400">Devise : {getCurrencyLabel(currency)}</p>
          </div>
        </div>

        {/* Client & Date Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed">
          <div>
            <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px] block mb-1">
              Facturé à :
            </span>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              {invoice.client.name}
            </h3>
            <p className="text-neutral-500 mt-0.5">{invoice.client.email}</p>
            <p className="text-neutral-500">
              {joinParts([invoice.client.address, invoice.client.city, invoice.client.country], ", ")}
            </p>
            {invoice.client.phone && (
              <p className="text-neutral-400 font-mono mt-0.5">{invoice.client.phone}</p>
            )}
          </div>

          <div className="sm:text-right space-y-1.5">
            <p>
              <span className="text-neutral-400">Date d&apos;émission : </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatDate(invoice.issueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-400">Date d&apos;échéance : </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {formatDate(invoice.dueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-400">Moyen de règlement : </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {invoice.paymentMethod || "Wave Business / Virement Bancaire"}
              </span>
            </p>
            <p>
              <span className="text-neutral-400">Statut comptable : </span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {statusLabels[invoice.status]}
              </span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-neutral-200/90 dark:border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] dark:bg-neutral-900/50 text-neutral-400 uppercase text-[10px] font-semibold border-b border-neutral-200/80 dark:border-neutral-800">
              <tr>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-3 text-center">Qté</th>
                <th className="py-3 px-3 text-right">Prix Unitaire HT</th>
                <th className="py-3 px-4 text-right">Total HT ({getCurrencySymbol(currency)})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-3.5 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                    {item.description}
                  </td>
                  <td className="py-3.5 px-3 text-center text-neutral-500 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-3 text-right text-neutral-500 font-mono">
                    {formatFCFA(item.unitPrice, currency)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-neutral-900 dark:text-white font-mono">
                    {formatFCFA(item.total, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Breakdown - Dedicated isolated card with generous spacing */}
        <div className="flex justify-end">
          <div className="w-full sm:w-80 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2 text-xs">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Sous-total Brut HT :</span>
              <span className="font-mono font-medium">{formatFCFA(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>TVA ({invoice.taxRate ?? 18}%) :</span>
              <span className="font-mono font-medium">{formatFCFA(taxAmount, currency)}</span>
            </div>
            <div className="pt-2.5 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-baseline font-bold text-neutral-900 dark:text-white">
              <span className="text-xs uppercase tracking-wide">Total TTC Net :</span>
              <span className="font-extrabold font-mono text-base sm:text-lg text-neutral-900 dark:text-white">
                {formatFCFA(invoice.amount, currency)}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
              <span>Montant Déjà Réglé :</span>
              <span className="font-mono">{formatFCFA(invoice.paidAmount, currency)}</span>
            </div>
          </div>
        </div>

        {/* Notes & Legal (Isolated block with clear top border) */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-[11px] text-neutral-400">
          <p className="font-semibold text-neutral-600 dark:text-neutral-300">
            Conditions de paiement :
          </p>
          <p className="italic leading-relaxed">
            {invoice.notes || "Facture payable à réception. En cas de retard de paiement, des intérêts de retard au taux légal OHADA seront appliqués."}
          </p>
        </div>

        {/* Signature & Payment Verification */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
              Paiement Sécurisé Mobile Money & Virement
            </span>
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {invoice.paymentMethod === "Wave" && organization.waveNumber
                ? `Paiement Wave : ${organization.waveNumber}`
                : invoice.paymentMethod === "Orange Money" && organization.omNumber
                ? `Paiement Orange Money : ${organization.omNumber}`
                : invoice.paymentMethod === "Virement Bancaire" && (organization.iban || organization.bankName)
                ? `${organization.bankName ? organization.bankName + " · " : ""}IBAN : ${organization.iban || ""}`
                : organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : (invoice.paymentMethod || "Règlement direct")}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono">
              {joinParts([organization.legalName, joinParts([organization.city, organization.country], ", ")])}
            </p>
          </div>

          <div className="sm:text-right space-y-1">
            <div className="font-serif italic text-base text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-neutral-700 pb-0.5 px-3">
              {signatureName}
            </div>
            <p className="text-[10px] text-neutral-400">{signatureRole}</p>
          </div>
        </div>
      </div>

      {/* Reusable Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Supprimer cette facture ?"
        description={
          <span>
            Êtes-vous certain de vouloir supprimer définitivement la facture{" "}
            <strong className="font-bold text-neutral-900 dark:text-white">{invoice.number}</strong>{" "}
            ? Cette action est irréversible.
          </span>
        }
        confirmText="Confirmer la suppression"
        cancelText="Annuler"
        variant="danger"
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Mail, Download, Send, CheckCircle2, Check, Printer } from "lucide-react";
import { Invoice } from "@/lib/mock-data";
import { formatCurrency, formatDate, joinParts } from "@/lib/utils";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { printInvoice } from "@/lib/print-invoice";

interface InvoicePreviewCardProps {
  invoice: Invoice;
  onSend?: () => void;
  onDownloadPdf?: () => void;
}

export function InvoicePreviewCard({
  invoice,
  onSend,
  onDownloadPdf,
}: InvoicePreviewCardProps) {
  const { organization } = useData();
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const invoiceCurrency = invoice.currency || organization?.currency || "XOF";

  const signatureName = user?.user_metadata?.full_name || organization.legalName || "Direction";
  const signatureRole = "Direction Générale";

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      if (onSend) onSend();
      setTimeout(() => setIsSent(false), 2500);
    }, 600);
  };

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : [
    {
      id: "item-default",
      description: "Prestation de services & développement",
      quantity: 1,
      unitPrice: Math.round(invoice.amount / 1.18),
      total: Math.round(invoice.amount / 1.18),
    },
  ];

  const subtotal = invoice.subtotal || Math.round(invoice.amount / 1.18);
  const taxAmount = invoice.taxAmount || (invoice.amount - subtotal);

  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Top Header Controls in Notion Light / Flat Style */}
      <div className="flex items-center justify-between gap-2 pb-1">
        <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
          Aperçu
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Email Button - Notion Light Style */}
          <button
            type="button"
            onClick={() => alert(`Email envoyé pour la facture ${invoice.number}`)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Email</span>
          </button>

          {/* PDF Button - Notion Light Style */}
          <button
            type="button"
            onClick={onDownloadPdf || (() => printInvoice(invoice, organization))}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Primary Flat CTA: Send Invoice */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-lg shadow-none transition-colors"
          >
            {isSent ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Envoyée !</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{isSending ? "Envoi..." : "Envoyer"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Document Sheet - Flat Design Pure Notion */}
      <div className="p-6 sm:p-7 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none space-y-5 text-xs text-neutral-600 dark:text-neutral-300">
        {/* Document Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              FACTURE
            </h2>
            <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 mt-0.5">
              N° <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{invoice.number}</span>
            </p>
          </div>

          {/* Monogram squircle logo */}
          <div className="w-9 h-9 rounded-xl bg-neutral-900 dark:bg-white flex items-center justify-center text-white dark:text-neutral-900 font-serif font-bold text-sm shadow-none">
            G
          </div>
        </div>

        {/* Billed By & Billed To */}
        <div className="grid grid-cols-2 gap-4 pt-1 text-[11px] leading-relaxed">
          <div>
            <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-0.5">
              Émetteur :
            </span>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {organization.legalName}
            </p>
            <p className="text-neutral-400">{organization.email}</p>
            <p className="text-neutral-400">{joinParts([organization.address, organization.city], ", ")}</p>
            <p className="text-neutral-400 text-[10px]">
              {joinParts([organization.taxId, organization.rccm && `RCCM ${organization.rccm}`])}
            </p>
          </div>

          <div>
            <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-0.5">
              Destinataire :
            </span>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              {invoice.client.name}
            </p>
            <p className="text-neutral-400">{invoice.client.email}</p>
            <p className="text-neutral-400">
              {invoice.client.address ? `${invoice.client.address}, ` : ""}
              {invoice.client.city}, {invoice.client.country}
            </p>
            {invoice.client.phone && (
              <p className="text-neutral-400 text-[10px]">{invoice.client.phone}</p>
            )}
          </div>
        </div>

        {/* Date Issued & Due Date */}
        <div className="grid grid-cols-2 gap-4 py-2 border-y border-neutral-100 dark:border-neutral-800 text-[11px]">
          <div>
            <span className="text-neutral-400">Date d&apos;émission :</span>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatDate(invoice.issueDate)}
            </p>
          </div>
          <div>
            <span className="text-neutral-400">Date d&apos;échéance :</span>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Items Table in Flat Style */}
        <div>
          <div className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider mb-2">
            Prestations & Services :
          </div>
          <table className="w-full text-left text-[11px]">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 text-[10px]">
                <th className="pb-1.5 font-medium">Description</th>
                <th className="pb-1.5 text-center font-medium">Qté</th>
                <th className="pb-1.5 text-right font-medium">P.U HT</th>
                <th className="pb-1.5 text-right font-medium">Total HT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-medium">
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2 text-neutral-800 dark:text-neutral-200">
                    {item.description || "Ligne de prestation"}
                  </td>
                  <td className="py-2 text-center text-neutral-500">{item.quantity}</td>
                  <td className="py-2 text-right text-neutral-500 font-mono">
                    {formatCurrency(item.unitPrice, invoiceCurrency)}
                  </td>
                  <td className="py-2 text-right font-semibold text-neutral-900 dark:text-white font-mono">
                    {formatCurrency(item.total || item.quantity * item.unitPrice, invoiceCurrency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal, Tax & Grand Total - Dedicated isolated card with generous spacing */}
        <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 space-y-2 text-xs">
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>Sous-total HT :</span>
            <span className="font-mono font-medium">{formatCurrency(subtotal, invoiceCurrency)}</span>
          </div>
          <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
            <span>TVA ({invoice.taxRate ?? 18}%) :</span>
            <span className="font-mono font-medium">{formatCurrency(taxAmount, invoiceCurrency)}</span>
          </div>
          <div className="pt-2.5 border-t border-neutral-200 dark:border-neutral-700 flex justify-between items-baseline font-bold text-neutral-900 dark:text-white">
            <span className="text-xs uppercase tracking-wide">Total TTC Net :</span>
            <span className="text-base font-extrabold font-mono text-neutral-900 dark:text-white">
              {formatCurrency(invoice.amount, invoiceCurrency)}
            </span>
          </div>
        </div>

        {/* Fine print with clear separation */}
        <div className="pt-2 text-[10px] text-neutral-400 italic leading-relaxed border-t border-neutral-100 dark:border-neutral-800">
          Conformément aux règles OHADA, tout retard entraîne des intérêts légaux calculés au jour le jour.
        </div>

        {/* Payment Method & Signature Row */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
              Moyen de Règlement
            </p>
            <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-[11px] mt-0.5">
              {invoice.paymentMethod || "Wave Business / Virement Bancaire"}
            </p>
            <p className="text-[10px] text-neutral-400 font-mono">
              {invoice.paymentMethod === "Wave" && organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : invoice.paymentMethod === "Orange Money" && organization.omNumber
                ? `OM : ${organization.omNumber}`
                : invoice.paymentMethod === "Virement Bancaire" && (organization.iban || organization.bankName)
                ? `${organization.bankName ? organization.bankName + " · " : ""}IBAN : ${organization.iban || ""}`
                : organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : "Règlement direct"}
            </p>
          </div>

          {/* Signature */}
          <div className="text-right">
            <div className="font-serif italic text-base text-neutral-900 dark:text-white border-b border-neutral-300 dark:border-neutral-700 pb-0.5 px-2">
              {signatureName}
            </div>
            <p className="text-[10px] text-neutral-400 mt-0.5">{signatureRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

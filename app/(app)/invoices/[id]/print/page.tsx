"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useData } from "@/lib/data-context";
import { formatFCFA, formatDate } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function InvoicePrintPage({
  params,
}: {
  params: { id: string };
}) {
  const { invoices, organization } = useData();
  const { user } = useAuth();
  const invoice = invoices.find((i) => i.id === params.id) || invoices[0];
  const signatureName = user?.user_metadata?.full_name || organization.legalName || "Direction";
  const signatureRole = "Direction Générale";

  useEffect(() => {
    // Automatically trigger print dialog when page loads
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!invoice) {
    return (
      <div className="p-8 text-center text-xs text-neutral-500">
        Facture introuvable.
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
  const taxRate = invoice.taxRate !== undefined ? invoice.taxRate : 18;
  const taxAmount = invoice.taxAmount !== undefined ? invoice.taxAmount : (invoice.amount - subtotal);
  const totalAmount = invoice.amount;

  const statusLabel =
    invoice.status === "payee"
      ? "PAYÉE"
      : invoice.status === "en_retard"
      ? "EN RETARD"
      : invoice.status === "brouillon"
      ? "BROUILLON"
      : "ENVOYÉE";

  return (
    <div className="bg-white min-h-screen text-neutral-900 font-sans p-6 sm:p-12 print:p-0 print:m-0 print:min-h-0 max-w-4xl mx-auto">
      {/* Top Controls (Hidden during print) */}
      <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-neutral-200">
        <Link
          href={`/invoices/${invoice.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 border border-neutral-200 rounded-xl"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retour à la facture</span>
        </Link>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl"
        >
          <Printer className="w-4 h-4" />
          <span>Lancer l&apos;impression</span>
        </button>
      </div>

      {/* Official Invoice Sheet */}
      <div id="printable-invoice" className="space-y-6 sm:space-y-8 print:space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start pb-4 sm:pb-6 print:pb-3 border-b border-neutral-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-serif font-bold text-base">
                {organization.name.slice(0, 1) || "G"}
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900">
                  {organization.name}
                </h1>
                <p className="text-xs text-neutral-500 font-medium">
                  {organization.legalName}
                </p>
              </div>
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              {organization.address}, {organization.city} · {organization.country}
            </p>
            <p className="text-xs text-neutral-500 font-mono">
              {organization.taxId} · RCCM {organization.rccm}
            </p>
            <p className="text-xs text-neutral-500">
              Tél : {organization.phone} · Email : {organization.email}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-2xl font-black tracking-tight text-neutral-900">
              FACTURE
            </span>
            <p className="text-sm font-mono font-bold text-neutral-800">
              {invoice.number}
            </p>
            <p className="text-xs text-neutral-500">Devise : {invoice.currency || organization.currency || "XOF"}</p>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mt-1 border-neutral-300 text-neutral-700">
              {statusLabel}
            </div>
          </div>
        </div>

        {/* Client & Dates */}
        <div className="grid grid-cols-2 gap-8 text-xs leading-relaxed py-2 print:py-1">
          <div>
            <span className="font-semibold text-neutral-400 uppercase text-[10px] tracking-wider block mb-1">
              Facturé à :
            </span>
            <h3 className="text-sm font-bold text-neutral-900">
              {invoice.client.name}
            </h3>
            <p className="text-neutral-600 mt-0.5">{invoice.client.email}</p>
            {invoice.client.address && (
              <p className="text-neutral-600">
                {invoice.client.address}, {invoice.client.city}, {invoice.client.country}
              </p>
            )}
            {invoice.client.phone && (
              <p className="text-neutral-500 font-mono mt-0.5">{invoice.client.phone}</p>
            )}
          </div>

          <div className="text-right space-y-1">
            <p>
              <span className="text-neutral-500">Date d&apos;émission : </span>
              <span className="font-semibold text-neutral-900">
                {formatDate(invoice.issueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">Date d&apos;échéance : </span>
              <span className="font-semibold text-neutral-900">
                {formatDate(invoice.dueDate)}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">Moyen de règlement : </span>
              <span className="font-semibold text-neutral-900">
                {invoice.paymentMethod || "Wave"}
              </span>
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-neutral-200 rounded-xl overflow-hidden mt-3 print:mt-2">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] text-neutral-500 uppercase text-[10px] font-semibold border-b border-neutral-200">
              <tr>
                <th className="py-2 px-3 print:py-1.5 print:px-2">Description</th>
                <th className="py-2 px-2 print:py-1.5 print:px-1 text-center">Qté</th>
                <th className="py-2 px-3 print:py-1.5 print:px-2 text-right">Prix Unitaire HT</th>
                <th className="py-2 px-3 print:py-1.5 print:px-2 text-right">Total HT ({invoice?.currency || organization.currency || "XOF"})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 font-medium text-neutral-900">
                    {item.description}
                  </td>
                  <td className="py-2.5 px-2 print:py-1.5 print:px-1 text-center text-neutral-600 font-mono">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-right text-neutral-600 font-mono">
                    {formatFCFA(item.unitPrice, invoice?.currency || organization.currency)}
                  </td>
                  <td className="py-2.5 px-3 print:py-1.5 print:px-2 text-right font-bold text-neutral-900 font-mono">
                    {formatFCFA(item.total, invoice?.currency || organization.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end pt-3 print:pt-2">
          <div className="w-72 p-3 sm:p-4 print:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-1.5 print:space-y-1 text-xs">
            <div className="flex justify-between text-neutral-600">
              <span>Sous-total Brut HT :</span>
              <span className="font-mono font-medium">{formatFCFA(subtotal, invoice?.currency || organization.currency)}</span>
            </div>
            <div className="flex justify-between text-neutral-600">
              <span>TVA ({taxRate}%) :</span>
              <span className="font-mono font-medium">{formatFCFA(taxAmount, invoice?.currency || organization.currency)}</span>
            </div>
            <div className="pt-2 border-t border-neutral-300 flex justify-between items-baseline font-bold text-neutral-900">
              <span className="text-xs uppercase tracking-wide">Total TTC Net :</span>
              <span className="font-extrabold font-mono text-base text-neutral-900">
                {formatFCFA(totalAmount, invoice?.currency || organization.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Legal Mentions */}
        <div className="pt-3 print:pt-2 border-t border-neutral-200 space-y-1 text-[11px] print:text-[10px] text-neutral-500">
          <p className="font-semibold text-neutral-800">Conditions de règlement :</p>
          <p className="italic leading-relaxed">
            {invoice.notes || "Paiement attendu sous 15 jours. Tout retard donnera lieu à application des pénalités selon les normes OHADA."}
          </p>
        </div>

        {/* Footer Signature */}
        <div className="pt-4 sm:pt-6 print:pt-3 border-t border-neutral-200 flex justify-between items-end gap-4">
          <div className="space-y-1 text-xs">
            <span className="text-[10px] font-semibold uppercase text-neutral-400 tracking-wider">
              Coordonnées de Règlement
            </span>
            <p className="font-semibold text-neutral-900">
              {invoice.paymentMethod === "Wave" && organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : invoice.paymentMethod === "Orange Money" && organization.omNumber
                ? `Orange Money : ${organization.omNumber}`
                : invoice.paymentMethod === "Virement Bancaire" && (organization.iban || organization.bankName)
                ? `${organization.bankName ? organization.bankName + " · " : ""}IBAN : ${organization.iban || ""}`
                : organization.waveNumber
                ? `Wave : ${organization.waveNumber}`
                : "Règlement à réception"}
            </p>
            <p className="text-[11px] text-neutral-500 font-mono">
              {organization.legalName} · {organization.city}, {organization.country}
            </p>
          </div>

          <div className="text-right space-y-1">
            <div className="font-serif italic text-base text-neutral-900 border-b border-neutral-300 pb-0.5 px-3">
              {signatureName}
            </div>
            <p className="text-[10px] text-neutral-500">{signatureRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

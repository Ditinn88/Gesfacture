"use client";

import React, { useEffect, useState } from "react";
import { Wallet, X } from "lucide-react";
import { Invoice } from "@/lib/mock-data";
import { cn, formatCurrency, paidAmountOf, remainingAmountOf } from "@/lib/utils";

interface RecordPaymentModalProps {
  // Facture sur laquelle on enregistre un paiement (null = fenêtre fermée)
  invoice: Invoice | null;
  onClose: () => void;
  // Montant reçu, toujours > 0 et au plus égal au reste à payer
  onConfirm: (amount: number) => void;
}

export function RecordPaymentModal({ invoice, onClose, onConfirm }: RecordPaymentModalProps) {
  const [value, setValue] = useState("");

  const remaining = invoice ? remainingAmountOf(invoice) : 0;

  // Montant proposé par défaut : le reste à payer (réinitialisé à chaque ouverture, pas à chaque
  // nouvel objet facture renvoyé par le contexte, pour ne pas effacer la saisie en cours)
  const invoiceId = invoice?.id;
  useEffect(() => {
    if (invoice) setValue(String(remainingAmountOf(invoice)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (invoice) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [invoice, onClose]);

  if (!invoice) return null;

  // Accepte « 5 000 000 » ou « 1500,50 »
  const amount = Number(value.replace(/[\s  ]/g, "").replace(",", "."));
  const error =
    value.trim() === "" || isNaN(amount)
      ? "Saisissez le montant reçu."
      : amount <= 0
      ? "Le montant doit être supérieur à 0."
      : amount > remaining
      ? `Le montant dépasse le reste à payer (${formatCurrency(remaining, invoice.currency)}).`
      : null;
  const after = error ? remaining : remaining - amount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!error) onConfirm(amount);
  };

  const rows = [
    { label: "Total de la facture", value: formatCurrency(invoice.amount, invoice.currency) },
    { label: "Déjà payé", value: formatCurrency(paidAmountOf(invoice), invoice.currency) },
    { label: "Reste à payer", value: formatCurrency(remaining, invoice.currency), strong: true },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150 no-print"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        className="relative bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight">
              Enregistrer un paiement
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Facture <span className="font-mono font-semibold">{invoice.number}</span> · {invoice.client.name}.
              Un paiement partiel reste sur la même facture.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-[#fafaf9] dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 p-3 space-y-1.5 text-xs">
          {rows.map((r) => (
            <div key={r.label} className="flex justify-between gap-3">
              <span className="text-neutral-500 dark:text-neutral-400">{r.label}</span>
              <span
                className={cn(
                  "font-mono text-right",
                  r.strong ? "font-bold text-neutral-900 dark:text-white" : "text-neutral-700 dark:text-neutral-300"
                )}
              >
                {r.value}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="payment-amount" className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
            Montant reçu
          </label>
          <div className="flex items-center gap-2">
            <input
              id="payment-amount"
              type="text"
              inputMode="decimal"
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono text-right text-neutral-900 dark:text-white bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-700 dark:focus:ring-neutral-300"
            />
            <button
              type="button"
              onClick={() => setValue(String(remaining))}
              className="shrink-0 px-2.5 py-2 text-[11px] font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all"
            >
              Tout
            </button>
          </div>
          <p className={cn("text-[11px]", error ? "text-[#c5221f] dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500")}>
            {error ||
              (after > 0
                ? `Restera à payer : ${formatCurrency(after, invoice.currency)}`
                : "La facture sera entièrement réglée et passera en « Payée ».")}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-none transition-all active:scale-95"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!!error}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enregistrer le paiement
          </button>
        </div>
      </form>
    </div>
  );
}

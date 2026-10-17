"use client";

import React from "react";
import { HelpCircle, MessageSquare, Mail, Phone } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-200">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Aide & Assistance Client
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 dark:text-neutral-500 mt-1">
          Une équipe dédiée pour vous accompagner dans la configuration de vos factures et passerelles Mobile Money.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Chat Direct WhatsApp</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Assistance instantanée avec un conseiller de 8h à 20h GMT.
          </p>
          <button className="text-xs font-medium text-neutral-900 dark:text-white hover:underline pt-1 inline-flex items-center gap-1">
            Démarrer une conversation →
          </button>
        </div>

        <div className="p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Support Email Dédié</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Écrivez-nous à support@gesfacture.com pour toute question technique ou fiscale.
          </p>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 pt-1 block">
            support@gesfacture.com
          </span>
        </div>
      </div>
    </div>
  );
}

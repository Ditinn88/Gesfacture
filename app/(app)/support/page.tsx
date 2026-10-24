"use client";

import React from "react";
import { MessageSquare, Mail, ArrowUpRight } from "lucide-react";
import {
  SUPPORT_EMAIL,
  SUPPORT_WHATSAPP_DISPLAY,
  supportMailtoUrl,
  supportWhatsappUrl,
} from "@/lib/support";

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
        {/* Toute la carte ouvre WhatsApp (application ou WhatsApp Web) */}
        <a
          href={supportWhatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="group block p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 dark:hover:border-neutral-600 hover:-translate-y-0.5 transition-all duration-200 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Chat Direct WhatsApp</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Assistance instantanée avec un conseiller de 8h à 20h GMT au {SUPPORT_WHATSAPP_DISPLAY}.
          </p>
          <span className="text-xs font-medium text-neutral-900 dark:text-white group-hover:underline pt-1 inline-flex items-center gap-1">
            Démarrer une conversation
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </span>
        </a>

        {/* Toute la carte ouvre la messagerie avec l'adresse et l'objet préremplis */}
        <a
          href={supportMailtoUrl()}
          className="group block p-6 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 dark:hover:border-neutral-600 hover:-translate-y-0.5 transition-all duration-200 space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">Support Email Dédié</h3>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Écrivez-nous pour toute question technique ou fiscale.
          </p>
          <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline pt-1 inline-flex items-center gap-1">
            {SUPPORT_EMAIL}
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </span>
        </a>
      </div>
    </div>
  );
}

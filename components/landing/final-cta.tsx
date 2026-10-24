"use client";

import React, { useState } from "react";

export function FinalCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("success");
    setEmail("");
    setTimeout(() => setStatus("idle"), 4000);
  };

  return (
    <section
      className="py-16 sm:py-20 bg-brand-surface relative overflow-hidden"
      data-purpose="bottom-cta-banner"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-br from-brand-deep via-[#1e0747] to-brand-primary text-white rounded-3xl p-7 sm:p-14 relative overflow-hidden shadow-2xl text-center">
          {/* Background radial glows */}
          <div
            aria-hidden="true"
            className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"
          ></div>
          <div
            aria-hidden="true"
            className="absolute -left-20 -top-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"
          ></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 bg-white/10 text-indigo-200 text-xs font-semibold rounded-full uppercase tracking-wider mb-4">
              Rejoignez la nouvelle vague
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
              Prêt à vous faire payer sans délai ?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 leading-relaxed">
              Créez votre première facture professionnelle dès aujourd'hui. Aucune carte bancaire requise pour démarrer.
            </p>

            {/* Quick Email Signup Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              id="signup-form"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre-email@entreprise.com"
                className="w-full px-5 py-3.5 rounded-full text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 placeholder-slate-400 border-none font-medium"
                aria-label="Adresse email professionnelle"
              />
              <button
                type="submit"
                className="whitespace-nowrap px-8 py-3.5 rounded-full bg-white text-brand-deep hover:bg-slate-100 font-bold text-sm shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Démarrer l'essai
              </button>
            </form>

            {status === "success" && (
              <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 rounded-2xl text-emerald-200 text-xs font-semibold animate-float-obj">
                ✓ Merci ! Votre espace d'essai GesFacture est prêt à être configuré.
              </div>
            )}

            <p className="text-xs text-slate-400 mt-4">
              Essai gratuit 14 jours • Configuration en 2 minutes • Annulation libre
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

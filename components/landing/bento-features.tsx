import React from "react";

export function BentoFeatures() {
  return (
    <section
      className="py-16 sm:py-24 bg-brand-surface"
      data-purpose="bento-grid-features"
      id="fonctionnalites"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
            Pensé pour l'Afrique
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-4 mb-4 tracking-tight">
            Tout ce dont vous avez besoin pour facturer &amp; être payé
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Des fonctionnalités taillées pour le contexte commercial d'Afrique de l'Ouest et Centrale.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento 1: Large feature */}
          <div className="md:col-span-2 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/80 shadow-soft-card flex flex-col justify-between card-hover-lift">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand-deep text-white flex items-center justify-center mb-6 shadow-sm">
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Factures conformes avec QR Code de certification
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Chaque facture générée embarque un QR Code sécurisé et les mentions obligatoires conformes aux réglementations fiscales de l'UEMOA et CEMAC (NINEA, RCCM, centre fiscal).
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5 text-emerald-600">
                ✓ Conforme DGI &amp; UEMOA
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600">
                ✓ Export PDF Vectoriel
              </span>
            </div>
          </div>

          {/* Bento 2: Mobile Money Integration */}
          <div className="bg-gradient-to-br from-brand-deep to-brand-primary text-white rounded-3xl p-7 sm:p-10 shadow-soft-card flex flex-col justify-between card-hover-lift">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center mb-6">
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3">
                Encaissement Mobile Money natif
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Vos clients paient directement en 1 clic par Wave, Orange Money ou carte bancaire. Les fonds arrivent directement sur votre compte.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
              <span>Délai d'encaissement</span>
              <span className="font-bold text-emerald-400">Instantané</span>
            </div>
          </div>

          {/* Bento 3: Automatic Reminders */}
          <div className="bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/80 shadow-soft-card flex flex-col justify-between card-hover-lift">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-sm">
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Relances WhatsApp &amp; SMS
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Programmez des notifications douces par WhatsApp ou SMS avant et après l'échéance. Réduisez vos retards de paiement de 65%.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-slate-500">
              Zéro friction, vos clients apprécient.
            </div>
          </div>

          {/* Bento 4: Multi-currency & SYSCOHADA */}
          <div className="md:col-span-2 bg-white rounded-3xl p-7 sm:p-10 border border-slate-200/80 shadow-soft-card flex flex-col justify-between card-hover-lift">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-sm">
                <svg
                  className="w-5 h-5 fill-none stroke-current stroke-2"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">
                Rapports financiers &amp; Export comptable SYSCOHADA
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                Transmettez en un clic vos journaux de ventes et récapitulatifs de TVA collectée à votre expert-comptable au format Excel ou PDF certifié.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500">
              <span>Multi-devises (FCFA, EUR, USD)</span>
              <span>• Grand livre des ventes</span>
              <span>• Tableau de bord de trésorerie</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

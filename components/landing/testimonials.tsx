import React from "react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  initials: string;
  avatarBg: string;
}

function TestimonialCard({
  quote,
  author,
  role,
  initials,
  avatarBg,
}: TestimonialProps) {
  return (
    <div className="bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-soft-card flex flex-col justify-between card-hover-lift">
      <div>
        <div className="flex items-center gap-1 text-amber-400 mb-4 text-sm tracking-widest">
          ★★★★★
        </div>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed italic mb-6">
          « {quote} »
        </p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
        <div
          className={`w-11 h-11 rounded-full ${avatarBg} text-white font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0`}
        >
          {initials}
        </div>
        <div>
          <p className="font-bold text-sm text-slate-900">{author}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const reviews: TestimonialProps[] = [
    {
      quote:
        "Mes clients corporate à Dakar ont été impressionnés par la netteté des factures. L'intégration directe du paiement Wave a réduit mes délais de paiement de 3 semaines à 48 heures.",
      author: "Fatou Ndiaye",
      role: "Fondatrice, Teranga Agency (Dakar)",
      initials: "FN",
      avatarBg: "bg-brand-deep",
    },
    {
      quote:
        "Le calcul automatique de la TVA 18% m'évite les erreurs bêtes que je faisais sur Excel. Mon comptable à Abidjan est ravi à la fin de chaque mois. Un outil indispensable.",
      author: "Kouamé Konan",
      role: "Consultant Cloud & Dev (Abidjan)",
      initials: "KK",
      avatarBg: "bg-indigo-600",
    },
    {
      quote:
        "Les relances automatiques par WhatsApp ont sauvé ma trésorerie. Plus besoin d'appeler moi-même pour réclamer mes paiements. C'est poli, professionnel et ultra efficace.",
      author: "Boris Eto'o",
      role: "Gérant, Krystal Logix (Douala)",
      initials: "BE",
      avatarBg: "bg-emerald-600",
    },
  ];

  return (
    <section
      className="py-16 sm:py-24 bg-brand-surface border-t border-slate-100"
      data-purpose="wall-of-love"
      id="temoignages"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
            Wall of Love
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-4 mb-4 tracking-tight">
            Ce que disent nos utilisateurs
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            Des milliers d'indépendants et gérants de PME ont accéléré leurs rentrées de fonds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev) => (
            <TestimonialCard key={rev.author} {...rev} />
          ))}
        </div>
      </div>
    </section>
  );
}

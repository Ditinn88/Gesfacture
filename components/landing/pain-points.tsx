import React from "react";
import { Calculator, FileX, Hourglass } from "lucide-react";

interface ProblemCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ProblemCard({
  icon,
  title,
  description,
}: ProblemCardProps) {
  return (
    <div className="bg-brand-surface p-7 sm:p-8 rounded-3xl border border-neutral-200/80 card-hover-lift">
      {/* Icônes monochromes, même style que les cartes du tableau de bord */}
      <div className="w-12 h-12 rounded-2xl bg-neutral-100 text-neutral-700 border border-neutral-200/80 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="font-bold text-lg text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function PainPoints() {
  const problems: ProblemCardProps[] = [
    {
      icon: <FileX className="w-5 h-5" strokeWidth={1.75} />,
      title: "Modèles Word et Excel cassés",
      description:
        "Mises en page désalignées, formules erronées, logos flous. Une facture amateur dégrade immédiatement la crédibilité auprès des grands comptes.",
    },
    {
      icon: <Calculator className="w-5 h-5" strokeWidth={1.75} />,
      title: "Calcul manuel de la TVA (18%)",
      description:
        "Erreurs d'arrondis sur les montants HT/TTC, confusion sur les acomptes et pénalités fiscales évitables lors des déclarations comptables.",
    },
    {
      icon: <Hourglass className="w-5 h-5" strokeWidth={1.75} />,
      title: "Relances manuelles embarrassantes",
      description:
        "Perte de trace des créances, relances oubliées et manque de moyens de paiement locaux instantanés pour vos clients.",
    },
  ];

  return (
    <section
      className="py-16 sm:py-24 bg-white border-y border-neutral-100 relative"
      data-purpose="pain-points-section"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold text-neutral-900 uppercase tracking-widest bg-neutral-100 px-3 py-1 rounded-full">
            Le constat
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-4 mb-4 tracking-tight">
            Pourquoi 80% des entrepreneurs africains perdent du temps et des revenus
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base">
            Gérer une entreprise est déjà exigeant. Ne laissez pas un système de facturation archaïque freiner votre croissance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((prob) => (
            <ProblemCard key={prob.title} {...prob} />
          ))}
        </div>
      </div>
    </section>
  );
}

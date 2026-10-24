import React from "react";

interface StepProps {
  number: string;
  badgeBg: string;
  title: string;
  description: string;
}

function StepItem({ number, badgeBg, title, description }: StepProps) {
  return (
    <div className="relative text-center md:text-left">
      <div
        className={`w-14 h-14 rounded-2xl ${badgeBg} text-white font-mono font-bold text-xl flex items-center justify-center mx-auto md:mx-0 mb-6 shadow-btn-glow transition-transform hover:scale-105 duration-300`}
      >
        {number}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export function HowItWorks() {
  const steps: StepProps[] = [
    {
      number: "01",
      badgeBg: "bg-brand-deep",
      title: "Créez votre profil",
      description:
        "Renseignez le nom de votre entreprise, votre logo et vos identifiants fiscaux (NINEA, RCCM).",
    },
    {
      number: "02",
      badgeBg: "bg-neutral-900",
      title: "Émettez la facture",
      description:
        "Ajoutez vos prestations, la TVA 18% est calculée automatiquement. Personnalisez les couleurs selon votre marque.",
    },
    {
      number: "03",
      badgeBg: "bg-emerald-600",
      title: "Encaissez sans stress",
      description:
        "Envoyez le lien sécurisé par WhatsApp ou Email. Votre client règle en un clic via Mobile Money.",
    },
  ];

  return (
    <section
      className="py-16 sm:py-24 bg-white border-t border-neutral-100"
      data-purpose="how-it-works-timeline"
      id="comment-ca-marche"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-xs font-bold text-brand-deep uppercase tracking-widest bg-brand-soft px-3 py-1 rounded-full">
            Simplicité radicale
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-navy mt-4 mb-4 tracking-tight">
            Opérationnel en 3 étapes rapides
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base">
            Aucun paramétrage complexe. Vous êtes prêt à émettre votre première facture en moins de 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
          {steps.map((step) => (
            <StepItem key={step.number} {...step} />
          ))}
        </div>
      </div>
    </section>
  );
}

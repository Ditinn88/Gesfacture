// Coordonnées du support GESFACTURE (page Aide, pied de page de la landing)
export const SUPPORT_WHATSAPP = "+971507925501";
export const SUPPORT_EMAIL = "ingdiallo88@gmail.com";

// Numéro affiché lisiblement : +971 50 792 5501
export const SUPPORT_WHATSAPP_DISPLAY = "+971 50 792 5501";

// Lien WhatsApp (wa.me attend le numéro sans « + » ni espaces) avec un message prérempli
export function supportWhatsappUrl(message = "Bonjour, j'ai besoin d'aide sur GESFACTURE.") {
  return `https://wa.me/${SUPPORT_WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function supportMailtoUrl(subject = "Demande d'assistance GESFACTURE") {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

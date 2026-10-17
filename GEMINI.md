# GEMINI.md — GESFACTURE

> **Documentation Technique & Référence Globale de l'Application**  
> Ce document sert de source de vérité pour les développeurs et modèles d'IA qui interviennent sur le projet **GESFACTURE**.

---

## 1. Ce que l'Application fait

**GESFACTURE** est une plateforme SaaS moderne de facturation, gestion commerciale et suivi des encaissements, conçue spécifiquement pour les entrepreneurs, indépendants, TPE et PME d'Afrique francophone (UEMOA/CEMAC) et de l'international.

L'application permet aux dirigeants d'entreprise de :
- Gérer l'intégralité du cycle de facturation (brouillon, émission, envoi, relance, encaissement).
- Suivre les créances en temps réel avec des indicateurs financiers (KPIs) dynamiques et conformes aux normes OHADA.
- Proposer des règlements adaptés à l'écosystème local (Mobile Money : **Wave**, **Orange Money**, **MTN MoMo**, ainsi que virement bancaire et espèces).
- Générer, imprimer et exporter des factures officielles au format **A4** avec un rendu 1:1 pixel-perfect et une isolation totale (aucun élément d'interface ou de modale sur les PDF).
- Gérer un fichier clients complet avec historique des facturations et statut commercial.
- Configurer les mentions légales d'entreprise (Raison sociale, NINEA, RCCM, adresses, coordonnées) et synchroniser ces informations instantanément avec les factures.

---

## 2. Toutes les Fonctionnalités Implémentées

### A. Dashboard Financier (`/dashboard`)
- **Cartes KPI en Temps Réel** :
  - *Chiffre d'Affaires Brut* (Total émis, nombre de factures, taux de croissance).
  - *Montants Encaissés* (Total des règlements perçus avec barre de progression du taux de recouvrement).
  - *Créances en Attente* (Factures envoyées non échues).
  - *Alertes Retard* (Créances échues avec point pulsant rouge d'alerte fiscale).
  - *Nouveaux Clients* (Acquisitions mensuelles).
- **Graphique d'Évolution du Revenu** :
  - Vue bimodale mensuelle / hebdomadaire via `Recharts`.
  - Double courbe : *Chiffre d'Affaires émis* vs *Encaissements effectifs*.
  - Tooltip personnalisé au design Notion Light avec formatage FCFA sans décimales.
- **Tableau des Factures Récentes** :
  - Affichage instantané des dernières factures émises.
  - Badges de statut pillés pastels (`Payée`, `Envoyée`, `Brouillon`, `En retard`).
  - Menu d'actions contextuelles (Voir détail, Modifier, Marquer comme payée, Supprimer).
- **Aperçu Express de Facture** :
  - Panneau latéral avec rendu miniature en direct de la facture sélectionnée.
  - Boutons d'action rapide : Envoi d'email, export PDF isolé, envoi client.

### B. Gestion des Factures (`/invoices`)
- **Tableau Complet & Filtrable** :
  - Filtres par statut en un clic : *Toutes*, *Payée*, *Envoyée*, *En retard*, *Brouillon*.
  - Recherche multi-critères en direct (par nom de client, numéro de facture ou montant).
  - Tri par date ou montant.
- **Pagination Dynamique** :
  - Gestion par tranches de 20 éléments avec sélecteur de taille de page, compteurs précis et commandes Suivant / Précédent.
- **Actions sur Ligne** :
  - Menu dropdown à 3 points sans débordement d'écran (`RowActionsDropdown`).
  - Redirection fluide vers la modification pré-remplie ou la suppression sécurisée avec modale de confirmation.

### C. Création & Édition de Factures (`/invoices/new`)
- **Mode Dual : Création & Modification** :
  - Détection automatique du paramètre `?edit=[id]` pour pré-remplir le formulaire avec les données existantes.
  - Sélection du client via `CustomDropdown` avec recherche intégrée et bouton d'ajout rapide de client sans quitter la page.
- **Dates & Conditions** :
  - Sélecteurs de date personnalisés (`CustomDatePicker`) avec vue calendrier intégrée au style Notion (fond noir au focus, hairlines 1px).
  - Date d'émission et date d'échéance alignées sur la même ligne sur mobile.
  - Sélection du moyen de règlement (Wave, Orange Money, MTN MoMo, Virement, Espèces).
- **Lignes de Facturation Dynamiques** :
  - Ajout / suppression de lignes d'articles en direct.
  - Calcul automatique : `Total Ligne = Quantité × Prix Unitaire HT`.
  - Calcul dynamique du sous-total HT, de la remise éventuelle, de la TVA (18% paramétrable) et du Total TTC net.
- **Aperçu Live Dynamique (Desktop & Mobile)** :
  - Volet latéral sticky qui reflète en temps réel les saisies du formulaire.
- **Bouton Primaire & Modale de Succès** :
  - Bouton d'action principal « Créer la facture » (ou « Enregistrer modifications »).
  - Modale de feedback avec résumé complet de la facture créée.
  - Bouton « Télécharger la facture » déclenchant l'impression isolée propre de la facture A4 (zéro modale sur l'export).
  - Boutons « Retourner aux factures » et « Consulter la page détaillée ».

### D. Détail Facture & Impression A4 (`/invoices/[id]` & `/invoices/[id]/print`)
- **Feuille A4 Notion Flat Design** :
  - Monogramme de marque `[G]` en squircle noir.
  - Mentions légales complètes de l'organisation (NINEA, RCCM, adresse, contacts).
  - Coordonnées complètes du client facturé.
  - Tableau des prestations avec quadrillage 1px hairline.
  - Bloc des totaux (Sous-total HT, TVA, Total TTC Net en caractères gras et police mono).
  - Conditions de règlement et mentions légales OHADA.
  - Bloc de signature et coordonnées bancaires / Mobile Money.
- **Moteur d'Impression Isolé (`lib/print-invoice.ts`)** :
  - Génération d'un document HTML A4 propre dans un iframe invisible.
  - Déclenchement de l'impression sur le contexte isolé de l'iframe : garantit l'exclusion absolue de la modale, du menu et du layout de l'application sur le PDF généré.
- **Route Dédiée Plein Écran** :
  - `/invoices/[id]/print` pour l'ouverture directe et l'impression sans distraction.

### E. Répertoire des Clients (`/clients`)
- Liste tabulaire complète des clients enregistrés avec avatar monogramme.
- Total facturé par client et volume de factures associées.
- Statuts client (*Actif*, *Inactif*) sous forme de pills pastels.
- Formulaire d'ajout rapide et modification de client.
- Barre de recherche en temps réel par nom, email ou ville.
- Pagination complète pour grands volumes de données.

### F. Paramètres de l'Organisation (`/settings`)
- **Navigation Responsive Double Mode** :
  - *Sur mobile* : Sélecteur déroulant de rubriques (`Dropdown`) + barre de puces horizontales (`Pills`) compactes à un tap.
  - *Sur desktop* : Cartes de navigation verticales détaillées.
- **5 Rubriques Paramétrables** :
  1. *Identité de l'Entreprise* : Raison sociale, Nom légal, NINEA, RCCM, adresse, ville, pays, téléphone, email.
  2. *Modèle de Facture & TVA* : Devise standard, préfixe de numérotation, taux de TVA par défaut, délai de paiement, mentions de bas de page.
  3. *Coordonnées de Règlement* : Numéro marchand Wave, Orange Money, IBAN, code SWIFT et banque.
  4. *Relances & Notifications* : Délais d'alerte avant/après échéance.
  5. *Profil & Administrateur* : Identité de l'utilisateur principal et rôle.
- **Répercussion Directe** :
  - Toute modification enregistrée se synchronise immédiatement dans l'ensemble des factures, aperçus et exports PDF sans rechargement de page.

### G. Composants UI & Système de Navigation Global
- **Navigation Responsive Mobile-First** :
  - Tiroir latéral mobile (Drawer) avec fermeture automatique lors de la navigation ou du clic sur l'arrière-plan.
  - Bouton circulaire ergonomique de fermeture `✕`.
  - Verrouillage du scroll arrière (`overflow: hidden`) pendant l'ouverture du menu.
  - Raccourci direct d'engrenage `Paramètres` dans la Topbar pour smartphone.
- **Mode Sombre / Mode Clair (Dark / Light)** :
  - Gestion via `next-themes` avec persistance.
  - Fond clair Warm Notion (`#FAFAF9`) et fond sombre Deep Charcoal (`#121212`).
- **Barre de Recherche avec Micro-Animation** :
  - Animation de loupe pivotante et grossissante au focus (`animate-loupe`).
  - Badge raccourci clavier `⌘ K`.

---

## 3. Structure des Fichiers

```
c:\Users\HP\GESFACTURE
├── app/
│   ├── (app)/                       # Groupe de routes authentifiées de l'application
│   │   ├── budgeting/page.tsx       # Espace Gestion Budgétaire (placeholder UI)
│   │   ├── clients/page.tsx         # Répertoire et gestion des clients
│   │   ├── dashboard/page.tsx       # Tableau de bord principal avec KPIs & graphiques
│   │   ├── invoices/
│   │   │   ├── page.tsx             # Liste filtrable et paginée des factures
│   │   │   ├── new/page.tsx         # Création & édition de facture (+ modale de succès)
│   │   │   └── [id]/
│   │   │       ├── page.tsx         # Consultation détaillée de facture
│   │   │       └── print/page.tsx   # Vue d'impression A4 dédiée plein écran
│   │   ├── payments/page.tsx        # Historique des paiements et règlements
│   │   ├── products/page.tsx        # Catalogue d'articles / prestations
│   │   ├── reports/page.tsx         # Rapports financiers & exports comptables
│   │   ├── settings/page.tsx        # Paramètres organisation, TVA, Wave/OM & profil
│   │   ├── support/page.tsx         # Centre d'aide et documentation
│   │   ├── wallet/page.tsx          # Portefeuille digital & soldes
│   │   └── layout.tsx               # Layout de l'application (Sidebar, Topbar, DataProvider)
│   ├── globals.css                  # Directives Tailwind, tokens Notion & règles @media print
│   ├── layout.tsx                   # RootLayout HTML (fonts Inter, ThemeProvider, AuthProvider)
│   ├── login/page.tsx               # Page de connexion & d'inscription Dribbble Split-Screen
│   ├── signup/page.tsx              # Redirection vers /login?tab=signup
│   └── page.tsx                     # Redirection racine vers /dashboard
├── components/
│   ├── auth/
│   │   └── auth-modal.tsx           # Modale d'authentification Notion Light (Connexion & Inscription)
│   ├── dashboard/
│   │   ├── invoice-preview-card.tsx # Panneau latéral d'aperçu rapide d'une facture
│   │   ├── kpi-cards.tsx            # Cartes métriques financières (CA, Encaissé, Retards)
│   │   ├── recent-invoices.tsx      # Tableau des factures récentes du Dashboard
│   │   └── revenue-chart.tsx        # Graphique d'évolution du CA avec Recharts
│   ├── layout/
│   │   ├── sidebar.tsx              # Barre latérale de navigation (Desktop fixe & Mobile drawer)
│   │   └── topbar.tsx               # En-tête avec barre de recherche, +Facture, statut Cloud & Auth
│   ├── theme-provider.tsx           # Wrapper next-themes
│   └── ui/
│       ├── confirm-modal.tsx        # Boîte de dialogue de confirmation (ex: suppression, vidage démo)
│       ├── custom-date-picker.tsx   # Sélecteur de date avec calendrier visuel Notion Light
│       ├── custom-dropdown.tsx      # Menu déroulant stylisé avec recherche et sélection
│       ├── pagination.tsx           # Barre de pagination complète avec taille de page
│       ├── row-actions-dropdown.tsx # Menu 3 points d'options sur ligne de tableau
│       ├── skeleton.tsx             # Skeleton loaders neutres pour états de chargement
│       └── status-badge.tsx         # Badges de statuts pastels arrondis (Payée, Envoyée, etc.)
├── lib/
│   ├── auth-context.tsx             # Contexte d'authentification Supabase (User, Session, Login, Signup)
│   ├── data-context.tsx             # Context React global (CRUD Factures, Clients, Organisation & Realtime)
│   ├── mock-data.ts                 # Données de démonstration réalistes & interfaces TypeScript
│   ├── print-invoice.ts             # Moteur d'impression A4 isolé (iframe) & téléchargement HTML
│   ├── search-context.tsx           # Context de recherche globale pour la Topbar
│   ├── supabase.ts                  # Client singleton Supabase avec détection dynamique
│   └── utils.ts                     # Utilitaires (formatFCFA, formatDate, cn / clsx / twMerge)
├── public/                          # Assets statiques, icônes SVG
├── supabase/
│   └── schema.sql                   # Schéma SQL officiel prêt pour Supabase SQL Editor
├── .env.local                       # Variables d'environnement locales (Supabase URL & Anon Key)
├── .env.local.example               # Modèle de variables d'environnement
├── AGENTS.md                        # Système de design officiel (Règles strictes Notion Light)
├── GEMINI.md                        # Présent fichier de documentation globale
├── package.json                     # Dépendances du projet
├── tailwind.config.js               # Configuration Tailwind (couleurs neutres, animations)
└── tsconfig.json                    # Configuration TypeScript
```

---

## 4. Technologies & Bibliothèques Utilisées

| Technologie / Librairie | Version | Rôle & Justification |
| :--- | :--- | :--- |
| **Next.js** | `^14.2.23` | Framework React avec App Router, Server Components & Client Components (`"use client"`). |
| **React & React DOM** | `^18.3.1` | Bibliothèque UI principale. |
| **TypeScript** | `^5.7.3` | Typage statique strict sur l'ensemble des données, props et interfaces. |
| **Tailwind CSS** | `^3.4.17` | Framework CSS utilitaire configuré sans aucune teinte bleue (`neutral-*`). |
| **@supabase/supabase-js**| `^2.49.1` | Client officiel Supabase pour la persistance temps réel du cloud. |
| **next-themes** | `^0.4.4` | Gestion du basculement Dark / Light mode avec persistance sans flash. |
| **Lucide React** | `^0.475.0` | Bibliothèque d'icônes vectorielles légères et cohérentes. |
| **Recharts** | `^2.15.1` | Graphiques statistiques responsives pour le chiffre d'affaires. |
| **clsx & tailwind-merge**| `^2.1.1` / `^3.0.1` | Concaténation et fusion dédupliquée des classes CSS utilitaires via `cn()`. |

---

## 5. Décisions de Design (Notion Light / Flat Design)

Le projet respecte rigoureusement les principes énoncés dans le fichier [`AGENTS.md`](file:///c:/Users/HP/GESFACTURE/AGENTS.md) :

1. **Flat Design Pur & Style Notion** :
   - Contours nets et fins de 1px (`border-neutral-200 dark:border-neutral-800`).
   - Aucune ombre portée lourde (`shadow-none` par défaut, `shadow-xs` ou `shadow-2xl` subtile pour les tiroirs mobiles uniquement).
2. **Éradication Totale des Teintes Bleues** :
   - ❌ **Interdit** : les classes `slate-*` (qui ont une teinte bleutée `hsl(215°)`), `border-blue-*`, halos de focus bleus.
   - ✅ **Obligatoire** : utilisation exclusive de la palette neutre `neutral-*` (`neutral-100` à `neutral-900`).
3. **Format Financier Africain & International** :
   - Devise standard : Franc CFA (`XOF`).
   - Pas de décimales, séparateur d'espace : `formatFCFA(1500000)` donne `1 500 000 FCFA`.
   - Alignement à droite dans les tableaux avec police en gras ou monospace.
4. **Dates Internationales Francophones** :
   - Format `DD/MM/YYYY` (ex: `17/10/2026`).
5. **Badges de Statut en Pilules Pastels** :
   - Badges entièrement arrondis `rounded-full` sans dégradé :
     - *Payée* : vert d'eau (`bg-[#e6f4ea] text-[#137333] border-[#ceead6]/60`).
     - *Envoyée* : ambre (`bg-[#fef7e0] text-[#b06000] border-[#fce8b2]/60`).
     - *En retard* : rose fiscal (`bg-[#fce8e6] text-[#c5221f] border-[#fad2cf]/60`).
     - *Brouillon* : gris neutre (`bg-[#f1f3f4] text-[#5f6368] border-[#e0e0e0]/70`).
6. **Micro-Interactions Notion** :
   - Inversion noir/blanc au survol sur les boutons secondaires : fond blanc devenant noir et texte devenant blanc (`hover:bg-neutral-900 hover:text-white`).
   - Translation de flèche `group-hover:translate-x-0.5 group-hover:-translate-y-0.5`.
   - Animation de rotation de la loupe de recherche (`animate-loupe`).
7. **Isolation Totale de l'Impression / PDF** :
   - L'export PDF / impression s'effectue via un `iframe` invisible isolé avec le balisage A4 officiel afin d'empêcher que la modale ou le reste du DOM n'apparaissent sur le PDF imprimé.

---

## 6. Instructions pour un Futur Modèle d'IA

Lors de toute intervention future sur ce code, **vous devez OBLIGATOIREMENT respecter les règles suivantes** :

### A. Préservation du Système de Design
- N'utilisez **JAMAIS** les classes Tailwind `slate-*`, `blue-*` ou `indigo-*`. Utilisez uniquement `neutral-*`.
- Ne mettez jamais d'ombres lourdes (`shadow-lg`, `shadow-xl`) sur les cartes de contenu ou les boutons : privilégiez `border border-neutral-200 dark:border-neutral-800 shadow-none`.
- Les montants doivent systématiquement être formatés avec `formatFCFA(amount)` issu de `@/lib/utils`. Ne saisissez jamais d'espaces manuels ou de symboles `$` / `€` en dur.
- Le logo officiel de la marque est toujours le monogramme `[G]` en police Serif dans un squircle noir (`rounded-xl bg-neutral-900 text-white font-serif`).

### B. Impression et Téléchargement de Factures
- Ne faites **JAMAIS** un simple `window.print()` sur une page contenant une modale ouverte.
- Utilisez toujours la fonction `printInvoice(invoice, organization)` depuis [`lib/print-invoice.ts`](file:///c:/Users/HP/GESFACTURE/lib/print-invoice.ts) : elle garantit une isolation parfaite par iframe sans fuite visuelle d'éléments de l'interface utilisateur.

### C. Gestion d'État et Navigation Mobile
- Pour fermer la barre latérale sur mobile, utilisez la fonction stable fournie par le layout parent avec `useCallback`.
- Ne placez jamais `onClose?.()` à l'intérieur d'un `useEffect` de la Sidebar sans condition de dépendance stricte, sous peine de créer une boucle fermant le menu instantanément lors de son ouverture.
- Respectez la règle des classes sur l'élément `<aside>` de la barre latérale :
  - Fermé : `-translate-x-full lg:translate-x-0`
  - Ouvert : `translate-x-0`

### D. Validation avant Validation Finale
- Exécutez toujours `npx tsc --noEmit` pour vous assurer qu'aucune erreur TypeScript n'a été introduite.
- Vérifiez la compilation Next.js dans le terminal sans avertissement.
- Vérifiez que les vues s'adaptent confortablement aux petits écrans mobiles (< 380px de large).

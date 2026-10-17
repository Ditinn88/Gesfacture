# GESFACTURE — SYSTEME DE DESIGN OFFICIEL (NOTION LIGHT / FLAT DESIGN)

Ce document constitue la **règle absolue d'interface et d'expérience utilisateur (UI/UX)** pour GESFACTURE.
Tous les composants, pages, formulaires, modales et tableaux créés dans ce projet DOIVENT respecter STRICTEMENT ce système de design.

---

## 1. Principes Directeurs & Esthétique

* **Flat Design Pur & Style Notion Light** : Aucune ombre portée lourde (`shadow-none` par défaut). Contours nets, fins et précis de 1px.
* **Zéro Teinte Bleue Interdite** :
  * ❌ STRICTEMENT INTERDIT : classes `slate-*` (qui ont une teinte bleue `hsl(215-220°)`), `border-blue-*`, `bg-blue-*`, halos de focus bleus par défaut.
  * ✅ OBLIGATOIRE : utiliser exclusivement la palette neutre pure `neutral-*` (`neutral-100`, `neutral-200`, `neutral-400`, `neutral-700`, `neutral-900`).
* **Micro-Interactions Vivantes** : Inversion de couleurs au survol, micro-translations de flèches, micro-rotations d'icônes, pulsation d'alertes.
* **Mobile-First & Ergonomie Tactile** : Cibles de tap confortables (min 32px), adaptation responsive sans débordement, boutons compacts sur smartphone.
* **Skeleton Loaders Systématiques** : Tout composant de données doit intégrer un état `isLoading` avec squelettes neutres `bg-neutral-200/70 dark:bg-neutral-800`.

---

## 2. Tokens de Couleurs & Surfaces

| Élément | Mode Clair (Light) | Mode Sombre (Dark) | Règle Tailwind |
| :--- | :--- | :--- | :--- |
| **Fond d'application (Canvas)** | `#FAFAF9` (Warm Notion) | `#121212` (Deep Charcoal) | `bg-[#fafaf9] dark:bg-[#121212]` |
| **Fond des cartes / conteneurs**| `#FFFFFF` (Pur) | `#191919` / `#171717` | `bg-white dark:bg-neutral-900` |
| **Bordures par défaut (Hairline)**| `#E5E5E5` | `#262626` | `border-neutral-200 dark:border-neutral-800` |
| **Bordures actives / survol** | `#A3A3A3` | `#525252` | `border-neutral-400 dark:border-neutral-600` |
| **Séparateurs internes** | `#F5F5F5` | `#262626` | `divide-neutral-100 dark:divide-neutral-800/80` |
| **Survol de ligne / élément** | `#F6F6F5` | `#262626/50` | `hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50` |
| **Texte principal (Titres/Montants)**| `#171717` | `#FFFFFF` | `text-neutral-900 dark:text-white font-bold` |
| **Texte secondaire (Labels)** | `#737373` | `#A3A3A3` | `text-neutral-500 dark:text-neutral-400` |
| **Texte tertiaire (Sous-titres/Dates)**| `#A3A3A3` | `#737373` | `text-neutral-400 dark:text-neutral-500 text-xs` |
| **Alerte Retard / Négatif** | `#C5221F` (Rouge fiscal) | `#F87171` (Rose 400) | `text-[#c5221f] dark:text-rose-400 font-bold` |

---

## 3. Typographie & Formatage Financier

* **Famille Sans-serif** : `font-sans` (`Inter, -apple-system, system-ui, sans-serif`).
* **Logo Brand** : Monogramme `G` en police Serif (`font-serif`, Georgia / Times) centré dans un squircle noir (`rounded-xl bg-neutral-900 text-white`).
* **Format des Montants** :
  * Devise standard : Franc CFA (`XOF`).
  * 0 décimale, séparateur d'espaces : `1 500 000 FCFA` (via `formatFCFA(amount)`).
  * Alignement toujours à droite dans les tableaux avec police en gras (`font-bold text-right`).
* **Format des Dates** : Format international francophone `DD/MM/YYYY` (ex: `12/03/2026`).

---

## 4. Composants Clés & Règles d'Implémentation

### A. Bouton d'Action avec Inversion au Survol (Signature Notion)
Tous les boutons secondaires ou de consultation (`Tout voir ↗`, `Facture`, `Filtres`, etc.) utilisent l'inversion noir/blanc au survol :
```tsx
<Link
  href="/invoices"
  className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-medium text-neutral-800 dark:text-neutral-200 bg-white dark:bg-neutral-800 hover:bg-neutral-900 hover:text-white hover:border-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900 dark:hover:border-white border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-none transition-all duration-200 active:scale-95 shrink-0"
>
  <span>Tout voir</span>
  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white dark:group-hover:text-neutral-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
</Link>
```

### B. Bouton Primaire Solide
Pour les CTA principaux de création ou de validation :
```tsx
<button
  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 rounded-xl shadow-none transition-colors"
>
  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
  <span>Créer une facture</span>
</button>
```

### C. Statuts sous Forme de « Pills » Arrondis
Les statuts de factures et clients sont STRICTEMENT des pilules arrondies `rounded-full` aux tons pastels plats sans dégradé :
* **Payée / Actif** : `bg-[#e6f4ea] text-[#137333] border border-[#ceead6]/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/50`
* **Envoyée** : `bg-[#fef7e0] text-[#b06000] border border-[#fce8b2]/60 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50`
* **En retard** : `bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]/60 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/50`
* **Brouillon** : `bg-[#f1f3f4] text-[#5f6368] border border-[#e0e0e0]/70 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700`
* *Micro-interaction* : `transition-all duration-150 hover:scale-105 cursor-default`

### D. Cartes KPI & Conteneurs de Données
* Structure : `p-5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-none hover:border-neutral-400/80 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200`
* Icône monochrome : conteneur `w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/80 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200`
* Point pulsant d'alerte : `relative flex h-2 w-2 ml-2 inline-flex` avec `animate-ping` sur les éléments urgents.

### E. Barre de Recherche & Micro-Animation de Loupe
* Conteneur : `rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200/60`
* Animation Loupe : au clic / focus, la loupe s'anime (`animate-loupe`), pivote (`-12°`), s'agrandit (`scale(1.2)`) et passe en noir profond `text-neutral-900`.
* Badge Raccourci : `⌘ K` discret à droite en police mono `text-[10px]`.

### F. Tableaux et Listes
* Conteneur avec `rounded-2xl border border-neutral-200 overflow-hidden shadow-none`.
* En-tête : fond `bg-[#fafaf9] dark:bg-neutral-900/50`, texte `text-[11px] font-medium text-neutral-400`.
* Lignes : survol doux `hover:bg-[#f6f6f5] dark:hover:bg-neutral-800/50 transition-all duration-150`.
* L'en-tête du tableau sur mobile conserve le bouton d'action sur la même ligne : `flex items-center justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-4`.

---

## 5. Règles Responsives & Menu Mobile

1. **Largeur du Tiroir Mobile (Drawer)** : `w-[280px] sm:w-[290px] lg:w-[250px] shadow-2xl shadow-neutral-900/15 lg:shadow-none`.
2. **Bouton de fermeture Mobile** : Cible tactile circulaire `w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-500`.
3. **Verrouillage du Scroll Mobile** : Bloquer le scroll du document (`overflow: hidden`) dès que le menu est ouvert.
4. **Topbar sur Mobile** :
   * Padding réduit à `px-4 sm:px-8`.
   * Logo officiel squircle noir `[G]` présent pour rappeler la marque.
   * Largeur responsive de recherche (`w-36 xs:w-48 sm:w-72 md:w-80`) pour ne jamais repousser le bouton d'action.

---

## 6. Checklist de Validation pour Chaque Nouveau Composant

Avant de considérer tout nouveau composant ou page comme terminé, vérifier :
- [ ] Zéro couleur bleue sur les bordures, fonds et anneaux de sélection.
- [ ] Présence d'un `Skeleton Loader` complet via la prop `isLoading`.
- [ ] Les montants financiers sont formatés en FCFA sans décimales.
- [ ] Les statuts sont des badges arrondis `rounded-full` pastels.
- [ ] Les boutons secondaires adoptent l'inversion de couleur au hover.
- [ ] Le layout ne déborde pas sur les écrans mobiles (< 380px).

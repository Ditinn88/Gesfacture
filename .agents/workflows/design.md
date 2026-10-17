---
description: 
---

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

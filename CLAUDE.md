# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

GESFACTURE est un SaaS de facturation (Next.js 14 App Router, TypeScript strict, Tailwind, Supabase) destiné aux TPE/PME d'Afrique francophone. Toute l'UI, les messages et la doc sont en français.

## Commandes

```bash
npm install
npm run dev          # http://localhost:3000 (/ = landing page, app sous /dashboard)
npm run build        # build de production, sert aussi de vérification de types
npx tsc --noEmit     # vérification de types seule
```

- Aucun framework de test n'est installé (pas de Vitest/Jest/Playwright) : il n'y a pas de tests à lancer.
- Aucune config ESLint n'existe : `npm run lint` (`next lint`) lancerait l'assistant de configuration interactif. Utiliser `tsc --noEmit` / `npm run build` pour valider.
- Déploiement : Vercel déploie automatiquement chaque push sur `main` (production : https://gesfacture.vercel.app). Pas de préproduction : un push sur `main` part en ligne.
- Variables d'environnement dans `.env.local` (voir `.env.local.example`) : `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). Le schéma se crée en exécutant `supabase/schema.sql` dans l'éditeur SQL Supabase (pas de migrations ni de Supabase CLI).

## Architecture

**Application 100 % client.** Toutes les pages sous `app/(app)/` sont des Client Components ; il n'y a ni Server Actions, ni route handlers, ni `middleware.ts`. Le client Supabase (`lib/supabase.ts`) est appelé directement depuis le navigateur avec la clé anon.

**Mode local vs cloud.** `isSupabaseConfigured` (`lib/supabase.ts`) vaut `false` si les variables manquent ou contiennent encore les placeholders (`votre-projet`, `votre_cle`) ; `supabase` vaut alors `null`. Le `DataProvider` ne synchronise avec Supabase que s'il existe une vraie session (`cloudUserId`) ; sinon (pas de config, visiteur, connexion « démo » via `loginAsDemo`) tout reste en localStorage. Dans les mutations, utiliser la variable `cloud` (client Supabase ou `null`), pas `supabase` directement.

**Couche de données : `lib/data-context.tsx` (`DataProvider` / `useData`).** C'est la seule source de vérité pour factures, clients et organisation ; les pages ne requêtent jamais Supabase elles-mêmes.
- Local-first : chaque mutation (`addInvoice`, `updateClient`…) met à jour l'état React + le cache localStorage de façon synchrone (updaters fonctionnels `saveInvoices` / `saveClients`), puis écrit dans Supabase sans attendre. En cas d'échec, `reportSyncError` remplit `syncError`, affiché par `components/layout/sync-error-banner.tsx`. Les fonctions CRUD sont synchrones.
- Le chargement attend la fin de l'auth et se relance à chaque changement de compte : cache local du compte, fetch Supabase, puis abonnement Realtime (`postgres_changes`) qui recharge la table modifiée. Le cache est séparé par compte (`storageKey(base, cloudUserId)`) et celui du compte précédent est effacé à la déconnexion.
- Valeurs dérivées, jamais stockées : une facture `envoyee` dont l'échéance est passée est exposée en `en_retard` ; `totalInvoiced` / `invoicesCount` des clients sont recalculés depuis les factures non brouillon (correspondance par `invoice.client.id`, sinon par nom ou email normalisés), avec `totalsByCurrency`.
- Mapping camelCase (types TS) ↔ snake_case (colonnes) centralisé dans `rowToInvoice`, `rowToClient`, `invoiceUpdatesToRow` et l'`insert` de `addInvoice` : un nouveau champ se déclare là et dans `supabase/schema.sql`. Les lignes de facture passent par `normalizeItems` (quantités et prix en nombres).
- Les clés localStorage sont versionnées (`gesfacture_invoices_v7`, etc.) ; incrémenter la version et ajouter l'ancienne clé à `legacyKeys` pour invalider les caches existants.
- Filtres anti-données-démo : `isMockInvoice`, `isMockClient` et `parseOrgRow` écartent d'anciennes fixtures (IDs `inv-00x`/`cli-0x`, noms et numéros codés en dur) qui correspondent aussi aux valeurs `DEFAULT` du schéma SQL. Ne pas réutiliser ces valeurs comme données de test. `stripPlaceholders` efface de même les coordonnées fictives (`PLACEHOLDER_ORGANIZATION_VALUES`) d'anciens caches.
- Premier lancement en mode local (aucun cache v8 ni v7) : `RECENT_INVOICES` / `TOP_CLIENTS` sont chargés et écrits en cache comme exemples. Les caches v7 sont relus si la clé v8 est absente.
- Les IDs sont générés côté client (`inv-${Date.now()}`, `cli-${Date.now()}`) ; les colonnes `id` sont en `TEXT`.
- Les infos bancaires (IBAN, banque, SWIFT) sont stockées en JSON sérialisé dans la seule colonne `organizations.iban`.

**Types de domaine** : définis dans `lib/mock-data.ts` (`Invoice`, `Client`, `Organization`, `DEFAULT_ORGANIZATION`) malgré le nom du fichier. Statuts en codes français : facture `payee | envoyee | brouillon | en_retard`, client `actif | inactif`. Le client est copié en JSONB dans chaque facture (`invoice.client`). Chaque facture porte sa devise (`currency`, défaut : celle de l'organisation) : passer `invoice.currency` à `formatFCFA` / `formatCurrency` pour tout affichage propre à une facture. Ne jamais additionner des montants de devises différentes : regrouper avec `sumByCurrency` et afficher avec `components/ui/currency-totals.tsx` ; graphiques et taux portent sur `resolveInvoicesCurrency` (devise la plus utilisée). Les devises proposées viennent du catalogue `AVAILABLE_CURRENCIES` (`CurrencyInfo` avec pays, région, symbole ; `getCurrencyInfo`, `getCurrencySymbol` dans `lib/utils.ts`) et se choisissent avec `components/ui/currency-dropdown.tsx` (drapeaux chargés depuis flagcdn, repli texte). Le `subtotal` stocké est déjà remisé (`discountPercent`). Paiements partiels : les acomptes s'accumulent dans `paidAmount` de la même facture (`recordPayment`, qui la passe en `payee` une fois soldée) ; pour tout montant encaissé ou restant dû, utiliser `paidAmountOf` / `remainingAmountOf` / `isPartiallyPaid` (`lib/utils.ts`) plutôt que le seul statut, et `StatusBadge partial`.

**Schéma Supabase** (`supabase/schema.sql`, idempotent : peut être relancé sur une base existante) : 3 tables à plat (`organizations`, `clients`, `invoices`) + `organization_members`, montants en `NUMERIC`. Chaque ligne a un `user_id` (défaut `auth.uid()`) : c'est le chef d'entreprise propriétaire des données. L'organisation d'un utilisateur a pour `id` son identifiant de compte.

**Membres et espaces partagés.** Le propriétaire ajoute des membres (`organization_members` : `owner_id`, `email` en minuscules, `role` `admin | comptable | lecteur`). Les politiques RLS passent toutes par `public.workspace_role(user_id)` (`owner`, rôle du membre si son email est **confirmé**, sinon `NULL`) : lecture pour tout l'espace, écriture clients/factures sauf `lecteur`, paramètres pour `owner`/`admin`, membres gérés par le seul `owner`. Côté client, `DataProvider` résout d'abord l'espace (`resolveWorkspace` : le compte connecté est-il membre d'un autre espace ?) puis charge les données de `ownerId` : les lectures filtrent explicitement `user_id = ownerId`, les insertions passent `user_id: ownerId` (le défaut `auth.uid()` rattacherait la ligne au membre), et le cache local est séparé par espace (`cacheId`). Les mutations refusées par le rôle (`canEdit`, `canManageOrganization`) appellent `denyAction`, affiché comme « Action non autorisée » par le bandeau. Gestion de l'équipe : `components/settings/members-panel.tsx` (rubrique « Équipe & Membres » des Paramètres) ; l'invitation est un lien WhatsApp/email vers `/login?tab=signup&email=…`, aucun email n'est envoyé par l'application. Si `schema.sql` n'a pas été relancé, `membersAvailable` vaut `false` et chacun reste dans son propre espace. Les inscrits confirment leur email (le script supprime l'ancien trigger d'auto-confirmation ; « Confirm email » doit être activé dans Supabase).

**Auth** (`lib/auth-context.tsx`) : `AuthProvider` dans le layout racine (`app/layout.tsx`), donc disponible dans `DataProvider`. L'utilisateur est mis en cache dans localStorage (`gesfacture_local_auth_user_v6`). Les routes ne sont pas protégées : les pages lisent `useAuth().user` et ouvrent `AuthModal` via `openAuthModal()`. Les messages d'erreur Supabase sont traduits en français dans le contexte.

**Layout applicatif** (`app/(app)/layout.tsx`) : `DataProvider` → `SearchProvider` (requête de recherche globale partagée entre `Topbar` et les pages) → Sidebar fixe de 250px en desktop / tiroir sur mobile + Topbar. Les éléments d'interface portent la classe `no-print`.

**PDF & impression** (`lib/print-invoice.ts`) : `generateInvoiceHtml` produit le HTML A4 complet de la facture (styles inline) ; `printInvoice` l'imprime via une iframe isolée, `downloadInvoicePdf` le rend avec html2canvas + jsPDF. Toute modification visuelle de la facture imprimée se fait dans ce générateur HTML, pas dans les composants React.

**Contacts du support** (WhatsApp, email) : centralisés dans `lib/support.ts`, utilisés par la page Aide et le pied de page de la landing.

**`docs/PLAN.md` décrit l'architecture cible, pas l'existant** (multi-tenant `organizations`/`memberships`, montants en entiers, numérotation séquentielle côté serveur, shadcn, react-hook-form, zod, @react-pdf, Vitest/Playwright). Aucun de ces éléments n'est implémenté ; ne pas supposer leur présence.

## Système de design (obligatoire)

`AGENTS.md` (copie dans `.agents/rules/design-system.md`) est la règle absolue pour toute l'UI ; le lire avant de créer ou modifier un composant. `.agents/workflows/design.md` donne les classes exactes des motifs récurrents (boutons, pilules de statut, cartes KPI, tableaux, recherche). Points essentiels :
- Palette `neutral-*` uniquement, landing et page de connexion comprises : jamais de `slate-*`, `blue-*`, `indigo-*`, `violet-*` ni d'anneau de focus bleu (la palette `brand` de `tailwind.config.js` est elle aussi neutre). Flat design, `shadow-none` par défaut.
- Canvas `bg-[#fafaf9] dark:bg-[#121212]`, cartes `bg-white dark:bg-neutral-900` avec bordure `neutral-200/800`. Mode sombre via `next-themes` (`darkMode: "class"`), chaque classe doit avoir sa variante `dark:`.
- Montants via `formatFCFA()` (0 décimale, « 1 500 000 FCFA »), alignés à droite en gras ; dates via `formatDate()` (`DD/MM/YYYY`) ; les deux dans `lib/utils.ts` avec `cn()`.
- Statuts : utiliser `components/ui/status-badge.tsx` (pilules pastel `rounded-full`).
- Tout composant de données expose un état `isLoading` rendu avec `components/ui/skeleton.tsx`.
- Boutons secondaires avec inversion noir/blanc au survol ; mobile-first sans débordement sous 380px.

# GESFACTURE — Plan d'implémentation

SaaS de facturation pour entrepreneurs africains et internationaux.
Stack imposée : **Next.js 14 (App Router) · Supabase (Postgres + Auth + Storage) · Tailwind CSS · Vercel**.

---

## 1. Principes directeurs

1. **L'argent ne ment pas.** Montants stockés en **entiers (unités mineures)** + code devise ISO 4217. Jamais de `float`. Le XOF, XAF et GNF ont 0 décimale, le NGN/MAD/EUR en ont 2 : la précision est dérivée de la devise.
2. **Le serveur recalcule tout.** Le client affiche un aperçu en direct, mais les totaux enregistrés sont toujours recalculés côté serveur par la même fonction pure.
3. **Une facture envoyée est un document légal.** Numérotation séquentielle sans trou, attribuée à l'émission (pas au brouillon). Une facture émise n'est plus modifiable : on l'annule (et plus tard on émet un avoir). Les infos client/entreprise sont **figées (snapshot)** dans la facture au moment de l'émission.
4. **Multi-tenant dès le jour 1.** Toutes les données appartiennent à une `organization`. Un utilisateur est membre d'une ou plusieurs organisations. Isolation garantie par **RLS Postgres**, pas seulement par le code.
5. **L'UI ne connaît pas la source des données.** Une couche `repository` (interface) permet de passer des données locales (phase 2) à Supabase (phase 3) sans réécrire les pages.
6. **Pensé pour l'Afrique :** mobile-first, pages légères, formats de nombres locaux (`150 000 F CFA`), Mobile Money (Orange Money, Wave, MTN MoMo, M-Pesa) comme moyen de paiement de premier ordre, identifiants fiscaux locaux (NINEA, NIF, RCCM, IFU…).

---

## 2. Stack technique détaillée

| Besoin | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 14.2.x, App Router, TypeScript strict | Imposé ; Server Components + Server Actions |
| Style | Tailwind CSS + **shadcn/ui** (Radix) + `lucide-react` | Le style des captures (cartes blanches, bordures fines, accent bleu) se reproduit à l'identique |
| Thème | `next-themes` | Mode sombre (présent dans la capture) |
| Formulaires | `react-hook-form` + `useFieldArray` + `zod` | Lignes dynamiques, validation partagée client/serveur |
| Graphiques | `recharts` | Dashboard (CA mensuel, répartition des statuts) |
| Tableaux | `@tanstack/react-table` | Tri, filtres, pagination des listes |
| Dates | `date-fns` (+ locale `fr`) | Léger, tree-shakable |
| Données serveur | `@supabase/supabase-js` + `@supabase/ssr` | Auth par cookies compatible App Router/middleware |
| PDF | `@react-pdf/renderer` (route handler) | PDF identique partout, indépendant du navigateur |
| Emails | Resend + `react-email` | Envoi de facture avec lien public + PDF |
| Toasts | `sonner` | Feedback des actions |
| Tests unitaires | Vitest + Testing Library | Calculs, formatage, schémas, composants |
| Tests E2E | Playwright | Parcours complets (inscription → facture payée) |
| Tests BDD/RLS | Supabase CLI (local) + tests Vitest multi-utilisateurs | Prouver l'isolation entre organisations |
| Qualité | ESLint, Prettier, `tsc --noEmit`, GitHub Actions | CI sur chaque push |

---

## 3. Modèle de données (Supabase / Postgres)

Tous les montants : `bigint` en unités mineures. Tous les taux : `numeric(5,2)` (ex. `18.00`).

```text
profiles            id (= auth.users.id) · full_name · avatar_url · default_org_id · created_at

organizations       id · name · legal_name · email · phone
                    address_line1 · address_line2 · city · postal_code · country_code (ISO-2)
                    currency (ISO-4217) · locale · timezone
                    tax_id (NIF/NINEA/IFU…) · registration_number (RCCM…)
                    logo_path (Storage) · brand_color
                    invoice_prefix ('FAC') · default_due_days (30) · default_tax_rate
                    default_notes · default_terms
                    payment_details jsonb   -- { bank:{name,iban,swift}, mobile_money:[{provider,number,name}] }
                    created_at · updated_at

memberships         org_id · user_id · role (owner|admin|member) · PK(org_id,user_id)

clients             id · org_id · name · contact_name · email · phone
                    address_line1 · address_line2 · city · postal_code · country_code
                    tax_id · currency (optionnel, défaut org) · notes
                    archived_at · created_at · updated_at

products            id · org_id · name · description · unit ('pièce','heure','jour','forfait')
                    unit_price · tax_rate · archived_at · created_at        -- catalogue réutilisable

invoice_counters    org_id · year · last_number · PK(org_id,year)

invoices            id · org_id · client_id
                    number (NULL tant que brouillon, UNIQUE(org_id, number))
                    status (draft|sent|paid|void)
                    issue_date · due_date · currency
                    client_snapshot jsonb · org_snapshot jsonb   -- figés à l'émission
                    discount_type (percent|fixed|null) · discount_value
                    subtotal · discount_total · tax_total · total · amount_paid
                    notes · terms · public_token (uuid, UNIQUE)
                    sent_at · paid_at · voided_at · created_by · created_at · updated_at

invoice_items       id · invoice_id · org_id · position · product_id (nullable)
                    description · quantity numeric(12,3) · unit_price · tax_rate
                    line_subtotal · line_discount · line_tax · line_total

payments            id · invoice_id · org_id · amount · paid_on (date)
                    method (cash|bank_transfer|mobile_money|card|check|other)
                    reference · note · created_by · created_at

invoice_events      id · invoice_id · org_id · type (created|updated|sent|viewed|payment_added|paid|voided|reminder_sent)
                    payload jsonb · actor_id · created_at                 -- historique / timeline
```

### Statut affiché (dérivé, jamais stocké)
Vue `invoices_view` :
- `draft` → **Brouillon**
- `sent` + `amount_paid = 0` + `due_date >= today` → **Envoyée**
- `sent` + `0 < amount_paid < total` → **Partiellement payée**
- `sent` + `due_date < today` (non soldée) → **En retard**
- `paid` → **Payée** · `void` → **Annulée**

« En retard » est calculé à la lecture : aucun cron nécessaire, toujours exact.

### Fonctions Postgres (SECURITY DEFINER, vérification d'appartenance incluse)
- `finalize_invoice(invoice_id)` : verrouille le compteur (`SELECT … FOR UPDATE`), attribue `FAC-2026-0001`, fige les snapshots, passe en `sent`. Atomique → pas de doublon ni de trou.
- `record_payment(invoice_id, amount, …)` : insère le paiement, met à jour `amount_paid`, passe en `paid` si soldée, refuse un dépassement.
- `void_invoice(invoice_id)` : annule (interdit si paiements existants).
- `is_member(org_id)` / `has_role(org_id, role)` : utilisées par toutes les policies RLS.
- Trigger `on_auth_user_created` → crée le `profile`.

### RLS (toutes les tables, sans exception)
- `SELECT/INSERT/UPDATE/DELETE` autorisés si `is_member(org_id)`.
- `invoices`/`invoice_items` : `UPDATE/DELETE` seulement si `status = 'draft'`.
- `organizations` : modification réservée à `owner|admin`.
- Lecture publique d'une facture **uniquement** via route serveur qui vérifie `public_token` (pas de policy `anon` directe).
- Storage : bucket `logos` (public en lecture), écriture limitée au dossier `{org_id}/` pour ses membres.

---

## 4. Logique métier critique

### 4.1 Pays → devise, locale, TVA (`lib/countries.ts`)
Table statique (modifiable par l'utilisateur dans les paramètres) :

| Pays | Devise | TVA par défaut | ID fiscal |
|---|---|---|---|
| Sénégal | XOF | 18 % | NINEA |
| Côte d'Ivoire | XOF | 18 % | NCC |
| Mali, Burkina, Bénin, Togo | XOF | 18 % | NIF / IFU |
| Niger | XOF | 19 % | NIF |
| Guinée | GNF | 18 % | NIF |
| Cameroun | XAF | 19,25 % | NIU |
| Gabon, Congo | XAF | 18 % | NIF |
| RDC | CDF | 16 % | NIF |
| Maroc | MAD | 20 % | ICE / IF |
| Tunisie | TND | 19 % | MF |
| Algérie | DZD | 19 % | NIF |
| Nigeria | NGN | 7,5 % | TIN |
| Ghana | GHS | 15 % (+ prélèvements) | TIN |
| Kenya | KES | 16 % | KRA PIN |
| Rwanda | RWF | 18 % | TIN |
| Madagascar | MGA | 20 % | NIF |
| France | EUR | 20 % | SIRET / TVA |
| Belgique | EUR | 21 % | TVA |
| Canada / USA | CAD / USD | 0 % (taxes régionales, à saisir) | — |

> ⚠️ Les taux sont des **valeurs par défaut pré-remplies**, pas une vérité fiscale : ils changent. L'utilisateur peut toujours les modifier, ligne par ligne. Le cas des prélèvements multiples (Ghana NHIL/GETFund, AIRSI en Côte d'Ivoire) est prévu en V2 via des « taxes additionnelles ».

### 4.2 Calcul d'une facture (`lib/invoice/calculate.ts`, fonction pure, testée à 100 %)
1. `line_subtotal = round(quantity × unit_price)`
2. Remise globale (pourcentage ou montant fixe) **répartie au prorata** des lignes → `line_discount` (le reste d'arrondi va sur la dernière ligne pour que la somme tombe juste).
3. `line_tax = round((line_subtotal − line_discount) × tax_rate / 100)` — arrondi **par ligne** en unités mineures.
4. `subtotal = Σ line_subtotal`, `discount_total = Σ line_discount`, `tax_total = Σ line_tax`, `total = subtotal − discount_total + tax_total`.
5. Arrondi : demi au supérieur. Précision via `Intl.NumberFormat(…, {currency}).resolvedOptions().maximumFractionDigits`.
6. Récap TVA groupé par taux sur la facture (obligatoire dans beaucoup de juridictions).

### 4.3 Formatage (`lib/money.ts`)
- `toMinor("2500.50", "EUR") → 250050`, `fromMinor(…)`, `formatMoney(150000, "XOF", "fr-SN") → "150 000 F CFA"`.
- Saisie : champ montant tolérant (`2 500,50` ou `2500.50`).

### 4.4 Cycle de vie
```
Brouillon ──(Émettre/Envoyer)──► Envoyée ──(paiements)──► Partiellement payée ──► Payée
    │                              │
    └── suppression autorisée      └──(Annuler, si aucun paiement)──► Annulée
```
Actions disponibles : dupliquer (toute facture → nouveau brouillon), télécharger PDF, copier le lien public, envoyer par email, relancer, enregistrer un paiement.

---

## 5. Arborescence du projet

```text
gesfacture/
├─ app/
│  ├─ (marketing)/            page.tsx (landing) · pricing · legal
│  ├─ (auth)/                 login · signup · forgot-password · reset-password
│  ├─ auth/callback/route.ts  échange du code OAuth / magic link
│  ├─ onboarding/             création de l'organisation (nom, pays → devise & TVA)
│  ├─ (app)/                  layout.tsx = sidebar + topbar (protégé)
│  │  ├─ dashboard/
│  │  ├─ invoices/            page (liste) · new · [id] (détail) · [id]/edit
│  │  ├─ clients/             page · new · [id]
│  │  ├─ products/
│  │  ├─ payments/
│  │  ├─ reports/
│  │  └─ settings/            company · invoicing · taxes · profile · security
│  ├─ i/[token]/              vue publique client d'une facture
│  └─ api/invoices/[id]/pdf/route.ts
├─ components/
│  ├─ ui/                     shadcn (button, input, select, dialog, table…)
│  ├─ layout/                 sidebar, topbar, user-menu, theme-toggle
│  ├─ invoices/               invoice-form, line-items, invoice-preview, status-badge, totals
│  ├─ clients/ · dashboard/ · settings/
├─ lib/
│  ├─ money.ts · countries.ts · dates.ts
│  ├─ invoice/calculate.ts · invoice/schema.ts · invoice/status.ts
│  ├─ data/                   repository.ts (interfaces) · mock/ · supabase/
│  ├─ supabase/               client.ts · server.ts · middleware.ts · types.ts (générés)
│  └─ actions/                server actions (invoices, clients, settings…)
├─ supabase/
│  ├─ migrations/             SQL versionné
│  ├─ seed.sql                données de démo
│  └─ tests/                  tests RLS
├─ tests/  unit/ · e2e/
├─ middleware.ts
└─ docs/PLAN.md
```

---

## 6. Pages & fonctionnalités

| Route | Contenu |
|---|---|
| `/dashboard` | 4 cartes KPI (nb factures, montant facturé, encaissé, en attente) + montant en retard, graphique CA/encaissements sur 12 mois, répartition par statut, 5 dernières factures, top clients, filtre de période |
| `/invoices` | Onglets par statut avec compteurs, recherche (n°, client), filtres (dates, montant), tri, pagination, actions rapides par ligne, état vide soigné |
| `/invoices/new` | Mise en page de la capture : formulaire à gauche, **aperçu live** à droite (toggle). Client (sélection + création rapide), dates (échéance auto selon délai par défaut), devise, lignes dynamiques (ajout/suppression/réordonnancement, sélection depuis le catalogue), TVA par ligne, remise globale, notes & conditions. Boutons « Enregistrer brouillon » / « Émettre & envoyer » |
| `/invoices/[id]` | Rendu facture, badge statut, timeline des événements, paiements, actions (PDF, lien, email, paiement, dupliquer, annuler) |
| `/clients` | Liste + recherche, fiche client : coordonnées, total facturé/payé/dû, factures du client |
| `/products` | Catalogue produits/services (nom, prix, unité, TVA) |
| `/payments` | Historique des encaissements, filtre par méthode (Mobile Money, virement, espèces…) |
| `/reports` | CA par mois/client, TVA collectée par période, balance âgée (0-30 / 31-60 / 61-90 / 90+ j), export CSV |
| `/settings` | Entreprise (nom, adresse, logo, IDs fiscaux, couleur), Facturation (préfixe, délai, notes/conditions par défaut, coordonnées bancaires & Mobile Money), Taxes (taux par défaut), Profil, Sécurité (mot de passe) |
| `/i/[token]` | Facture vue par le client final, sans compte : téléchargement PDF, instructions de paiement, événement « vue » enregistré |

Transverse : mode sombre, responsive (sidebar → drawer sur mobile), raccourci `⌘K` recherche (visible dans la capture), squelettes de chargement, `error.tsx`/`not-found.tsx`, toasts, confirmations pour actions destructrices, accessibilité clavier.

---

## 7. Phases d'exécution

Chaque phase se termine par une **démo vérifiable** et des **critères d'acceptation** cochés avant de passer à la suivante.

### Phase 0 — Socle (≈ 0,5 j)
- `create-next-app@14` (TS, Tailwind, ESLint, App Router, `src/` non), Prettier, alias `@/`.
- shadcn/ui init + composants de base, `next-themes`, police Inter.
- Design tokens Tailwind extraits des captures (couleurs, rayons, ombres, espacements).
- `lib/money.ts`, `lib/countries.ts`, `lib/invoice/calculate.ts` **+ leurs tests Vitest** (on écrit le cœur métier avant l'UI).
- Git init, GitHub Actions (lint, typecheck, test).

✅ `npm run build` et `npm test` passent ; calculs testés sur XOF (0 déc.), EUR (2 déc.), remises, multi-taux.

### Phase 1 — UI à partir des captures (≈ 3 j)
- Layout app : sidebar (logo, recherche, menu, aide, paramètres, toggle sombre, carte utilisateur), topbar avec fil d'Ariane.
- Toutes les pages du §6 en composants statiques fidèles au style des captures.
- Écran « Créer une facture » pixel-proche de la capture, avec aperçu à droite.
- Composants partagés : `StatusBadge`, `MoneyInput`, `KpiCard`, `DataTable`, `EmptyState`, `PageHeader`.

✅ Toutes les routes s'affichent, responsive 360 px → 1440 px, clair/sombre, aucune donnée réelle encore.

### Phase 2 — Interactivité avec données locales (≈ 2 j)
- `lib/data/repository.ts` : interfaces `InvoiceRepo`, `ClientRepo`, `ProductRepo`, `SettingsRepo`, `PaymentRepo`.
- Implémentation `mock/` (seed réaliste : entreprise sénégalaise en XOF + une française en EUR, ~15 clients, ~40 factures sur 12 mois) persistée en `localStorage`.
- Formulaire facture complet : `react-hook-form` + `zod`, lignes dynamiques, recalcul live, changement de pays/devise → TVA par défaut.
- CRUD clients/produits, transitions de statut, paiements, dashboard calculé depuis les données, filtres/recherche fonctionnels.

✅ On peut créer un client → une facture → l'émettre → enregistrer un paiement partiel puis total, et voir le dashboard bouger. Toutes les routes et liens fonctionnent.

### Phase 3 — Base de données Supabase + tests (≈ 3 j)
- Supabase CLI, projet local (Docker) + projet distant « dev ».
- Migrations SQL du §3 : tables, index (`org_id`, `status`, `due_date`, `client_id`), contraintes `CHECK` (montants ≥ 0, quantité > 0), vue, fonctions, triggers, RLS, bucket Storage.
- Types TypeScript générés (`supabase gen types`).
- Implémentation `lib/data/supabase/` du repository + **Server Actions** (validation zod, recalcul serveur, `revalidatePath`).
- Upload du logo, génération PDF, lien public `/i/[token]`.
- Tests : unitaires (calculs), intégration (fonctions SQL : numérotation concurrente, paiements), **RLS** (l'utilisateur A ne voit/modifie jamais les données de B, `anon` ne voit rien).

✅ Les mêmes parcours que la phase 2 fonctionnent sur Postgres ; suite de tests RLS verte ; 50 émissions concurrentes → 50 numéros uniques consécutifs.

### Phase 4 — Authentification (≈ 1,5 j)
- Supabase Auth : email + mot de passe, magic link, Google OAuth (optionnel), mot de passe oublié, confirmation email.
- `middleware.ts` (`@supabase/ssr`) : rafraîchit la session, redirige les non-connectés hors de `(app)`, et les connectés hors de `(auth)`.
- Onboarding : création de l'organisation (nom, pays → devise/TVA/locale) + membership `owner`.
- Vérification de session **aussi** dans les Server Actions et route handlers (le middleware ne suffit pas).

✅ Inscription → onboarding → dashboard vide ; déconnexion ; accès direct à `/invoices` sans session → `/login?next=/invoices`.

### Phase 5 — Landing page (≈ 1 j)
- Hero (promesse + capture du produit), bénéfices (multi-devises, TVA par pays, Mobile Money, PDF pro), « comment ça marche » en 3 étapes, aperçu dashboard, tarifs (Gratuit / Pro), FAQ, CTA, footer légal.
- SEO : metadata, Open Graph, `sitemap.xml`, `robots.txt`. Performance Lighthouse ≥ 90.

### Phase 6 — Passage de bout en bout, sécurité, déploiement (≈ 2 j)
- **Sécurité** : audit RLS table par table, clé `service_role` jamais exposée (uniquement serveur, idéalement inutilisée), en-têtes (CSP, HSTS, X-Frame-Options, Referrer-Policy) dans `next.config.js`, validation zod de toute entrée serveur, tokens publics non devinables (UUID v4), limitation de débit sur auth et `/i/[token]`, upload logo limité (type MIME, 2 Mo), `npm audit`.
- **Tests E2E Playwright** : inscription, onboarding, création client, facture multi-lignes avec remise, émission, paiement partiel/total, PDF, lien public, isolation entre deux comptes, déconnexion.
- **Déploiement** : projet Supabase prod (`supabase db push`), variables Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`), URLs de redirection Auth, domaine. Re-jouer la suite E2E contre l'URL de prod.

✅ Prod accessible, E2E verts en prod, aucune alerte critique.

**Total estimé : ≈ 13 jours de travail effectif.**

---

## 8. Backlog V2 (après mise en ligne)
- Factures **récurrentes** (onglet « Recurring » de la capture) via Vercel Cron
- Facturation **fractionnée** / acomptes (onglet « Split »)
- Devis → conversion en facture ; avoirs
- Paiement en ligne : Wave, Orange Money, CinetPay, PayDunya, Flutterwave, Stripe
- Relances automatiques par email / WhatsApp
- Équipe : invitations, rôles
- Taxes additionnelles et retenues à la source
- Multilingue FR / EN (`next-intl`)
- Abonnements SaaS (Stripe / Paystack)

---

## 9. Risques identifiés
| Risque | Parade |
|---|---|
| Erreurs d'arrondi sur les montants | Entiers + fonction pure unique + tests exhaustifs |
| Fuite de données entre clients | RLS partout + tests automatisés d'isolation |
| Numéros de facture en double / manquants | Attribution en transaction verrouillée côté Postgres |
| Taux de TVA obsolètes | Valeurs par défaut éditables, avertissement dans l'UI |
| Next.js 14 n'est plus la dernière version majeure | On épingle la dernière 14.2.x patchée ; migration possible plus tard |
| Connexions lentes | Server Components, peu de JS client, images optimisées |

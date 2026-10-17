# GESFACTURE ⚡

> **Plateforme SaaS de Facturation, Gestion Commerciale & Suivi des Encaissements**  
> Conçue pour les entrepreneurs, indépendants, TPE et PME d'Afrique francophone (UEMOA / CEMAC) et de l'international, dans le respect des normes OHADA.

---

## 🌟 Fonctionnalités Principales

- **Dashboard Financier en Temps Réel** : Indicateurs clés (Total Encaissé, Factures en Attente, Factures en Retard, Nouveaux Clients) calculés dynamiquement sur la base de données.
- **Filtre de Période Interactif** : Sélecteur de date avec calendrier visuel et raccourcis (*Tout, Ce mois, 30 derniers jours, Cette année, Plage personnalisée*).
- **Gestion Complète des Factures (`/invoices`)** : Création, modification, consultation détaillée, changement de statut en un clic (*Payée, Envoyée, Brouillon, En retard*).
- **Moteur d'Export PDF Haute-Fidélité A4** : Téléchargement direct de documents PDF nets et isolés sur votre bureau/ordinateur sans passer par la boîte d'impression.
- **Options d'Impression Papier Dédiées** : Isolation absolue via iframe (aucun élément d'interface ou de modale sur les impressions).
- **Moyens de Paiement Adaptés à l'Afrique** : Prise en charge native de **Wave**, **Orange Money**, **MTN MoMo**, virement bancaire (IBAN) et espèces.
- **Répertoire Clients Synchronisé (`/clients`)** : Gestion du fichier clients, historique de facturation, coordonnées et statuts.
- **Recherche Instantanée en Base de Données** : Barre de recherche globale dans la Topbar avec menu déroulant affichant les correspondances factures et clients en temps réel.
- **Mode Sombre / Mode Clair (Dark / Light)** : Système de design Notion Light / Flat Design pur, sans ombre portée lourde et avec palette neutre.
- **Authentification & Synchronisation Supabase** : Persistance cloud temps réel PostgreSQL avec sécurité au niveau des lignes (RLS).

---

## 🛠️ Stack Technologique

- **Framework** : [Next.js 14](https://nextjs.org/) (App Router, React 18, Server & Client Components)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (Typage statique strict)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/) (Tokens Notion Light, palette neutre pure)
- **Base de Données & Auth** : [Supabase](https://supabase.com/) (PostgreSQL temps réel, Supabase Auth)
- **Génération PDF & Print** : [jsPDF](https://github.com/parallax/jsPDF) & [html2canvas](https://html2canvas.hertzen.com/)
- **Visualisations & Graphiques** : [Recharts](https://recharts.org/)
- **Icônes** : [Lucide React](https://lucide.dev/)

---

## 🚀 Démarrage Rapide

### 1. Cloner le Projet

```bash
git clone https://github.com/Ditinn88/GesFacture.git
cd GesFacture
```

### 2. Installer les Dépendances

```bash
npm install
```

### 3. Configurer les Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet (en vous inspirant de `.env.local.example`) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

### 4. Configurer la Base de Données

Exécutez le script SQL présent dans [`supabase/schema.sql`](./supabase/schema.sql) dans l'éditeur SQL de votre projet Supabase.

### 5. Lancer le Serveur de Développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
├── app/
│   ├── (app)/                       # Routes authentifiées de l'application
│   │   ├── clients/page.tsx         # Répertoire des clients
│   │   ├── dashboard/page.tsx       # Tableau de bord principal & KPIs
│   │   ├── invoices/                # Facturation & cycle de vie
│   │   │   ├── page.tsx             # Liste filtrable et paginée des factures
│   │   │   ├── new/page.tsx         # Création / édition de facture
│   │   │   └── [id]/page.tsx        # Vue détaillée, export PDF & impression
│   │   ├── settings/page.tsx        # Paramètres d'entreprise & coordonnées Wave/OM/IBAN
│   │   └── layout.tsx               # Layout principal (Sidebar, Topbar, DataProvider)
│   ├── globals.css                  # Directives Tailwind & tokens de design
│   ├── layout.tsx                   # RootLayout HTML & Providers
│   └── page.tsx                     # Redirection racine
├── components/
│   ├── dashboard/                   # Composants Dashboard (KPIs, Graphiques, Filtre Date)
│   ├── layout/                      # Sidebar (avec carte profil & déconnexion) et Topbar
│   └── ui/                          # Calendrier Notion, Dropdowns, Badges, Modales
├── lib/
│   ├── auth-context.tsx             # Contexte d'authentification Supabase
│   ├── data-context.tsx             # Contexte de données réelles (CRUD Supabase & cache)
│   ├── print-invoice.ts             # Moteur d'export PDF isolé & impression A4
│   └── utils.ts                     # Formatage FCFA, dates francophones, cn()
└── supabase/
    └── schema.sql                   # Schéma SQL officiel Supabase
```

---

## 📄 Licence

Ce projet est sous licence MIT.

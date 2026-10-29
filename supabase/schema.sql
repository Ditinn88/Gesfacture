CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table Organisation
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY DEFAULT 'default',
  name TEXT NOT NULL DEFAULT 'GESFACTURE',
  legal_name TEXT DEFAULT 'GESFACTURE SAS',
  rccm TEXT DEFAULT 'SN-DKR-2024-B-12845',
  tax_id TEXT DEFAULT 'NINEA 007293842 2V3',
  address TEXT DEFAULT 'Immeuble Tamaro, Avenue Pasteur',
  city TEXT DEFAULT 'Dakar - Plateau',
  country TEXT DEFAULT 'Sénégal',
  phone TEXT DEFAULT '+221 33 821 00 11',
  email TEXT DEFAULT 'contact@gesfacture.sn',
  website TEXT DEFAULT 'https://gesfacture.sn',
  currency TEXT DEFAULT 'XOF',
  invoice_prefix TEXT DEFAULT 'FAC-2026-',
  payment_delay INTEGER DEFAULT 30,
  default_vat_rate NUMERIC DEFAULT 18,
  wave_number TEXT DEFAULT '+221 77 123 45 67',
  om_number TEXT DEFAULT '+221 78 987 65 43',
  iban TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. Table Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT DEFAULT 'Dakar',
  country TEXT DEFAULT 'Sénégal',
  phone TEXT,
  address TEXT,
  total_invoiced NUMERIC DEFAULT 0,
  invoices_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'actif',
  percentage NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. Table Factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL,
  client JSONB NOT NULL,
  issue_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  currency TEXT DEFAULT 'XOF',
  amount NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 18,
  tax_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'brouillon',
  payment_method TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Colonnes ajoutées après la première version (ce script peut être relancé sur une base existante)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'XOF';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_percent NUMERIC DEFAULT 0;

-- Propriétaire de chaque ligne (rempli automatiquement avec l'utilisateur connecté)
-- L'organisation d'un utilisateur a pour id son identifiant de compte.
ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();
ALTER TABLE public.invoices
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients (user_id);
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON public.invoices (user_id);

-- 4. Membres de l'entreprise : le chef d'entreprise (propriétaire du compte) ajoute des membres par email.
-- Un membre qui se connecte avec cet email (confirmé) accède aux données du propriétaire selon son rôle :
--   admin     : tout, y compris les paramètres de l'entreprise
--   comptable : factures, clients et paiements (pas les paramètres)
--   lecteur   : consultation seule
CREATE TABLE IF NOT EXISTS public.organization_members (
  id TEXT PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'comptable',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  CONSTRAINT organization_members_role_check CHECK (role IN ('admin', 'comptable', 'lecteur')),
  CONSTRAINT organization_members_owner_email_key UNIQUE (owner_id, email)
);

CREATE INDEX IF NOT EXISTS organization_members_email_idx ON public.organization_members (email);

-- Rôle de l'utilisateur connecté dans l'espace d'un propriétaire : 'owner', 'admin', 'comptable',
-- 'lecteur', ou NULL s'il n'y a pas accès. Seul un email confirmé donne accès (« Confirm email »
-- doit rester activé). SECURITY DEFINER : lit auth.users et évite la récursion entre politiques RLS.
CREATE OR REPLACE FUNCTION public.workspace_role(p_owner UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN p_owner = auth.uid() THEN 'owner'
    ELSE (
      SELECT m.role
      FROM public.organization_members m
      JOIN auth.users u ON u.id = auth.uid()
      WHERE m.owner_id = p_owner
        AND m.email = lower(u.email)
        AND u.email_confirmed_at IS NOT NULL
      LIMIT 1
    )
  END
$$;

REVOKE ALL ON FUNCTION public.workspace_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.workspace_role(UUID) TO authenticated;

-- 5. Sécurité RLS : chaque utilisateur accède à ses propres lignes et à celles des espaces dont il est membre
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Anciennes politiques : toutes supprimées, quel que soit leur nom (une première version a pu en créer
-- d'autres, ouvertes à tous, qui s'ajouteraient aux règles ci-dessous), puis recréées
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT policyname, tablename FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('organizations', 'clients', 'invoices', 'organization_members')
  LOOP
    EXECUTE format('DROP POLICY %I ON public.%I', p.policyname, p.tablename);
  END LOOP;
END $$;

DROP POLICY IF EXISTS "public_org" ON public.organizations;
DROP POLICY IF EXISTS "public_clients" ON public.clients;
DROP POLICY IF EXISTS "public_invoices" ON public.invoices;
DROP POLICY IF EXISTS "own_org" ON public.organizations;
DROP POLICY IF EXISTS "own_clients" ON public.clients;
DROP POLICY IF EXISTS "own_invoices" ON public.invoices;

-- Organisation : lecture pour tout l'espace, modification par le propriétaire et les administrateurs
DROP POLICY IF EXISTS "workspace_org_select" ON public.organizations;
CREATE POLICY "workspace_org_select" ON public.organizations FOR SELECT TO authenticated
  USING (public.workspace_role(user_id) IS NOT NULL);
DROP POLICY IF EXISTS "workspace_org_insert" ON public.organizations;
CREATE POLICY "workspace_org_insert" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin'));
DROP POLICY IF EXISTS "workspace_org_update" ON public.organizations;
CREATE POLICY "workspace_org_update" ON public.organizations FOR UPDATE TO authenticated
  USING (public.workspace_role(user_id) IN ('owner', 'admin'))
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin'));
DROP POLICY IF EXISTS "workspace_org_delete" ON public.organizations;
CREATE POLICY "workspace_org_delete" ON public.organizations FOR DELETE TO authenticated
  USING (public.workspace_role(user_id) = 'owner');

-- Clients et factures : lecture pour tout l'espace, écriture pour tous sauf les lecteurs
DROP POLICY IF EXISTS "workspace_clients_select" ON public.clients;
CREATE POLICY "workspace_clients_select" ON public.clients FOR SELECT TO authenticated
  USING (public.workspace_role(user_id) IS NOT NULL);
DROP POLICY IF EXISTS "workspace_clients_insert" ON public.clients;
CREATE POLICY "workspace_clients_insert" ON public.clients FOR INSERT TO authenticated
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));
DROP POLICY IF EXISTS "workspace_clients_update" ON public.clients;
CREATE POLICY "workspace_clients_update" ON public.clients FOR UPDATE TO authenticated
  USING (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'))
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));
DROP POLICY IF EXISTS "workspace_clients_delete" ON public.clients;
CREATE POLICY "workspace_clients_delete" ON public.clients FOR DELETE TO authenticated
  USING (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));

DROP POLICY IF EXISTS "workspace_invoices_select" ON public.invoices;
CREATE POLICY "workspace_invoices_select" ON public.invoices FOR SELECT TO authenticated
  USING (public.workspace_role(user_id) IS NOT NULL);
DROP POLICY IF EXISTS "workspace_invoices_insert" ON public.invoices;
CREATE POLICY "workspace_invoices_insert" ON public.invoices FOR INSERT TO authenticated
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));
DROP POLICY IF EXISTS "workspace_invoices_update" ON public.invoices;
CREATE POLICY "workspace_invoices_update" ON public.invoices FOR UPDATE TO authenticated
  USING (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'))
  WITH CHECK (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));
DROP POLICY IF EXISTS "workspace_invoices_delete" ON public.invoices;
CREATE POLICY "workspace_invoices_delete" ON public.invoices FOR DELETE TO authenticated
  USING (public.workspace_role(user_id) IN ('owner', 'admin', 'comptable'));

-- Membres : visibles par tout l'espace, gérés par le seul propriétaire
DROP POLICY IF EXISTS "workspace_members_select" ON public.organization_members;
CREATE POLICY "workspace_members_select" ON public.organization_members FOR SELECT TO authenticated
  USING (public.workspace_role(owner_id) IS NOT NULL);
DROP POLICY IF EXISTS "owner_members_write" ON public.organization_members;
CREATE POLICY "owner_members_write" ON public.organization_members FOR ALL TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- Temps réel : les 4 tables diffusent leurs changements (les règles RLS filtrent ce que chacun reçoit)
DO $$
DECLARE
  t TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime' AND NOT puballtables) THEN
    FOREACH t IN ARRAY ARRAY['organizations', 'clients', 'invoices', 'organization_members'] LOOP
      IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
      ) THEN
        EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
      END IF;
    END LOOP;
  END IF;
END $$;

-- Base existante : les lignes créées avant ces règles (user_id NULL) sont invisibles.
-- Pour les rattacher à votre compte, remplacez l'email puis exécutez ce bloc séparément :
--
-- UPDATE public.clients  SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com') WHERE user_id IS NULL;
-- UPDATE public.invoices SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com') WHERE user_id IS NULL;
-- UPDATE public.organizations
--   SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com'),
--       id      = (SELECT id::text FROM auth.users WHERE email = 'votre@email.com')
--   WHERE id = 'default' AND user_id IS NULL;

-- 6. Vérification des emails : chaque inscrit confirme son adresse via le lien reçu.
-- Une ancienne version confirmait automatiquement tous les comptes (n'importe qui pouvait
-- s'inscrire avec l'email d'un autre) : on retire ce déclencheur.
-- Côté Supabase : Authentication > Providers > Email > « Confirm email » activé, et l'URL du site
-- (ex. https://votre-domaine/login) ajoutée dans Authentication > URL Configuration > Redirect URLs.
-- Supabase n'autorise plus à modifier auth.users depuis l'éditeur SQL (« must be owner of relation users ») :
-- on ne touche à la table que si le déclencheur existe, et une erreur de droits n'annule pas le reste du script.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created' AND tgrelid = 'auth.users'::regclass
  ) THEN
    BEGIN
      DROP TRIGGER on_auth_user_created ON auth.users;
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'Déclencheur on_auth_user_created non supprimé (droits insuffisants) : supprimez-le depuis Database > Triggers.';
    END;
  END IF;
END $$;
DO $$
BEGIN
  DROP FUNCTION IF EXISTS public.handle_auto_confirm_user() CASCADE;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Fonction handle_auto_confirm_user non supprimée : %', SQLERRM;
END $$;


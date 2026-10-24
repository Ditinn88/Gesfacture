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
  amount NUMERIC NOT NULL DEFAULT 0,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 18,
  tax_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'brouillon',
  payment_method TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  currency TEXT DEFAULT 'XOF',
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

-- 4. Sécurité RLS : chaque utilisateur connecté n'accède qu'à ses propres lignes
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Anciennes politiques ouvertes à tous (supprimées)
DROP POLICY IF EXISTS "public_org" ON public.organizations;
DROP POLICY IF EXISTS "public_clients" ON public.clients;
DROP POLICY IF EXISTS "public_invoices" ON public.invoices;

DROP POLICY IF EXISTS "own_org" ON public.organizations;
CREATE POLICY "own_org" ON public.organizations FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "own_clients" ON public.clients;
CREATE POLICY "own_clients" ON public.clients FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "own_invoices" ON public.invoices;
CREATE POLICY "own_invoices" ON public.invoices FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Base existante : les lignes créées avant ces règles (user_id NULL) sont invisibles.
-- Pour les rattacher à votre compte, remplacez l'email puis exécutez ce bloc séparément :
--
-- UPDATE public.clients  SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com') WHERE user_id IS NULL;
-- UPDATE public.invoices SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com') WHERE user_id IS NULL;
-- UPDATE public.organizations
--   SET user_id = (SELECT id FROM auth.users WHERE email = 'votre@email.com'),
--       id      = (SELECT id::text FROM auth.users WHERE email = 'votre@email.com')
--   WHERE id = 'default' AND user_id IS NULL;

-- 5. Auto-confirmation automatique des inscriptions (Supprime le blocage "Email not confirmed")
-- Ce trigger valide instantanément l'adresse email des nouveaux inscrits dans auth.users
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auto_confirm_user();

-- Valider immédiatement tous les comptes déjà créés en attente de confirmation
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;


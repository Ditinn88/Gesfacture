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
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. Sécurité RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_org" ON public.organizations;
CREATE POLICY "public_org" ON public.organizations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_clients" ON public.clients;
CREATE POLICY "public_clients" ON public.clients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "public_invoices" ON public.invoices;
CREATE POLICY "public_invoices" ON public.invoices FOR ALL USING (true) WITH CHECK (true);

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


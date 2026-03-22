-- ============================================
-- Migration: Add updated_at to existing tables,
-- create bills/debts/contributions/insurance_policies,
-- add progress columns to profiles.
-- Generated 2026-03-23
-- ============================================

-- ============================================
-- 1. Shared trigger function: auto-set updated_at
-- ============================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


-- ============================================
-- 2. Add updated_at to existing tables
-- ============================================

-- transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_transactions ON public.transactions;
CREATE TRIGGER set_updated_at_transactions
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- accounts
ALTER TABLE public.accounts
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_accounts ON public.accounts;
CREATE TRIGGER set_updated_at_accounts
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- budgets
ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_budgets ON public.budgets;
CREATE TRIGGER set_updated_at_budgets
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- goals
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS set_updated_at_goals ON public.goals;
CREATE TRIGGER set_updated_at_goals
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 3. Contributions table
-- ============================================

CREATE TABLE IF NOT EXISTS public.contributions (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type                text NOT NULL,
  period              text NOT NULL,
  monthly_salary      numeric(12, 2) NOT NULL,
  employee_share      numeric(12, 2) NOT NULL,
  employer_share      numeric(12, 2),
  total_contribution  numeric(12, 2) NOT NULL,
  is_paid             boolean DEFAULT false NOT NULL,
  employment_type     text NOT NULL DEFAULT 'employed',
  notes               text,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contributions_user_id ON public.contributions USING btree (user_id);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can insert own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can update own contributions" ON public.contributions;
DROP POLICY IF EXISTS "Users can delete own contributions" ON public.contributions;

CREATE POLICY "Users can view own contributions"
  ON public.contributions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own contributions"
  ON public.contributions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own contributions"
  ON public.contributions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own contributions"
  ON public.contributions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_updated_at_contributions ON public.contributions;
CREATE TRIGGER set_updated_at_contributions
  BEFORE UPDATE ON public.contributions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 4. Bills table
-- ============================================

CREATE TABLE IF NOT EXISTS public.bills (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  category        text NOT NULL,
  amount          numeric(12, 2) NOT NULL,
  billing_cycle   text NOT NULL DEFAULT 'monthly',
  due_day         integer,
  provider        text,
  last_paid_date  date,
  is_active       boolean DEFAULT true NOT NULL,
  notes           text,
  account_id      uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now() NOT NULL,
  updated_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills USING btree (user_id);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can insert own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete own bills" ON public.bills;

CREATE POLICY "Users can view own bills"
  ON public.bills FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own bills"
  ON public.bills FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own bills"
  ON public.bills FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own bills"
  ON public.bills FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_updated_at_bills ON public.bills;
CREATE TRIGGER set_updated_at_bills
  BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 5. Debts table
-- ============================================

CREATE TABLE IF NOT EXISTS public.debts (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name             text NOT NULL,
  type             text NOT NULL,
  lender           text,
  current_balance  numeric(12, 2) NOT NULL,
  original_amount  numeric(12, 2) NOT NULL,
  interest_rate    numeric(6, 4) NOT NULL,
  minimum_payment  numeric(12, 2) NOT NULL,
  due_day          integer,
  is_paid_off      boolean DEFAULT false NOT NULL,
  notes            text,
  account_id       uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_debts_user_id ON public.debts USING btree (user_id);

ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can insert own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can update own debts" ON public.debts;
DROP POLICY IF EXISTS "Users can delete own debts" ON public.debts;

CREATE POLICY "Users can view own debts"
  ON public.debts FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own debts"
  ON public.debts FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own debts"
  ON public.debts FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own debts"
  ON public.debts FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_updated_at_debts ON public.debts;
CREATE TRIGGER set_updated_at_debts
  BEFORE UPDATE ON public.debts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 6. Insurance Policies table
--    (sync_service maps local_insurance -> insurance_policies)
-- ============================================

CREATE TABLE IF NOT EXISTS public.insurance_policies (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                text NOT NULL,
  type                text NOT NULL,
  provider            text,
  policy_number       text,
  premium_amount      numeric(12, 2) NOT NULL,
  premium_frequency   text NOT NULL DEFAULT 'monthly',
  coverage_amount     numeric(12, 2),
  renewal_date        date,
  is_active           boolean DEFAULT true NOT NULL,
  notes               text,
  account_id          uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_insurance_policies_user_id ON public.insurance_policies USING btree (user_id);

ALTER TABLE public.insurance_policies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can insert own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can update own insurance policies" ON public.insurance_policies;
DROP POLICY IF EXISTS "Users can delete own insurance policies" ON public.insurance_policies;

CREATE POLICY "Users can view own insurance policies"
  ON public.insurance_policies FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own insurance policies"
  ON public.insurance_policies FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own insurance policies"
  ON public.insurance_policies FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own insurance policies"
  ON public.insurance_policies FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_updated_at_insurance_policies ON public.insurance_policies;
CREATE TRIGGER set_updated_at_insurance_policies
  BEFORE UPDATE ON public.insurance_policies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 6b. Investments table
-- ============================================

CREATE TABLE IF NOT EXISTS public.investments (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name                text NOT NULL,
  type                text NOT NULL,
  amount_invested     numeric(12, 2) NOT NULL DEFAULT 0,
  current_value       numeric(12, 2) NOT NULL DEFAULT 0,
  account_id          uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  date_started        date NOT NULL,
  notes               text,
  navpu               text,
  units               numeric(12, 4),
  interest_rate       numeric(6, 4),
  maturity_date       date,
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments USING btree (user_id);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can insert own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can update own investments" ON public.investments;
DROP POLICY IF EXISTS "Users can delete own investments" ON public.investments;

CREATE POLICY "Users can view own investments"
  ON public.investments FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own investments"
  ON public.investments FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own investments"
  ON public.investments FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own investments"
  ON public.investments FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP TRIGGER IF EXISTS set_updated_at_investments ON public.investments;
CREATE TRIGGER set_updated_at_investments
  BEFORE UPDATE ON public.investments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================
-- 7. Transactions tags note
--    transactions.tags is already text[] (array) in schema.sql.
--    The sync service encodes/decodes between JSON string (SQLite)
--    and text[] (Postgres) automatically — no change needed.
-- ============================================


-- ============================================
-- 8. Add progress-tracking columns to profiles
-- ============================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS checklist_done jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS checklist_skipped jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS guides_read jsonb DEFAULT '[]'::jsonb;


-- ============================================
-- 9. Backfill updated_at for existing rows
--    (set to created_at so we don't clobber real timestamps)
-- ============================================

UPDATE public.transactions SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.accounts     SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.budgets      SET updated_at = created_at WHERE updated_at IS NULL;
UPDATE public.goals        SET updated_at = created_at WHERE updated_at IS NULL;

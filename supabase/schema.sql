-- ============================================
-- ExitPlan: Financial Freedom Tracker
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. Create the transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount          numeric(12, 2) NOT NULL,
  category        text NOT NULL,
  description     text NOT NULL,
  date            date NOT NULL,
  currency        text DEFAULT 'PHP' NOT NULL,
  attachment_path text,
  account_id      uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  transfer_id     uuid,
  tags            text[] DEFAULT '{}'
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON public.transactions USING btree (date DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies — users can only access their own transactions

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Goals table
-- ============================================

CREATE TABLE IF NOT EXISTS public.goals (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at      timestamptz DEFAULT now() NOT NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name            text NOT NULL,
  target_amount   numeric(12, 2) NOT NULL,
  current_amount  numeric(12, 2) DEFAULT 0 NOT NULL,
  deadline        date,
  category        text NOT NULL,
  is_completed    boolean DEFAULT false NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals USING btree (user_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Profiles table (for admin role tracking)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                          uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email                       text,
  full_name                   text,
  primary_currency            text DEFAULT 'PHP' NOT NULL,
  has_completed_onboarding    boolean DEFAULT false NOT NULL,
  role                        text DEFAULT 'user' NOT NULL CHECK (role IN ('user', 'admin')),
  created_at                  timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

-- Prevent authenticated users from self-escalating protected fields.
-- Service-role operations (for trusted server actions) are still allowed.
CREATE OR REPLACE FUNCTION public.prevent_protected_profile_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  jwt_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  IF jwt_role IS DISTINCT FROM 'service_role' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Updating role is not allowed';
    END IF;

    IF NEW.has_completed_onboarding IS DISTINCT FROM OLD.has_completed_onboarding THEN
      RAISE EXCEPTION 'Updating onboarding state is not allowed';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_fields_before_update ON public.profiles;

CREATE TRIGGER protect_profile_fields_before_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_protected_profile_updates();

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- Budgets table
-- ============================================

CREATE TABLE IF NOT EXISTS public.budgets (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category    text NOT NULL,
  amount      numeric(12, 2) NOT NULL,
  month       date NOT NULL -- first day of the month (e.g. 2026-02-01)
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON public.budgets USING btree (month);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets"
  ON public.budgets FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own budgets"
  ON public.budgets FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own budgets"
  ON public.budgets FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own budgets"
  ON public.budgets FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Accounts table
-- ============================================

CREATE TABLE IF NOT EXISTS public.accounts (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        text NOT NULL,
  type        text NOT NULL CHECK (type IN ('cash', 'bank', 'e-wallet', 'credit-card')),
  currency    text DEFAULT 'PHP' NOT NULL,
  balance     numeric(12, 2) DEFAULT 0 NOT NULL,
  is_archived boolean DEFAULT false NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts USING btree (user_id);

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own accounts"
  ON public.accounts FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own accounts"
  ON public.accounts FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Atomic transfer function
-- ============================================

CREATE OR REPLACE FUNCTION public.create_account_transfer(
  from_account_id uuid,
  to_account_id uuid,
  transfer_amount numeric,
  transfer_date date,
  transfer_description text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  from_balance numeric(12, 2);
  to_balance numeric(12, 2);
  from_archived boolean;
  to_archived boolean;
  transfer_uuid uuid := gen_random_uuid();
  normalized_amount numeric(12, 2) := ROUND(ABS(transfer_amount)::numeric, 2);
  normalized_description text := COALESCE(NULLIF(BTRIM(transfer_description), ''), 'Transfer');
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF from_account_id IS NULL OR to_account_id IS NULL THEN
    RAISE EXCEPTION 'Both accounts are required';
  END IF;

  IF from_account_id = to_account_id THEN
    RAISE EXCEPTION 'Source and destination accounts must be different';
  END IF;

  IF normalized_amount <= 0 THEN
    RAISE EXCEPTION 'Transfer amount must be greater than zero';
  END IF;

  SELECT balance, is_archived
    INTO from_balance, from_archived
  FROM public.accounts
  WHERE id = from_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF from_balance IS NULL THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  SELECT balance, is_archived
    INTO to_balance, to_archived
  FROM public.accounts
  WHERE id = to_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF to_balance IS NULL THEN
    RAISE EXCEPTION 'Destination account not found';
  END IF;

  IF from_archived OR to_archived THEN
    RAISE EXCEPTION 'Archived accounts cannot be used for transfers';
  END IF;

  IF from_balance < normalized_amount THEN
    RAISE EXCEPTION 'Insufficient balance in source account';
  END IF;

  UPDATE public.accounts
  SET balance = ROUND((balance - normalized_amount)::numeric, 2)
  WHERE id = from_account_id;

  UPDATE public.accounts
  SET balance = ROUND((balance + normalized_amount)::numeric, 2)
  WHERE id = to_account_id;

  INSERT INTO public.transactions (
    user_id,
    amount,
    category,
    description,
    date,
    currency,
    account_id,
    transfer_id
  )
  VALUES
    (
      current_user_id,
      -normalized_amount,
      'transfer',
      normalized_description,
      transfer_date,
      'PHP',
      from_account_id,
      transfer_uuid
    ),
    (
      current_user_id,
      normalized_amount,
      'transfer',
      normalized_description,
      transfer_date,
      'PHP',
      to_account_id,
      transfer_uuid
    );

  RETURN transfer_uuid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_account_transfer(uuid, uuid, numeric, date, text) TO authenticated;


-- ============================================
-- Exchange Rates table (user-defined rates)
-- ============================================

CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_currency text NOT NULL,
  to_currency   text NOT NULL,
  rate          numeric(12, 6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_user_id ON public.exchange_rates USING btree (user_id);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exchange rates"
  ON public.exchange_rates FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own exchange rates"
  ON public.exchange_rates FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own exchange rates"
  ON public.exchange_rates FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own exchange rates"
  ON public.exchange_rates FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Market Rates table (global reference rates)
-- ============================================

CREATE TABLE IF NOT EXISTS public.market_rates (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at  timestamptz DEFAULT now() NOT NULL,
  updated_at  timestamptz DEFAULT now() NOT NULL,
  currency    text NOT NULL UNIQUE,
  rate_to_php numeric(12, 6) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_market_rates_currency ON public.market_rates USING btree (currency);

ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view market rates (no user_id column)
CREATE POLICY "Authenticated users can view market rates"
  ON public.market_rates FOR SELECT TO authenticated
  USING (true);

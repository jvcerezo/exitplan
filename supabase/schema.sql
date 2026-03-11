-- ============================================
-- ExitPlan: Financial Freedom Tracker
-- Run this in the Supabase SQL Editor
-- ============================================

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

DROP POLICY IF EXISTS "Users can view own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can insert own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON public.accounts;

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'transactions_amount_nonzero'
  ) THEN
    ALTER TABLE public.transactions
      ADD CONSTRAINT transactions_amount_nonzero CHECK (amount <> 0) NOT VALID;
  END IF;
END $$;

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date    ON public.transactions USING btree (date DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

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
-- Atomic transaction write functions
-- ============================================

CREATE OR REPLACE FUNCTION public.create_user_transaction(
  p_amount numeric,
  p_category text,
  p_description text,
  p_date date,
  p_currency text DEFAULT 'PHP',
  p_account_id uuid DEFAULT NULL,
  p_transfer_id uuid DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_attachment_path text DEFAULT NULL
)
RETURNS public.transactions
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  account_balance numeric(12, 2);
  inserted_row public.transactions;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_account_id IS NULL THEN
    RAISE EXCEPTION 'Account is required for income and expense transactions';
  END IF;

  SELECT balance
    INTO account_balance
  FROM public.accounts
  WHERE id = p_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF account_balance IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  UPDATE public.accounts
  SET balance = ROUND((balance + p_amount)::numeric, 2)
  WHERE id = p_account_id;

  INSERT INTO public.transactions (
    user_id,
    amount,
    category,
    description,
    date,
    currency,
    attachment_path,
    account_id,
    transfer_id,
    tags
  )
  VALUES (
    current_user_id,
    ROUND(p_amount::numeric, 2),
    p_category,
    p_description,
    p_date,
    COALESCE(NULLIF(BTRIM(p_currency), ''), 'PHP'),
    NULLIF(BTRIM(p_attachment_path), ''),
    p_account_id,
    p_transfer_id,
    p_tags
  )
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_user_transaction(numeric, text, text, date, text, uuid, uuid, text[], text) TO authenticated;


CREATE OR REPLACE FUNCTION public.import_transactions_with_balance(
  p_transactions jsonb
)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  tx jsonb;
  tx_amount numeric(12, 2);
  tx_category text;
  tx_description text;
  tx_date date;
  tx_currency text;
  tx_account_id uuid;
  tx_transfer_id uuid;
  tx_attachment_path text;
  tx_tags text[];
  account_balance numeric(12, 2);
  inserted_count integer := 0;
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_transactions IS NULL OR jsonb_typeof(p_transactions) <> 'array' THEN
    RAISE EXCEPTION 'Transactions payload must be an array';
  END IF;

  FOR tx IN SELECT * FROM jsonb_array_elements(p_transactions)
  LOOP
    tx_amount := ROUND(COALESCE((tx->>'amount')::numeric, 0)::numeric, 2);
    tx_category := COALESCE(NULLIF(BTRIM(tx->>'category'), ''), 'other');
    tx_description := COALESCE(NULLIF(BTRIM(tx->>'description'), ''), tx_category);
    tx_date := COALESCE((tx->>'date')::date, CURRENT_DATE);
    tx_currency := COALESCE(NULLIF(BTRIM(tx->>'currency'), ''), 'PHP');
    tx_account_id := NULLIF(BTRIM(tx->>'account_id'), '')::uuid;
    tx_transfer_id := NULLIF(BTRIM(tx->>'transfer_id'), '')::uuid;
    tx_attachment_path := NULLIF(BTRIM(tx->>'attachment_path'), '');

    tx_tags := ARRAY(
      SELECT jsonb_array_elements_text(COALESCE(tx->'tags', '[]'::jsonb))
    );

    IF tx_account_id IS NOT NULL THEN
      SELECT balance
        INTO account_balance
      FROM public.accounts
      WHERE id = tx_account_id
        AND user_id = current_user_id
      FOR UPDATE;

      IF account_balance IS NULL THEN
        RAISE EXCEPTION 'Account not found for imported transaction';
      END IF;

      UPDATE public.accounts
      SET balance = ROUND((balance + tx_amount)::numeric, 2)
      WHERE id = tx_account_id;
    END IF;

    INSERT INTO public.transactions (
      user_id,
      amount,
      category,
      description,
      date,
      currency,
      attachment_path,
      account_id,
      transfer_id,
      tags
    )
    VALUES (
      current_user_id,
      tx_amount,
      tx_category,
      tx_description,
      tx_date,
      tx_currency,
      tx_attachment_path,
      tx_account_id,
      tx_transfer_id,
      tx_tags
    );

    inserted_count := inserted_count + 1;
  END LOOP;

  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_transactions_with_balance(jsonb) TO authenticated;


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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goals_target_amount_positive'
  ) THEN
    ALTER TABLE public.goals
      ADD CONSTRAINT goals_target_amount_positive CHECK (target_amount > 0) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goals_current_amount_nonnegative'
  ) THEN
    ALTER TABLE public.goals
      ADD CONSTRAINT goals_current_amount_nonnegative CHECK (current_amount >= 0) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON public.goals USING btree (user_id);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can insert own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can update own goals" ON public.goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON public.goals;

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
-- Goal Funding ledger (audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.goal_fundings (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz DEFAULT now() NOT NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_id       uuid REFERENCES public.goals(id) ON DELETE CASCADE NOT NULL,
  account_id    uuid REFERENCES public.accounts(id) ON DELETE CASCADE NOT NULL,
  amount        numeric(12, 2) NOT NULL,
  note          text,
  funding_date  date NOT NULL
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'goal_fundings_amount_positive'
  ) THEN
    ALTER TABLE public.goal_fundings
      ADD CONSTRAINT goal_fundings_amount_positive CHECK (amount > 0) NOT VALID;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_goal_fundings_user_id ON public.goal_fundings USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_goal_fundings_goal_id ON public.goal_fundings USING btree (goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_fundings_account_id ON public.goal_fundings USING btree (account_id);

ALTER TABLE public.goal_fundings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own goal fundings" ON public.goal_fundings;
DROP POLICY IF EXISTS "Users can insert own goal fundings" ON public.goal_fundings;
DROP POLICY IF EXISTS "Users can update own goal fundings" ON public.goal_fundings;
DROP POLICY IF EXISTS "Users can delete own goal fundings" ON public.goal_fundings;

CREATE POLICY "Users can view own goal fundings"
  ON public.goal_fundings FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own goal fundings"
  ON public.goal_fundings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own goal fundings"
  ON public.goal_fundings FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own goal fundings"
  ON public.goal_fundings FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Atomic goal funding function
-- ============================================

CREATE OR REPLACE FUNCTION public.add_funds_to_goal(
  p_goal_id uuid,
  p_account_id uuid,
  p_amount numeric,
  p_note text DEFAULT NULL,
  p_funding_date date DEFAULT CURRENT_DATE
)
RETURNS uuid
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
  account_balance numeric(12, 2);
  goal_current_amount numeric(12, 2);
  goal_target_amount numeric(12, 2);
  normalized_amount numeric(12, 2) := ROUND(ABS(p_amount)::numeric, 2);
  new_goal_amount numeric(12, 2);
  funding_id uuid := gen_random_uuid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_goal_id IS NULL OR p_account_id IS NULL THEN
    RAISE EXCEPTION 'Goal and account are required';
  END IF;

  IF normalized_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be greater than zero';
  END IF;

  SELECT balance
    INTO account_balance
  FROM public.accounts
  WHERE id = p_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF account_balance IS NULL THEN
    RAISE EXCEPTION 'Account not found';
  END IF;

  IF account_balance < normalized_amount THEN
    RAISE EXCEPTION 'Insufficient account balance';
  END IF;

  SELECT current_amount, target_amount
    INTO goal_current_amount, goal_target_amount
  FROM public.goals
  WHERE id = p_goal_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF goal_current_amount IS NULL THEN
    RAISE EXCEPTION 'Goal not found';
  END IF;

  new_goal_amount := ROUND((goal_current_amount + normalized_amount)::numeric, 2);

  UPDATE public.accounts
  SET balance = ROUND((balance - normalized_amount)::numeric, 2)
  WHERE id = p_account_id;

  UPDATE public.goals
  SET
    current_amount = new_goal_amount,
    is_completed = new_goal_amount >= goal_target_amount
  WHERE id = p_goal_id;

  INSERT INTO public.goal_fundings (
    id,
    user_id,
    goal_id,
    account_id,
    amount,
    note,
    funding_date
  ) VALUES (
    funding_id,
    current_user_id,
    p_goal_id,
    p_account_id,
    normalized_amount,
    NULLIF(BTRIM(p_note), ''),
    COALESCE(p_funding_date, CURRENT_DATE)
  );

  RETURN funding_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_funds_to_goal(uuid, uuid, numeric, text, date) TO authenticated;


-- ============================================
-- Admin registry
-- ============================================

CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id      uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at   timestamptz DEFAULT now() NOT NULL,
  granted_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note         text
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin_user(p_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE user_id = p_user_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;


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
  created_at                  timestamptz DEFAULT now() NOT NULL,
  avatar_url                  text
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

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
  -- Only block direct role escalation from non-service-role callers.
  -- has_completed_onboarding is managed exclusively via complete_onboarding() RPC.
  IF jwt_role IS DISTINCT FROM 'service_role' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Updating role is not allowed';
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
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
  month       date NOT NULL, -- first day of the period (week, month, or quarter)
  period      text NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly')),
  rollover    boolean DEFAULT false NOT NULL
);

ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS rollover boolean DEFAULT false NOT NULL;

ALTER TABLE public.budgets
  ADD COLUMN IF NOT EXISTS period text NOT NULL DEFAULT 'monthly'
  CHECK (period IN ('weekly', 'monthly', 'quarterly'));

-- Re-create the unique index to be period-scoped
DROP INDEX IF EXISTS idx_budgets_user_month_category_unique;

-- Replace the old monthly-only constraint with a period-aware start-date rule.
ALTER TABLE public.budgets
  DROP CONSTRAINT IF EXISTS budgets_month_is_first_day;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_amount_positive'
  ) THEN
    ALTER TABLE public.budgets
      ADD CONSTRAINT budgets_amount_positive CHECK (amount > 0) NOT VALID;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'budgets_period_start_valid'
  ) THEN
    ALTER TABLE public.budgets
      ADD CONSTRAINT budgets_period_start_valid CHECK (
        (period = 'monthly' AND month = date_trunc('month', month)::date)
        OR (period = 'quarterly' AND month = date_trunc('quarter', month)::date)
        OR (period = 'weekly' AND EXTRACT(DOW FROM month) = 0)
      ) NOT VALID;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_user_period_month_category_unique
  ON public.budgets (user_id, period, month, category);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month ON public.budgets USING btree (month);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

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

  SELECT balance
    INTO from_balance
  FROM public.accounts
  WHERE id = from_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF from_balance IS NULL THEN
    RAISE EXCEPTION 'Source account not found';
  END IF;

  SELECT balance
    INTO to_balance
  FROM public.accounts
  WHERE id = to_account_id
    AND user_id = current_user_id
  FOR UPDATE;

  IF to_balance IS NULL THEN
    RAISE EXCEPTION 'Destination account not found';
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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'exchange_rates_rate_positive'
  ) THEN
    ALTER TABLE public.exchange_rates
      ADD CONSTRAINT exchange_rates_rate_positive CHECK (rate > 0) NOT VALID;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_exchange_rates_user_pair_unique
  ON public.exchange_rates (user_id, from_currency, to_currency);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_user_id ON public.exchange_rates USING btree (user_id);

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Users can insert own exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Users can update own exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Users can delete own exchange rates" ON public.exchange_rates;

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'market_rates_rate_positive'
  ) THEN
    ALTER TABLE public.market_rates
      ADD CONSTRAINT market_rates_rate_positive CHECK (rate_to_php > 0) NOT VALID;
  END IF;
END $$;


-- ============================================
-- Cross-table ownership guardrails
-- ============================================

CREATE OR REPLACE FUNCTION public.validate_transaction_relationships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  account_owner uuid;
BEGIN
  IF NEW.account_id IS NOT NULL THEN
    SELECT user_id INTO account_owner
    FROM public.accounts
    WHERE id = NEW.account_id;

    IF account_owner IS NULL THEN
      RAISE EXCEPTION 'Referenced account does not exist';
    END IF;

    IF account_owner IS DISTINCT FROM NEW.user_id THEN
      RAISE EXCEPTION 'Transaction account must belong to the same user';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_transaction_relationships_before_write ON public.transactions;

CREATE TRIGGER validate_transaction_relationships_before_write
  BEFORE INSERT OR UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_transaction_relationships();


CREATE OR REPLACE FUNCTION public.validate_goal_funding_relationships()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  account_owner uuid;
  goal_owner uuid;
BEGIN
  SELECT user_id INTO account_owner
  FROM public.accounts
  WHERE id = NEW.account_id;

  IF account_owner IS NULL THEN
    RAISE EXCEPTION 'Referenced funding account does not exist';
  END IF;

  SELECT user_id INTO goal_owner
  FROM public.goals
  WHERE id = NEW.goal_id;

  IF goal_owner IS NULL THEN
    RAISE EXCEPTION 'Referenced goal does not exist';
  END IF;

  IF account_owner IS DISTINCT FROM NEW.user_id OR goal_owner IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Goal funding references must belong to the same user';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_goal_funding_relationships_before_write ON public.goal_fundings;

CREATE TRIGGER validate_goal_funding_relationships_before_write
  BEFORE INSERT OR UPDATE ON public.goal_fundings
  FOR EACH ROW EXECUTE FUNCTION public.validate_goal_funding_relationships();

CREATE INDEX IF NOT EXISTS idx_market_rates_currency ON public.market_rates USING btree (currency);

ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view market rates" ON public.market_rates;

-- Anyone authenticated can view market rates (no user_id column)
CREATE POLICY "Authenticated users can view market rates"
  ON public.market_rates FOR SELECT TO authenticated
  USING (true);


-- ============================================
-- Complete onboarding (bypasses trigger guard)
-- ============================================

CREATE OR REPLACE FUNCTION public.complete_onboarding()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid := auth.uid();
BEGIN
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.profiles
  SET has_completed_onboarding = true
  WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_onboarding() TO authenticated;


-- ============================================
-- Avatars storage bucket
-- Run once in the Supabase Dashboard → Storage tab,
-- or paste in the SQL editor after enabling pg_storage.
-- ============================================

-- Create the public "avatars" bucket (idempotent)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;

-- Allow authenticated users to upload only to their own folder
CREATE POLICY "Authenticated users can upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Authenticated users can update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

CREATE POLICY "Authenticated users can delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  );

-- Public read for avatar URLs (bucket is already public, this is optional)
CREATE POLICY "Public can view avatars"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');

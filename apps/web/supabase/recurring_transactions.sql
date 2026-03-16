-- ============================================
-- Recurring Transactions
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- Recurring transactions table
-- ============================================

CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     timestamptz DEFAULT now() NOT NULL,
  user_id        uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount         numeric(12, 2) NOT NULL,
  category       text NOT NULL,
  description    text,
  currency       text NOT NULL DEFAULT 'PHP',
  account_id     uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  frequency      text NOT NULL,
  interval_count integer NOT NULL DEFAULT 1,
  start_date     date NOT NULL,
  end_date       date,
  next_run_date  date NOT NULL,
  last_run_date  date,
  run_time       time,
  is_active      boolean NOT NULL DEFAULT true,
  tags           text[],
  CONSTRAINT recurring_transactions_amount_nonzero CHECK (amount <> 0),
  CONSTRAINT recurring_transactions_frequency_check CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  CONSTRAINT recurring_transactions_interval_positive CHECK (interval_count > 0)
);

-- Add run_time column if upgrading from earlier migration
ALTER TABLE public.recurring_transactions
  ADD COLUMN IF NOT EXISTS run_time time;

-- Drop yearly constraint if present and replace with updated one
ALTER TABLE public.recurring_transactions
  DROP CONSTRAINT IF EXISTS recurring_transactions_frequency_check;

ALTER TABLE public.recurring_transactions
  ADD CONSTRAINT recurring_transactions_frequency_check
  CHECK (frequency IN ('daily', 'weekly', 'monthly'));

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_user_id
  ON public.recurring_transactions USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_recurring_transactions_next_run
  ON public.recurring_transactions USING btree (user_id, next_run_date)
  WHERE is_active = true;

ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can insert own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can update own recurring transactions" ON public.recurring_transactions;
DROP POLICY IF EXISTS "Users can delete own recurring transactions" ON public.recurring_transactions;

CREATE POLICY "Users can view own recurring transactions"
  ON public.recurring_transactions FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own recurring transactions"
  ON public.recurring_transactions FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own recurring transactions"
  ON public.recurring_transactions FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete own recurring transactions"
  ON public.recurring_transactions FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);


-- ============================================
-- Process due recurring transactions
-- p_current_time: the caller's local time (e.g. '14:30:00').
--   If a recurring rule has run_time set, it is only processed
--   once the local clock has reached that time on the due date.
--   Pass NULL to skip the time check entirely.
-- Returns number of transactions created.
-- ============================================

CREATE OR REPLACE FUNCTION public.process_due_recurring_transactions(
  p_current_time time DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  current_user_id uuid;
  rec             RECORD;
  processed_count integer := 0;
  next_date       date;
BEGIN
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  FOR rec IN
    SELECT *
    FROM public.recurring_transactions
    WHERE user_id       = current_user_id
      AND is_active     = true
      AND next_run_date <= CURRENT_DATE
      AND (end_date IS NULL OR next_run_date <= end_date)
    FOR UPDATE
  LOOP
    -- Skip if run_time is set and the caller's local time hasn't reached it yet
    IF rec.run_time IS NOT NULL AND p_current_time IS NOT NULL AND p_current_time < rec.run_time THEN
      CONTINUE;
    END IF;
    -- Insert the new transaction
    INSERT INTO public.transactions (
      user_id, amount, category, description,
      date, currency, account_id, tags
    ) VALUES (
      current_user_id,
      ROUND(rec.amount::numeric, 2),
      rec.category,
      COALESCE(rec.description, rec.category),
      rec.next_run_date,
      rec.currency,
      rec.account_id,
      rec.tags
    );

    -- Update account balance atomically
    IF rec.account_id IS NOT NULL THEN
      UPDATE public.accounts
      SET balance = ROUND((balance + rec.amount)::numeric, 2)
      WHERE id      = rec.account_id
        AND user_id = current_user_id;
    END IF;

    -- Compute next run date
    CASE rec.frequency
      WHEN 'daily'   THEN next_date := rec.next_run_date + (rec.interval_count || ' days')::interval;
      WHEN 'weekly'  THEN next_date := rec.next_run_date + (rec.interval_count * 7 || ' days')::interval;
      WHEN 'monthly' THEN next_date := rec.next_run_date + (rec.interval_count || ' months')::interval;
      ELSE                next_date := rec.next_run_date + '1 month'::interval;
    END CASE;

    -- Update the recurring rule
    UPDATE public.recurring_transactions
    SET
      last_run_date = rec.next_run_date,
      next_run_date = next_date,
      is_active     = CASE
                        WHEN rec.end_date IS NOT NULL AND next_date > rec.end_date THEN false
                        ELSE true
                      END
    WHERE id = rec.id;

    processed_count := processed_count + 1;
  END LOOP;

  RETURN processed_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_due_recurring_transactions(time) TO authenticated;

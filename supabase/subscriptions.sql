-- ============================================
-- Sandalan Premium Subscriptions
-- Run this in the Supabase SQL Editor
-- ============================================

-- Tracks premium subscription purchases from Google Play.
-- The app writes a row on purchase; server-side verification
-- can be added later via Edge Function + Google Play Developer API.

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id      text NOT NULL,               -- e.g. 'sandalan_premium_monthly'
  purchase_token  text,                         -- Google Play purchase token
  status          text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'refunded'
  platform        text NOT NULL DEFAULT 'android', -- 'android', 'ios', 'web'
  started_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz,                  -- NULL = lifetime or managed by store
  cancelled_at    timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for quick user lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- RLS: users can read/insert their own subscriptions.
-- Updates/deletes are server-side only (Edge Functions or admin).
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can insert own subscriptions"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Grant access to authenticated users
GRANT SELECT, INSERT ON public.subscriptions TO authenticated;

-- ─── Helper RPC: check if user has active subscription ───────────────────

CREATE OR REPLACE FUNCTION public.has_active_subscription()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = auth.uid()
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_subscription() TO authenticated;

-- ============================================
-- Developer Notes & Roadmap
-- Run this in the Supabase SQL Editor
-- ============================================

-- Developer notes shown at the bottom of the home screen.
-- Managed by admin via /admin/dev-notes.
CREATE TABLE IF NOT EXISTS public.dev_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  body        text NOT NULL,
  type        text NOT NULL DEFAULT 'note', -- 'note', 'announcement', 'update'
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Roadmap items shown below dev notes on home screen.
CREATE TABLE IF NOT EXISTS public.roadmap_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  status      text NOT NULL DEFAULT 'planned', -- 'planned', 'in_progress', 'completed'
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  target_version text, -- e.g. 'v1.2.0'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- RLS: all authenticated users can read active items (public content)
ALTER TABLE public.dev_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active dev notes" ON public.dev_notes;
CREATE POLICY "Anyone can read active dev notes"
  ON public.dev_notes FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can read visible roadmap" ON public.roadmap_items;
CREATE POLICY "Anyone can read visible roadmap"
  ON public.roadmap_items FOR SELECT
  USING (is_visible = true);

-- Admin can do everything (via admin client which bypasses RLS)
GRANT SELECT ON public.dev_notes TO authenticated;
GRANT SELECT ON public.roadmap_items TO authenticated;

-- ============================================
-- Seed: Developer Note
-- ============================================

INSERT INTO public.dev_notes (title, body, type, is_active, sort_order) VALUES
  ('Welcome to Sandalan!', 'Salamat sa pagtangkilik! I''m a solo developer building the ultimate Filipino adulting companion. Your feedback shapes the roadmap — tap Send Feedback in the More screen anytime.', 'announcement', true, 0)
ON CONFLICT DO NOTHING;

-- ============================================
-- Seed: Roadmap Items
-- ============================================

INSERT INTO public.roadmap_items (title, description, status, target_version, is_visible, sort_order) VALUES
  -- v1.x — Foundation
  ('Launch Polish', 'Bug fixes, premium billing, testing suite', 'completed', 'v1.1.0', true, 0),
  ('Government Portals', 'SSS, PhilHealth, Pag-IBIG, BIR, NBI, DFA — access directly in-app', 'in_progress', 'v1.2.0', true, 1),
  ('Smart Notifications', 'Trial expiry alerts, bill due reminders, budget overspend warnings', 'planned', 'v1.3.0', true, 2),
  ('Shared Goals', 'Save together with barkada or family toward a common target', 'planned', 'v1.4.0', true, 3),
  ('Smarter AI Chat', 'On-device Taglish assistant — works offline, learns your spending habits', 'planned', 'v1.5.0', true, 4),
  ('Financial Quizzes', 'Test your adulting knowledge — earn badges and compete with friends', 'planned', 'v1.6.0', true, 5),
  ('Live Investment Prices', 'PSE stocks, US stocks, crypto — auto-updated daily', 'planned', 'v1.7.0', true, 6),
  ('OFW & Freelancer Tools', 'Remittance tracker, invoicing, BIR Official Receipts', 'planned', 'v1.8.0', true, 7),
  ('iOS App', 'Sandalan on iPhone and iPad', 'planned', 'v1.9.0', true, 8),

  -- v2.x — Expansion
  ('Nearby Services Map', 'Find SSS, Pag-IBIG, BIR offices, banks, and ATMs near you', 'planned', 'v2.0.0', true, 9),
  ('Bank Account Linking', 'Auto-import transactions from BDO, BPI, GCash, Maya — no more manual entry', 'planned', 'v2.1.0', true, 10),
  ('Family Finances', 'Shared household budgets, family member accounts, panganay dashboard', 'planned', 'v2.2.0', true, 11),
  ('Smart Receipts', 'Auto-detect store, itemize purchases, track warranties from photos', 'planned', 'v2.3.0', true, 12),
  ('Financial Health Report', 'Monthly PDF report card — net worth, spending score, savings rate vs peers', 'planned', 'v2.4.0', true, 13),
  ('Widgets & Watch', 'Enhanced home widgets, spending tracker on WearOS smartwatch', 'planned', 'v2.5.0', true, 14)
ON CONFLICT DO NOTHING;

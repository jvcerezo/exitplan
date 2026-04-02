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

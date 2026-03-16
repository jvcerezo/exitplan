-- ============================================
-- Adulting Checklist Progress
-- Run this in the Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS public.adulting_checklist_progress (
  user_id      uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id      text NOT NULL,
  completed_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_adulting_checklist_user_id
  ON public.adulting_checklist_progress USING btree (user_id);

ALTER TABLE public.adulting_checklist_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their checklist progress" ON public.adulting_checklist_progress;

CREATE POLICY "Users can manage their checklist progress"
  ON public.adulting_checklist_progress FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

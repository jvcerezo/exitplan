-- ============================================
-- Fix: goal funding trigger crashes during CASCADE delete
--
-- When a user is deleted, CASCADE deletes goal_fundings rows.
-- The AFTER DELETE trigger fires and tries to UPDATE public.goals,
-- but goals is also being CASCADE-deleted, causing "Database error
-- deleting user".
--
-- Fix: check if the goal still exists before trying to update it.
-- ============================================

CREATE OR REPLACE FUNCTION public.recalculate_goal_totals_from_fundings()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  affected_goal_id uuid;
  target_goal_id uuid;
  total_funded numeric(12, 2);
  goal_target_amount numeric(12, 2);
  goal_exists boolean;
BEGIN
  affected_goal_id := COALESCE(NEW.goal_id, OLD.goal_id);

  IF affected_goal_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  FOR target_goal_id IN
    SELECT DISTINCT goal_id
    FROM (VALUES (NEW.goal_id), (OLD.goal_id)) AS candidate(goal_id)
    WHERE goal_id IS NOT NULL
  LOOP
    -- Skip if goal no longer exists (e.g. during CASCADE delete)
    SELECT EXISTS (SELECT 1 FROM public.goals WHERE id = target_goal_id)
      INTO goal_exists;
    IF NOT goal_exists THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(SUM(amount), 0)
      INTO total_funded
    FROM public.goal_fundings
    WHERE goal_id = target_goal_id;

    SELECT g.target_amount
      INTO goal_target_amount
    FROM public.goals g
    WHERE g.id = target_goal_id;

    IF goal_target_amount IS NOT NULL THEN
      UPDATE public.goals
      SET
        current_amount = ROUND(total_funded::numeric, 2),
        is_completed = ROUND(total_funded::numeric, 2) >= goal_target_amount
      WHERE id = target_goal_id;
    END IF;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$;

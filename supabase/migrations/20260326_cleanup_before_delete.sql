-- ============================================
-- cleanup_before_delete(target_user_id uuid)
--
-- Clears all sessions, refresh tokens, and public data
-- for a user BEFORE calling auth.admin.deleteUser().
-- This prevents GoTrue from choking on cascading many sessions.
--
-- Called by the /api/delete-account endpoint.
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_before_delete(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Clear auth sessions and refresh tokens
  DELETE FROM auth.refresh_tokens
    WHERE session_id IN (SELECT id FROM auth.sessions WHERE user_id = target_user_id);
  DELETE FROM auth.sessions WHERE user_id = target_user_id;

  -- Clear all public data (belt + suspenders with CASCADE)
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  DELETE FROM public.goal_fundings WHERE user_id = target_user_id;
  DELETE FROM public.goals WHERE user_id = target_user_id;
  DELETE FROM public.budgets WHERE user_id = target_user_id;
  DELETE FROM public.accounts WHERE user_id = target_user_id;
  DELETE FROM public.contributions WHERE user_id = target_user_id;
  DELETE FROM public.debts WHERE user_id = target_user_id;
  DELETE FROM public.bills WHERE user_id = target_user_id;
  DELETE FROM public.insurance_policies WHERE user_id = target_user_id;
  DELETE FROM public.investments WHERE user_id = target_user_id;
  DELETE FROM public.bug_reports WHERE user_id = target_user_id;
  DELETE FROM public.recurring_transactions WHERE user_id = target_user_id;
  DELETE FROM public.exchange_rates WHERE user_id = target_user_id;
  DELETE FROM public.adulting_checklist_progress WHERE user_id = target_user_id;
  DELETE FROM public.admin_users WHERE user_id = target_user_id;
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;

-- Only the service role (via API route) should call this
REVOKE ALL ON FUNCTION public.cleanup_before_delete(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cleanup_before_delete(uuid) FROM authenticated;

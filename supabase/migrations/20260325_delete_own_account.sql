-- ============================================
-- delete_own_account() RPC
-- Called by the Flutter app to delete the authenticated user's account.
-- Uses SECURITY DEFINER to access auth.users with elevated privileges.
-- All user data cascades via ON DELETE CASCADE foreign keys.
-- ============================================

DROP FUNCTION IF EXISTS public.delete_own_account();

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the authenticated user's ID
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Manually delete from all public tables first (belt + suspenders)
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.goal_savings WHERE user_id = current_user_id;
  DELETE FROM public.goals WHERE user_id = current_user_id;
  DELETE FROM public.budgets WHERE user_id = current_user_id;
  DELETE FROM public.accounts WHERE user_id = current_user_id;
  DELETE FROM public.contributions WHERE user_id = current_user_id;
  DELETE FROM public.debts WHERE user_id = current_user_id;
  DELETE FROM public.bills WHERE user_id = current_user_id;
  DELETE FROM public.insurance_policies WHERE user_id = current_user_id;
  DELETE FROM public.tax_records WHERE user_id = current_user_id;
  DELETE FROM public.investments WHERE user_id = current_user_id;
  DELETE FROM public.bug_reports WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  DELETE FROM public.user_settings WHERE id = current_user_id;

  -- Delete the auth user (also removes all linked identities: email, Google, etc.)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

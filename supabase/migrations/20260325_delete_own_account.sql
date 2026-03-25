-- ============================================
-- delete_own_account() RPC
-- Called by the Flutter app to delete the authenticated user's account.
-- Uses SECURITY DEFINER to access auth.users with elevated privileges.
-- All user data cascades via ON DELETE CASCADE foreign keys.
-- ============================================

CREATE OR REPLACE FUNCTION public.delete_own_account()
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

  -- Delete the auth user — this cascades to all public tables
  -- (profiles, accounts, transactions, goals, budgets, debts, etc.)
  -- and removes all linked identities (email, Google, etc.)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;

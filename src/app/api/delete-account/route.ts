import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/delete-account
 *
 * Deletes the authenticated user's account using the admin SDK.
 * The Flutter app calls this because Supabase hosted instances don't allow
 * direct DELETE FROM auth.users via SQL/RPC.
 *
 * Expects: Authorization: Bearer <supabase-access-token>
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  const token = authHeader.slice(7);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Verify the token and get the user
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1. Clear all sessions and refresh tokens first — GoTrue chokes
  //    on deleteUser when there are many active sessions.
  try {
    await admin.rpc("cleanup_before_delete", { target_user_id: user.id });
  } catch {
    // If RPC doesn't exist yet, try manual cleanup via admin API
    try {
      await admin.auth.admin.signOut(token);
    } catch {
      // Continue — deleteUser might still work
    }
  }

  // 2. Delete the user — cascades to all data and linked identities
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Error deleting account:", error.message, error);

    // If GoTrue fails, try direct SQL cleanup as last resort
    try {
      // Clear all user data from public tables
      const tables = [
        "transactions", "goal_fundings", "goals", "budgets", "accounts",
        "contributions", "debts", "bills", "insurance_policies", "investments",
        "bug_reports", "recurring_transactions", "exchange_rates",
        "adulting_checklist_progress",
      ];
      for (const table of tables) {
        await admin.from(table).delete().eq("user_id", user.id);
      }
      await admin.from("profiles").delete().eq("id", user.id);
      await admin.from("admin_users").delete().eq("user_id", user.id);

      // Retry deleteUser after clearing data
      const { error: retryError } = await admin.auth.admin.deleteUser(user.id);
      if (retryError) {
        console.error("Retry delete failed:", retryError.message);
        return NextResponse.json(
          { error: `Could not delete account after cleanup: ${retryError.message}` },
          { status: 500 }
        );
      }
    } catch (cleanupErr) {
      console.error("Cleanup failed:", cleanupErr);
      return NextResponse.json(
        { error: `Could not delete account: ${error.message}` },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}

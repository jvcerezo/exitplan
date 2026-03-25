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

  // Use admin client to delete the user — cascades to all data
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Could not delete account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

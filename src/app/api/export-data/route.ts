import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    { data: profile },
    { data: accounts },
    { data: transactions },
    { data: budgets },
    { data: goals },
    { data: debts },
    { data: contributions },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("accounts").select("*").eq("user_id", user.id),
    supabase.from("transactions").select("*").eq("user_id", user.id),
    supabase.from("budgets").select("*").eq("user_id", user.id),
    supabase.from("goals").select("*").eq("user_id", user.id),
    supabase.from("debts").select("*").eq("user_id", user.id),
    supabase.from("contributions").select("*").eq("user_id", user.id),
  ]);

  const exportPayload = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: profile?.email ?? user.email,
      full_name: profile?.full_name,
      created_at: profile?.created_at,
    },
    accounts: accounts ?? [],
    transactions: transactions ?? [],
    budgets: budgets ?? [],
    goals: goals ?? [],
    debts: debts ?? [],
    government_contributions: contributions ?? [],
  };

  return new NextResponse(JSON.stringify(exportPayload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="exitplan-data-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}

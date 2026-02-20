import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface UserWithStats {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  created_at: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  goalCount: number;
}

async function getUsers(): Promise<UserWithStats[]> {
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: transactions }, { data: goals }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("transactions").select("user_id, amount"),
      supabase.from("goals").select("user_id"),
    ]);

  if (!profiles) return [];

  // Group transactions by user
  const txByUser = new Map<
    string,
    { count: number; income: number; expenses: number }
  >();
  for (const tx of transactions ?? []) {
    const existing = txByUser.get(tx.user_id) ?? {
      count: 0,
      income: 0,
      expenses: 0,
    };
    existing.count++;
    const amount = Number(tx.amount);
    if (amount > 0) existing.income += amount;
    else existing.expenses += Math.abs(amount);
    txByUser.set(tx.user_id, existing);
  }

  // Group goals by user
  const goalsByUser = new Map<string, number>();
  for (const g of goals ?? []) {
    goalsByUser.set(g.user_id, (goalsByUser.get(g.user_id) ?? 0) + 1);
  }

  return profiles.map((p) => {
    const txStats = txByUser.get(p.id) ?? {
      count: 0,
      income: 0,
      expenses: 0,
    };
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      transactionCount: txStats.count,
      totalIncome: txStats.income,
      totalExpenses: txStats.expenses,
      goalCount: goalsByUser.get(p.id) ?? 0,
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <>
              {/* Mobile card view */}
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg border border-border/40 p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.full_name || "No name"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <Badge
                        variant={
                          user.role === "admin" ? "destructive" : "secondary"
                        }
                        className="text-xs shrink-0"
                      >
                        {user.role}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Transactions</p>
                        <p className="font-medium tabular-nums">{user.transactionCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Goals</p>
                        <p className="font-medium tabular-nums">{user.goalCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Income</p>
                        <p className="font-medium tabular-nums text-emerald-600">
                          {formatCurrency(user.totalIncome)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Expenses</p>
                        <p className="font-medium tabular-nums text-foreground">
                          {formatCurrency(user.totalExpenses)}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Joined{" "}
                      {new Date(user.created_at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        User
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Role
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Transactions
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Income
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Expenses
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Goals
                      </th>
                      <th className="pb-3 font-medium text-muted-foreground text-right">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 pr-4">
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.full_name || "No name"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {user.email}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge
                            variant={
                              user.role === "admin" ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {user.transactionCount}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-emerald-600">
                          {formatCurrency(user.totalIncome)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums text-foreground">
                          {formatCurrency(user.totalExpenses)}
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {user.goalCount}
                        </td>
                        <td className="py-3 text-right text-muted-foreground whitespace-nowrap">
                          {new Date(user.created_at).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

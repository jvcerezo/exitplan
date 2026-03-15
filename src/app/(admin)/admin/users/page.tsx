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
  lastTransactionAt: string | null;
}

function getInitials(name: string | null) {
  const value = (name ?? "").trim();
  if (!value) return "U";
  return value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
}

async function getUsers(): Promise<UserWithStats[]> {
  const supabase = createAdminClient();

  const [{ data: profiles }, { data: transactions }, { data: goals }, { data: adminUsers }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("transactions").select("user_id, amount, created_at"),
      supabase.from("goals").select("user_id"),
      supabase.from("admin_users").select("user_id"),
    ]);

  if (!profiles) return [];

  const adminIds = new Set((adminUsers ?? []).map((entry) => entry.user_id));

  // Group transactions by user
  const txByUser = new Map<
    string,
    { count: number; income: number; expenses: number; lastTransactionAt: string | null }
  >();
  for (const tx of transactions ?? []) {
    const existing = txByUser.get(tx.user_id) ?? {
      count: 0,
      income: 0,
      expenses: 0,
      lastTransactionAt: null,
    };
    existing.count++;
    const amount = Number(tx.amount);
    if (amount > 0) existing.income += amount;
    else existing.expenses += Math.abs(amount);

    if (!existing.lastTransactionAt || new Date(tx.created_at) > new Date(existing.lastTransactionAt)) {
      existing.lastTransactionAt = tx.created_at;
    }

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
      lastTransactionAt: null,
    };
    return {
      id: p.id,
      email: p.email,
      full_name: p.full_name,
      role: adminIds.has(p.id) ? "admin" : "user",
      created_at: p.created_at,
      transactionCount: txStats.count,
      totalIncome: txStats.income,
      totalExpenses: txStats.expenses,
      goalCount: goalsByUser.get(p.id) ?? 0,
      lastTransactionAt: txStats.lastTransactionAt,
    };
  });
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  const adminCount = users.filter((user) => user.role === "admin").length;
  const activeUsers = users.filter((user) => user.transactionCount > 0).length;
  const usersWithGoals = users.filter((user) => user.goalCount > 0).length;
  const usersMissingEmail = users.filter((user) => !user.email).length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">
          {users.length} registered {users.length === 1 ? "user" : "users"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Users" value={users.length} />
        <SummaryCard title="Admins" value={adminCount} tone="warn" />
        <SummaryCard title="Active Users" value={activeUsers} subtitle="with transactions" />
        <SummaryCard title="Missing Email" value={usersMissingEmail} tone={usersMissingEmail > 0 ? "critical" : "ok"} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <>
              <div className="space-y-3 md:hidden">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-lg border border-border/50 p-3 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex items-start gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                          {getInitials(user.full_name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {user.full_name || "No name"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email || "No email"}
                          </p>
                          <p className="text-[11px] text-muted-foreground/80 truncate">
                            ID: {user.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={
                            user.role === "admin" ? "destructive" : "secondary"
                          }
                          className="text-xs shrink-0"
                        >
                          {user.role}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {user.transactionCount > 0 ? "Active" : "Inactive"}
                        </Badge>
                      </div>
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
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <p>
                        Joined{" "}
                        {new Date(user.created_at).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-right">
                        {user.lastTransactionAt
                          ? `Last tx ${new Date(user.lastTransactionAt).toLocaleDateString("en-PH", {
                              month: "short",
                              day: "numeric",
                            })}`
                          : "No tx yet"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

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
                      <th className="pb-3 pr-4 font-medium text-muted-foreground">
                        Activity
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
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Net
                      </th>
                      <th className="pb-3 pr-4 font-medium text-muted-foreground text-right">
                        Last Tx
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
                          <div className="flex items-start gap-2 min-w-0">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                              {getInitials(user.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[220px]">
                                {user.full_name || "No name"}
                              </p>
                              <p className="text-xs text-muted-foreground truncate max-w-[240px]">
                                {user.email || "No email"}
                              </p>
                              <p className="text-[11px] text-muted-foreground/80 truncate max-w-[240px]">
                                {user.id}
                              </p>
                            </div>
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
                        <td className="py-3 pr-4">
                          <Badge variant="outline" className="text-[11px]">
                            {user.transactionCount > 0 ? "Active" : "Inactive"}
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
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {formatCurrency(user.totalIncome - user.totalExpenses)}
                        </td>
                        <td className="py-3 pr-4 text-right text-muted-foreground whitespace-nowrap">
                          {user.lastTransactionAt
                            ? new Date(user.lastTransactionAt).toLocaleDateString("en-PH", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
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

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Notes</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          <p>Users with goals: <span className="font-medium text-foreground">{usersWithGoals}</span></p>
          <p>Users with no transactions: <span className="font-medium text-foreground">{users.length - activeUsers}</span></p>
        </CardContent>
      </Card>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: number;
  subtitle?: string;
  tone?: "ok" | "warn" | "critical";
}) {
  return (
    <Card>
      <CardContent className="p-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
        <p
          className={`mt-1 text-xl font-bold ${
            tone === "critical"
              ? "text-red-600"
              : tone === "warn"
                ? "text-amber-600"
                : tone === "ok"
                  ? "text-emerald-600"
                  : ""
          }`}
        >
          {value}
        </p>
        {subtitle ? <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p> : null}
      </CardContent>
    </Card>
  );
}

import {
  Users,
  ArrowLeftRight,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  UserPlus,
  CheckCircle2,
  Calculator,
  ArrowRightLeft,
  CreditCard,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getMetrics() {
  const supabase = createAdminClient();

  const [
    { count: totalUsers },
    { data: recentUsers },
    { data: transactions },
    { data: goals },
    { data: budgets },
    { data: accounts },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("transactions").select("*"),
    supabase.from("goals").select("*"),
    supabase.from("budgets").select("*"),
    supabase.from("accounts").select("*"),
  ]);

  const totalTransactions = transactions?.length ?? 0;

  const totalIncome =
    transactions
      ?.filter((t) => t.amount > 0 && t.category !== "transfer")
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalExpenses =
    transactions
      ?.filter((t) => t.amount < 0 && t.category !== "transfer")
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) ?? 0;

  const netVolume = totalIncome - totalExpenses;

  // Transfer metrics
  const transferTransactions = transactions?.filter(
    (t) => t.transfer_id != null
  ) ?? [];
  const uniqueTransfers = new Set(
    transferTransactions.map((t) => t.transfer_id)
  );
  const totalTransfers = uniqueTransfers.size;
  const transferVolume =
    transferTransactions
      .filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0);

  // Attachment metrics
  const withAttachments =
    transactions?.filter((t) => t.attachment_path).length ?? 0;

  const totalGoals = goals?.length ?? 0;
  const completedGoals = goals?.filter((g) => g.is_completed).length ?? 0;
  const totalGoalTarget =
    goals?.reduce((sum, g) => sum + Number(g.target_amount), 0) ?? 0;
  const totalGoalSaved =
    goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) ?? 0;

  // Budget metrics
  const totalBudgets = budgets?.length ?? 0;
  const totalBudgetAmount =
    budgets?.reduce((sum, b) => sum + Number(b.amount), 0) ?? 0;
  const uniqueBudgetUsers = new Set(budgets?.map((b) => b.user_id) ?? []);

  // Account metrics
  const totalAccounts = accounts?.length ?? 0;
  const activeAccounts = accounts?.filter((a) => !a.is_archived).length ?? 0;
  const totalAccountBalance =
    accounts
      ?.filter((a) => !a.is_archived)
      .reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  const accountTypes: Record<string, number> = {};
  for (const a of accounts ?? []) {
    accountTypes[a.type] = (accountTypes[a.type] || 0) + 1;
  }

  // New users in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const newUsersThisWeek =
    recentUsers?.filter(
      (u) => new Date(u.created_at) >= sevenDaysAgo
    ).length ?? 0;

  return {
    totalUsers: totalUsers ?? 0,
    newUsersThisWeek,
    recentUsers: recentUsers ?? [],
    totalTransactions,
    totalIncome,
    totalExpenses,
    netVolume,
    totalTransfers,
    transferVolume,
    withAttachments,
    totalGoals,
    completedGoals,
    totalGoalTarget,
    totalGoalSaved,
    totalBudgets,
    totalBudgetAmount,
    budgetUsers: uniqueBudgetUsers.size,
    totalAccounts,
    activeAccounts,
    totalAccountBalance,
    accountTypes,
  };
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground">
          Monitor all platform activity at a glance.
        </p>
      </div>

      {/* User Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Users
        </h2>
        <div className="grid gap-4 grid-cols-2">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toString()}
            icon={Users}
          />
          <MetricCard
            title="New This Week"
            value={metrics.newUsersThisWeek.toString()}
            icon={UserPlus}
            accent="green"
          />
        </div>
      </div>

      {/* Transaction Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Transactions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Transactions"
            value={metrics.totalTransactions.toString()}
            icon={ArrowLeftRight}
          />
          <MetricCard
            title="Total Income"
            value={formatCurrency(metrics.totalIncome)}
            icon={TrendingUp}
            accent="green"
          />
          <MetricCard
            title="Total Expenses"
            value={formatCurrency(metrics.totalExpenses)}
            icon={TrendingDown}
          />
          <MetricCard
            title="Net Volume"
            value={formatCurrency(metrics.netVolume)}
            icon={Wallet}
            accent={metrics.netVolume >= 0 ? "green" : undefined}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-4">
          <MetricCard
            title="Transfers"
            value={metrics.totalTransfers.toString()}
            icon={ArrowRightLeft}
          />
          <MetricCard
            title="Transfer Volume"
            value={formatCurrency(metrics.transferVolume)}
            icon={ArrowRightLeft}
          />
          <MetricCard
            title="With Attachments"
            value={metrics.withAttachments.toString()}
            icon={Paperclip}
          />
        </div>
      </div>

      {/* Accounts Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Accounts
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Accounts"
            value={metrics.totalAccounts.toString()}
            icon={CreditCard}
          />
          <MetricCard
            title="Active"
            value={metrics.activeAccounts.toString()}
            icon={CreditCard}
            accent="green"
          />
          <MetricCard
            title="Combined Balance"
            value={formatCurrency(metrics.totalAccountBalance)}
            icon={Wallet}
          />
          <MetricCard
            title="Account Types"
            value={Object.entries(metrics.accountTypes)
              .map(([type, count]) => `${count} ${type}`)
              .join(", ") || "None"}
            icon={CreditCard}
            small
          />
        </div>
      </div>

      {/* Budget Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Budgets
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            title="Total Budgets"
            value={metrics.totalBudgets.toString()}
            icon={Calculator}
          />
          <MetricCard
            title="Budget Volume"
            value={formatCurrency(metrics.totalBudgetAmount)}
            icon={Calculator}
          />
          <MetricCard
            title="Users with Budgets"
            value={metrics.budgetUsers.toString()}
            icon={Users}
          />
        </div>
      </div>

      {/* Goal Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Goals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Goals"
            value={metrics.totalGoals.toString()}
            icon={Target}
          />
          <MetricCard
            title="Completed"
            value={metrics.completedGoals.toString()}
            icon={CheckCircle2}
            accent="green"
          />
          <MetricCard
            title="Target Volume"
            value={formatCurrency(metrics.totalGoalTarget)}
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Saved"
            value={formatCurrency(metrics.totalGoalSaved)}
            icon={Wallet}
            accent="green"
          />
        </div>
      </div>

      {/* Recent Signups */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.recentUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          ) : (
            <div className="space-y-3">
              {metrics.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {user.full_name || "No name"}
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(user.created_at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  accent,
  small,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "green" | "red";
  small?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 min-w-0">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={`${small ? "text-sm" : "text-xl sm:text-2xl"} font-bold truncate ${
                accent === "green"
                  ? "text-emerald-600"
                  : accent === "red"
                    ? "text-red-500"
                    : ""
              }`}
            >
              {value}
            </p>
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

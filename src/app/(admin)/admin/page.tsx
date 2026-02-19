import {
  Users,
  ArrowLeftRight,
  Target,
  TrendingUp,
  TrendingDown,
  Wallet,
  UserPlus,
  CheckCircle2,
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
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("transactions").select("*"),
    supabase.from("goals").select("*"),
  ]);

  const totalTransactions = transactions?.length ?? 0;

  const totalIncome =
    transactions
      ?.filter((t) => t.amount > 0)
      .reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;

  const totalExpenses =
    transactions
      ?.filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0) ?? 0;

  const netVolume = totalIncome - totalExpenses;

  const totalGoals = goals?.length ?? 0;
  const completedGoals = goals?.filter((g) => g.is_completed).length ?? 0;
  const totalGoalTarget =
    goals?.reduce((sum, g) => sum + Number(g.target_amount), 0) ?? 0;
  const totalGoalSaved =
    goals?.reduce((sum, g) => sum + Number(g.current_amount), 0) ?? 0;

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
    totalGoals,
    completedGoals,
    totalGoalTarget,
    totalGoalSaved,
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            accent="red"
          />
          <MetricCard
            title="Net Volume"
            value={formatCurrency(metrics.netVolume)}
            icon={Wallet}
            accent={metrics.netVolume >= 0 ? "green" : "red"}
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
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {user.full_name || "No name"}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {user.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
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
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "green" | "red";
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p
              className={`text-2xl font-bold ${
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

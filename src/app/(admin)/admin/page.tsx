import {
  Activity,
  AlertTriangle,
  Bug,
  CheckCircle2,
  Clock3,
  Database,
  Mail,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import Link from "next/link";
import { OfflineSyncHealth } from "@/components/admin/offline-sync-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isOnOrAfter(dateValue: string, threshold: Date) {
  return new Date(dateValue) >= threshold;
}

function isBetween(dateValue: string, start: Date, end: Date) {
  const date = new Date(dateValue);
  return date >= start && date < end;
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getPercentage(part: number, total: number) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

function toDayKey(dateValue: string | Date) {
  const date = new Date(dateValue);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildLastNDays(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));

    return {
      key: toDayKey(date),
      label: date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
      }),
    };
  });
}

async function getMetrics() {
  const supabase = createAdminClient();

  const [
    { data: profiles },
    { data: transactions },
    { data: goals },
    { data: budgets },
    { data: accounts },
    { data: bugReports },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, full_name, created_at, has_completed_onboarding"),
    supabase
      .from("transactions")
      .select("id, user_id, created_at, category, transfer_id, attachment_path, account_id"),
    supabase.from("goals").select("id, user_id, created_at, is_completed"),
    supabase.from("budgets").select("id, user_id, created_at"),
    supabase.from("accounts").select("id, user_id, type, created_at"),
    supabase
      .from("bug_reports")
      .select("id, user_id, title, severity, status, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const allProfiles = profiles ?? [];
  const allTransactions = transactions ?? [];
  const allGoals = goals ?? [];
  const allBudgets = budgets ?? [];
  const allAccounts = accounts ?? [];
  const allBugReports = bugReports ?? [];

  const accountTypes: Record<string, number> = {};
  for (const a of allAccounts) {
    accountTypes[a.type] = (accountTypes[a.type] || 0) + 1;
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const totalUsers = allProfiles.length;
  const recentUsers = [...allProfiles]
    .sort(
      (left, right) =>
        new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
    )
    .slice(0, 5);

  const newUsersThisWeek = allProfiles.filter((user) =>
    isOnOrAfter(user.created_at, sevenDaysAgo)
  ).length;
  const previousWeekUsers = allProfiles.filter((user) =>
    isBetween(user.created_at, fourteenDaysAgo, sevenDaysAgo)
  ).length;
  const newUsersThisMonth = allProfiles.filter((user) =>
    isOnOrAfter(user.created_at, thirtyDaysAgo)
  ).length;

  const onboardedUsers = allProfiles.filter(
    (user) => user.has_completed_onboarding
  ).length;

  const usersWithAccounts = new Set(allAccounts.map((account) => account.user_id));
  const usersWithGoals = new Set(allGoals.map((goal) => goal.user_id));
  const usersWithBudgets = new Set(allBudgets.map((budget) => budget.user_id));
  const completedGoals = allGoals.filter((goal) => goal.is_completed).length;

  const transactionsLast7d = allTransactions.filter((transaction) =>
    isOnOrAfter(transaction.created_at, sevenDaysAgo)
  );
  const transactionsLast30d = allTransactions.filter((transaction) =>
    isOnOrAfter(transaction.created_at, thirtyDaysAgo)
  );
  const activeUsers7d = new Set(
    transactionsLast7d.map((transaction) => transaction.user_id)
  ).size;
  const activeUsers30d = new Set(
    transactionsLast30d.map((transaction) => transaction.user_id)
  ).size;

  const transferRows = allTransactions.filter(
    (transaction) => transaction.transfer_id != null
  ).length;
  const openBugReports = allBugReports.filter(
    (report) => report.status !== "resolved"
  ).length;
  const criticalOpenBugReports = allBugReports.filter(
    (report) => report.status !== "resolved" && report.severity === "critical"
  ).length;
  const bugReportsLast30d = allBugReports.filter((report) =>
    isOnOrAfter(report.created_at, thirtyDaysAgo)
  ).length;

  const profileById = new Map(allProfiles.map((profile) => [profile.id, profile]));
  const recentBugReports = allBugReports.slice(0, 6).map((report) => {
    const profile = profileById.get(report.user_id);
    return {
      ...report,
      reporterName: profile?.full_name || profile?.email || "Unknown User",
      reporterEmail: profile?.email || null,
    };
  });
  const withAttachments = allTransactions.filter(
    (transaction) => transaction.attachment_path
  ).length;
  const transactionsMissingAccount = allTransactions.filter(
    (transaction) => transaction.category !== "transfer" && !transaction.account_id
  ).length;
  const profilesMissingEmail = allProfiles.filter((user) => !user.email).length;
  const accountsLast30d = allAccounts.filter((account) =>
    isOnOrAfter(account.created_at, thirtyDaysAgo)
  ).length;
  const nonTransferTransactions = allTransactions.filter(
    (transaction) => transaction.category !== "transfer"
  );

  const dailyFrames = buildLastNDays(14);

  const signupCounts = new Map<string, number>();
  for (const profile of allProfiles) {
    const key = toDayKey(profile.created_at);
    signupCounts.set(key, (signupCounts.get(key) ?? 0) + 1);
  }

  const transactionCounts = new Map<string, number>();
  const activeUsersByDay = new Map<string, Set<string>>();
  for (const transaction of allTransactions) {
    const key = toDayKey(transaction.created_at);
    transactionCounts.set(key, (transactionCounts.get(key) ?? 0) + 1);

    const activeUsers = activeUsersByDay.get(key) ?? new Set<string>();
    activeUsers.add(transaction.user_id);
    activeUsersByDay.set(key, activeUsers);
  }

  const accountsCreatedByDay = new Map<string, number>();
  for (const account of allAccounts) {
    const key = toDayKey(account.created_at);
    accountsCreatedByDay.set(key, (accountsCreatedByDay.get(key) ?? 0) + 1);
  }

  const goalsCreatedByDay = new Map<string, number>();
  for (const goal of allGoals) {
    const key = toDayKey(goal.created_at);
    goalsCreatedByDay.set(key, (goalsCreatedByDay.get(key) ?? 0) + 1);
  }

  const budgetsCreatedByDay = new Map<string, number>();
  for (const budget of allBudgets) {
    const key = toDayKey(budget.created_at);
    budgetsCreatedByDay.set(key, (budgetsCreatedByDay.get(key) ?? 0) + 1);
  }

  const trafficData = dailyFrames.map((day) => ({
    label: day.label,
    signups: signupCounts.get(day.key) ?? 0,
    activeUsers: activeUsersByDay.get(day.key)?.size ?? 0,
    transactions: transactionCounts.get(day.key) ?? 0,
  }));

  const provisioningData = dailyFrames.map((day) => ({
    label: day.label,
    accounts: accountsCreatedByDay.get(day.key) ?? 0,
    goals: goalsCreatedByDay.get(day.key) ?? 0,
    budgets: budgetsCreatedByDay.get(day.key) ?? 0,
  }));

  const healthData = [
    {
      metric: "Onboarding",
      value: getPercentage(onboardedUsers, totalUsers),
    },
    {
      metric: "Activity 30d",
      value: getPercentage(activeUsers30d, totalUsers),
    },
    {
      metric: "Account Coverage",
      value: getPercentage(usersWithAccounts.size, totalUsers),
    },
    {
      metric: "Tx Integrity",
      value: 100 - getPercentage(transactionsMissingAccount, nonTransferTransactions.length),
    },
    {
      metric: "Profile Completeness",
      value: 100 - getPercentage(profilesMissingEmail, totalUsers),
    },
  ];

  const dataIntegrityRate =
    100 - getPercentage(transactionsMissingAccount, nonTransferTransactions.length);
  const profileCompletenessRate =
    100 - getPercentage(profilesMissingEmail, totalUsers);

  const signupTrend =
    newUsersThisWeek === previousWeekUsers
      ? "Flat vs previous week"
      : newUsersThisWeek > previousWeekUsers
        ? `Up ${newUsersThisWeek - previousWeekUsers} vs previous week`
        : `Down ${previousWeekUsers - newUsersThisWeek} vs previous week`;

  return {
    totalUsers,
    newUsersThisWeek,
    newUsersThisMonth,
    signupTrend,
    onboardedUsers,
    onboardingRate: getPercentage(onboardedUsers, totalUsers),
    dataIntegrityRate,
    profileCompletenessRate,
    usersWithAccounts: usersWithAccounts.size,
    usersWithGoals: usersWithGoals.size,
    usersWithBudgets: usersWithBudgets.size,
    accountCoverageRate: getPercentage(usersWithAccounts.size, totalUsers),
    goalCoverageRate: getPercentage(usersWithGoals.size, totalUsers),
    budgetCoverageRate: getPercentage(usersWithBudgets.size, totalUsers),
    activeUsers7d,
    activeUsers30d,
    activityRate30d: getPercentage(activeUsers30d, totalUsers),
    transactionsLast7d: transactionsLast7d.length,
    transactionsLast30d: transactionsLast30d.length,
    avgTransactionsPerActiveUser30d:
      activeUsers30d === 0 ? 0 : transactionsLast30d.length / activeUsers30d,
    recentUsers,
    withAttachments,
    completedGoals,
    attachmentRate: getPercentage(withAttachments, allTransactions.length),
    transferShare: getPercentage(transferRows, allTransactions.length),
    transactionsMissingAccount,
    profilesMissingEmail,
    totalGoals: allGoals.length,
    totalBudgets: allBudgets.length,
    totalAccounts: allAccounts.length,
    avgAccountsPerUser: totalUsers === 0 ? 0 : allAccounts.length / totalUsers,
    accountsLast30d,
    accountTypes,
    openBugReports,
    criticalOpenBugReports,
    bugReportsLast30d,
    recentBugReports,
    trafficData,
    provisioningData,
    healthData,
  };
}

export default async function AdminDashboardPage() {
  const metrics = await getMetrics();
  const recentActiveRate = formatPercent(metrics.activityRate30d);
  const recentOnboardingRate = formatPercent(metrics.onboardingRate);
  const dataIntegrity = formatPercent(metrics.dataIntegrityRate);

  const alertItems = [
    {
      label: "Open bug reports",
      value: metrics.openBugReports,
      tone:
        metrics.openBugReports === 0
          ? "ok"
          : metrics.openBugReports <= 5
            ? "warn"
            : "critical",
    },
    {
      label: "Critical open bugs",
      value: metrics.criticalOpenBugReports,
      tone: metrics.criticalOpenBugReports === 0 ? "ok" : "critical",
    },
    {
      label: "Tx rows missing account",
      value: metrics.transactionsMissingAccount,
      tone: metrics.transactionsMissingAccount === 0 ? "ok" : "critical",
    },
    {
      label: "Profiles missing email",
      value: metrics.profilesMissingEmail,
      tone:
        metrics.profilesMissingEmail === 0
          ? "ok"
          : metrics.profilesMissingEmail <= 3
            ? "warn"
            : "critical",
    },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-sm text-muted-foreground">
            Essential platform health and risk indicators.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/bug-reports"
            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            Manage Bugs
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            View Users
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <CompactMetric
          title="Users"
          value={metrics.totalUsers.toLocaleString("en-PH")}
          detail={`${metrics.newUsersThisWeek} new in 7d`}
          icon={Users}
        />
        <CompactMetric
          title="Active 30d"
          value={recentActiveRate}
          detail={`${metrics.activeUsers30d} users`}
          icon={Activity}
          tone="ok"
        />
        <CompactMetric
          title="Onboarding"
          value={recentOnboardingRate}
          detail={`${metrics.onboardedUsers}/${metrics.totalUsers} completed`}
          icon={CheckCircle2}
          tone={metrics.onboardingRate >= 70 ? "ok" : "warn"}
        />
        <CompactMetric
          title="Data Integrity"
          value={dataIntegrity}
          detail={`${metrics.transactionsMissingAccount} orphan tx`}
          icon={Database}
          tone={metrics.transactionsMissingAccount === 0 ? "ok" : "critical"}
        />
        <CompactMetric
          title="Open Bugs"
          value={metrics.openBugReports.toString()}
          detail={`${metrics.criticalOpenBugReports} critical`}
          icon={Bug}
          tone={metrics.openBugReports === 0 ? "ok" : "warn"}
        />
        <CompactMetric
          title="Tx / Active"
          value={metrics.avgTransactionsPerActiveUser30d.toFixed(1)}
          detail="30d avg"
          icon={ShieldCheck}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Essential Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {alertItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{item.label}</span>
                  <Badge
                    variant="secondary"
                    className={
                      item.tone === "ok"
                        ? "text-emerald-700"
                        : item.tone === "warn"
                          ? "text-amber-700"
                          : "text-red-600"
                    }
                  >
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Users with accounts</span>
                <span className="font-medium">{formatPercent(metrics.accountCoverageRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Users with goals</span>
                <span className="font-medium">{formatPercent(metrics.goalCoverageRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Users with budgets</span>
                <span className="font-medium">{formatPercent(metrics.budgetCoverageRate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Profiles missing email</span>
                <span className="font-medium">{metrics.profilesMissingEmail}</span>
              </div>
            </div>

            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transactions (7d)</span>
                <span className="font-medium">{metrics.transactionsLast7d}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transactions (30d)</span>
                <span className="font-medium">{metrics.transactionsLast30d}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bugs filed (30d)</span>
                <span className="font-medium">{metrics.bugReportsLast30d}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account provisioning (30d)</span>
                <span className="font-medium">{metrics.accountsLast30d}</span>
              </div>
            </div>

            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <p className="font-medium">Account Type Mix</p>
              <p className="text-muted-foreground">
                {Object.entries(metrics.accountTypes)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => `${count} ${type}`)
                  .join(" · ") || "None"}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <OfflineSyncHealth />
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Signups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.recentUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No users yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.recentUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {user.full_name || "No name"}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          {user.email || "No email"}
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Bug Reports</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.recentBugReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bug reports yet.</p>
              ) : (
                <div className="space-y-2">
                  {metrics.recentBugReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{report.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {report.reporterName}
                        </p>
                        <p className="text-[11px] text-muted-foreground/80 mt-0.5 uppercase">
                          {report.severity} · {report.status.replace("_", " ")}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {new Date(report.created_at).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <Link
                href="/admin/bug-reports"
                className="inline-flex text-xs text-primary hover:underline"
              >
                View all bug reports
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function CompactMetric({
  title,
  value,
  icon: Icon,
  tone,
  detail,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "ok" | "warn" | "critical";
  detail?: string;
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{title}</p>
            <p
              className={`mt-0.5 text-lg font-bold leading-none ${
                tone === "ok"
                  ? "text-emerald-600"
                  : tone === "warn"
                    ? "text-amber-600"
                    : tone === "critical"
                      ? "text-red-600"
                      : ""
              }`}
            >
              {value}
            </p>
            {detail ? (
              <p className="mt-1 text-xs text-muted-foreground truncate">{detail}</p>
            ) : null}
          </div>
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

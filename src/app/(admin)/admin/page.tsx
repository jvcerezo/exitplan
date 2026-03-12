import {
  Activity,
  ChartColumn,
  Users,
  UserRoundCheck,
  Target,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Calculator,
  ArrowRightLeft,
  CreditCard,
  Paperclip,
  TriangleAlert,
  Mail,
  Database,
  Bug,
} from "lucide-react";
import Link from "next/link";
import { OfflineSyncHealth } from "@/components/admin/offline-sync-health";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminOverviewCharts } from "@/components/admin/admin-overview-charts";
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
    bugReportsLast30d,
    recentBugReports,
    trafficData,
    provisioningData,
    healthData,
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
          Track growth, adoption, and operational health at a glance.
        </p>
      </div>

      {/* SLI Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Service Level Indicators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Onboarding SLI"
            value={formatPercent(metrics.onboardingRate)}
            icon={UserRoundCheck}
            accent={metrics.onboardingRate >= 70 ? "green" : "red"}
            detail={`${metrics.onboardedUsers} of ${metrics.totalUsers} users`}
          />
          <MetricCard
            title="Activity SLI"
            value={formatPercent(metrics.activityRate30d)}
            icon={Activity}
            accent="green"
            detail={`${metrics.activeUsers30d} active in 30d`}
          />
          <MetricCard
            title="Data Integrity"
            value={formatPercent(metrics.dataIntegrityRate)}
            icon={Database}
            accent="green"
            detail={`${metrics.transactionsMissingAccount} tx missing account`}
          />
          <MetricCard
            title="Profile Completeness"
            value={formatPercent(metrics.profileCompletenessRate)}
            icon={Mail}
            accent={metrics.profileCompletenessRate >= 95 ? "green" : "amber"}
            detail={`${metrics.profilesMissingEmail} missing email`}
          />
        </div>
      </div>

      {/* Traffic Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Traffic
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Users"
            value={metrics.totalUsers.toString()}
            icon={Users}
          />
          <MetricCard
            title="New Users · 7d"
            value={metrics.newUsersThisWeek.toString()}
            icon={UserPlus}
            accent="green"
            detail={metrics.signupTrend}
          />
          <MetricCard
            title="Transactions · 7d"
            value={metrics.transactionsLast7d.toString()}
            icon={ArrowRightLeft}
            accent="green"
            detail={`${metrics.transactionsLast30d} in 30d`}
          />
          <MetricCard
            title="Tx / Active User"
            value={metrics.avgTransactionsPerActiveUser30d.toFixed(1)}
            icon={ChartColumn}
            detail="Based on trailing 30 days"
          />
        </div>
      </div>

      <AdminOverviewCharts
        trafficData={metrics.trafficData}
        provisioningData={metrics.provisioningData}
        healthData={metrics.healthData}
      />

      {/* Adoption Metrics */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Provisioning & Coverage
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Users with Accounts"
            value={formatPercent(metrics.accountCoverageRate)}
            icon={CreditCard}
            accent="green"
            detail={`${metrics.usersWithAccounts} users`}
          />
          <MetricCard
            title="Users with Budgets"
            value={formatPercent(metrics.budgetCoverageRate)}
            icon={Calculator}
            detail={`${metrics.usersWithBudgets} users`}
          />
          <MetricCard
            title="Users with Goals"
            value={formatPercent(metrics.goalCoverageRate)}
            icon={Target}
            detail={`${metrics.usersWithGoals} users`}
          />
          <MetricCard
            title="Goals Completed"
            value={metrics.completedGoals.toString()}
            icon={CheckCircle2}
            accent="green"
            detail={`${metrics.totalGoals} total goals`}
          />
        </div>
      </div>

      {/* Operational Health */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
          Reliability Signals
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Attachment Coverage"
            value={formatPercent(metrics.attachmentRate)}
            icon={Paperclip}
            detail={`${metrics.withAttachments} transactions with files`}
          />
          <MetricCard
            title="Transfer Share"
            value={formatPercent(metrics.transferShare)}
            icon={ArrowRightLeft}
            detail="Share of transaction rows"
          />
          <MetricCard
            title="Tx Missing Account"
            value={metrics.transactionsMissingAccount.toString()}
            icon={TriangleAlert}
            accent={metrics.transactionsMissingAccount === 0 ? "green" : "red"}
            detail="Should stay at zero"
          />
          <MetricCard
            title="Profiles Missing Email"
            value={metrics.profilesMissingEmail.toString()}
            icon={Mail}
            accent={metrics.profilesMissingEmail === 0 ? "green" : "red"}
          />
          <MetricCard
            title="Open Bug Reports"
            value={metrics.openBugReports.toString()}
            icon={Bug}
            accent={metrics.openBugReports === 0 ? "green" : "amber"}
            detail={`${metrics.bugReportsLast30d} submitted in 30d`}
          />
        </div>
        <div className="mt-3">
          <Link href="/admin/bug-reports" className="text-sm text-primary hover:underline">
            View and manage all open bug reports
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Platform Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Accounts provisioned in 30 days</span>
              <span className="font-medium">{metrics.accountsLast30d}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Average accounts per user</span>
              <span className="font-medium">{metrics.avgAccountsPerUser.toFixed(1)}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Current account type mix</span>
              <span className="font-medium text-right">
                {Object.entries(metrics.accountTypes)
                  .map(([type, count]) => `${count} ${type}`)
                  .join(", ") || "None"}
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Total budgets configured</span>
              <span className="font-medium">{metrics.totalBudgets}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <OfflineSyncHealth />
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
            <CardContent>
              {metrics.recentBugReports.length === 0 ? (
                <p className="text-sm text-muted-foreground">No bug reports yet.</p>
              ) : (
                <div className="space-y-3">
                  {metrics.recentBugReports.map((report) => (
                    <div
                      key={report.id}
                      className="flex items-start justify-between gap-3 text-sm"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  accent,
  small,
  detail,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "green" | "red" | "amber";
  small?: boolean;
  detail?: string;
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
                    : accent === "amber"
                      ? "text-amber-500"
                    : ""
              }`}
            >
              {value}
            </p>
            {detail ? (
              <p className="text-xs text-muted-foreground truncate">{detail}</p>
            ) : null}
          </div>
          <div className="rounded-lg bg-muted p-2.5">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

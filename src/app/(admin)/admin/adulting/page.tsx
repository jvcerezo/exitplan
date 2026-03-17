import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function getPercentage(part: number, total: number) {
  if (total === 0) return 0;
  return (part / total) * 100;
}

async function getAdultingMetrics() {
  const supabase = createAdminClient();

  const [
    { data: profiles },
    { data: contributions },
    { data: taxRecords },
    { data: debts },
    { data: insurance },
    { data: bills },
  ] = await Promise.all([
    supabase.from("profiles").select("id, full_name, email"),
    supabase
      .from("contributions")
      .select("id, user_id, type, created_at, is_paid, employee_share, employer_share, total_contribution, employment_type, period")
      .order("created_at", { ascending: false }),
    supabase
      .from("tax_records")
      .select("id, user_id, created_at, year, quarter, filing_type, status, tax_due, amount_paid")
      .order("created_at", { ascending: false }),
    supabase
      .from("debts")
      .select("id, user_id, created_at, name, type, current_balance, original_amount, interest_rate, is_paid_off")
      .order("created_at", { ascending: false }),
    supabase
      .from("insurance_policies")
      .select("id, user_id, created_at, name, type, premium_amount, premium_frequency, is_active, renewal_date")
      .order("created_at", { ascending: false }),
    supabase
      .from("bills")
      .select("id, user_id, created_at, name, category, amount, billing_cycle, is_active")
      .order("created_at", { ascending: false }),
  ]);

  const allProfiles = profiles ?? [];
  const allContributions = contributions ?? [];
  const allTaxRecords = taxRecords ?? [];
  const allDebts = debts ?? [];
  const allInsurance = insurance ?? [];
  const allBills = bills ?? [];

  const totalUsers = allProfiles.length;
  const profileById = new Map(allProfiles.map((p) => [p.id, p]));

  // ── Contributions ────────────────────────────────────────────────
  const usersWithContributions = new Set(allContributions.map((c) => c.user_id));
  const paidContributions = allContributions.filter((c) => c.is_paid).length;
  const unpaidContributions = allContributions.filter((c) => !c.is_paid).length;
  const totalContributionAmount = allContributions.reduce(
    (sum, c) => sum + (c.total_contribution ?? 0),
    0
  );

  const contributionsByType: Record<string, number> = {};
  for (const c of allContributions) {
    contributionsByType[c.type] = (contributionsByType[c.type] || 0) + 1;
  }

  const contributionsByEmploymentType: Record<string, number> = {};
  for (const c of allContributions) {
    contributionsByEmploymentType[c.employment_type] =
      (contributionsByEmploymentType[c.employment_type] || 0) + 1;
  }

  // ── Tax Records ──────────────────────────────────────────────────
  const usersWithTax = new Set(allTaxRecords.map((t) => t.user_id));
  const taxByStatus: Record<string, number> = {};
  for (const t of allTaxRecords) {
    taxByStatus[t.status] = (taxByStatus[t.status] || 0) + 1;
  }
  const totalTaxDue = allTaxRecords.reduce((sum, t) => sum + (t.tax_due ?? 0), 0);
  const totalTaxPaid = allTaxRecords.reduce((sum, t) => sum + (t.amount_paid ?? 0), 0);

  // ── Debts ────────────────────────────────────────────────────────
  const usersWithDebts = new Set(allDebts.map((d) => d.user_id));
  const activeDebts = allDebts.filter((d) => !d.is_paid_off);
  const paidOffDebts = allDebts.filter((d) => d.is_paid_off);
  const totalOutstandingBalance = activeDebts.reduce(
    (sum, d) => sum + (d.current_balance ?? 0),
    0
  );
  const debtsByType: Record<string, number> = {};
  for (const d of allDebts) {
    debtsByType[d.type] = (debtsByType[d.type] || 0) + 1;
  }

  // ── Insurance ────────────────────────────────────────────────────
  const usersWithInsurance = new Set(allInsurance.map((i) => i.user_id));
  const activeInsurance = allInsurance.filter((i) => i.is_active);
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const upcomingRenewals = activeInsurance.filter((i) => {
    if (!i.renewal_date) return false;
    const renewal = new Date(i.renewal_date);
    return renewal >= now && renewal <= thirtyDaysFromNow;
  });

  const insuranceByType: Record<string, number> = {};
  for (const i of allInsurance) {
    insuranceByType[i.type] = (insuranceByType[i.type] || 0) + 1;
  }

  // ── Bills ────────────────────────────────────────────────────────
  const usersWithBills = new Set(allBills.map((b) => b.user_id));
  const activeBills = allBills.filter((b) => b.is_active);
  const totalMonthlyBills = activeBills
    .filter((b) => b.billing_cycle === "monthly")
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const billsByCategory: Record<string, number> = {};
  for (const b of allBills) {
    billsByCategory[b.category] = (billsByCategory[b.category] || 0) + 1;
  }

  // ── Adoption: all adulting users ─────────────────────────────────
  const adultingUsers = new Set([
    ...usersWithContributions,
    ...usersWithTax,
    ...usersWithDebts,
    ...usersWithInsurance,
    ...usersWithBills,
  ]);

  // ── Top adulting users ───────────────────────────────────────────
  const userRecordCounts = new Map<string, number>();
  for (const uid of adultingUsers) {
    userRecordCounts.set(uid, 0);
  }
  for (const c of allContributions) {
    userRecordCounts.set(c.user_id, (userRecordCounts.get(c.user_id) ?? 0) + 1);
  }
  for (const t of allTaxRecords) {
    userRecordCounts.set(t.user_id, (userRecordCounts.get(t.user_id) ?? 0) + 1);
  }
  for (const d of allDebts) {
    userRecordCounts.set(d.user_id, (userRecordCounts.get(d.user_id) ?? 0) + 1);
  }
  for (const i of allInsurance) {
    userRecordCounts.set(i.user_id, (userRecordCounts.get(i.user_id) ?? 0) + 1);
  }
  for (const b of allBills) {
    userRecordCounts.set(b.user_id, (userRecordCounts.get(b.user_id) ?? 0) + 1);
  }

  const topUsers = [...userRecordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => {
      const profile = profileById.get(userId);
      return {
        userId,
        name: profile?.full_name || "No name",
        email: profile?.email || "No email",
        totalRecords: count,
      };
    });

  return {
    totalUsers,
    adultingUsers: adultingUsers.size,
    adoptionRate: getPercentage(adultingUsers.size, totalUsers),
    // Contributions
    totalContributions: allContributions.length,
    paidContributions,
    unpaidContributions,
    totalContributionAmount,
    usersWithContributions: usersWithContributions.size,
    contributionsByType,
    contributionsByEmploymentType,
    // Tax
    totalTaxRecords: allTaxRecords.length,
    usersWithTax: usersWithTax.size,
    taxByStatus,
    totalTaxDue,
    totalTaxPaid,
    // Debts
    totalDebts: allDebts.length,
    activeDebts: activeDebts.length,
    paidOffDebts: paidOffDebts.length,
    usersWithDebts: usersWithDebts.size,
    totalOutstandingBalance,
    debtsByType,
    // Insurance
    totalInsurance: allInsurance.length,
    activeInsurance: activeInsurance.length,
    usersWithInsurance: usersWithInsurance.size,
    upcomingRenewals: upcomingRenewals.length,
    insuranceByType,
    // Bills
    totalBills: allBills.length,
    activeBills: activeBills.length,
    usersWithBills: usersWithBills.size,
    totalMonthlyBills,
    billsByCategory,
    // Top users
    topUsers,
  };
}

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function prettyLabel(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function AdminAdultingPage() {
  const m = await getAdultingMetrics();

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Adulting Hub</h1>
          <p className="text-sm text-muted-foreground">
            Adoption and usage analytics for Philippine adulting features.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          Back to Overview
        </Link>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <KpiCard
          title="Hub Adoption"
          value={formatPercent(m.adoptionRate)}
          detail={`${m.adultingUsers} of ${m.totalUsers} users`}
          tone={m.adoptionRate >= 20 ? "ok" : "warn"}
        />
        <KpiCard
          title="Contributions"
          value={m.totalContributions.toString()}
          detail={`${m.usersWithContributions} users`}
        />
        <KpiCard
          title="Tax Records"
          value={m.totalTaxRecords.toString()}
          detail={`${m.usersWithTax} users`}
        />
        <KpiCard
          title="Debts"
          value={m.totalDebts.toString()}
          detail={`${m.activeDebts} active`}
          tone={m.activeDebts > 0 ? "warn" : "ok"}
        />
        <KpiCard
          title="Insurance"
          value={m.totalInsurance.toString()}
          detail={`${m.activeInsurance} active`}
        />
        <KpiCard
          title="Bills"
          value={m.totalBills.toString()}
          detail={`${m.activeBills} active`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ── Contributions Card ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Government Contributions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <Row label="Total records" value={m.totalContributions.toString()} />
              <Row label="Paid" value={m.paidContributions.toString()} />
              <Row label="Unpaid" value={m.unpaidContributions.toString()} tone={m.unpaidContributions > 0 ? "warn" : undefined} />
              <Row label="Total contributed" value={formatCurrency(m.totalContributionAmount)} />
              <Row label="Users tracking" value={m.usersWithContributions.toString()} />
            </div>
            {Object.keys(m.contributionsByType).length > 0 && (
              <MixCard
                title="By Type"
                data={m.contributionsByType}
              />
            )}
            {Object.keys(m.contributionsByEmploymentType).length > 0 && (
              <MixCard
                title="By Employment Type"
                data={m.contributionsByEmploymentType}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Tax Records Card ──────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tax Records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <Row label="Total records" value={m.totalTaxRecords.toString()} />
              <Row label="Users filing" value={m.usersWithTax.toString()} />
              <Row label="Total tax due" value={formatCurrency(m.totalTaxDue)} />
              <Row label="Total tax paid" value={formatCurrency(m.totalTaxPaid)} />
              <Row
                label="Unpaid balance"
                value={formatCurrency(m.totalTaxDue - m.totalTaxPaid)}
                tone={m.totalTaxDue - m.totalTaxPaid > 0 ? "warn" : undefined}
              />
            </div>
            {Object.keys(m.taxByStatus).length > 0 && (
              <MixCard title="By Status" data={m.taxByStatus} />
            )}
          </CardContent>
        </Card>

        {/* ── Debts Card ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Debt Tracker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <Row label="Total debts" value={m.totalDebts.toString()} />
              <Row label="Active" value={m.activeDebts.toString()} tone={m.activeDebts > 0 ? "warn" : undefined} />
              <Row label="Paid off" value={m.paidOffDebts.toString()} tone={m.paidOffDebts > 0 ? "ok" : undefined} />
              <Row label="Users tracking" value={m.usersWithDebts.toString()} />
              <Row label="Outstanding balance" value={formatCurrency(m.totalOutstandingBalance)} />
            </div>
            {Object.keys(m.debtsByType).length > 0 && (
              <MixCard title="By Type" data={m.debtsByType} />
            )}
          </CardContent>
        </Card>

        {/* ── Insurance Card ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insurance Policies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <Row label="Total policies" value={m.totalInsurance.toString()} />
              <Row label="Active" value={m.activeInsurance.toString()} />
              <Row label="Users tracking" value={m.usersWithInsurance.toString()} />
              <Row
                label="Renewals in 30 days"
                value={m.upcomingRenewals.toString()}
                tone={m.upcomingRenewals > 0 ? "warn" : undefined}
              />
            </div>
            {Object.keys(m.insuranceByType).length > 0 && (
              <MixCard title="By Type" data={m.insuranceByType} />
            )}
          </CardContent>
        </Card>

        {/* ── Bills Card ────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bills & Subscriptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5 rounded-md border p-3 text-sm">
              <Row label="Total bills" value={m.totalBills.toString()} />
              <Row label="Active" value={m.activeBills.toString()} />
              <Row label="Users tracking" value={m.usersWithBills.toString()} />
              <Row label="Monthly total (active)" value={formatCurrency(m.totalMonthlyBills)} />
            </div>
            {Object.keys(m.billsByCategory).length > 0 && (
              <MixCard title="By Category" data={m.billsByCategory} />
            )}
          </CardContent>
        </Card>

        {/* ── Top Users Card ────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Adulting Users</CardTitle>
          </CardHeader>
          <CardContent>
            {m.topUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {m.topUsers.map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        <span className="text-muted-foreground mr-1.5">
                          {index + 1}.
                        </span>
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0 tabular-nums">
                      {user.totalRecords} records
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail?: string;
  tone?: "ok" | "warn" | "critical";
}) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
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
            <p className="mt-1 text-xs text-muted-foreground truncate">
              {detail}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "critical";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`font-medium ${
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
      </span>
    </div>
  );
}

function MixCard({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) {
  return (
    <div className="grid gap-1.5 rounded-md border p-3 text-sm">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground text-xs">
        {Object.entries(data)
          .sort((a, b) => b[1] - a[1])
          .map(([key, count]) => `${count} ${prettyLabel(key)}`)
          .join(" · ")}
      </p>
    </div>
  );
}

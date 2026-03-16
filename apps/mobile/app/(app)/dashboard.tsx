import React, { useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import Svg, { Circle as SvgCircle, Path as SvgPath, Defs as SvgDefs, LinearGradient as SvgLinearGradient, Stop as SvgStop } from "react-native-svg";
import { router } from "expo-router";
import { useTransactionsSummary, useRecentTransactions, useTransactions } from "@/hooks/use-transactions";
import { useHealthScore } from "@/hooks/use-health-score";
import { useGoals } from "@/hooks/use-goals";
import { useBudgetSummary } from "@/hooks/use-budgets";
import {
  useMonthlyTrend,
  useSpendingByCategory,
  useNetWorthOverTime,
  useSpendingComparison,
} from "@/hooks/use-chart-data";
import { useSafeToSpend } from "@/hooks/use-safe-to-spend";
import { useSavingsRate } from "@/hooks/use-savings-rate";
import { useEmergencyFund } from "@/hooks/use-emergency-fund";
import { useProfile } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/lib/theme";
import { formatCurrency, formatSignedCurrency, getTransactionLabel, getTransactionCategory } from "@/lib/format";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUp,
  ArrowDown,
  CornerDownRight,
  Clock,
  AlertCircle,
  Zap,
  Shield,
} from "lucide-react-native";

// ── Types ────────────────────────────────────────────────────────────────────

type DashboardSection = "trends" | "planning" | "health" | "activity";
type TrendView = "spending" | "monthly" | "networth" | "compare";

const SECTION_PILLS: Array<{ value: DashboardSection; label: string }> = [
  { value: "trends", label: "Trends" },
  { value: "planning", label: "Planning" },
  { value: "health", label: "Health" },
  { value: "activity", label: "Insights" },
];

const TREND_PILLS: Array<{ value: TrendView; label: string }> = [
  { value: "spending", label: "Spending" },
  { value: "monthly", label: "Monthly" },
  { value: "networth", label: "Net Worth" },
  { value: "compare", label: "Compare" },
];

const DONUT_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFirstOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function getCurrentMonthRange() {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0],
  };
}

function getScoreColor(score: number, isDark: boolean) {
  if (score >= 80) return isDark ? "#4ADE80" : "#16A34A";
  if (score >= 50) return isDark ? "#FACC15" : "#EAB308";
  return isDark ? "#F87171" : "#EF4444";
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

function getBarColor(score: number) {
  if (score >= 80) return "#22C55E";
  if (score >= 50) return "#EAB308";
  return "#EF4444";
}

function getProgressColor(pct: number, primary: string) {
  if (pct >= 100) return primary;
  if (pct >= 75) return primary + "CC";
  if (pct >= 50) return primary + "99";
  if (pct >= 25) return primary + "66";
  return primary + "4D";
}

function formatCategory(value: string) {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonBox({
  width,
  height,
  borderRadius = 4,
  color,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  color: string;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: color,
          opacity: 0.5,
        },
        style,
      ]}
    />
  );
}

// ── Main Dashboard Screen ────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  useProfile();

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useTransactionsSummary();
  const { data: healthScore, isLoading: healthLoading } = useHealthScore();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const { data: recentTx, isLoading: recentLoading, error: recentError } = useRecentTransactions();
  const { data: trend, isLoading: trendLoading } = useMonthlyTrend();
  const { data: spending, isLoading: spendingLoading } = useSpendingByCategory();
  const { data: netWorth, isLoading: netWorthLoading } = useNetWorthOverTime();
  const { data: comparison, isLoading: comparisonLoading } = useSpendingComparison();
  const { data: budgetData, isLoading: budgetLoading } = useBudgetSummary(getFirstOfMonth());
  const { data: safeToSpend, isLoading: safeLoading } = useSafeToSpend();
  const { data: savingsRate, isLoading: savingsLoading } = useSavingsRate();
  const { data: emergencyFund, isLoading: emergencyLoading } = useEmergencyFund(3);

  // Spending insights
  const monthRange = getCurrentMonthRange();
  const { data: monthTx, isLoading: insightsLoading } = useTransactions({
    dateFrom: monthRange.from,
    dateTo: monthRange.to,
  });

  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<DashboardSection>("trends");
  const [activeTrend, setActiveTrend] = useState<TrendView>("spending");

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  }

  const incomeColor = isDark ? colors.green400 : colors.green600;
  const activeGoals = goals?.filter((g: any) => !g.is_completed) ?? [];
  const sortedGoals = [...activeGoals]
    .sort((a: any, b: any) => {
      if (a.deadline && b.deadline)
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      const pctA = a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
      const pctB = b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
      return pctB - pctA;
    })
    .slice(0, 3);

  // Compute spending insights
  const insights = monthTx
    ? (() => {
        const expenses = monthTx.filter(
          (tx: any) => tx.amount < 0 && tx.category !== "transfer"
        );
        const categoryTotals: Record<string, number> = {};
        for (const tx of expenses) {
          categoryTotals[tx.category] =
            (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
        }
        const topCategory =
          Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ?? "N/A";
        const transactionCount = monthTx.filter(
          (tx: any) => tx.category !== "transfer"
        ).length;
        const avgAmount =
          expenses.length > 0
            ? expenses.reduce((sum: number, tx: any) => sum + Math.abs(tx.amount), 0) /
              expenses.length
            : 0;
        const biggestExpense =
          expenses.length > 0
            ? Math.max(...expenses.map((tx: any) => Math.abs(tx.amount)))
            : 0;
        return { topCategory, transactionCount, avgAmount, biggestExpense };
      })()
    : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          variant="h2"
          style={{ color: colors.foreground, letterSpacing: -0.3 }}
        >
          Dashboard
        </Text>
        <Text
          variant="body-sm"
          style={{ color: colors.mutedForeground, marginTop: 2 }}
        >
          Your path to financial freedom
        </Text>
      </View>

      {/* ── OVERVIEW label ───────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: colors.mutedForeground,
            marginBottom: 8,
          }}
        >
          Overview
        </Text>
      </View>

      {/* ── Balance Cards ────────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16 }}>
        {summaryLoading ? (
          <View style={{ gap: 12 }}>
            <Card>
              <CardHeader><SkeletonBox width={96} height={16} color={colors.muted} /></CardHeader>
              <CardContent><SkeletonBox width={128} height={32} color={colors.muted} /></CardContent>
            </Card>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Card style={{ flex: 1 }}>
                <CardHeader><SkeletonBox width={64} height={16} color={colors.muted} /></CardHeader>
                <CardContent><SkeletonBox width={96} height={24} color={colors.muted} /></CardContent>
              </Card>
              <Card style={{ flex: 1 }}>
                <CardHeader><SkeletonBox width={64} height={16} color={colors.muted} /></CardHeader>
                <CardContent><SkeletonBox width={96} height={24} color={colors.muted} /></CardContent>
              </Card>
            </View>
          </View>
        ) : summaryError ? (
          <Card>
            <CardContent style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 24 }}>
              <AlertCircle size={20} color={colors.destructive} />
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                  Could not load balance
                </Text>
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  {summaryError instanceof Error
                    ? summaryError.message
                    : "Check your connection."}
                </Text>
              </View>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Total Balance */}
            <Card style={{ marginBottom: 12 }}>
              <CardHeader
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingBottom: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: colors.mutedForeground,
                  }}
                >
                  Total Balance
                </Text>
                <Wallet size={18} color={colors.foreground} />
              </CardHeader>
              <CardContent>
                <Text
                  style={{ fontSize: 22, fontWeight: "700", color: colors.foreground }}
                >
                  {formatCurrency(summary?.balance ?? 0)}
                </Text>
              </CardContent>
            </Card>

            {/* Income + Expenses */}
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
              <Card style={{ flex: 1 }}>
                <CardHeader
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "500",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                    }}
                  >
                    Income
                  </Text>
                  <TrendingUp size={16} color={incomeColor} />
                </CardHeader>
                <CardContent>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: incomeColor }}>
                    {formatCurrency(summary?.income ?? 0)}
                  </Text>
                </CardContent>
              </Card>
              <Card style={{ flex: 1 }}>
                <CardHeader
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingBottom: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "500",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                    }}
                  >
                    Expenses
                  </Text>
                  <TrendingDown size={16} color={colors.foreground} />
                </CardHeader>
                <CardContent>
                  <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}>
                    {formatCurrency(summary?.expenses ?? 0)}
                  </Text>
                </CardContent>
              </Card>
            </View>

            {/* Breakdown row */}
            {summary?.breakdown && (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {[
                  { icon: Wallet, label: "Accounts", value: formatCurrency(summary.breakdown.inAccounts) },
                  { icon: Target, label: "Goals", value: formatCurrency(summary.breakdown.inGoals) },
                  { icon: DollarSign, label: "Budgets", value: formatCurrency(budgetData?.totalBudget ?? 0) },
                ].map((item) => (
                  <View
                    key={item.label}
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.muted + "4D",
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                      <item.icon size={12} color={colors.mutedForeground} />
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "500",
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          color: colors.mutedForeground,
                        }}
                        numberOfLines={1}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Text
                      style={{ fontSize: 12, fontWeight: "600", color: colors.foreground }}
                      numberOfLines={1}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </View>

      {/* ── DASHBOARD SECTIONS ───────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            textTransform: "uppercase",
            letterSpacing: 1,
            color: colors.mutedForeground,
            marginBottom: 8,
            paddingHorizontal: 4,
          }}
        >
          Dashboard Sections
        </Text>
        <SegmentedControl
          options={SECTION_PILLS}
          value={activeSection}
          onChange={setActiveSection}
          compact
        />
      </View>

      {/* ── Section Content ──────────────────────────────────────────── */}
      <View style={{ paddingHorizontal: 16, gap: 16 }}>
        {/* ════════════ TRENDS ════════════ */}
        {activeSection === "trends" && (
          <>
            {/* Hint text */}
            <View style={{ marginTop: -4, paddingHorizontal: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <CornerDownRight size={14} color={colors.primary + "B3"} />
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  Trends selected — choose a trend view below
                </Text>
              </View>
              <View
                style={{
                  marginLeft: 6,
                  marginTop: 4,
                  height: 8,
                  width: 1,
                  backgroundColor: colors.border + "CC",
                }}
              />
            </View>

            {/* Trend Views bordered section */}
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.primary + "33",
                backgroundColor: colors.primary + "0A",
                padding: 10,
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  color: colors.primary + "CC",
                }}
              >
                Trend Views
              </Text>
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "80",
                  backgroundColor: colors.background + "99",
                  padding: 6,
                }}
              >
                <SegmentedControl
                  options={TREND_PILLS}
                  value={activeTrend}
                  onChange={setActiveTrend}
                />
              </View>

              {/* ── Spending by Category (Donut) ── */}
              {activeTrend === "spending" && (
                <SpendingChartSection
                  data={spending}
                  isLoading={spendingLoading}
                  colors={colors}
                  isDark={isDark}
                />
              )}

              {/* ── Monthly Trend (Bar Chart) ── */}
              {activeTrend === "monthly" && (
                <MonthlyTrendSection
                  data={trend}
                  isLoading={trendLoading}
                  colors={colors}
                  isDark={isDark}
                />
              )}

              {/* ── Net Worth (Area-like) ── */}
              {activeTrend === "networth" && (
                <NetWorthSection
                  data={netWorth}
                  isLoading={netWorthLoading}
                  colors={colors}
                  isDark={isDark}
                />
              )}

              {/* ── Spending Comparison (Table) ── */}
              {activeTrend === "compare" && (
                <SpendingComparisonSection
                  data={comparison}
                  isLoading={comparisonLoading}
                  colors={colors}
                  isDark={isDark}
                />
              )}
            </View>
          </>
        )}

        {/* ════════════ PLANNING ════════════ */}
        {activeSection === "planning" && (
          <>
            <BudgetStatusSection
              data={budgetData}
              isLoading={budgetLoading}
              colors={colors}
              isDark={isDark}
            />
            <GoalsSnapshotSection
              goals={sortedGoals}
              totalGoals={goals?.length ?? 0}
              activeCount={activeGoals.length}
              isLoading={goalsLoading}
              colors={colors}
              isDark={isDark}
            />
          </>
        )}

        {/* ════════════ HEALTH ════════════ */}
        {activeSection === "health" && (
          <>
            <HealthScoreSection
              data={healthScore}
              isLoading={healthLoading}
              colors={colors}
              isDark={isDark}
            />
            <SafeToSpendSection
              data={safeToSpend}
              isLoading={safeLoading}
              colors={colors}
              isDark={isDark}
            />
            <SavingsRateSection
              data={savingsRate}
              isLoading={savingsLoading}
              colors={colors}
              isDark={isDark}
            />
            <EmergencyFundSection
              data={emergencyFund}
              isLoading={emergencyLoading}
              colors={colors}
              isDark={isDark}
            />
          </>
        )}

        {/* ════════════ INSIGHTS / ACTIVITY ════════════ */}
        {activeSection === "activity" && (
          <>
            <SpendingInsightsSection
              insights={insights}
              isLoading={insightsLoading}
              colors={colors}
            />
            <RecentTransactionsSection
              transactions={recentTx}
              isLoading={recentLoading}
              error={recentError}
              colors={colors}
              isDark={isDark}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS (matching web exactly)
// ═══════════════════════════════════════════════════════════════════════════════

// ── Spending Chart (Donut) ───────────────────────────────────────────────────

function SpendingChartSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent style={{ alignItems: "center", justifyContent: "center", height: 220 }}>
          <View
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: colors.muted,
              opacity: 0.5,
            }}
          />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Spending by Category</CardTitle>
        </CardHeader>
        <CardContent style={{ alignItems: "center", justifyContent: "center", height: 220 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            No spending data this month
          </Text>
        </CardContent>
      </Card>
    );
  }

  const totalSpending = data.reduce((sum: number, item: any) => sum + item.amount, 0);
  const size = 180;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16 }}>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent style={{ gap: 12 }}>
        {/* Donut chart */}
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background circle */}
            <SvgCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={colors.muted}
              strokeWidth={strokeWidth}
            />
            {/* Data segments */}
            {data.map((item: any, index: number) => {
              const pct = totalSpending > 0 ? item.amount / totalSpending : 0;
              const dashLength = pct * circumference;
              const gapLength = circumference - dashLength;
              const rotation = (cumulativeOffset / circumference) * 360 - 90;
              cumulativeOffset += dashLength;

              return (
                <SvgCircle
                  key={item.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={DONUT_COLORS[index % DONUT_COLORS.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${gapLength}`}
                  strokeLinecap="butt"
                  rotation={rotation}
                  origin={`${size / 2}, ${size / 2}`}
                />
              );
            })}
          </Svg>
        </View>

        {/* Legend */}
        <View style={{ gap: 8 }}>
          {data.map((item: any, index: number) => {
            const percentage = totalSpending > 0 ? (item.amount / totalSpending) * 100 : 0;
            return (
              <View
                key={item.category}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  borderRadius: 6,
                  backgroundColor: colors.muted + "66",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
                  <View
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length],
                    }}
                  />
                  <Text
                    style={{ fontSize: 14, color: colors.foreground, textTransform: "capitalize" }}
                    numberOfLines={1}
                  >
                    {item.category}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                    {formatCurrency(item.amount)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}

// ── Monthly Trend (Bar Chart) ────────────────────────────────────────────────

function MonthlyTrendSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 220, flexDirection: "row", alignItems: "flex-end", gap: 8, justifyContent: "center", paddingBottom: 24 }}>
          {[40, 65, 55, 80, 45, 70].map((h, i) => (
            <View key={i} style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", gap: 2 }}>
              <View style={{ flex: 1, height: `${h}%`, backgroundColor: colors.muted, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.5 }} />
              <View style={{ flex: 1, height: `${h - 15}%`, backgroundColor: colors.muted, borderTopLeftRadius: 4, borderTopRightRadius: 4, opacity: 0.5 }} />
            </View>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Monthly Trend</CardTitle>
        </CardHeader>
        <CardContent style={{ alignItems: "center", justifyContent: "center", height: 220 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            No transaction data available
          </Text>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item: any) => ({
    ...item,
    net: Math.round((item.income - item.expenses) * 100) / 100,
  }));
  const maxVal = Math.max(...chartData.map((m: any) => Math.max(m.income, m.expenses)), 1);
  const chartHeight = 200;

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16 }}>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent style={{ gap: 12 }}>
        {/* Bar chart */}
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border + "99",
            backgroundColor: colors.background + "4D",
            padding: 8,
          }}
        >
          <View style={{ height: chartHeight, flexDirection: "row", alignItems: "flex-end", gap: 4 }}>
            {chartData.map((month: any) => {
              const incHeight = maxVal > 0 ? (month.income / maxVal) * (chartHeight - 24) : 0;
              const expHeight = maxVal > 0 ? (month.expenses / maxVal) * (chartHeight - 24) : 0;
              return (
                <View key={month.month} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 2, flex: 1 }}>
                    <View
                      style={{
                        flex: 1,
                        height: Math.max(incHeight, 2),
                        backgroundColor: "#16a34a",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }}
                    />
                    <View
                      style={{
                        flex: 1,
                        height: Math.max(expHeight, 2),
                        backgroundColor: "#94a3b8",
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 9, color: colors.mutedForeground }}
                    numberOfLines={1}
                  >
                    {month.month}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#16a34a" }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Income</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#94a3b8" }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Expenses</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: "#2563eb" }} />
              <Text style={{ fontSize: 11, color: colors.mutedForeground }}>Net</Text>
            </View>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

// ── Net Worth (Area-like Chart) ──────────────────────────────────────────────

function NetWorthSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={160} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent>
          <SkeletonBox width="100%" height={200} borderRadius={8} color={colors.muted} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Net Worth Over Time</CardTitle>
        </CardHeader>
        <CardContent style={{ alignItems: "center", justifyContent: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Not enough data yet
          </Text>
        </CardContent>
      </Card>
    );
  }

  const maxBalance = Math.max(...data.map((d: any) => d.balance), 1);
  const minBalance = Math.min(...data.map((d: any) => d.balance), 0);
  const range = maxBalance - minBalance || 1;
  const chartHeight = 180;
  const chartWidth = 300;
  const paddingX = 8;
  const paddingY = 8;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = data.map((d: any, i: number) => {
    const x = paddingX + (i / (data.length - 1 || 1)) * usableWidth;
    const y = paddingY + usableHeight - ((d.balance - minBalance) / range) * usableHeight;
    return { x, y };
  });

  const linePath = points.map((p: any, i: number) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${chartHeight - paddingY} L${points[0].x},${chartHeight - paddingY} Z`;

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16 }}>Net Worth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ alignItems: "center" }}>
          <Svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
            <SvgDefs>
              <SvgLinearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <SvgStop offset="0.05" stopColor="#16a34a" stopOpacity={0.3} />
                <SvgStop offset="0.95" stopColor="#16a34a" stopOpacity={0} />
              </SvgLinearGradient>
            </SvgDefs>
            <SvgPath d={areaPath} fill="url(#netWorthGrad)" />
            <SvgPath d={linePath} fill="none" stroke="#16a34a" strokeWidth={2} />
            {/* Dots */}
            {points.map((p: any, i: number) => (
              <SvgCircle key={i} cx={p.x} cy={p.y} r={3} fill="#16a34a" />
            ))}
          </Svg>
        </View>
        {/* X-axis labels */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, marginTop: 4 }}>
          {data
            .filter((_: any, i: number) => i % Math.max(1, Math.floor(data.length / 6)) === 0 || i === data.length - 1)
            .map((d: any) => (
              <Text key={d.month} style={{ fontSize: 9, color: colors.mutedForeground }}>
                {d.month}
              </Text>
            ))}
        </View>
      </CardContent>
    </Card>
  );
}

// ── Spending Comparison (Table) ──────────────────────────────────────────────

function SpendingComparisonSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={192} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent>
          <SkeletonBox width="100%" height={200} borderRadius={8} color={colors.muted} />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <CardTitle style={{ fontSize: 16 }}>Spending: This vs Last Month</CardTitle>
        </CardHeader>
        <CardContent style={{ alignItems: "center", justifyContent: "center", paddingVertical: 32 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Not enough data to compare
          </Text>
        </CardContent>
      </Card>
    );
  }

  const mobileRows = data
    .filter((d: any) => d.currentMonth > 0 || d.previousMonth > 0)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16 }}>Spending: This vs Last Month</CardTitle>
      </CardHeader>
      <CardContent>
        <View
          style={{
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border + "99",
            backgroundColor: colors.background + "4D",
            overflow: "hidden",
          }}
        >
          {/* Header row */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.border + "99",
            }}
          >
            <Text style={{ flex: 1.1, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.mutedForeground }}>
              Category
            </Text>
            <Text style={{ flex: 0.9, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.mutedForeground, textAlign: "right" }}>
              This
            </Text>
            <Text style={{ flex: 0.9, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.mutedForeground, textAlign: "right" }}>
              Last
            </Text>
            <Text style={{ flex: 0.7, fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, color: colors.mutedForeground, textAlign: "right" }}>
              {"\u0394"}
            </Text>
          </View>

          {/* Data rows */}
          {mobileRows.map((d: any, index: number) => {
            const isIncrease = d.changePercent > 0;
            const isDecrease = d.changePercent < 0;
            const deltaColor = isIncrease
              ? "#F59E0B"
              : isDecrease
              ? "#16A34A"
              : colors.mutedForeground;

            return (
              <View
                key={d.category}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderBottomWidth: index < mobileRows.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border + "80",
                }}
              >
                <Text
                  style={{ flex: 1.1, fontSize: 11, fontWeight: "500", color: colors.foreground }}
                  numberOfLines={1}
                >
                  {formatCategory(d.category)}
                </Text>
                <Text
                  style={{ flex: 0.9, fontSize: 11, fontWeight: "600", color: colors.primary, textAlign: "right" }}
                  numberOfLines={1}
                >
                  {formatCurrency(d.currentMonth)}
                </Text>
                <Text
                  style={{ flex: 0.9, fontSize: 11, color: colors.mutedForeground, textAlign: "right" }}
                  numberOfLines={1}
                >
                  {formatCurrency(d.previousMonth)}
                </Text>
                <View style={{ flex: 0.7, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                  {isIncrease && <ArrowUp size={12} color={deltaColor} />}
                  {isDecrease && <ArrowDown size={12} color={deltaColor} />}
                  <Text style={{ fontSize: 11, fontWeight: "600", color: deltaColor }}>
                    {Math.abs(d.changePercent)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </CardContent>
    </Card>
  );
}

// ── Budget Status ────────────────────────────────────────────────────────────

function BudgetStatusSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 12 }}>
          <SkeletonBox width={112} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          {[40, 55, 35].map((w, i) => (
            <View key={i} style={{ gap: 6 }}>
              <SkeletonBox width={`${w}%`} height={12} color={colors.muted} />
              <SkeletonBox width="100%" height={6} borderRadius={3} color={colors.muted} />
            </View>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data || data.budgets.length === 0) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 12 }}>
          <CardTitle style={{ fontSize: 16 }}>Budget Status</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            No budgets set this month.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(app)/budgets")}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <Text style={{ fontSize: 14, color: colors.primary }}>Set up budgets</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </CardContent>
      </Card>
    );
  }

  const budgetItems = data.budgets
    .map((budget: any) => {
      const spent = data.spentByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { budget, spent, percentage };
    })
    .sort((a: any, b: any) => b.percentage - a.percentage);

  const alerts = budgetItems.filter((a: any) => a.percentage >= 75);
  const totalPct = data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
        <CardTitle style={{ fontSize: 16 }}>Budget Status</CardTitle>
        {alerts.length > 0 && (
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: isDark ? "#FACC15" : "#CA8A04",
            }}
          >
            {alerts.length} alert{alerts.length > 1 ? "s" : ""}
          </Text>
        )}
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        {/* Budget summary */}
        <View style={{ gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Total Spent</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              {formatCurrency(data.totalSpent)} / {formatCurrency(data.totalBudget)}
            </Text>
          </View>
          <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" }}>
            <View
              style={{
                height: "100%",
                borderRadius: 4,
                backgroundColor:
                  totalPct > 100
                    ? colors.foreground
                    : totalPct > 75
                    ? "#EAB308"
                    : "#22C55E",
                width: `${Math.min(totalPct, 100)}%`,
              }}
            />
          </View>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: "right" }}>
            {totalPct.toFixed(0)}% used
          </Text>
        </View>

        {/* Per-category budgets */}
        <View style={{ gap: 10 }}>
          {budgetItems.map(({ budget, spent, percentage }: any) => {
            const isOver = percentage > 100;
            const statusColor =
              percentage >= 75
                ? isOver
                  ? colors.foreground
                  : "#EAB308"
                : "#16A34A";
            const barColor =
              percentage >= 75
                ? isOver
                  ? colors.foreground
                  : "#EAB308"
                : "#16A34A";

            return (
              <View key={budget.id} style={{ gap: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "500", color: colors.foreground, textTransform: "capitalize", flex: 1 }}
                    numberOfLines={1}
                  >
                    {budget.category}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "500", color: statusColor }}>
                    {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: barColor,
                      width: `${Math.min(percentage, 100)}%`,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/(app)/budgets")}
          style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
        >
          <Text style={{ fontSize: 14, color: colors.primary }}>Manage Budgets</Text>
          <ArrowRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </CardContent>
    </Card>
  );
}

// ── Goals Snapshot ───────────────────────────────────────────────────────────

function GoalsSnapshotSection({
  goals,
  totalGoals,
  activeCount,
  isLoading,
  colors,
  isDark,
}: {
  goals: any[];
  totalGoals: number;
  activeCount: number;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 12 }}>
          <SkeletonBox width={96} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ gap: 12 }}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={{ gap: 8 }}>
              <SkeletonBox width={128} height={16} color={colors.muted} />
              <SkeletonBox width="100%" height={8} borderRadius={4} color={colors.muted} />
              <SkeletonBox width={96} height={12} color={colors.muted} />
            </View>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
        <CardTitle style={{ fontSize: 16 }}>Active Goals</CardTitle>
        {activeCount > 3 && (
          <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>
            {activeCount - 3} more
          </Text>
        )}
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        {goals.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 16, gap: 8 }}>
            <Target size={32} color={colors.mutedForeground} />
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
              No active goals yet
            </Text>
          </View>
        ) : (
          <>
            <View style={{ gap: 12 }}>
              {goals.map((goal: any) => {
                const pct = Math.min(
                  100,
                  goal.target_amount > 0
                    ? (goal.current_amount / goal.target_amount) * 100
                    : 0
                );
                const daysLeft = goal.deadline
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(goal.deadline + "T00:00:00").getTime() - Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : null;

                return (
                  <View key={goal.id} style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                          <Text
                            style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}
                            numberOfLines={1}
                          >
                            {goal.name}
                          </Text>
                          {daysLeft !== null && daysLeft <= 30 && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
                              <Clock size={12} color={daysLeft <= 7 ? "#EF4444" : "#F59E0B"} />
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: "500",
                                  color: daysLeft <= 7 ? "#EF4444" : "#F59E0B",
                                }}
                              >
                                {daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
                          {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)} {"\u2022"} {pct.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                    <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" }}>
                      <View
                        style={{
                          height: "100%",
                          borderRadius: 4,
                          backgroundColor: getProgressColor(pct, colors.primary),
                          width: `${pct}%`,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
              {totalGoals > 0 && (
                <TouchableOpacity
                  onPress={() => router.push("/(app)/goals")}
                  style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                >
                  <Text style={{ fontSize: 14, fontWeight: "500", color: colors.primary }}>
                    View all ({totalGoals})
                  </Text>
                  <ArrowRight size={14} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Health Score ─────────────────────────────────────────────────────────────

function HealthScoreSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={160} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: colors.muted, opacity: 0.5 }} />
          <View style={{ flex: 1, gap: 8 }}>
            <SkeletonBox width="100%" height={12} color={colors.muted} />
            <SkeletonBox width="75%" height={12} color={colors.muted} />
            <SkeletonBox width="50%" height={12} color={colors.muted} />
          </View>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (data.total / 100) * circumference;
  const scoreStroke =
    data.total >= 80
      ? "#22C55E"
      : data.total >= 50
      ? "#EAB308"
      : "#EF4444";

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 8 }}>
        <CardTitle style={{ fontSize: 16 }}>Financial Health</CardTitle>
      </CardHeader>
      <CardContent>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 24 }}>
          {/* Circular score using SVG */}
          <View style={{ width: 96, height: 96 }}>
            <Svg width={96} height={96} viewBox="0 0 96 96">
              <SvgCircle
                cx={48}
                cy={48}
                r={42}
                fill="none"
                stroke={colors.muted}
                strokeWidth={6}
              />
              <SvgCircle
                cx={48}
                cy={48}
                r={42}
                fill="none"
                stroke={scoreStroke}
                strokeWidth={6}
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={dashOffset}
                rotation={-90}
                origin="48, 48"
              />
            </Svg>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: getScoreColor(data.total, isDark),
                }}
              >
                {data.total}
              </Text>
              <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                {getScoreLabel(data.total)}
              </Text>
            </View>
          </View>

          {/* Sub-scores */}
          <View style={{ flex: 1, gap: 10 }}>
            {data.subScores.map((sub: any) => (
              <View key={sub.label} style={{ gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <Text
                    style={{ fontSize: 12, fontWeight: "500", color: colors.foreground }}
                    numberOfLines={1}
                  >
                    {sub.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {sub.detail}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: getBarColor(sub.score),
                      width: `${sub.score}%`,
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

// ── Safe to Spend ────────────────────────────────────────────────────────────

function SafeToSpendSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={144} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ gap: 16 }}>
          <SkeletonBox width={192} height={48} color={colors.muted} />
          <View style={{ gap: 8 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <SkeletonBox width={112} height={12} color={colors.muted} />
                <SkeletonBox width={80} height={12} color={colors.muted} />
              </View>
            ))}
          </View>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const hasIncome = data.monthlyIncome > 0;
  const isLow = data.safeToSpend < data.monthlyIncome * 0.1;
  const isEmpty = data.safeToSpend <= 0;

  const statusColor = isEmpty
    ? colors.foreground
    : isLow
    ? "#F59E0B"
    : "#16A34A";

  const breakdownItems = [
    { label: "Monthly Income", value: data.monthlyIncome, Icon: Wallet, sign: "+", color: isDark ? colors.emerald400 : colors.emerald700 },
    { label: "Budget Limits", value: data.budgetAllocated, Icon: TrendingDown, sign: "\u2212", color: colors.mutedForeground },
    { label: "Goal Contributions", value: data.goalContributions, Icon: Target, sign: "\u2212", color: colors.mutedForeground },
  ];

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingBottom: 12 }}>
        <Zap size={20} color={colors.mutedForeground} />
        <CardTitle style={{ fontSize: 16 }}>Safe to Spend</CardTitle>
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        {/* Big number */}
        <View>
          <Text style={{ fontSize: 30, fontWeight: "700", color: statusColor }}>
            {formatCurrency(data.safeToSpend)}
          </Text>
          <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 2 }}>
            {isEmpty
              ? "Budget fully committed this month"
              : isLow
              ? "Running low \u2014 check your budgets"
              : "freely available this month"}
          </Text>
        </View>

        {/* Progress bar */}
        {hasIncome && (
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Spent</Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                {formatCurrency(data.alreadySpent)} of {formatCurrency(data.budgetAllocated || data.monthlyIncome)}
              </Text>
            </View>
            <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden" }}>
              <View
                style={{
                  height: "100%",
                  borderRadius: 4,
                  backgroundColor:
                    data.budgetAllocated > 0
                      ? data.alreadySpent / data.budgetAllocated > 0.9
                        ? colors.foreground
                        : data.alreadySpent / data.budgetAllocated > 0.7
                        ? "#F59E0B"
                        : colors.primary
                      : colors.primary,
                  width: `${Math.min(
                    100,
                    Math.round(
                      (data.alreadySpent / (data.budgetAllocated || data.monthlyIncome || 1)) * 100
                    )
                  )}%`,
                }}
              />
            </View>
          </View>
        )}

        {/* Breakdown */}
        <View style={{ gap: 8, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
          {breakdownItems.map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <item.Icon size={14} color={colors.mutedForeground} />
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: "500", color: item.color }}>
                {item.sign} {formatCurrency(item.value)}
              </Text>
            </View>
          ))}
        </View>

        {!hasIncome && (
          <View style={{ backgroundColor: colors.muted + "80", borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              Add income transactions this month to see your safe-to-spend number
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ── Savings Rate ─────────────────────────────────────────────────────────────

function SavingsRateSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={160} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ gap: 16 }}>
          <SkeletonBox width={128} height={32} color={colors.muted} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <SkeletonBox width={80} height={12} color={colors.muted} />
              <SkeletonBox width={96} height={16} color={colors.muted} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <SkeletonBox width={80} height={12} color={colors.muted} />
              <SkeletonBox width={96} height={16} color={colors.muted} />
            </View>
          </View>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isImproving =
    data.lastMonthSavingsPercent !== undefined &&
    data.savingsRatePercent > data.lastMonthSavingsPercent;
  const isMaintained =
    data.lastMonthSavingsPercent !== undefined &&
    data.savingsRatePercent === data.lastMonthSavingsPercent;

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
        <CardTitle style={{ fontSize: 16 }}>Monthly Savings</CardTitle>
        {data.lastMonthSavingsPercent !== undefined && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            {isImproving ? (
              <>
                <TrendingUp size={14} color="#16A34A" />
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#16A34A" }}>
                  +{data.savingsRatePercent - data.lastMonthSavingsPercent}%
                </Text>
              </>
            ) : isMaintained ? (
              <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>
                No change
              </Text>
            ) : (
              <>
                <TrendingDown size={14} color="#F59E0B" />
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#F59E0B" }}>
                  {data.savingsRatePercent - data.lastMonthSavingsPercent}%
                </Text>
              </>
            )}
          </View>
        )}
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        {/* Big savings rate */}
        <View>
          <Text style={{ fontSize: 36, fontWeight: "700", color: "#16A34A" }}>
            {data.savingsRatePercent}%
          </Text>
          <Text style={{ fontSize: 14, color: colors.mutedForeground, marginTop: 4 }}>
            of income saved this month
          </Text>
        </View>

        {/* Breakdown */}
        <View style={{ flexDirection: "row", gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>Income</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              {formatCurrency(data.monthlyIncome)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>Expenses</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>
              {formatCurrency(data.monthlyExpenses)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>Saved</Text>
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#16A34A" }}>
              {formatCurrency(data.monthlySavings)}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

// ── Emergency Fund ───────────────────────────────────────────────────────────

function EmergencyFundSection({
  data,
  isLoading,
  colors,
  isDark,
}: {
  data: any;
  isLoading: boolean;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 8 }}>
          <SkeletonBox width={160} height={20} color={colors.muted} />
        </CardHeader>
        <CardContent style={{ gap: 16 }}>
          <SkeletonBox width={128} height={32} color={colors.muted} />
          <SkeletonBox width="100%" height={8} borderRadius={4} color={colors.muted} />
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <SkeletonBox width={80} height={12} color={colors.muted} />
              <SkeletonBox width={96} height={16} color={colors.muted} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <SkeletonBox width={80} height={12} color={colors.muted} />
              <SkeletonBox width={96} height={16} color={colors.muted} />
            </View>
          </View>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isFunded = data.monthsCovered >= data.targetMonths;
  const hasExpenseData = data.monthlyExpenses > 0;
  const { hasGoal } = data;
  const statusColor =
    !hasExpenseData && !hasGoal
      ? colors.mutedForeground
      : isFunded
      ? "#16A34A"
      : data.progressPercent >= 50
      ? "#EAB308"
      : "#F59E0B";
  const progressColor =
    !hasExpenseData && !hasGoal
      ? colors.mutedForeground + "66"
      : isFunded
      ? "#22C55E"
      : data.progressPercent >= 50
      ? "#EAB308"
      : "#F59E0B";

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Shield size={20} color={colors.mutedForeground} />
          <CardTitle style={{ fontSize: 16 }}>Emergency Fund</CardTitle>
        </View>
        {hasGoal && (
          <Text
            style={{ fontSize: 12, color: colors.mutedForeground, maxWidth: 140 }}
            numberOfLines={1}
          >
            {data.goalName}
          </Text>
        )}
      </CardHeader>
      <CardContent style={{ gap: 16 }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
            <View style={{ gap: 4 }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                {data.monthsCovered.toFixed(1)} of {data.targetMonths} months covered
              </Text>
              <Text style={{ fontSize: 24, fontWeight: "700", color: statusColor }}>
                {formatCurrency(data.currentAmount)}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: "right" }}>
              {hasGoal
                ? `Goal: ${formatCurrency(data.targetAmount)}`
                : hasExpenseData
                ? `Target: ${formatCurrency(data.targetAmount)}`
                : "No expense data yet"}
            </Text>
          </View>

          {/* Progress bar */}
          <View style={{ height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: "hidden", marginTop: 12 }}>
            <View
              style={{
                height: "100%",
                backgroundColor: progressColor,
                width: `${data.progressPercent}%`,
              }}
            />
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Monthly Expenses</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              {formatCurrency(data.monthlyExpenses)}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Target Goal</Text>
            <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
              {hasGoal
                ? formatCurrency(data.targetAmount)
                : `${data.targetMonths} months expenses`}
            </Text>
          </View>
        </View>

        {!isFunded && (hasGoal || hasExpenseData) && (
          <View
            style={{
              padding: 8,
              borderRadius: 4,
              backgroundColor: (data.progressPercent >= 50 ? "#EAB308" : "#F59E0B") + "1A",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isDark
                  ? data.progressPercent >= 50 ? "#FDE68A" : "#FCD34D"
                  : data.progressPercent >= 50 ? "#A16207" : "#92400E",
              }}
            >
              {formatCurrency(data.targetAmount - data.currentAmount)} more to reach target
            </Text>
          </View>
        )}

        {!isFunded && !hasGoal && !hasExpenseData && (
          <View style={{ padding: 8, borderRadius: 4, backgroundColor: colors.muted + "80" }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.mutedForeground }}>
              Add expense transactions to calculate your target
            </Text>
          </View>
        )}

        {isFunded && (
          <View style={{ padding: 8, borderRadius: 4, backgroundColor: "#22C55E1A" }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: isDark ? "#86EFAC" : "#15803D",
              }}
            >
              You're fully covered for {data.targetMonths} months!
            </Text>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

// ── Spending Insights ────────────────────────────────────────────────────────

function SpendingInsightsSection({
  insights,
  isLoading,
  colors,
}: {
  insights: any;
  isLoading: boolean;
  colors: any;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader style={{ paddingBottom: 12 }}>
          <CardTitle style={{ fontSize: 16 }}>This Month's Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: "45%", gap: 6 }}>
                <SkeletonBox width={80} height={12} color={colors.muted} />
                <SkeletonBox width={96} height={24} color={colors.muted} />
              </View>
            ))}
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader style={{ paddingBottom: 12 }}>
        <CardTitle style={{ fontSize: 16 }}>This Month's Activity</CardTitle>
      </CardHeader>
      <CardContent style={{ gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Top Spending</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground, textTransform: "capitalize" }}>
              {insights?.topCategory ?? "N/A"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Total Transactions</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              {insights?.transactionCount ?? 0}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 }}>
          <View>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Average Amount</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              {formatCurrency(insights?.avgAmount ?? 0)}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Largest Expense</Text>
            <Text style={{ fontSize: 16, fontWeight: "700", color: colors.foreground }}>
              {formatCurrency(insights?.biggestExpense ?? 0)}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

// ── Recent Transactions ──────────────────────────────────────────────────────

function RecentTransactionsSection({
  transactions,
  isLoading,
  error,
  colors,
  isDark,
}: {
  transactions: any;
  isLoading: boolean;
  error: any;
  colors: any;
  isDark: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: 16 }}>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent style={{ gap: 16 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.muted, opacity: 0.5 }} />
              <View style={{ flex: 1, gap: 8 }}>
                <SkeletonBox width={128} height={16} color={colors.muted} />
                <SkeletonBox width={80} height={12} color={colors.muted} />
              </View>
              <SkeletonBox width={64} height={16} color={colors.muted} />
            </View>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle style={{ fontSize: 16 }}>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 24 }}>
          <AlertCircle size={20} color={colors.destructive} />
          <View>
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
              Could not load transactions
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {error instanceof Error ? error.message : "Check your connection."}
            </Text>
          </View>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <CardTitle style={{ fontSize: 16 }}>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 24, gap: 8 }}>
            <Wallet size={32} color={colors.mutedForeground} />
            <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
              No transactions yet
            </Text>
            <Text style={{ fontSize: 12, color: colors.mutedForeground, textAlign: "center" }}>
              Add your first transaction and start tracking your path to financial freedom.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 16 }}>
            {transactions.slice(0, 5).map((tx: any) => (
              <View key={tx.id} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                      tx.category === "transfer"
                        ? "#DBEAFE"
                        : tx.amount > 0
                        ? "#DCFCE7"
                        : colors.muted,
                  }}
                >
                  {tx.category === "transfer" ? (
                    <ArrowLeftRight size={20} color="#2563EB" />
                  ) : tx.amount > 0 ? (
                    <ArrowUpRight size={20} color="#16A34A" />
                  ) : (
                    <ArrowDownRight size={20} color={colors.foreground} />
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}
                    numberOfLines={1}
                  >
                    {getTransactionLabel(tx)}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground, textTransform: "capitalize" }}>
                    {getTransactionCategory(tx)}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color:
                      tx.category === "transfer"
                        ? "#2563EB"
                        : tx.amount > 0
                        ? "#16A34A"
                        : colors.foreground,
                  }}
                >
                  {formatSignedCurrency(tx.amount)}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => router.push("/(app)/transactions")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                paddingTop: 8,
              }}
            >
              <Text style={{ fontSize: 14, color: colors.primary }}>
                View all transactions
              </Text>
              <ArrowRight size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </CardContent>
    </Card>
  );
}

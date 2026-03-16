import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useBudgetSummary, useAddBudget, useDeleteBudget } from "@/hooks/use-budgets";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/format";
import { EXPENSE_CATEGORIES } from "@exitplan/core";
import {
  ChevronLeft,
  ChevronRight,
  Wallet,
  TrendingDown,
  Scale,
  PieChart,
  Trash2,
} from "lucide-react-native";

type BudgetPeriod = "monthly" | "weekly" | "quarterly";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // Sunday
  return formatDateLocal(d);
}

function getFirstOfMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function getFirstOfQuarter(date: Date): string {
  const month = Math.floor(date.getMonth() / 3) * 3;
  return `${date.getFullYear()}-${String(month + 1).padStart(2, "0")}-01`;
}

function getCurrentPeriodStart(period: BudgetPeriod): string {
  const now = new Date();
  if (period === "weekly") return getStartOfWeek(now);
  if (period === "quarterly") return getFirstOfQuarter(now);
  return getFirstOfMonth(now);
}

function shiftPeriod(startStr: string, period: BudgetPeriod, delta: number): string {
  const [year, month, day] = startStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (period === "weekly") {
    date.setDate(date.getDate() + delta * 7);
    return formatDateLocal(date);
  }
  if (period === "quarterly") {
    date.setMonth(date.getMonth() + delta * 3);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
  }
  date.setMonth(date.getMonth() + delta);
  return getFirstOfMonth(date);
}

function formatPeriodLabel(startStr: string, period: BudgetPeriod): string {
  const [year, month, day] = startStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (period === "weekly") {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (period === "quarterly") {
    const end = new Date(date.getFullYear(), date.getMonth() + 3, 0);
    return `Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()} (${date.toLocaleDateString("en-US", { month: "short" })}–${end.toLocaleDateString("en-US", { month: "short" })})`;
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const PERIOD_TABS: { value: BudgetPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

export default function BudgetsScreen() {
  const { colors, isDark } = useTheme();
  const queryClient = useQueryClient();
  const [showAdvancedPeriods, setShowAdvancedPeriods] = useState(false);
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [periodStart, setPeriodStart] = useState(() => getCurrentPeriodStart("monthly"));
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading } = useBudgetSummary(periodStart);
  const addBudget = useAddBudget();
  const deleteBudget = useDeleteBudget();

  const [budgetCategory, setBudgetCategory] = useState("food");
  const [budgetAmount, setBudgetAmount] = useState("");

  function handlePeriodChange(p: BudgetPeriod) {
    setPeriod(p);
    setPeriodStart(getCurrentPeriodStart(p));
  }

  function handleToggleAdvancedPeriods() {
    setShowAdvancedPeriods((current) => {
      const next = !current;
      if (!next && period !== "monthly") {
        setPeriod("monthly");
        setPeriodStart(getCurrentPeriodStart("monthly"));
      }
      return next;
    });
  }

  const visibleBudgets = useMemo(() => {
    if (!data) return [];
    const byCategory = new Map<string, (typeof data.budgets)[0]>();
    for (const budget of data.budgets) {
      if (!byCategory.has(budget.category)) {
        byCategory.set(budget.category, budget);
      }
    }
    return Array.from(byCategory.values());
  }, [data]);

  const existingCategories = visibleBudgets.map((b) => b.category);

  const displayTotals = useMemo(() => {
    const totalBudget = Math.round(
      visibleBudgets.reduce((sum, b) => sum + b.amount, 0) * 100
    ) / 100;
    const totalSpent = Math.round(
      visibleBudgets.reduce(
        (sum, b) => sum + (data?.spentByCategory?.[b.category] ?? 0),
        0
      ) * 100
    ) / 100;
    return { totalBudget, totalSpent };
  }, [data, visibleBudgets]);

  const remaining = displayTotals.totalBudget - displayTotals.totalSpent;
  const isOverBudget = remaining < 0;

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["budgets"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!budgetAmount) {
      Alert.alert("Required", "Please enter a budget amount.");
      return;
    }
    try {
      await addBudget.mutateAsync({
        category: budgetCategory,
        amount: parseFloat(budgetAmount),
        month: periodStart,
        period: period,
      });
      setShowAdd(false);
      setBudgetAmount("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add budget");
    }
  }

  function handleDeleteBudget(budgetId: string, categoryName: string) {
    Alert.alert(
      "Delete budget?",
      `This permanently deletes the ${categoryName} budget.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteBudget.mutate(budgetId),
        },
      ]
    );
  }

  function getProgressColor(pct: number): string {
    if (pct > 100) return colors.destructive;
    if (pct >= 75) return "#F59E0B";
    return colors.primary;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>
          Budgets
        </Text>
        <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 2 }}>
          Keep it simple with monthly budgets
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Period tabs */}
        <SegmentedControl
          options={showAdvancedPeriods ? PERIOD_TABS : [PERIOD_TABS[0]]}
          value={period}
          onChange={handlePeriodChange}
        />

        {/* Toggle advanced periods */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 11, color: colors.mutedForeground, flex: 1 }}>
            {showAdvancedPeriods
              ? "Advanced mode: weekly and quarterly views are enabled."
              : "Simple mode: monthly view only."}
          </Text>
          <TouchableOpacity onPress={handleToggleAdvancedPeriods} style={{ paddingLeft: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "500", color: colors.primary }}>
              {showAdvancedPeriods ? "Hide weekly/quarterly" : "Show weekly/quarterly"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Period navigator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border + "99",
            backgroundColor: colors.muted + "33",
            padding: 8,
            marginBottom: 16,
          }}
        >
          <TouchableOpacity
            onPress={() => setPeriodStart((s) => shiftPeriod(s, period, -1))}
            style={{
              height: 36,
              width: 36,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border + "99",
              backgroundColor: colors.background + "B3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronLeft size={16} color={colors.foreground} />
          </TouchableOpacity>
          <Text
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {formatPeriodLabel(periodStart, period)}
          </Text>
          <TouchableOpacity
            onPress={() => setPeriodStart((s) => shiftPeriod(s, period, 1))}
            style={{
              height: 36,
              width: 36,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border + "99",
              backgroundColor: colors.background + "B3",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ChevronRight size={16} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Summary bar */}
        {data && visibleBudgets.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 16 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {/* Total Budget */}
              <View
                style={{
                  minWidth: 160,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "99",
                  backgroundColor: colors.muted + "40",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <Wallet size={14} color={colors.mutedForeground} />
                  <Text
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                    }}
                  >
                    Total Budget
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  {formatCurrency(displayTotals.totalBudget)}
                </Text>
              </View>

              {/* Total Spent */}
              <View
                style={{
                  minWidth: 160,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "99",
                  backgroundColor: colors.muted + "40",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <TrendingDown size={14} color={colors.mutedForeground} />
                  <Text
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                    }}
                  >
                    Total Spent
                  </Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>
                  {formatCurrency(displayTotals.totalSpent)}
                </Text>
              </View>

              {/* Remaining */}
              <View
                style={{
                  minWidth: 170,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "99",
                  backgroundColor: colors.muted + "40",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    marginBottom: 4,
                  }}
                >
                  <Scale size={14} color={colors.mutedForeground} />
                  <Text
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      color: colors.mutedForeground,
                    }}
                  >
                    Remaining
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: isOverBudget
                      ? colors.destructive
                      : isDark
                      ? "#34D399"
                      : "#16A34A",
                  }}
                >
                  {formatCurrency(remaining)}
                </Text>
              </View>
            </View>
          </ScrollView>
        )}

        {/* Budget cards */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={{
                  height: 80,
                  backgroundColor: colors.muted,
                  borderRadius: 10,
                }}
              />
            ))}
          </View>
        ) : data && visibleBudgets.length > 0 ? (
          <View style={{ gap: 12 }}>
            {visibleBudgets.map((budget) => {
              const spent = data.spentByCategory[budget.category] ?? 0;
              const effectiveBudget = budget.amount;
              const percentage =
                effectiveBudget > 0 ? (spent / effectiveBudget) * 100 : 0;
              const clampedPct = Math.min(percentage, 100);
              const budgetRemaining =
                Math.round((effectiveBudget - spent) * 100) / 100;

              return (
                <Card key={budget.id} style={{ borderRadius: 12 }}>
                  <View style={{ padding: 12 }}>
                    {/* Header row */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ gap: 2, flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: colors.foreground,
                              textTransform: "capitalize",
                            }}
                          >
                            {budget.category}
                          </Text>
                          <View
                            style={{
                              borderRadius: 999,
                              backgroundColor: colors.primary + "1A",
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "500",
                                color: colors.primary,
                                textTransform: "capitalize",
                              }}
                            >
                              {period}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          handleDeleteBudget(budget.id, budget.category)
                        }
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={14} color={colors.mutedForeground} />
                      </TouchableOpacity>
                    </View>

                    {/* Spent / Budget */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: colors.mutedForeground,
                        }}
                      >
                        {formatCurrency(spent)} spent
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: colors.foreground,
                        }}
                      >
                        of {formatCurrency(effectiveBudget)}
                      </Text>
                    </View>

                    {/* Progress bar */}
                    <View
                      style={{
                        height: 10,
                        backgroundColor: colors.muted + "B3",
                        borderRadius: 5,
                        overflow: "hidden",
                        marginBottom: 8,
                      }}
                    >
                      <View
                        style={{
                          height: "100%",
                          borderRadius: 5,
                          backgroundColor: getProgressColor(percentage),
                          width: `${clampedPct}%`,
                        }}
                      />
                    </View>

                    {/* Status */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            percentage > 100
                              ? colors.destructive
                              : percentage >= 75
                              ? "#F59E0B"
                              : colors.mutedForeground,
                        }}
                      >
                        {percentage.toFixed(0)}% used
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            budgetRemaining < 0
                              ? colors.destructive
                              : isDark
                              ? "#34D399"
                              : "#16A34A",
                        }}
                      >
                        {budgetRemaining < 0
                          ? `${formatCurrency(Math.abs(budgetRemaining))} over`
                          : `${formatCurrency(budgetRemaining)} left`}
                      </Text>
                    </View>
                  </View>
                </Card>
              );
            })}
          </View>
        ) : (
          <EmptyState
            icon={<PieChart size={28} color={colors.primary} />}
            title={`No budgets for ${formatPeriodLabel(periodStart, period)}`}
            description="Create budgets for your expense categories to track spending limits."
          />
        )}
      </View>

      {/* Add Budget Modal */}
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Budget">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Select
            label="Category"
            value={budgetCategory}
            onValueChange={setBudgetCategory}
            options={EXPENSE_CATEGORIES.filter(
              (c) => !existingCategories.includes(c.toLowerCase())
            ).map((c) => ({
              value: c.toLowerCase(),
              label: c,
            }))}
          />
          <Input
            label={`${period === "monthly" ? "Monthly" : period === "weekly" ? "Weekly" : "Quarterly"} Limit (PHP)`}
            placeholder="e.g. 5000"
            value={budgetAmount}
            onChangeText={setBudgetAmount}
            keyboardType="decimal-pad"
          />
          <Button onPress={handleAdd} loading={addBudget.isPending}>
            Add Budget
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

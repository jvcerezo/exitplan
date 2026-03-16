import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useGoals, useAddGoal, useDeleteGoal, useAddFundsToGoal } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/lib/theme";
import { formatCurrency, GOAL_CATEGORIES } from "@exitplan/core";
import type { Goal } from "@exitplan/core";
import {
  Target,
  CheckCircle2,
  TrendingUp,
  Clock,
  Trash2,
  AlertCircle,
} from "lucide-react-native";

function getProgressColor(pct: number, colors: any): string {
  if (pct >= 100) return colors.primary;
  if (pct >= 75) return colors.primary + "CC";
  if (pct >= 50) return colors.primary + "99";
  if (pct >= 25) return colors.primary + "66";
  return colors.primary + "4D";
}

function GoalCard({
  goal,
  onDelete,
  onAddFunds,
}: {
  goal: Goal;
  onDelete: () => void;
  onAddFunds: () => void;
}) {
  const { colors } = useTheme();
  const pct =
    goal.target_amount > 0
      ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
      : 0;

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
    <Card
      style={{
        marginBottom: 12,
        borderRadius: 16,
        ...(goal.is_completed
          ? { borderColor: colors.primary + "4D" }
          : {}),
      }}
    >
      <View style={{ padding: 12 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
              flex: 1,
            }}
          >
            <View
              style={{
                marginTop: 2,
                height: 36,
                width: 36,
                borderRadius: 8,
                backgroundColor: goal.is_completed
                  ? colors.primary + "1A"
                  : colors.muted,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {goal.is_completed ? (
                <CheckCircle2 size={20} color={colors.primary} />
              ) : (
                <Target size={20} color={colors.mutedForeground} />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.foreground,
                }}
                numberOfLines={1}
              >
                {goal.name}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.mutedForeground,
                  textTransform: "capitalize",
                }}
              >
                {goal.category}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 4 }}>
            <TouchableOpacity
              onPress={onDelete}
              style={{ padding: 4 }}
            >
              <Trash2 size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress */}
        <View style={{ marginBottom: 6 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "700", color: colors.foreground }}
            >
              {formatCurrency(goal.current_amount)}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: colors.mutedForeground,
              }}
            >
              of {formatCurrency(goal.target_amount)}
            </Text>
          </View>
          <View
            style={{
              height: 10,
              backgroundColor: colors.muted,
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                height: "100%",
                borderRadius: 5,
                backgroundColor: getProgressColor(pct, colors),
                width: `${pct}%`,
              }}
            />
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: colors.mutedForeground,
              }}
            >
              {pct.toFixed(0)}% complete
            </Text>
            {daysLeft !== null && !goal.is_completed && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Clock size={12} color={colors.mutedForeground} />
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.mutedForeground,
                  }}
                >
                  {daysLeft === 0
                    ? "Due today"
                    : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                </Text>
              </View>
            )}
            {goal.is_completed && (
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: colors.primary,
                }}
              >
                Completed
              </Text>
            )}
          </View>
        </View>

        {/* Add Funds button */}
        <TouchableOpacity
          onPress={onAddFunds}
          style={{
            marginTop: 8,
            height: 32,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {goal.is_completed ? "Open Goal" : "Add Funds"}
          </Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function GoalsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: goals, isLoading, error } = useGoals();
  const { data: accounts } = useAccounts();
  const addGoal = useAddGoal();
  const deleteGoal = useDeleteGoal();
  const addFundsToGoal = useAddFundsToGoal();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [mobileTab, setMobileTab] = useState<"active" | "completed">("active");

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");
  const [fundAmount, setFundAmount] = useState("");
  const [fundAccountId, setFundAccountId] = useState("");

  const goalList = goals ?? [];
  const active = useMemo(() => goalList.filter((g) => !g.is_completed), [goalList]);
  const completed = useMemo(() => goalList.filter((g) => g.is_completed), [goalList]);
  const mobileGoals = mobileTab === "active" ? active : completed;

  // Overview summary
  const totalSaved = goalList.reduce((sum, g) => sum + g.current_amount, 0);

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["goals"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!name.trim() || !targetAmount) {
      Alert.alert("Required", "Please enter a name and target amount.");
      return;
    }
    try {
      await addGoal.mutateAsync({
        name: name.trim(),
        category,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        deadline: deadline || null,
      });
      setShowAdd(false);
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setDeadline("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add goal");
    }
  }

  async function handleAddFunds() {
    if (!selectedGoal) return;
    const amount = parseFloat(fundAmount);
    if (!fundAmount || isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!fundAccountId) {
      Alert.alert("Error", "Please select an account.");
      return;
    }
    try {
      await addFundsToGoal.mutateAsync({
        goalId: selectedGoal.id,
        accountId: fundAccountId,
        amount,
      });
      setShowAddFunds(false);
      setFundAmount("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add funds");
    }
  }

  function handleDelete(goal: Goal) {
    Alert.alert(
      "Delete Goal",
      `Delete "${goal.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteGoal.mutate(goal.id),
        },
      ]
    );
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
          Goals
        </Text>
        <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 2 }}>
          Set targets and track your progress to freedom
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Overview card */}
        {goalList.length > 0 && (
          <Card style={{ marginBottom: 16, borderRadius: 16 }}>
            <CardContent style={{ padding: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: colors.mutedForeground,
                  }}
                >
                  Goals Overview
                </Text>
                <View
                  style={{
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: colors.primary + "40",
                    backgroundColor: colors.primary + "1A",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "600",
                      color: colors.primary,
                    }}
                  >
                    {completed.length}/{goalList.length} complete
                  </Text>
                </View>
              </View>

              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "80",
                  overflow: "hidden",
                }}
              >
                {[
                  { label: "Active Goals", value: String(active.length), color: colors.foreground, iconColor: colors.mutedForeground, Icon: Target },
                  { label: "Completed", value: String(completed.length), color: colors.primary, iconColor: colors.primary, Icon: CheckCircle2 },
                  { label: "Total Saved", value: formatCurrency(totalSaved), color: "#16A34A", iconColor: "#16A34A", Icon: TrendingUp },
                ].map((item, idx) => (
                  <View
                    key={item.label}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                      ...(idx < 2
                        ? {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border + "99",
                          }
                        : {}),
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.muted + "B3",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <item.Icon size={14} color={item.iconColor} />
                      </View>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "500",
                          color: colors.foreground + "D9",
                        }}
                      >
                        {item.label}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </Text>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}

        {/* Segmented control for active/completed */}
        {goalList.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <SegmentedControl
              options={[
                { value: "active" as const, label: `Active (${active.length})` },
                { value: "completed" as const, label: `Completed (${completed.length})` },
              ]}
              value={mobileTab}
              onChange={setMobileTab}
            />
          </View>
        )}

        {/* Goal cards */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {[1, 2].map((i) => (
              <View
                key={i}
                style={{
                  height: 128,
                  backgroundColor: colors.muted,
                  borderRadius: 10,
                }}
              />
            ))}
          </View>
        ) : error ? (
          <Card>
            <CardContent
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                paddingVertical: 24,
              }}
            >
              <AlertCircle size={20} color={colors.destructive} />
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                Could not load goals
              </Text>
            </CardContent>
          </Card>
        ) : goalList.length === 0 ? (
          <EmptyState
            icon={<Target size={28} color={colors.primary} />}
            title="No goals yet"
            description="Set your first financial goal and start building towards freedom."
          />
        ) : mobileGoals.length === 0 ? (
          <Card>
            <CardContent style={{ paddingVertical: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  textAlign: "center",
                }}
              >
                No {mobileTab} goals yet.
              </Text>
            </CardContent>
          </Card>
        ) : (
          mobileGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onDelete={() => handleDelete(goal)}
              onAddFunds={() => {
                setSelectedGoal(goal);
                setShowAddFunds(true);
              }}
            />
          ))
        )}
      </View>

      {/* Add Goal Modal */}
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Goal">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Goal Name" placeholder="e.g. Emergency Fund" value={name} onChangeText={setName} />
          <Select
            label="Category"
            value={category}
            onValueChange={setCategory}
            options={GOAL_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Target Amount (PHP)"
            placeholder="50000"
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
          />
          <Input
            label="Already Saved (PHP)"
            placeholder="0"
            value={currentAmount}
            onChangeText={setCurrentAmount}
            keyboardType="decimal-pad"
          />
          <Input
            label="Deadline (optional)"
            placeholder="YYYY-MM-DD"
            value={deadline}
            onChangeText={setDeadline}
          />
          <Button onPress={handleAdd} loading={addGoal.isPending}>
            Add Goal
          </Button>
        </View>
      </Modal>

      {/* Add Funds Modal */}
      <Modal
        visible={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        title={`Add Funds to ${selectedGoal?.name ?? ""}`}
      >
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input
            label="Amount (PHP)"
            placeholder="0.00"
            value={fundAmount}
            onChangeText={setFundAmount}
            keyboardType="decimal-pad"
          />
          <Select
            label="From Account"
            value={fundAccountId}
            onValueChange={setFundAccountId}
            placeholder="Select account..."
            options={(accounts ?? []).map((a) => ({
              value: a.id,
              label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
            }))}
          />
          <Button onPress={handleAddFunds} loading={addFundsToGoal.isPending}>
            Add Funds
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

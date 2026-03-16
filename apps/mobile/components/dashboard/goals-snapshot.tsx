import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@exitplan/core";
import type { Goal } from "@exitplan/core";
import { Target, ArrowRight } from "lucide-react-native";

interface GoalsSnapshotProps {
  goals: Goal[];
}

export function GoalsSnapshot({ goals }: GoalsSnapshotProps) {
  const activeGoals = goals.filter((g) => !g.is_completed).slice(0, 3);

  if (activeGoals.length === 0) return null;

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Target size={18} color="#7c3aed" />
          <Text variant="h4">Goals</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/goals")}>
          <View className="flex-row items-center gap-1">
            <Text variant="body-sm" color="primary">
              View all
            </Text>
            <ArrowRight size={14} color="#7c3aed" />
          </View>
        </TouchableOpacity>
      </View>
      <View className="gap-3">
        {activeGoals.map((goal) => {
          const pct =
            goal.target_amount > 0
              ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
              : 0;
          return (
            <View key={goal.id} className="gap-1">
              <View className="flex-row justify-between">
                <Text variant="body-sm">{goal.name}</Text>
                <Text variant="body-sm" color="muted">
                  {pct.toFixed(0)}%
                </Text>
              </View>
              <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-violet-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </View>
              <View className="flex-row justify-between">
                <Text variant="caption" color="muted">
                  {formatCurrency(goal.current_amount)}
                </Text>
                <Text variant="caption" color="muted">
                  {formatCurrency(goal.target_amount)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
}

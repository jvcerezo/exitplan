import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@exitplan/core";
import type { Goal } from "@exitplan/core";
import { CheckCircle, PlusCircle, Trash2 } from "lucide-react-native";

interface GoalCardProps {
  goal: Goal;
  onAddFunds?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

export function GoalCard({
  goal,
  onAddFunds,
  onComplete,
  onDelete,
}: GoalCardProps) {
  const pct =
    goal.target_amount > 0
      ? Math.min(100, (goal.current_amount / goal.target_amount) * 100)
      : 0;

  return (
    <Card className="mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1 mr-3">
          <Text variant="h4">{goal.name}</Text>
          <Badge variant="secondary" className="mt-1 self-start">
            {goal.category}
          </Badge>
        </View>
        {goal.is_completed ? (
          <CheckCircle size={20} color="#10b981" />
        ) : (
          <Text variant="h4" color="primary">
            {pct.toFixed(0)}%
          </Text>
        )}
      </View>

      <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
        <View
          className={`h-full rounded-full ${
            goal.is_completed ? "bg-emerald-500" : "bg-violet-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </View>

      <View className="flex-row justify-between mb-3">
        <View>
          <Text variant="caption" color="muted">
            Saved
          </Text>
          <Text variant="body-sm" className="font-semibold">
            {formatCurrency(goal.current_amount)}
          </Text>
        </View>
        <View className="items-end">
          <Text variant="caption" color="muted">
            Target
          </Text>
          <Text variant="body-sm" className="font-semibold">
            {formatCurrency(goal.target_amount)}
          </Text>
        </View>
        {goal.deadline && (
          <View className="items-end">
            <Text variant="caption" color="muted">
              Deadline
            </Text>
            <Text variant="body-sm">
              {new Date(goal.deadline).toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        )}
      </View>

      {!goal.is_completed && (
        <View className="flex-row gap-2">
          {onAddFunds && (
            <TouchableOpacity
              onPress={onAddFunds}
              className="flex-1 flex-row items-center justify-center gap-1 py-2 rounded-lg bg-violet-50"
            >
              <PlusCircle size={14} color="#7c3aed" />
              <Text variant="caption" color="primary" className="font-semibold">
                Add Funds
              </Text>
            </TouchableOpacity>
          )}
          {onComplete && (
            <TouchableOpacity
              onPress={onComplete}
              className="flex-row items-center justify-center gap-1 px-3 py-2 rounded-lg bg-emerald-50"
            >
              <CheckCircle size={14} color="#10b981" />
              <Text
                variant="caption"
                className="text-emerald-700 font-semibold"
              >
                Complete
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              className="px-3 py-2 rounded-lg bg-red-50"
            >
              <Trash2 size={14} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}

import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@exitplan/core";
import type { Budget } from "@exitplan/core";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  onDelete?: () => void;
}

export function BudgetCard({ budget, spent, onDelete }: BudgetCardProps) {
  const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const overBudget = spent > budget.amount;

  return (
    <Card>
      <View className="flex-row justify-between mb-2">
        <Text variant="h4" className="capitalize">
          {budget.category}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete}>
            <Text variant="caption" className="text-red-500">
              Remove
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <View className="flex-row justify-between mb-2">
        <Text variant="body-sm" color="muted">
          {formatCurrency(spent)} spent
        </Text>
        <Text variant="body-sm" color="muted">
          {formatCurrency(budget.amount)} budget
        </Text>
      </View>
      <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${
            overBudget ? "bg-red-500" : "bg-violet-500"
          }`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </View>
      <Text
        variant="caption"
        className={`mt-1 ${overBudget ? "text-red-600" : "text-gray-500"}`}
      >
        {overBudget
          ? `Over by ${formatCurrency(spent - budget.amount)}`
          : `${formatCurrency(budget.amount - spent)} remaining`}
      </Text>
    </Card>
  );
}

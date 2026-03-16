import React from "react";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { formatCurrency } from "@exitplan/core";
import { TrendingUp, TrendingDown } from "lucide-react-native";

interface BalanceCardProps {
  balance: number;
  income: number;
  expenses: number;
  isLoading?: boolean;
}

export function BalanceCard({
  balance,
  income,
  expenses,
  isLoading,
}: BalanceCardProps) {
  return (
    <View className="bg-white/15 rounded-2xl p-4">
      <Text variant="caption" className="text-violet-200 mb-1">
        Net Worth
      </Text>
      <Text variant="h2" className="text-white">
        {isLoading ? "---" : formatCurrency(balance)}
      </Text>
      <View className="flex-row gap-4 mt-3">
        <View className="flex-row items-center gap-1">
          <TrendingUp size={14} color="#86efac" />
          <Text variant="caption" className="text-green-300">
            {formatCurrency(income)} income
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <TrendingDown size={14} color="#fca5a5" />
          <Text variant="caption" className="text-red-300">
            {formatCurrency(expenses)} expenses
          </Text>
        </View>
      </View>
    </View>
  );
}

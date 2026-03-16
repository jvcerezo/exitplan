import React from "react";
import { View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@exitplan/core";
import type { Transaction } from "@exitplan/core";
import { ArrowRight } from "lucide-react-native";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <Text variant="h4">Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push("/(app)/transactions")}>
          <View className="flex-row items-center gap-1">
            <Text variant="body-sm" color="primary">
              View all
            </Text>
            <ArrowRight size={14} color="#7c3aed" />
          </View>
        </TouchableOpacity>
      </View>
      {transactions.length === 0 ? (
        <Text variant="body-sm" color="muted" className="text-center py-4">
          No transactions yet
        </Text>
      ) : (
        <View className="gap-3">
          {transactions.slice(0, 5).map((tx) => (
            <View
              key={tx.id}
              className="flex-row items-center justify-between"
            >
              <View className="flex-1 mr-4">
                <Text variant="body-sm" className="text-gray-900">
                  {tx.description || tx.category}
                </Text>
                <Text variant="caption" color="muted">
                  {tx.category} * {tx.date}
                </Text>
              </View>
              <Text
                variant="body-sm"
                className={`font-semibold ${
                  tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {tx.amount >= 0 ? "+" : ""}
                {formatCurrency(tx.amount, tx.currency)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

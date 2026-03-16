import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { formatCurrency } from "@exitplan/core";
import type { Transaction } from "@exitplan/core";
import { Trash2 } from "lucide-react-native";

interface TransactionRowProps {
  transaction: Transaction;
  onDelete?: () => void;
  onPress?: () => void;
}

export function TransactionRow({
  transaction: tx,
  onDelete,
  onPress,
}: TransactionRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center py-3 border-b border-gray-50"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          tx.amount >= 0 ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        <Text
          variant="caption"
          className={tx.amount >= 0 ? "text-emerald-700" : "text-red-700"}
        >
          {tx.category.slice(0, 2).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="body-sm" className="text-gray-900">
          {tx.description || tx.category}
        </Text>
        <Text variant="caption" color="muted">
          {tx.category} * {tx.date}
        </Text>
      </View>
      <View className="items-end flex-row gap-2">
        <Text
          variant="body-sm"
          className={`font-semibold ${
            tx.amount >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {tx.amount >= 0 ? "+" : ""}
          {formatCurrency(tx.amount, tx.currency)}
        </Text>
        {onDelete && (
          <TouchableOpacity onPress={onDelete} className="p-1">
            <Trash2 size={14} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

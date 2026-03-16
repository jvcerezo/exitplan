import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@exitplan/core";
import type { Account } from "@exitplan/core";
import { Trash2, Archive } from "lucide-react-native";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

interface AccountCardProps {
  account: Account;
  onPress?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
}

export function AccountCard({
  account,
  onPress,
  onDelete,
  onArchive,
}: AccountCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Card className="mb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text variant="h4">{account.name}</Text>
            <Badge variant="secondary" className="mt-1 self-start">
              {TYPE_LABELS[account.type] ?? account.type}
            </Badge>
          </View>
          <View className="items-end">
            <Text
              variant="h4"
              className={account.balance < 0 ? "text-red-600" : "text-gray-900"}
            >
              {formatCurrency(account.balance, account.currency)}
            </Text>
            <Text variant="caption" color="muted">
              {account.currency}
            </Text>
          </View>
        </View>
        {(onArchive || onDelete) && (
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-100">
            {onArchive && (
              <TouchableOpacity
                onPress={onArchive}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100"
              >
                <Archive size={14} color="#6b7280" />
                <Text variant="caption" color="muted">
                  Archive
                </Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity
                onPress={onDelete}
                className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50"
              >
                <Trash2 size={14} color="#ef4444" />
                <Text variant="caption" className="text-red-600">
                  Delete
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

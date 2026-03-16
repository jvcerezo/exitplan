import React, { useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccounts,
  useAddAccount,
  useDeleteAccount,
} from "@/hooks/use-accounts";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/format";
import { ACCOUNT_TYPES, CURRENCIES } from "@exitplan/core";
import type { Account } from "@exitplan/core";
import {
  Plus,
  Minus,
  Trash2,
  Wallet,
  Building2,
  Smartphone,
  Banknote,
  CreditCard,
  Landmark,
  AlertCircle,
} from "lucide-react-native";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  bank: Building2,
  "e-wallet": Smartphone,
  cash: Banknote,
  "credit-card": CreditCard,
};

const TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  bank: { text: "#3B82F6", bg: "#3B82F6" + "1A" },
  "e-wallet": { text: "#8B5CF6", bg: "#8B5CF6" + "1A" },
  cash: { text: "#16A34A", bg: "#16A34A" + "1A" },
  "credit-card": { text: "#F97316", bg: "#F97316" + "1A" },
};

function AccountCard({
  account,
  onDelete,
}: {
  account: Account;
  onDelete: () => void;
}) {
  const { colors } = useTheme();
  const Icon = TYPE_ICONS[account.type] ?? Landmark;
  const colorInfo = TYPE_COLORS[account.type] ?? {
    text: colors.mutedForeground,
    bg: colors.muted,
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ padding: 16 }}>
        {/* Header row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, flex: 1 }}>
            <View
              style={{
                marginTop: 2,
                height: 36,
                width: 36,
                borderRadius: 12,
                backgroundColor: colorInfo.bg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon size={18} color={colorInfo.text} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.foreground,
                }}
                numberOfLines={1}
              >
                {account.name}
              </Text>
              <Badge variant="secondary" style={{ marginTop: 4 }}>
                {TYPE_LABELS[account.type] ?? account.type}
              </Badge>
            </View>
          </View>
          <TouchableOpacity
            onPress={onDelete}
            style={{ padding: 4 }}
          >
            <Trash2 size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Balance */}
        <View style={{ marginTop: 12 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: colors.foreground,
            }}
          >
            {formatCurrency(account.balance, account.currency)}
          </Text>
          {account.currency !== "PHP" && (
            <Text
              style={{
                fontSize: 12,
                color: colors.mutedForeground,
                marginTop: 2,
              }}
            >
              {account.currency}
            </Text>
          )}
        </View>

        {/* Quick actions */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 32,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Plus size={14} color={colors.foreground} />
            <Text style={{ fontSize: 12, color: colors.foreground }}>
              Add Income
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              height: 32,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Minus size={14} color={colors.foreground} />
            <Text style={{ fontSize: 12, color: colors.foreground }}>
              Add Expense
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
}

export default function AccountsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: accounts, isLoading, error } = useAccounts();
  const addAccount = useAddAccount();
  const deleteAccount = useDeleteAccount();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [currency, setCurrency] = useState("PHP");
  const [balance, setBalance] = useState("");

  const displayedAccounts = accounts ?? [];
  const totalBalance = displayedAccounts.reduce((sum, a) => sum + a.balance, 0);

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["accounts"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter an account name.");
      return;
    }
    try {
      await addAccount.mutateAsync({
        name: name.trim(),
        type,
        currency,
        balance: parseFloat(balance) || 0,
      });
      setShowAdd(false);
      setName("");
      setBalance("");
    } catch (e: unknown) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to add account"
      );
    }
  }

  function handleDelete(account: Account) {
    Alert.alert(
      "Delete account?",
      `This deletes ${account.name}, its transactions, and related records.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteAccount.mutate(account.id),
        },
      ]
    );
  }

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
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          variant="h2"
          style={{ color: colors.foreground, letterSpacing: -0.3 }}
        >
          Accounts
        </Text>
        <Text
          variant="body-sm"
          style={{ color: colors.mutedForeground, marginTop: 2 }}
        >
          Manage your wallets and bank accounts
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {isLoading ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 48,
            }}
          >
            <ActivityIndicator size="large" color={colors.mutedForeground} />
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
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.foreground,
                  }}
                >
                  Could not load accounts
                </Text>
                <Text
                  style={{ fontSize: 12, color: colors.mutedForeground }}
                >
                  {error instanceof Error
                    ? error.message
                    : "Check your connection."}
                </Text>
              </View>
            </CardContent>
          </Card>
        ) : displayedAccounts.length === 0 ? (
          <EmptyState
            icon={<Wallet size={28} color={colors.primary} />}
            title="No accounts yet"
            description="Add your first account to start tracking balances across wallets."
          />
        ) : (
          <>
            {/* Total balance */}
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                marginBottom: 16,
              }}
            >
              Total balance:{" "}
              <Text
                style={{
                  fontWeight: "600",
                  color: colors.foreground,
                }}
              >
                {formatCurrency(totalBalance)}
              </Text>
            </Text>

            {/* Account cards */}
            {displayedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onDelete={() => handleDelete(account)}
              />
            ))}
          </>
        )}
      </View>

      {/* Add Account Modal */}
      <Modal
        visible={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Account"
      >
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input
            label="Account Name"
            placeholder="e.g. BDO Savings, GCash"
            value={name}
            onChangeText={setName}
          />
          <Select
            label="Account Type"
            value={type}
            onValueChange={setType}
            options={ACCOUNT_TYPES.map((t) => ({
              value: t.value,
              label: t.label,
            }))}
          />
          <Select
            label="Currency"
            value={currency}
            onValueChange={setCurrency}
            options={CURRENCIES.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.name}`,
            }))}
          />
          <Input
            label="Current Balance"
            placeholder="0.00"
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
          />
          <Button onPress={handleAdd} loading={addAccount.isPending}>
            Add Account
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

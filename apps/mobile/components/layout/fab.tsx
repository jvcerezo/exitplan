import React, { useState } from "react";
import { View, TouchableOpacity, Text, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { usePathname } from "expo-router";
import {
  Plus,
  TrendingDown,
  TrendingUp,
  Target,
  Wallet,
  Calculator,
} from "lucide-react-native";
import { AddTransactionSheet } from "../transactions/add-transaction-sheet";
import { AddAccountSheet } from "../accounts/add-account-sheet";
import { AddGoalSheet } from "../goals/add-goal-sheet";
import { AddBudgetSheet } from "../budgets/add-budget-sheet";

export function FAB() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"expense" | "income" | "goal" | "account" | "budget" | null>(null);

  const isGoals = pathname.startsWith("/goals");
  const isAccounts = pathname.startsWith("/accounts");
  const isSettings = pathname.startsWith("/settings");
  const isBudgets = pathname.startsWith("/budgets");
  const isDashboard = pathname === "/" || pathname.startsWith("/dashboard");
  const isTransactions = pathname.startsWith("/transactions");

  const shouldHideFAB = isSettings || pathname.startsWith("/adulting");

  const menuItems: Array<{
    label: string;
    icon: React.ElementType;
    color: string;
    onPress: () => void;
  }> = [];

  if (isGoals) {
    menuItems.push({
      label: "Add Goal",
      icon: Target,
      color: colors.primary,
      onPress: () => {
        setMenuOpen(false);
        setActiveModal("goal");
      },
    });
  }

  if (isBudgets) {
    menuItems.push({
      label: "Add Budget",
      icon: Calculator,
      color: colors.primary,
      onPress: () => {
        setMenuOpen(false);
        // We will implement AddBudgetSheet later
        setActiveModal("budget");
      },
    });
  }

  if (isDashboard || isTransactions) {
    menuItems.push({
      label: "Add Expense",
      icon: TrendingDown,
      color: colors.foreground,
      onPress: () => {
        setMenuOpen(false);
        setActiveModal("expense");
      },
    });
    menuItems.push({
      label: "Add Income",
      icon: TrendingUp,
      color: colors.emerald500,
      onPress: () => {
        setMenuOpen(false);
        setActiveModal("income");
      },
    });
  }

  if (isAccounts) {
    menuItems.push({
      label: "Add Account",
      icon: Wallet,
      color: colors.primary,
      onPress: () => {
        setMenuOpen(false);
        setActiveModal("account");
      },
    });
  }

  return (
    <>
      {menuOpen && !shouldHideFAB && menuItems.length > 0 && (
        <Modal transparent visible animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setMenuOpen(false)}
          >
            <View
              style={{
                position: "absolute",
                bottom: insets.bottom + 20 + 56 + 12,
                right: 16,
                width: 200,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.onPress}
                    activeOpacity={0.6}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                    }}
                  >
                    <Icon size={16} color={item.color} />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: colors.foreground,
                      }}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </TouchableOpacity>
        </Modal>
      )}

      {!shouldHideFAB && menuItems.length > 0 && (
        <View
          style={{
            position: "absolute",
            right: 16,
            bottom: insets.bottom + 20,
            zIndex: 50,
          }}
        >
          <TouchableOpacity
            onPress={() => setMenuOpen((v) => !v)}
            activeOpacity={0.8}
            style={{
              height: 56,
              width: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 6,
              borderWidth: 2,
              borderColor: colors.background + "CC",
              transform: [{ rotate: menuOpen ? "45deg" : "0deg" }],
            }}
          >
            <Plus size={24} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      )}

      <AddTransactionSheet
        visible={activeModal === "expense" || activeModal === "income"}
        onClose={() => setActiveModal(null)}
        initialType={activeModal === "income" ? "income" : "expense"}
      />

      <AddAccountSheet
        visible={activeModal === "account"}
        onClose={() => setActiveModal(null)}
      />

      <AddGoalSheet
        visible={activeModal === "goal"}
        onClose={() => setActiveModal(null)}
      />

      <AddBudgetSheet
        visible={activeModal === "budget"}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}

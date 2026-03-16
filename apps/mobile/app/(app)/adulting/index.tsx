import React from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/lib/theme";
import {
  Landmark,
  ReceiptText,
  Gift,
  BookOpen,
  CreditCard,
  Shield,
  ChevronRight,
  Receipt,
  Calculator,
} from "lucide-react-native";

const groups = [
  {
    id: "compliance",
    label: "Compliance",
    items: [
      {
        route: "/(app)/adulting/contributions",
        icon: Landmark,
        title: "Gov't Contributions",
        subtitle: "SSS \u00B7 PhilHealth \u00B7 Pag-IBIG",
        color: "#3B82F6",
        bg: "#3B82F6" + "1A",
      },
      {
        route: "/(app)/adulting/taxes",
        icon: ReceiptText,
        title: "BIR Tax Tracker",
        subtitle: "TRAIN Law income tax",
        color: "#F97316",
        bg: "#F97316" + "1A",
      },
      {
        route: "/(app)/adulting/thirteenth-month",
        icon: Gift,
        title: "13th Month Pay",
        subtitle: "\u20B190,000 tax exemption calculator",
        color: "#22C55E",
        bg: "#22C55E" + "1A",
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        route: "/(app)/adulting/debts",
        icon: CreditCard,
        title: "Debt Manager",
        subtitle: "Loans, credit cards & payoff strategies",
        color: "#EF4444",
        bg: "#EF4444" + "1A",
      },
      {
        route: "/(app)/adulting/bills",
        icon: Receipt,
        title: "Bills & Subscriptions",
        subtitle: "Meralco, PLDT, Netflix, rent...",
        color: "#6366F1",
        bg: "#6366F1" + "1A",
      },
      {
        route: "/(app)/adulting/insurance",
        icon: Shield,
        title: "Insurance Tracker",
        subtitle: "Policies & renewal dates",
        color: "#14B8A6",
        bg: "#14B8A6" + "1A",
      },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      {
        route: "/(app)/adulting/calculators",
        icon: Calculator,
        title: "Financial Calculators",
        subtitle: "Loan amortization, compound interest, FIRE",
        color: "#A855F7",
        bg: "#A855F7" + "1A",
      },
      {
        route: "/(app)/adulting/checklist",
        icon: BookOpen,
        title: "Adulting Checklist",
        subtitle: "Step-by-step Filipino adulting guide",
        color: "#CA8A04",
        bg: "#EAB308" + "1A",
      },
    ],
  },
];

export default function AdultingHubScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text
          variant="h2"
          style={{ color: colors.foreground, letterSpacing: -0.3 }}
        >
          Adulting Hub
        </Text>
        <Text
          variant="body-sm"
          style={{ color: colors.mutedForeground, marginTop: 2 }}
        >
          Everything a Filipino adult needs — taxes, contributions, benefits,
          and more.
        </Text>
      </View>

      {/* Grouped tool list */}
      <View style={{ paddingHorizontal: 16, gap: 24, marginTop: 8 }}>
        {groups.map((group) => (
          <View key={group.id}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: 1,
                color: colors.mutedForeground,
                marginBottom: 8,
                paddingHorizontal: 4,
              }}
            >
              {group.label}
            </Text>
            <View
              style={{
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border + "99",
                overflow: "hidden",
              }}
            >
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <TouchableOpacity
                    key={item.route}
                    onPress={() => router.push(item.route as any)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      backgroundColor: colors.card,
                      ...(idx < group.items.length - 1
                        ? {
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border + "40",
                          }
                        : {}),
                    }}
                  >
                    <View
                      style={{
                        height: 36,
                        width: 36,
                        borderRadius: 12,
                        backgroundColor: item.bg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} color={item.color} />
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.foreground,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.mutedForeground,
                        }}
                      >
                        {item.subtitle}
                      </Text>
                    </View>
                    <ChevronRight
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      {/* Tip */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <Text
          style={{
            fontSize: 12,
            color: colors.mutedForeground,
            lineHeight: 18,
          }}
        >
          <Text style={{ fontWeight: "600", color: colors.foreground }}>
            Tip:
          </Text>{" "}
          SSS, PhilHealth, and Pag-IBIG aren't just deductions — they're
          benefits. Pag-IBIG's MP2 savings earn 6-7% tax-free dividends.
        </Text>
      </View>
    </ScrollView>
  );
}

import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { formatCurrency, calculate13thMonth } from "@exitplan/core";
import { Gift, ArrowLeft } from "lucide-react-native";

export default function ThirteenthMonthScreen() {
  const { colors } = useTheme();
  const [monthlySalary, setMonthlySalary] = useState("");
  const [monthsWorked, setMonthsWorked] = useState("12");

  const salary = parseFloat(monthlySalary);
  const months = parseInt(monthsWorked) || 12;
  const result =
    monthlySalary && !isNaN(salary) && salary > 0
      ? calculate13thMonth(salary, months)
      : null;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
        >
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Adulting Hub</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#22C55E" + "1A", alignItems: "center", justifyContent: "center" }}>
            <Gift size={20} color="#22C55E" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>13th Month Pay</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Estimate your 13th month and tax exemption</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16 }}>
          <Card style={{ backgroundColor: colors.accent, borderColor: colors.border }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Gift size={20} color={colors.primary} />
              <Text variant="h4" style={{ color: colors.foreground }}>13th Month Pay</Text>
            </View>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>
              All rank-and-file employees are legally entitled to 13th month
              pay, at least 1/12 of your basic annual salary, paid on or
              before December 24 (PD No. 851).
            </Text>
          </Card>
        </View>

        {/* Calculator */}
        <View style={{ marginHorizontal: 16, marginTop: 16, gap: 16 }}>
          <Input
            label="Monthly Basic Salary (PHP)"
            placeholder="e.g. 25000"
            value={monthlySalary}
            onChangeText={setMonthlySalary}
            keyboardType="decimal-pad"
          />
          <Input
            label="Months Worked This Year"
            placeholder="12"
            value={monthsWorked}
            onChangeText={setMonthsWorked}
            keyboardType="number-pad"
          />

          {result && (
            <Card style={{ marginTop: 8 }}>
              <Text variant="h4" style={{ color: colors.foreground, marginBottom: 12 }}>
                Your 13th Month Pay
              </Text>
              <View style={{ gap: 12 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Gross 13th Month Pay</Text>
                  <Text variant="h3" style={{ color: colors.primary }}>{formatCurrency(result.gross)}</Text>
                </View>
                <Separator />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Tax-Exempt Portion (up to P90,000)</Text>
                  <Text variant="body-sm" style={{ fontWeight: "600", color: colors.green600 }}>
                    {formatCurrency(result.taxExemptPortion)}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Taxable Portion</Text>
                  <Text
                    variant="body-sm"
                    style={{
                      fontWeight: "600",
                      color: result.taxable > 0 ? colors.destructive : colors.mutedForeground,
                    }}
                  >
                    {formatCurrency(result.taxable)}
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <Card style={{ padding: 16 }}>
            <Text variant="label" style={{ color: colors.foreground, marginBottom: 8 }}>
              How It's Calculated
            </Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>
              Formula: (Basic Monthly Salary / 12) x Months Worked
            </Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 8 }}>
              The first P90,000 of 13th month pay combined with other
              bonuses is tax-exempt. Any amount exceeding P90,000 is subject
              to income tax.
            </Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 8 }}>
              Your employer must pay this regardless of your employment
              status (resigned, terminated, or active) as long as you worked
              at least one month during the calendar year.
            </Text>
          </Card>
        </View>
    </ScrollView>
  );
}

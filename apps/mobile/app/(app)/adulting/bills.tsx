import React, { useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useBills, useBillsSummary, useAddBill, useDeleteBill, useMarkBillPaid } from "@/hooks/use-bills";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/format";
import type { Bill } from "@exitplan/core";
import {
  ArrowLeft,
  Receipt,
  Plus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  Tv,
  Home,
  Building2,
  Play,
  Monitor,
  Dumbbell,
  MoreHorizontal,
} from "lucide-react-native";

const BILL_CATEGORIES = [
  { value: "electricity", label: "Electricity (Meralco)" },
  { value: "water", label: "Water (Maynilad/MWC)" },
  { value: "internet", label: "Internet" },
  { value: "mobile", label: "Mobile / Load" },
  { value: "cable_tv", label: "Cable TV" },
  { value: "rent", label: "Rent" },
  { value: "association_dues", label: "Association Dues" },
  { value: "streaming", label: "Streaming (Netflix, etc.)" },
  { value: "software", label: "Software / SaaS" },
  { value: "gym", label: "Gym" },
  { value: "other", label: "Other" },
];

const BILLING_CYCLES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
  mobile: Smartphone,
  cable_tv: Tv,
  rent: Home,
  association_dues: Building2,
  streaming: Play,
  software: Monitor,
  gym: Dumbbell,
  other: MoreHorizontal,
};

const CATEGORY_COLORS: Record<string, { text: string; bg: string }> = {
  electricity: { text: "#EAB308", bg: "#EAB308" + "1A" },
  water: { text: "#3B82F6", bg: "#3B82F6" + "1A" },
  internet: { text: "#6366F1", bg: "#6366F1" + "1A" },
  mobile: { text: "#22C55E", bg: "#22C55E" + "1A" },
  cable_tv: { text: "#A855F7", bg: "#A855F7" + "1A" },
  rent: { text: "#F97316", bg: "#F97316" + "1A" },
  association_dues: { text: "#14B8A6", bg: "#14B8A6" + "1A" },
  streaming: { text: "#EF4444", bg: "#EF4444" + "1A" },
  software: { text: "#06B6D4", bg: "#06B6D4" + "1A" },
  gym: { text: "#EC4899", bg: "#EC4899" + "1A" },
  other: { text: "#6B7280", bg: "#6B7280" + "1A" },
};

const FREQ_LABEL: Record<string, string> = {
  monthly: "/mo",
  quarterly: "/qtr",
  semi_annual: "/6mo",
  annual: "/yr",
};

export default function BillsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: bills, isLoading } = useBills();
  const { data: summary } = useBillsSummary();
  const addBill = useAddBill();
  const deleteBill = useDeleteBill();
  const markBillPaid = useMarkBillPaid();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("electricity");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [dueDay, setDueDay] = useState("");
  const [provider, setProvider] = useState("");

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["bills"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!name.trim() || !amount) {
      Alert.alert("Required", "Please fill in the name and amount.");
      return;
    }
    try {
      await addBill.mutateAsync({
        name: name.trim(),
        category: category as Bill["category"],
        amount: parseFloat(amount),
        billing_cycle: billingCycle as Bill["billing_cycle"],
        due_day: dueDay ? Math.min(31, Math.max(1, parseInt(dueDay))) : null,
        provider: provider.trim() || null,
      });
      setShowAdd(false);
      setName("");
      setAmount("");
      setDueDay("");
      setProvider("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add bill");
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Adulting Hub
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              height: 36,
              width: 36,
              borderRadius: 12,
              backgroundColor: "#6366F1" + "1A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Receipt size={20} color="#6366F1" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>
              Bills & Subscriptions
            </Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>
              Track recurring expenses and due dates
            </Text>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
        {/* Summary cards */}
        {summary && summary.count > 0 && (
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
            <Card
              style={{
                flex: 1,
                borderColor: "#6366F1" + "33",
                backgroundColor: "#6366F1" + "0D",
              }}
            >
              <CardContent style={{ padding: 12 }}>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  Monthly Total
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "700", color: "#6366F1", marginTop: 2 }}>
                  {formatCurrency(summary.totalMonthly)}
                </Text>
              </CardContent>
            </Card>
            <Card style={{ flex: 1, padding: 16 }}>
              <CardContent style={{ padding: 12 }}>
                <Text style={{ fontSize: 11, color: colors.mutedForeground }}>
                  Annual Cost
                </Text>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.foreground, marginTop: 2 }}>
                  {formatCurrency(summary.totalMonthly * 12)}
                </Text>
              </CardContent>
            </Card>
          </View>
        )}

        {/* Due soon alert */}
        {summary && summary.dueSoon && summary.dueSoon.length > 0 && (
          <View
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: "#F97316" + "33",
              backgroundColor: "#F97316" + "0D",
              padding: 16,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <AlertCircle size={16} color="#F97316" style={{ marginTop: 2 }} />
            <View>
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#EA580C" }}>
                Due within 7 days
              </Text>
              {summary.dueSoon.map((b: any) => (
                <Text
                  key={b.id}
                  style={{ fontSize: 11, color: colors.mutedForeground, marginTop: 2 }}
                >
                  {b.name} — Day {b.due_day} · {formatCurrency(b.amount)}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Add button */}
        <Button
          variant="outline"
          size="sm"
          onPress={() => setShowAdd(true)}
          style={{ marginBottom: 16, alignSelf: "flex-start" }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Plus size={14} color={colors.foreground} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              Add Bill
            </Text>
          </View>
        </Button>

        {/* Bills list */}
        {isLoading ? (
          <View style={{ gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ height: 80, backgroundColor: colors.muted, borderRadius: 10 }} />
            ))}
          </View>
        ) : !bills || bills.length === 0 ? (
          <Card style={{ borderRadius: 16 }}>
            <CardContent style={{ padding: 32, alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                No bills tracked yet.
              </Text>
              <Text style={{ fontSize: 12, color: colors.mutedForeground, marginTop: 4 }}>
                Add your recurring bills and subscriptions above.
              </Text>
            </CardContent>
          </Card>
        ) : (
          <Card style={{ borderRadius: 16 }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 14, fontWeight: "600" }}>
                Bills & Subscriptions
                <Text style={{ fontSize: 12, fontWeight: "400", color: colors.mutedForeground }}>
                  {" "}({bills.filter((b) => b.is_active).length} active)
                </Text>
              </CardTitle>
            </CardHeader>
            <View>
              {bills.map((bill, idx) => {
                const Icon = CATEGORY_ICONS[bill.category] ?? MoreHorizontal;
                const colorInfo = CATEGORY_COLORS[bill.category] ?? CATEGORY_COLORS.other;
                const paidToday =
                  bill.last_paid_date === new Date().toISOString().slice(0, 10);

                return (
                  <View key={bill.id}>
                    {idx > 0 && <Separator />}
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        opacity: bill.is_active ? 1 : 0.5,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 12,
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 12,
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <View
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              backgroundColor: colorInfo.bg,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Icon size={16} color={colorInfo.text} />
                          </View>
                          <View style={{ flex: 1, minWidth: 0 }}>
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: colors.foreground,
                              }}
                              numberOfLines={1}
                            >
                              {bill.name}
                            </Text>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.mutedForeground,
                                marginTop: 2,
                              }}
                              numberOfLines={1}
                            >
                              {bill.provider ? `${bill.provider} · ` : ""}
                              {formatCurrency(bill.amount)}
                              {FREQ_LABEL[bill.billing_cycle] ?? ""}
                            </Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <TouchableOpacity
                            onPress={() => markBillPaid.mutate({ bill })}
                            style={{ padding: 4 }}
                          >
                            <CheckCircle2
                              size={16}
                              color={paidToday ? colors.primary : colors.mutedForeground}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert("Remove bill?", `"${bill.name}" will be permanently removed.`, [
                                { text: "Cancel", style: "cancel" },
                                {
                                  text: "Delete",
                                  style: "destructive",
                                  onPress: () => deleteBill.mutate(bill.id),
                                },
                              ])
                            }
                            style={{ padding: 4 }}
                          >
                            <Trash2 size={16} color={colors.destructive} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </Card>
        )}
      </View>

      {/* Add Bill Modal */}
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Bill / Subscription">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Name" placeholder="Netflix, Meralco..." value={name} onChangeText={setName} />
          <Select label="Category" value={category} onValueChange={setCategory} options={BILL_CATEGORIES} />
          <Input label="Provider (optional)" placeholder="PLDT, Globe..." value={provider} onChangeText={setProvider} />
          <Input label="Amount (PHP)" placeholder="1500" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <Select label="Billing Cycle" value={billingCycle} onValueChange={setBillingCycle} options={BILLING_CYCLES} />
          <Input label="Due Day (1-31, optional)" placeholder="25" value={dueDay} onChangeText={setDueDay} keyboardType="number-pad" />
          <Button onPress={handleAdd} loading={addBill.isPending} disabled={!name || !amount}>
            Add Bill
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

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
import {
  useDebts,
  useAddDebt,
  useDeleteDebt,
  useRecordDebtPayment,
} from "@/hooks/use-debts";
import { useAccounts } from "@/hooks/use-accounts";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@exitplan/core";
import type { Debt } from "@exitplan/core";
import { Plus, CreditCard, Trash2, DollarSign, ArrowLeft } from "lucide-react-native";

const DEBT_TYPES = [
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "sss_loan", label: "SSS Loan" },
  { value: "pagibig_loan", label: "Pag-IBIG Loan" },
  { value: "home_loan", label: "Home Loan" },
  { value: "car_loan", label: "Car Loan" },
  { value: "salary_loan", label: "Salary Loan" },
  { value: "other", label: "Other" },
];

export default function DebtsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: debts, isLoading } = useDebts();
  const { data: accounts } = useAccounts();
  const addDebt = useAddDebt();
  const deleteDebt = useDeleteDebt();
  const recordPayment = useRecordDebtPayment();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const [debtName, setDebtName] = useState("");
  const [debtType, setDebtType] = useState("personal_loan");
  const [debtBalance, setDebtBalance] = useState("");
  const [debtOriginal, setDebtOriginal] = useState("");
  const [debtRate, setDebtRate] = useState("");
  const [debtMinPayment, setDebtMinPayment] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentAccountId, setPaymentAccountId] = useState("");

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["debts"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!debtName.trim() || !debtBalance || !debtOriginal || !debtMinPayment) {
      Alert.alert("Required", "Please fill in all required fields.");
      return;
    }
    try {
      await addDebt.mutateAsync({
        name: debtName.trim(),
        type: debtType as Debt["type"],
        current_balance: parseFloat(debtBalance),
        original_amount: parseFloat(debtOriginal),
        interest_rate: parseFloat(debtRate) / 100 || 0,
        minimum_payment: parseFloat(debtMinPayment),
      });
      setShowAdd(false);
      setDebtName("");
      setDebtBalance("");
      setDebtOriginal("");
      setDebtRate("");
      setDebtMinPayment("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add debt");
    }
  }

  async function handlePayment() {
    if (!selectedDebt) return;
    const amount = parseFloat(paymentAmount);
    if (!paymentAmount || isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid payment amount.");
      return;
    }
    try {
      const result = await recordPayment.mutateAsync({
        debt: selectedDebt,
        paymentAmount: amount,
        accountId: paymentAccountId || undefined,
      });
      setShowPayment(false);
      setPaymentAmount("");
      if (result.isPaidOff) {
        Alert.alert("Debt Paid Off!", `Congratulations! You've paid off "${selectedDebt.name}".`);
      }
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to record payment");
    }
  }

  const activeDebts = debts?.filter((d) => !d.is_paid_off) ?? [];
  const totalDebt = activeDebts.reduce((s, d) => s + d.current_balance, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
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
          <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#EF4444" + "1A", alignItems: "center", justifyContent: "center" }}>
            <CreditCard size={20} color="#EF4444" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>Debt Manager</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Track balances, Avalanche & Snowball payoff</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16 }}>
          <Card style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>Total Debt</Text>
                <Text variant="h3" style={{ color: colors.destructive }}>{formatCurrency(totalDebt)}</Text>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>
                  {activeDebts.length} active debt{activeDebts.length !== 1 ? "s" : ""}
                </Text>
              </View>
              <Button size="sm" onPress={() => setShowAdd(true)}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Plus size={16} color={colors.primaryForeground} />
                  <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "600" }}>Add</Text>
                </View>
              </Button>
            </View>
          </Card>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2].map((i) => (
                <View key={i} style={{ height: 128, backgroundColor: colors.muted, borderRadius: 10 }} />
              ))}
            </View>
          ) : debts?.length === 0 ? (
            <EmptyState
              title="No debts tracked"
              description="Track your loans and credit card balances to plan your payoff strategy."
              icon={<CreditCard size={28} color={colors.primary} />}
            />
          ) : (
            <View style={{ gap: 12 }}>
              {debts?.map((debt) => {
                const progress =
                  debt.original_amount > 0
                    ? ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100
                    : 0;
                return (
                  <Card key={debt.id} style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text variant="h4" style={{ color: colors.foreground }}>{debt.name}</Text>
                        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                          <Badge variant={debt.is_paid_off ? "success" : "destructive"}>
                            {DEBT_TYPES.find((t) => t.value === debt.type)?.label ?? debt.type}
                          </Badge>
                          {debt.is_paid_off && <Badge variant="success">Paid Off</Badge>}
                        </View>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text variant="h4" style={{ color: colors.destructive }}>
                          {formatCurrency(debt.current_balance)}
                        </Text>
                        <Text variant="caption" style={{ color: colors.mutedForeground }}>
                          {(debt.interest_rate * 100).toFixed(1)}% rate
                        </Text>
                      </View>
                    </View>

                    <View style={{ marginBottom: 12 }}>
                      <View style={{ height: 6, backgroundColor: colors.muted, borderRadius: 3, overflow: "hidden" }}>
                        <View
                          style={{
                            height: "100%",
                            backgroundColor: colors.emerald500,
                            borderRadius: 3,
                            width: `${Math.min(100, progress)}%`,
                          }}
                        />
                      </View>
                      <Text variant="caption" style={{ color: colors.mutedForeground, marginTop: 4 }}>
                        {progress.toFixed(0)}% paid off {"\u2022"} Min payment: {formatCurrency(debt.minimum_payment)}/mo
                      </Text>
                    </View>

                    {!debt.is_paid_off && (
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedDebt(debt);
                            setPaymentAmount(String(debt.minimum_payment));
                            setShowPayment(true);
                          }}
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: colors.accent,
                          }}
                        >
                          <DollarSign size={14} color={colors.primary} />
                          <Text variant="caption" style={{ color: colors.primary, fontWeight: "600" }}>
                            Record Payment
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() =>
                            Alert.alert("Delete Debt", `Delete "${debt.name}"?`, [
                              { text: "Cancel", style: "cancel" },
                              { text: "Delete", style: "destructive", onPress: () => deleteDebt.mutate(debt.id) },
                            ])
                          }
                          style={{
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                            backgroundColor: colors.destructive + "15",
                          }}
                        >
                          <Trash2 size={14} color={colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          )}
        </View>
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Debt">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Debt Name" placeholder="e.g. BPI Credit Card" value={debtName} onChangeText={setDebtName} />
          <Select label="Type" value={debtType} onValueChange={setDebtType} options={DEBT_TYPES} />
          <Input label="Current Balance (PHP)" placeholder="0.00" value={debtBalance} onChangeText={setDebtBalance} keyboardType="decimal-pad" />
          <Input label="Original Amount (PHP)" placeholder="0.00" value={debtOriginal} onChangeText={setDebtOriginal} keyboardType="decimal-pad" />
          <Input label="Annual Interest Rate (%)" placeholder="e.g. 24" value={debtRate} onChangeText={setDebtRate} keyboardType="decimal-pad" />
          <Input label="Minimum Monthly Payment (PHP)" placeholder="0.00" value={debtMinPayment} onChangeText={setDebtMinPayment} keyboardType="decimal-pad" />
          <Button onPress={handleAdd} loading={addDebt.isPending}>Add Debt</Button>
        </View>
      </Modal>

      <Modal visible={showPayment} onClose={() => setShowPayment(false)} title={`Pay: ${selectedDebt?.name ?? ""}`}>
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Payment Amount (PHP)" placeholder="0.00" value={paymentAmount} onChangeText={setPaymentAmount} keyboardType="decimal-pad" />
          <Select
            label="From Account (optional)"
            value={paymentAccountId}
            onValueChange={setPaymentAccountId}
            placeholder="No account selected"
            options={(accounts ?? []).map((a) => ({
              value: a.id,
              label: `${a.name} (${formatCurrency(a.balance, a.currency)})`,
            }))}
          />
          <Button onPress={handlePayment} loading={recordPayment.isPending}>Record Payment</Button>
        </View>
      </Modal>
    </ScrollView>
  );
}

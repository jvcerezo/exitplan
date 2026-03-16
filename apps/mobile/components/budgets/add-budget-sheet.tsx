import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAddBudget } from "@/hooks/use-budgets";
import { CATEGORIES } from "@exitplan/core";

interface AddBudgetSheetProps {
  visible: boolean;
  onClose: () => void;
}

const PERIODS = [
  { label: "Monthly", value: "monthly" },
  { label: "Weekly", value: "weekly" },
  { label: "Quarterly", value: "quarterly" },
];

export function AddBudgetSheet({ visible, onClose }: AddBudgetSheetProps) {
  const addBudget = useAddBudget();
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState("monthly");

  // Reset state on open
  React.useEffect(() => {
    if (visible) {
      setCategory("Food");
      setAmount("");
      setPeriod("monthly");
    }
  }, [visible]);

  async function handleAdd() {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Required", "Please enter a valid amount.");
      return;
    }

    try {
      await addBudget.mutateAsync({
        category: category.toLowerCase(),
        amount: parsedAmount,
        month: new Date().toISOString().substring(0, 7), // YYYY-MM
        period: period as "monthly" | "weekly" | "quarterly",
      });
      onClose();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to add budget.");
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Budget">
      <View className="gap-4 pb-4">
        {/* Category */}
        <View className="gap-2">
          <Select
            label="Category"
            value={category}
            onValueChange={setCategory}
            options={CATEGORIES.map((c: string) => ({ label: c, value: c }))}
          />
        </View>

        {/* Amount */}
        <View className="gap-2">
          <Input
            label="Amount (₱)"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>

        {/* Period */}
        <View className="gap-2">
          <Select
            label="Period"
            value={period}
            onValueChange={setPeriod}
            options={PERIODS}
          />
        </View>

        <Button
          className="mt-4"
          onPress={handleAdd}
          disabled={addBudget.isPending}
        >
          {addBudget.isPending ? "Adding..." : "Add Budget"}
        </Button>
      </View>
    </Modal>
  );
}
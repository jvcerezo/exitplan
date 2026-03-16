import React, { useState } from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useAddTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { CATEGORIES } from "@exitplan/core";

interface AddTransactionSheetProps {
  visible: boolean;
  onClose: () => void;
  initialType?: "expense" | "income";
}

export function AddTransactionSheet({
  visible,
  onClose,
  initialType = "expense",
}: AddTransactionSheetProps) {
  const addTransaction = useAddTransaction();
  const { data: accounts } = useAccounts();

  const [isExpense, setIsExpense] = useState(initialType === "expense");
  
  // reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setIsExpense(initialType === "expense");
      setAmount("");
      setDescription("");
      setCategory("Food");
      setDate(new Date().toISOString().split("T")[0]);
      setAccountId("");
    }
  }, [visible, initialType]);

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");

  async function handleAdd() {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!accountId) {
      Alert.alert("Error", "Please select an account.");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        amount: isExpense ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
        description: description.trim() || category,
        category: category.toLowerCase(),
        date,
        currency: "PHP",
        account_id: accountId,
      });
      onClose();
      setAmount("");
      setDescription("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add transaction");
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Transaction">
      <View className="gap-4 pb-4">
        {/* Type toggle */}
        <View className="flex-row bg-gray-100 rounded-lg p-1">
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md items-center ${
              isExpense ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setIsExpense(true)}
          >
            <Text
              variant="body-sm"
              className={
                isExpense ? "text-red-600 font-semibold" : "text-gray-500"
              }
            >
              Expense
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-2 rounded-md items-center ${
              !isExpense ? "bg-white shadow-sm" : ""
            }`}
            onPress={() => setIsExpense(false)}
          >
            <Text
              variant="body-sm"
              className={
                !isExpense
                  ? "text-emerald-600 font-semibold"
                  : "text-gray-500"
              }
            >
              Income
            </Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Amount (PHP)"
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <Input
          label="Description"
          placeholder="What was this for?"
          value={description}
          onChangeText={setDescription}
        />
        <Select
          label="Category"
          value={category}
          onValueChange={setCategory}
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Input
          label="Date"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        <Select
          label="Account"
          value={accountId}
          onValueChange={setAccountId}
          placeholder="Select account..."
          options={(accounts ?? []).map((a) => ({
            value: a.id,
            label: a.name,
          }))}
        />
        <Button onPress={handleAdd} loading={addTransaction.isPending}>
          Add Transaction
        </Button>
      </View>
    </Modal>
  );
}

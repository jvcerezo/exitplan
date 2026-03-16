import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAddGoal } from "@/hooks/use-goals";
import { GOAL_CATEGORIES } from "@exitplan/core";

interface AddGoalSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddGoalSheet({ visible, onClose }: AddGoalSheetProps) {
  const addGoal = useAddGoal();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("0");
  const [deadline, setDeadline] = useState("");

  async function handleAdd() {
    if (!name.trim() || !targetAmount) {
      Alert.alert("Required", "Please enter a name and target amount.");
      return;
    }
    try {
      await addGoal.mutateAsync({
        name: name.trim(),
        category,
        target_amount: parseFloat(targetAmount),
        current_amount: parseFloat(currentAmount) || 0,
        deadline: deadline || null,
      });
      onClose();
      setName("");
      setTargetAmount("");
      setCurrentAmount("0");
      setDeadline("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add goal");
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Goal">
      <View className="gap-4 pb-4">
        <Input
          label="Goal Name"
          placeholder="e.g. Emergency Fund"
          value={name}
          onChangeText={setName}
        />
        <Select
          label="Category"
          value={category}
          onValueChange={setCategory}
          options={GOAL_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <Input
          label="Target Amount (PHP)"
          placeholder="50000"
          value={targetAmount}
          onChangeText={setTargetAmount}
          keyboardType="decimal-pad"
        />
        <Input
          label="Already Saved (PHP)"
          placeholder="0"
          value={currentAmount}
          onChangeText={setCurrentAmount}
          keyboardType="decimal-pad"
        />
        <Input
          label="Deadline (optional)"
          placeholder="YYYY-MM-DD"
          value={deadline}
          onChangeText={setDeadline}
        />
        <Button onPress={handleAdd} loading={addGoal.isPending}>
          Add Goal
        </Button>
      </View>
    </Modal>
  );
}

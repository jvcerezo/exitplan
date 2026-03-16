import React, { useState } from "react";
import { View, Alert } from "react-native";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAddAccount } from "@/hooks/use-accounts";
import { ACCOUNT_TYPES, CURRENCIES } from "@exitplan/core";

interface AddAccountSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function AddAccountSheet({ visible, onClose }: AddAccountSheetProps) {
  const addAccount = useAddAccount();
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [currency, setCurrency] = useState("PHP");
  const [balance, setBalance] = useState("");

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
      onClose();
      setName("");
      setBalance("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add account");
    }
  }

  return (
    <Modal visible={visible} onClose={onClose} title="Add Account">
      <View className="gap-4 pb-4">
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
          options={ACCOUNT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
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
  );
}

import React, { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { BrandMark } from "@/components/brand-mark";
import { useTheme } from "@/lib/theme";
import { useProfile } from "@/hooks/use-profile";
import { useAddAccount } from "@/hooks/use-accounts";
import { useAddGoal } from "@/hooks/use-goals";
import { supabase } from "@/lib/supabase";
import { COMMON_ACCOUNTS, ACCOUNT_TYPES, GOAL_CATEGORIES } from "@exitplan/core";
import {
  ArrowRight,
  Landmark,
  Target,
  X,
  Plus,
  Shield,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Clock,
  Plane,
  GraduationCap,
  Home,
  Car,
  Ellipsis,
} from "lucide-react-native";

const GOAL_ICONS: Record<string, React.ElementType> = {
  "emergency fund": Shield,
  "debt payoff": CreditCard,
  savings: PiggyBank,
  investment: TrendingUp,
  retirement: Clock,
  travel: Plane,
  education: GraduationCap,
  home: Home,
  vehicle: Car,
  other: Ellipsis,
};

interface AddedAccount {
  name: string;
  type: string;
  balance: string;
}

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { data: profile } = useProfile();
  const addAccount = useAddAccount();
  const addGoal = useAddGoal();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Accounts
  const [addedAccounts, setAddedAccounts] = useState<AddedAccount[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("bank");

  // Step 2: Goal
  const [goalCategory, setGoalCategory] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  function toggleAccount(preset: { name: string; type: string }) {
    setAddedAccounts((prev) => {
      const exists = prev.some((a) => a.name === preset.name);
      if (exists) return prev.filter((a) => a.name !== preset.name);
      return [...prev, { name: preset.name, type: preset.type, balance: "" }];
    });
  }

  function addCustomAccount() {
    if (!customName.trim()) return;
    setAddedAccounts((prev) => [
      ...prev,
      { name: customName, type: customType, balance: "" },
    ]);
    setCustomName("");
    setCustomType("bank");
    setShowCustomForm(false);
  }

  function removeAccount(index: number) {
    setAddedAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBalance(index: number, value: string) {
    setAddedAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, balance: value } : a))
    );
  }

  async function handleAccountsContinue() {
    if (addedAccounts.length === 0) return;
    setSaving(true);
    try {
      for (const acc of addedAccounts) {
        await addAccount.mutateAsync({
          name: acc.name,
          type: acc.type as "cash" | "bank" | "e-wallet" | "credit-card",
          currency: "PHP",
          balance: parseFloat(acc.balance) || 0,
        });
      }
      setSaving(false);
      setStep(2);
    } catch (error) {
      Alert.alert("Error", "Failed to add accounts");
      setSaving(false);
    }
  }

  async function handleGoalCreate() {
    if (!goalCategory || !goalName || !goalTarget) return;
    setSaving(true);
    try {
      await addGoal.mutateAsync({
        name: goalName,
        target_amount: parseFloat(goalTarget),
        current_amount: 0,
        deadline: null,
        category: goalCategory,
      });
      await completeOnboarding();
      router.push("/(app)/dashboard");
    } catch {
      Alert.alert("Error", "Failed to create goal");
      setSaving(false);
    }
  }

  async function completeOnboarding() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ has_completed_onboarding: true })
        .eq("id", user.id);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await completeOnboarding();
      router.push("/(app)/dashboard");
    } catch {
      Alert.alert("Error", "Failed to finish onboarding");
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Step 0: Welcome */}
        {step === 0 && (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: "center",
              paddingHorizontal: 24,
              paddingVertical: 48,
            }}
          >
            <View style={{ alignItems: "center", gap: 24 }}>
              <BrandMark size={96} />
              <View style={{ alignItems: "center" }}>
                <Text
                  variant="h1"
                  style={{
                    color: colors.foreground,
                    textAlign: "center",
                    letterSpacing: -0.5,
                  }}
                >
                  Welcome to Exit
                  <Text style={{ color: colors.primary }}>Plan</Text>
                  {profile?.full_name ? `, ${profile.full_name}` : ""}!
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.mutedForeground,
                    textAlign: "center",
                    marginTop: 12,
                  }}
                >
                  A quick 2-step setup and you'll have a personalised financial
                  dashboard ready to go.
                </Text>
              </View>

              {/* Step cards */}
              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                {[
                  {
                    icon: Landmark,
                    label: "Connect accounts",
                    sub: "Track every balance",
                  },
                  {
                    icon: Target,
                    label: "Set a goal",
                    sub: "Work toward what matters",
                  },
                ].map(({ icon: Icon, label, sub }) => (
                  <View
                    key={label}
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                      padding: 16,
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        backgroundColor: colors.primary + "1A",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={16} color={colors.primary} />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: colors.foreground,
                      }}
                    >
                      {label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.mutedForeground,
                      }}
                    >
                      {sub}
                    </Text>
                  </View>
                ))}
              </View>

              <Button
                size="lg"
                onPress={() => setStep(1)}
                style={{ width: "100%" }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "600",
                      color: colors.primaryForeground,
                    }}
                  >
                    Get Started
                  </Text>
                  <ArrowRight size={16} color={colors.primaryForeground} />
                </View>
              </Button>

              <Text
                style={{
                  fontSize: 12,
                  color: colors.mutedForeground,
                }}
              >
                You can always change these later in Settings.
              </Text>
            </View>
          </ScrollView>
        )}

        {/* Step 1: Accounts */}
        {step === 1 && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                variant="h2"
                style={{
                  color: colors.foreground,
                  letterSpacing: -0.3,
                }}
              >
                Add your accounts
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  paddingTop: 4,
                }}
              >
                Step 1 of 2
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                marginBottom: 16,
              }}
            >
              Select your accounts and enter their current balances.
            </Text>

            {/* Preset pills */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {(COMMON_ACCOUNTS ?? []).map((preset: { name: string; type: string }) => {
                const isAdded = addedAccounts.some(
                  (a) => a.name === preset.name
                );
                return (
                  <TouchableOpacity
                    key={preset.name}
                    onPress={() => toggleAccount(preset)}
                    style={{
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderWidth: 1,
                      backgroundColor: isAdded
                        ? colors.primary
                        : colors.muted + "80",
                      borderColor: isAdded
                        ? colors.primary
                        : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: isAdded
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      }}
                    >
                      {preset.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity
                onPress={() => setShowCustomForm(true)}
                style={{
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "transparent",
                  backgroundColor: colors.muted + "80",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Plus size={12} color={colors.mutedForeground} />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: colors.mutedForeground,
                  }}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom form */}
            {showCustomForm && (
              <View
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    Custom Account
                  </Text>
                  <TouchableOpacity onPress={() => setShowCustomForm(false)}>
                    <X size={16} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Input
                  label="Name"
                  placeholder="e.g., BDO, BPI"
                  value={customName}
                  onChangeText={setCustomName}
                />
                <Select
                  label="Type"
                  value={customType}
                  onValueChange={setCustomType}
                  options={ACCOUNT_TYPES.map((t) => ({
                    value: t.value,
                    label: t.label,
                  }))}
                />
                <Button
                  size="sm"
                  onPress={addCustomAccount}
                  disabled={!customName.trim()}
                >
                  Add Account
                </Button>
              </View>
            )}

            {/* Added accounts with balance inputs */}
            {addedAccounts.length > 0 && (
              <View style={{ gap: 8, marginBottom: 16 }}>
                {addedAccounts.map((acc, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: colors.border,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.foreground,
                        }}
                      >
                        {acc.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.mutedForeground,
                        }}
                      >
                        {acc.type}
                      </Text>
                    </View>
                    <Input
                      placeholder="0"
                      value={acc.balance}
                      onChangeText={(val) => updateBalance(i, val)}
                      keyboardType="decimal-pad"
                      style={{ width: 100, textAlign: "right" }}
                    />
                    <TouchableOpacity onPress={() => removeAccount(i)}>
                      <X size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Button
                variant="outline"
                onPress={() => setStep(2)}
                style={{ flex: 1 }}
              >
                Skip
              </Button>
              <Button
                onPress={handleAccountsContinue}
                disabled={addedAccounts.length === 0 || saving}
                loading={saving}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.primaryForeground,
                    }}
                  >
                    {saving ? "Saving..." : "Continue"}
                  </Text>
                  {!saving && (
                    <ArrowRight
                      size={14}
                      color={colors.primaryForeground}
                    />
                  )}
                </View>
              </Button>
            </View>
          </ScrollView>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text
                variant="h2"
                style={{
                  color: colors.foreground,
                  letterSpacing: -0.3,
                }}
              >
                Set your first goal
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.mutedForeground,
                  paddingTop: 4,
                }}
              >
                Step 2 of 2
              </Text>
            </View>
            <Text
              style={{
                fontSize: 14,
                color: colors.mutedForeground,
                marginBottom: 16,
              }}
            >
              What are you saving toward?{" "}
              <Text
                style={{
                  fontStyle: "italic",
                  color: colors.mutedForeground + "B3",
                }}
              >
                Optional
              </Text>
            </Text>

            {/* Goal category pills */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              {GOAL_CATEGORIES.map((cat) => {
                const Icon =
                  GOAL_ICONS[cat.toLowerCase()] ?? Ellipsis;
                const isSelected = goalCategory === cat.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => {
                      setGoalCategory(cat.toLowerCase());
                      if (!goalName) setGoalName(cat);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      borderRadius: 999,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderWidth: 1,
                      backgroundColor: isSelected
                        ? colors.primary
                        : colors.muted + "80",
                      borderColor: isSelected
                        ? colors.primary
                        : "transparent",
                    }}
                  >
                    <Icon
                      size={12}
                      color={
                        isSelected
                          ? colors.primaryForeground
                          : colors.mutedForeground
                      }
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: isSelected
                          ? colors.primaryForeground
                          : colors.mutedForeground,
                      }}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Goal form */}
            {goalCategory !== "" && (
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.muted + "33",
                  padding: 16,
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <Input
                  label="Goal name"
                  placeholder="e.g., Europe trip"
                  value={goalName}
                  onChangeText={setGoalName}
                />
                <Input
                  label="Target amount"
                  placeholder="0.00"
                  value={goalTarget}
                  onChangeText={setGoalTarget}
                  keyboardType="decimal-pad"
                />
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Button
                variant="outline"
                onPress={handleFinish}
                disabled={saving}
                loading={saving && !goalCategory}
                style={{ flex: 1 }}
              >
                {saving ? "Loading..." : "Skip"}
              </Button>
              <Button
                onPress={handleGoalCreate}
                disabled={
                  saving ||
                  !goalCategory ||
                  !goalName ||
                  !goalTarget
                }
                loading={saving && !!goalCategory}
                style={{ flex: 1 }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.primaryForeground,
                    }}
                  >
                    {saving ? "Creating..." : "Finish Setup"}
                  </Text>
                  {!saving && (
                    <ArrowRight
                      size={14}
                      color={colors.primaryForeground}
                    />
                  )}
                </View>
              </Button>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

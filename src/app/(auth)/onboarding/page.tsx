"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  X,
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
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useProfile } from "@/hooks/use-profile";
import { useAddAccount } from "@/hooks/use-accounts";
import { useAddGoal } from "@/hooks/use-goals";
import { completeOnboarding } from "@/app/(auth)/actions";
import { COMMON_ACCOUNTS, GOAL_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
};

interface AddedAccount {
  name: string;
  type: string;
  balance: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const addAccount = useAddAccount();
  const addGoal = useAddGoal();

  const [step, setStep] = useState(0);

  // Accounts step
  const [addedAccounts, setAddedAccounts] = useState<AddedAccount[]>([]);

  // Goal step
  const [goalCategory, setGoalCategory] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const [saving, setSaving] = useState(false);

  function toggleAccount(preset: { name: string; type: string }) {
    setAddedAccounts((prev) => {
      const exists = prev.some((a) => a.name === preset.name);
      if (exists) {
        return prev.filter((a) => a.name !== preset.name);
      }
      return [...prev, { name: preset.name, type: preset.type, balance: "" }];
    });
  }

  function removeAccount(index: number) {
    setAddedAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAccountBalance(index: number, balance: string) {
    setAddedAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, balance } : a))
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
      setStep(3);
    } catch (error) {
      console.error("Failed to add accounts:", error);
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
      console.log("Goal created successfully");
      const result = await completeOnboarding();
      console.log("Onboarding completed:", result);
      if (result.error) {
        throw new Error(result.error);
      }
      // Small delay to ensure DB sync
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to create goal or finish onboarding:", error);
      setSaving(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      console.log("Starting onboarding completion...");
      const result = await completeOnboarding();
      console.log("Onboarding completed:", result);
      if (result.error) {
        throw new Error(result.error);
      }
      // Small delay to ensure DB sync
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/dashboard");
    } catch (error) {
      console.error("Failed to finish onboarding:", error);
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Step indicator — only shown on steps 1-3 */}
      {step >= 1 && (
        <p className="mb-6 text-sm text-muted-foreground">
          Step {step} of 3
        </p>
      )}

      <Card className="w-full max-w-md">
        <CardContent className="pt-8 pb-8">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Welcome to Exit<span className="text-primary">Plan</span>
                  {profile?.full_name ? `, ${profile.full_name}` : ""}!
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Let&apos;s set up your account.
                </p>
              </div>
              <Button className="w-full" onClick={() => setStep(1)}>
                Get Started
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Step 1: Add Accounts */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Add your accounts</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tap to select your wallets and bank accounts.
                </p>
              </div>

              {/* Preset pills */}
              <div className="flex flex-wrap gap-2 justify-center">
                {COMMON_ACCOUNTS.map((preset) => {
                  const isAdded = addedAccounts.some(
                    (a) => a.name === preset.name
                  );
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => toggleAccount(preset)}
                      className={cn(
                        "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                        isAdded
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      {preset.name}
                    </button>
                  );
                })}
              </div>

              {/* Selected accounts list */}
              {addedAccounts.length > 0 && (
                <div className="space-y-2">
                  {addedAccounts.map((acc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                    >
                      <div>
                        <p className="text-sm font-medium">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAccount(i)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={addedAccounts.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Add Balance */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Add your balances</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter the current balance for each account.
                </p>
              </div>

              <div className="space-y-2">
                {addedAccounts.map((acc, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-muted-foreground">
                        ₱
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        placeholder="0"
                        value={acc.balance}
                        onChange={(e) =>
                          updateAccountBalance(i, e.target.value)
                        }
                        className="w-24 bg-transparent text-sm font-medium text-right outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAccountsContinue}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Continue"}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Add Goals (optional) */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-bold">Set your first goal</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  What are you saving toward? <span className="italic">(optional)</span>
                </p>
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {GOAL_CATEGORIES.map((cat) => {
                  const Icon = GOAL_ICONS[cat.toLowerCase()] ?? Ellipsis;
                  const isSelected = goalCategory === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setGoalCategory(cat.toLowerCase());
                        if (!goalName) setGoalName(cat);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Goal details */}
              {goalCategory && (
                <div className="space-y-4">
                  <input
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="Goal name"
                    className="w-full bg-transparent text-sm font-medium outline-none border-b border-border pb-2 placeholder:text-muted-foreground/40 focus:border-primary transition-colors"
                  />
                  <div className="flex items-baseline gap-2 py-2">
                    <span className="text-3xl font-bold text-muted-foreground/50">
                      ₱
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleFinish}
                  disabled={saving}
                >
                  {saving ? "Loading..." : "Skip"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleGoalCreate}
                  disabled={
                    saving || !goalCategory || !goalName || !goalTarget
                  }
                >
                  {saving ? "Creating..." : "Create & Finish"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        You can always change these later in Settings.
      </p>
    </div>
  );
}

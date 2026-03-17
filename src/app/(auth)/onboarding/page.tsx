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
  Receipt,
  Landmark,
  Plus,
  Wallet,
  Banknote,
  Target,
  Loader2,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { useAddAccount } from "@/hooks/use-accounts";
import { useAddGoal } from "@/hooks/use-goals";
import { completeOnboarding } from "@/app/(auth)/actions";
import { COMMON_ACCOUNTS, ACCOUNT_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types & Constants ───────────────────────────────────────────────────────

interface AddedAccount {
  name: string;
  type: string;
  balance: string;
}

const MONEY_GOALS = [
  { id: "track-expenses", label: "Track my daily expenses", icon: Receipt, goalCategory: "savings", goalName: "Build Savings" },
  { id: "budget-salary", label: "Budget my salary", icon: Wallet, goalCategory: "savings", goalName: "Monthly Budget" },
  { id: "pay-off-debt", label: "Pay off debt", icon: CreditCard, goalCategory: "debt payoff", goalName: "Debt Payoff" },
  { id: "build-emergency", label: "Build an emergency fund", icon: Shield, goalCategory: "emergency fund", goalName: "Emergency Fund" },
  { id: "save-for-goal", label: "Save for a big purchase", icon: Target, goalCategory: "savings", goalName: "Savings Goal" },
  { id: "grow-wealth", label: "Grow my wealth", icon: TrendingUp, goalCategory: "investment", goalName: "Wealth Growth" },
] as const;

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

// Steps: 0 = welcome, 1 = money goal, 2 = accounts
const STEP_COUNT = 3;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

function parseAmountInput(value: string): string {
  const stripped = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!stripped) return "";
  const [intPartRaw, ...rest] = stripped.split(".");
  const decimalPart = rest.join("");
  const normalizedInt = intPartRaw.replace(/^0+(?=\d)/, "");
  if (rest.length > 0) return `${normalizedInt || "0"}.${decimalPart}`;
  return normalizedInt;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 w-full max-w-xs">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-300",
            i < current ? "bg-primary" : i === current ? "bg-primary/50" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const addAccount = useAddAccount();
  const addGoal = useAddGoal();

  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Money goal
  const [selectedGoal, setSelectedGoal] = useState("");
  const [goalAmount, setGoalAmount] = useState("");

  // Step 2: Accounts
  const [addedAccounts, setAddedAccounts] = useState<AddedAccount[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState("bank");

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // ── Account helpers ──────────────────────────────────────────────────

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
      { name: customName.trim(), type: customType, balance: "" },
    ]);
    setCustomName("");
    setCustomType("bank");
    setShowCustomForm(false);
  }

  function removeAccount(index: number) {
    setAddedAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateBalance(index: number, raw: string) {
    const cleaned = parseAmountInput(raw);
    setAddedAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, balance: cleaned } : a))
    );
  }

  // ── Finish onboarding ────────────────────────────────────────────────

  async function handleFinish() {
    setSaving(true);
    try {
      // Create accounts
      for (const acc of addedAccounts) {
        await addAccount.mutateAsync({
          name: acc.name,
          type: acc.type as "cash" | "bank" | "e-wallet" | "credit-card",
          currency: "PHP",
          balance: parseFloat(acc.balance) || 0,
        });
      }

      // Create goal based on selected money goal
      const goalInfo = MONEY_GOALS.find((g) => g.id === selectedGoal);
      const parsedGoalAmount = parseFloat(goalAmount) || 0;
      if (goalInfo && parsedGoalAmount > 0) {
        await addGoal.mutateAsync({
          name: goalInfo.goalName,
          target_amount: parsedGoalAmount,
          current_amount: 0,
          deadline: null,
          category: goalInfo.goalCategory,
        });
      }

      await completeOnboarding();
      localStorage.setItem("exitplan_tour_required", "1");
      localStorage.setItem("exitplan_tour_pending", "1");
      router.push("/guide");
    } catch (error) {
      console.error("Onboarding error:", error);
      setSaving(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-[100dvh] flex-col items-center bg-background">
      {/* ── Step 0: Welcome ────────────────────────────────────────── */}
      {step === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 w-full max-w-md text-center space-y-8">
          <BrandMark className="h-20 w-20 rounded-[22px]" />

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {firstName ? `Hey ${firstName}!` : "Welcome!"}
            </h1>
            <p className="text-muted-foreground text-balance">
              Your adulting journey starts here. We&apos;ll guide you from your first payslip to retirement.
            </p>
          </div>

          <div className="w-full space-y-2.5 text-left">
            {[
              { icon: Wallet, text: "Track your finances in one place" },
              { icon: Target, text: "Step-by-step guides for every life stage" },
              { icon: Banknote, text: "Tools for IDs, taxes, insurance & more" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm font-medium">{text}</p>
              </div>
            ))}
          </div>

          <Button className="w-full" size="lg" onClick={() => setStep(1)}>
            Let&apos;s Go
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ── Steps 1-2 ──────────────────────────────────────────────── */}
      {step >= 1 && (
        <div className="flex flex-1 flex-col w-full max-w-lg px-5 py-8 sm:py-12">
          {/* Header with progress */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <StepProgress current={step} total={STEP_COUNT} />
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {step}/{STEP_COUNT - 1}
            </span>
          </div>

          {/* ── Step 1: Money Goal ──────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-1 flex-col space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  What&apos;s your #1 money goal?
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  This helps us personalize your dashboard. You can change it anytime.
                </p>
              </div>

              <div className="space-y-2">
                {MONEY_GOALS.map((goal) => {
                  const isSelected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => setSelectedGoal(goal.id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:border-foreground/20 hover:bg-muted/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        <goal.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{goal.label}</span>
                    </button>
                  );
                })}
              </div>

              {selectedGoal && (
                <div className="space-y-2 rounded-xl border bg-card p-4">
                  <Label htmlFor="goalAmount" className="text-sm font-medium">
                    How much are you aiming for?
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">₱</span>
                    <input
                      id="goalAmount"
                      type="text"
                      inputMode="decimal"
                      placeholder="e.g. 50,000"
                      value={formatAmount(goalAmount)}
                      onChange={(e) => setGoalAmount(parseAmountInput(e.target.value))}
                      className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/50"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A rough estimate is fine — you can adjust this anytime.
                  </p>
                </div>
              )}

              <div className="mt-auto pt-4 flex gap-3">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setStep(2)}
                >
                  Skip
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setStep(2)}
                  disabled={!selectedGoal || !goalAmount || parseFloat(goalAmount) <= 0}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 2: Add Accounts ───────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-1 flex-col space-y-5">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Where do you keep your money?
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Add your accounts with their current balances. You can add more later.
                </p>
              </div>

              {/* Preset pills */}
              <div className="flex flex-wrap gap-2">
                {COMMON_ACCOUNTS.map((preset) => {
                  const isAdded = addedAccounts.some((a) => a.name === preset.name);
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => toggleAccount(preset)}
                      className={cn(
                        "rounded-full px-3.5 py-2 text-xs font-medium transition-colors border",
                        isAdded
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      {preset.name}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowCustomForm(true)}
                  className="rounded-full px-3.5 py-2 text-xs font-medium transition-colors border bg-muted/50 text-muted-foreground border-transparent hover:bg-muted flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Custom
                </button>
              </div>

              {/* Custom form */}
              {showCustomForm && (
                <div className="rounded-xl border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Custom Account</p>
                    <button type="button" onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomType("bank"); }} className="text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customName">Name</Label>
                    <Input id="customName" value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="e.g., BDO, BPI, Tonik" autoFocus />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="customType">Type</Label>
                    <select id="customType" value={customType} onChange={(e) => setCustomType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      {ACCOUNT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>
                  <Button onClick={addCustomAccount} disabled={!customName.trim()} className="w-full" size="sm">Add Account</Button>
                </div>
              )}

              {/* Account list with balances */}
              {addedAccounts.length > 0 && (
                <div className="space-y-2 flex-1 overflow-y-auto">
                  {addedAccounts.map((acc, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border px-4 py-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">₱</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="0"
                          value={formatAmount(acc.balance)}
                          onChange={(e) => updateBalance(i, e.target.value)}
                          className="w-24 bg-transparent text-sm font-medium text-right outline-none"
                        />
                      </div>
                      <button type="button" onClick={() => removeAccount(i)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addedAccounts.length === 0 && !showCustomForm && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center">
                    Tap an account above to get started, or add a custom one.
                  </p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={handleFinish}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Skip"}
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleFinish}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Setting up...</>
                  ) : (
                    <>Finish Setup <ArrowRight className="h-4 w-4 ml-1.5" /></>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

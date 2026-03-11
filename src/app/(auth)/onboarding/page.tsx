"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
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
  Plus,
  Landmark,
  Target,
  ChevronRight,
  BarChart3,
  CircleDollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfile } from "@/hooks/use-profile";
import { useAddAccount } from "@/hooks/use-accounts";
import { useAddGoal } from "@/hooks/use-goals";
import { completeOnboarding } from "@/app/(auth)/actions";
import { COMMON_ACCOUNTS, GOAL_CATEGORIES, ACCOUNT_TYPES } from "@/lib/constants";
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

/** Formats a raw numeric string like "10000.50" → "10,000.50" for display. */
function formatAmount(raw: string): string {
  if (!raw) return "";
  // Split on decimal point
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

/**
 * Handles a change event on a money text input.
 * Strips commas, allows only digits and a single decimal point,
 * then returns the clean numeric string to store in state.
 */
function parseAmountInput(value: string): string {
  // Remove all commas, then strip any char that isn't a digit or decimal
  const stripped = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  // Prevent multiple decimal points
  const parts = stripped.split(".");
  if (parts.length > 2) return parts[0] + "." + parts.slice(1).join("");
  return stripped;
}

interface AddedAccount {
  name: string;
  type: string;
  balance: string;
}

// ─── Mock Screenshots ────────────────────────────────────────────────────────

function AccountsScreenshot() {
  const mockAccounts = [
    { name: "GCash", type: "E-Wallet", balance: "₱3,200.00", color: "bg-blue-500" },
    { name: "BDO", type: "Bank", balance: "₱18,450.00", color: "bg-green-500" },
    { name: "Cash", type: "Cash", balance: "₱1,500.00", color: "bg-amber-500" },
  ];
  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      {/* fake header */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] font-bold text-foreground/80">Accounts</div>
        <div className="h-4 w-4 rounded-full bg-primary/20 flex items-center justify-center">
          <Plus className="h-2.5 w-2.5 text-primary" />
        </div>
      </div>
      {/* total bar */}
      <div className="rounded-lg bg-primary/10 px-3 py-2 flex items-center justify-between">
        <div className="text-[9px] text-muted-foreground">Total Balance</div>
        <div className="text-[11px] font-bold text-primary">₱23,150.00</div>
      </div>
      {/* account cards */}
      {mockAccounts.map((acc) => (
        <div key={acc.name} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
          <div className={cn("h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0", acc.color)}>
            <Landmark className="h-3 w-3 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold truncate">{acc.name}</div>
            <div className="text-[8px] text-muted-foreground">{acc.type}</div>
          </div>
          <div className="text-[10px] font-mono font-medium">{acc.balance}</div>
        </div>
      ))}
      {/* add button hint */}
      <div className="mt-auto flex items-center justify-center gap-1 rounded-lg border border-dashed border-primary/30 py-2">
        <Plus className="h-3 w-3 text-primary/50" />
        <span className="text-[9px] text-primary/50">Add Account</span>
      </div>
    </div>
  );
}

function GoalsScreenshot() {
  const mockGoals = [
    { name: "Emergency Fund", target: "₱50,000", current: 40, color: "bg-blue-500", Icon: Shield },
    { name: "Travel Fund", target: "₱30,000", current: 62, color: "bg-violet-500", Icon: Plane },
    { name: "New Laptop", target: "₱80,000", current: 15, color: "bg-emerald-500", Icon: Target },
  ];
  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="flex items-center justify-between mb-1">
        <div className="text-[10px] font-bold text-foreground/80">Goals</div>
        <BarChart3 className="h-3.5 w-3.5 text-muted-foreground/60" />
      </div>
      {/* summary pill */}
      <div className="rounded-lg bg-primary/10 px-3 py-1.5 flex items-center gap-2">
        <CircleDollarSign className="h-3 w-3 text-primary" />
        <span className="text-[9px] text-muted-foreground">3 active goals · </span>
        <span className="text-[9px] font-semibold text-primary">₱32,000 saved</span>
      </div>
      {/* goal cards */}
      {mockGoals.map((g) => (
        <div key={g.name} className="rounded-lg border bg-card px-3 py-2 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className={cn("h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0", g.color)}>
              <g.Icon className="h-2.5 w-2.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[9px] font-semibold truncate">{g.name}</div>
            </div>
            <div className="text-[9px] text-muted-foreground">{g.current}%</div>
          </div>
          {/* progress bar */}
          <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full rounded-full", g.color)}
              style={{ width: `${g.current}%` }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[8px] text-muted-foreground">Target: {g.target}</span>
            <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared panel renderer ──────────────────────────────────────────────────
// Defined OUTSIDE OnboardingPage so React's component identity is stable
// across re-renders. If defined inside, every keystroke recreates the
// component, unmounting/remounting inputs and losing focus.
function StepPanel({
  screenshot,
  url,
  caption,
  captionSub,
  title,
  step: stepLabel,
  children,
}: {
  screenshot: React.ReactNode;
  url: string;
  caption: string;
  captionSub: string;
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row w-full h-full">
      {/* Screenshot panel — mobile: top 45% of screen, desktop: left 42% */}
      <div className="flex flex-col sm:w-[42%] bg-muted/40 border-b sm:border-b-0 sm:border-r flex-shrink-0 sm:flex-shrink sm:min-h-full" style={{ height: 'clamp(200px, 45dvh, 320px)' }}>
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
            <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
          </div>
          <div className="flex-1 h-5 rounded bg-muted text-[9px] text-muted-foreground flex items-center justify-center">
            {url}
          </div>
        </div>
        <div className="flex-1 overflow-hidden min-h-0">
          {screenshot}
        </div>
        <div className="hidden sm:block px-5 py-4 border-t bg-background/60 shrink-0">
          <p className="text-sm font-medium">{caption}</p>
          <p className="text-xs text-muted-foreground mt-1">{captionSub}</p>
        </div>
      </div>

      {/* Form panel — takes remaining height, scrollable */}
      <div className="flex-1 flex flex-col p-5 sm:p-8 gap-4 sm:gap-6 overflow-y-auto min-h-0">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h2>
          <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap pt-1">{stepLabel}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: profile } = useProfile();
  const addAccount = useAddAccount();
  const addGoal = useAddGoal();

  const [step, setStep] = useState(0);

  // Accounts step
  const [addedAccounts, setAddedAccounts] = useState<AddedAccount[]>([]);
  const [showCustomAccountForm, setShowCustomAccountForm] = useState(false);
  const [customAccountName, setCustomAccountName] = useState("");
  const [customAccountType, setCustomAccountType] = useState("bank");

  // Goal step
  const [goalCategory, setGoalCategory] = useState("");
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const handleGoalTargetChange = (value: string) => setGoalTarget(parseAmountInput(value));

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

  function addCustomAccount() {
    if (!customAccountName.trim()) return;
    setAddedAccounts((prev) => [
      ...prev,
      { name: customAccountName, type: customAccountType, balance: "" },
    ]);
    setCustomAccountName("");
    setCustomAccountType("bank");
    setShowCustomAccountForm(false);
  }

  function removeAccount(index: number) {
    setAddedAccounts((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAccountBalance(index: number, raw: string) {
    const cleaned = parseAmountInput(raw);
    setAddedAccounts((prev) =>
      prev.map((a, i) => (i === index ? { ...a, balance: cleaned } : a))
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
      await completeOnboarding();
      // Require completing the tour before onboarding is marked as complete
      localStorage.setItem("exitplan_tour_required", "1");
      localStorage.setItem("exitplan_tour_pending", "1");
      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/dashboard?tour=1");
    } catch (error) {
      console.error("Failed to create goal or finish onboarding:", error);
      setSaving(false);
    }
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await completeOnboarding();
      // Require completing the tour before onboarding is marked as complete
      localStorage.setItem("exitplan_tour_required", "1");
      localStorage.setItem("exitplan_tour_pending", "1");
      // Small delay before redirect
      await new Promise(resolve => setTimeout(resolve, 100));
      router.push("/dashboard?tour=1");
    } catch (error) {
      console.error("Failed to finish onboarding:", error);
      setSaving(false);
    }
  }

  return (
    <>
      {/* ── Step 0: Welcome ─────────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
          <div className="w-full max-w-sm sm:max-w-md text-center space-y-6">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome to Exit<span className="text-primary">Plan</span>
                {profile?.full_name ? `, ${profile.full_name}` : ""}!
              </h1>
              <p className="mt-3 text-muted-foreground">
                A quick 2-step setup and you&apos;ll have a personalised financial dashboard ready to go.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-left">
              {[
                { icon: Landmark, label: "Connect accounts", sub: "Track every balance" },
                { icon: Target, label: "Set a goal", sub: "Work toward what matters" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="rounded-xl border bg-card p-4 space-y-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
            <Button className="w-full" size="lg" onClick={() => setStep(1)}>
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground">
              You can always change these later in Settings.
            </p>
          </div>
        </div>
      )}

      {/* ── Steps 1 & 2: Mobile = full-screen page, Desktop = maximized dialog ── */}
      {(step === 1 || step === 2) && (
        <>
          {/* ── MOBILE: full-screen layout ─────────────────────────────────── */}
          <div className="sm:hidden flex flex-col h-[100dvh] bg-background overflow-hidden">
            {step === 1 ? (
              <StepPanel
                screenshot={<AccountsScreenshot />}
                url="exitplan.app/accounts"
                caption="Track all your money in one place"
                captionSub="See live balances across all accounts at a glance."
                title="Add your accounts"
                step="Step 1 of 2"
              >
                <p className="text-sm text-muted-foreground -mt-3">
                  Select your accounts and enter their current balances.
                </p>
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
                          "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
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
                    onClick={() => setShowCustomAccountForm(true)}
                    className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors border bg-muted/50 text-muted-foreground border-transparent hover:bg-muted flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Custom
                  </button>
                </div>
                {showCustomAccountForm && (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold">Custom Account</h3>
                      <button type="button" onClick={() => { setShowCustomAccountForm(false); setCustomAccountName(""); setCustomAccountType("bank"); }} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="m-customName">Name</Label>
                      <Input id="m-customName" value={customAccountName} onChange={(e) => setCustomAccountName(e.target.value)} placeholder="e.g., BDO, BPI" autoFocus />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="m-customType">Type</Label>
                      <select id="m-customType" value={customAccountType} onChange={(e) => setCustomAccountType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {ACCOUNT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                      </select>
                    </div>
                    <Button onClick={addCustomAccount} disabled={!customAccountName.trim()} className="w-full" size="sm">Add Account</Button>
                  </div>
                )}
                {addedAccounts.length > 0 && (
                  <div className="space-y-2 pr-1">
                    {addedAccounts.map((acc, i) => (
                      <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{acc.name}</p>
                          <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-muted-foreground">₱</span>
                          <input type="text" inputMode="decimal" placeholder="0" value={formatAmount(acc.balance)} onChange={(e) => updateAccountBalance(i, e.target.value)} className="w-28 bg-transparent text-sm font-medium text-right outline-none" />
                        </div>
                        <button type="button" onClick={() => removeAccount(i)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 pt-1 mt-auto">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Skip</Button>
                  <Button className="flex-1" onClick={handleAccountsContinue} disabled={addedAccounts.length === 0 || saving}>
                    {saving ? "Saving…" : "Continue"}{!saving && <ArrowRight className="h-4 w-4 ml-1.5" />}
                  </Button>
                </div>
              </StepPanel>
            ) : (
              <StepPanel
                screenshot={<GoalsScreenshot />}
                url="exitplan.app/goals"
                caption="Stay motivated with clear targets"
                captionSub="Watch your progress grow toward every goal."
                title="Set your first goal"
                step="Step 2 of 2"
              >
                <p className="text-sm text-muted-foreground -mt-3">
                  What are you saving toward?{" "}
                  <span className="italic text-muted-foreground/70">Optional</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {GOAL_CATEGORIES.map((cat) => {
                    const Icon = GOAL_ICONS[cat.toLowerCase()] ?? Ellipsis;
                    const isSelected = goalCategory === cat.toLowerCase();
                    return (
                      <button key={cat} type="button" onClick={() => { setGoalCategory(cat.toLowerCase()); if (!goalName) setGoalName(cat); }}
                        className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                          isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted")}>
                        <Icon className="h-3 w-3" />{cat}
                      </button>
                    );
                  })}
                </div>
                {goalCategory && (
                  <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="m-goalName">Goal name</Label>
                      <Input id="m-goalName" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g., Europe trip" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="m-goalTarget">Target amount</Label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">₱</span>
                        <input id="m-goalTarget" type="text" inputMode="decimal" placeholder="0.00" value={formatAmount(goalTarget)} onChange={(e) => handleGoalTargetChange(e.target.value)}
                          className="w-full rounded-md border border-input bg-background py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex gap-3 pt-1 mt-auto">
                  <Button variant="outline" className="flex-1" onClick={handleFinish} disabled={saving}>{saving ? "Loading…" : "Skip"}</Button>
                  <Button className="flex-1" onClick={handleGoalCreate} disabled={saving || !goalCategory || !goalName || !goalTarget}>
                    {saving ? "Creating…" : "Finish Setup"}{!saving && <ArrowRight className="h-4 w-4 ml-1.5" />}
                  </Button>
                </div>
              </StepPanel>
            )}
          </div>

          {/* ── DESKTOP: maximized centered dialog ─────────────────────────── */}
          <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center bg-black/50 p-6">
            <div className="bg-background border shadow-xl rounded-xl w-full max-w-5xl h-full max-h-[88vh] overflow-hidden flex">
              {step === 1 ? (
                <StepPanel
                  screenshot={<AccountsScreenshot />}
                  url="exitplan.app/accounts"
                  caption="Track all your money in one place"
                  captionSub="See live balances across all accounts at a glance."
                  title="Add your accounts"
                  step="Step 1 of 2"
                >
                  <p className="text-sm text-muted-foreground -mt-3">
                    Select your accounts and enter their current balances.
                  </p>
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
                            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
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
                      onClick={() => setShowCustomAccountForm(true)}
                      className="rounded-full px-3 py-1.5 text-xs font-medium transition-colors border bg-muted/50 text-muted-foreground border-transparent hover:bg-muted flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" />
                      Custom
                    </button>
                  </div>
                  {showCustomAccountForm && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold">Custom Account</h3>
                        <button type="button" onClick={() => { setShowCustomAccountForm(false); setCustomAccountName(""); setCustomAccountType("bank"); }} className="text-muted-foreground hover:text-foreground">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5 col-span-2">
                          <Label htmlFor="d-customName">Name</Label>
                          <Input id="d-customName" value={customAccountName} onChange={(e) => setCustomAccountName(e.target.value)} placeholder="e.g., BDO, BPI" autoFocus />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <Label htmlFor="d-customType">Type</Label>
                          <select id="d-customType" value={customAccountType} onChange={(e) => setCustomAccountType(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            {ACCOUNT_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
                          </select>
                        </div>
                      </div>
                      <Button onClick={addCustomAccount} disabled={!customAccountName.trim()} className="w-full" size="sm">Add Account</Button>
                    </div>
                  )}
                  {addedAccounts.length > 0 && (
                    <div className="space-y-2 overflow-y-auto pr-1">
                      {addedAccounts.map((acc, i) => (
                        <div key={i} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{acc.name}</p>
                            <p className="text-xs text-muted-foreground">{ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">₱</span>
                            <input type="text" inputMode="decimal" placeholder="0" value={formatAmount(acc.balance)} onChange={(e) => updateAccountBalance(i, e.target.value)} className="w-28 bg-transparent text-sm font-medium text-right outline-none" />
                          </div>
                          <button type="button" onClick={() => removeAccount(i)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3 pt-2 mt-auto">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Skip</Button>
                    <Button className="flex-1" onClick={handleAccountsContinue} disabled={addedAccounts.length === 0 || saving}>
                      {saving ? "Saving…" : "Continue"}{!saving && <ArrowRight className="h-4 w-4 ml-1.5" />}
                    </Button>
                  </div>
                </StepPanel>
              ) : (
                <StepPanel
                  screenshot={<GoalsScreenshot />}
                  url="exitplan.app/goals"
                  caption="Stay motivated with clear targets"
                  captionSub="Watch your progress grow toward every goal."
                  title="Set your first goal"
                  step="Step 2 of 2"
                >
                  <p className="text-sm text-muted-foreground -mt-3">
                    What are you saving toward?{" "}
                    <span className="italic text-muted-foreground/70">Optional</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_CATEGORIES.map((cat) => {
                      const Icon = GOAL_ICONS[cat.toLowerCase()] ?? Ellipsis;
                      const isSelected = goalCategory === cat.toLowerCase();
                      return (
                        <button key={cat} type="button" onClick={() => { setGoalCategory(cat.toLowerCase()); if (!goalName) setGoalName(cat); }}
                          className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                            isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted")}>
                          <Icon className="h-3 w-3" />{cat}
                        </button>
                      );
                    })}
                  </div>
                  {goalCategory && (
                    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="d-goalName">Goal name</Label>
                        <Input id="d-goalName" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g., Europe trip" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="d-goalTarget">Target amount</Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">₱</span>
                          <input id="d-goalTarget" type="text" inputMode="decimal" placeholder="0.00" value={formatAmount(goalTarget)} onChange={(e) => handleGoalTargetChange(e.target.value)}
                            className="w-full rounded-md border border-input bg-background py-2 pl-7 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3 pt-2 mt-auto">
                    <Button variant="outline" className="flex-1" onClick={handleFinish} disabled={saving}>{saving ? "Loading…" : "Skip"}</Button>
                    <Button className="flex-1" onClick={handleGoalCreate} disabled={saving || !goalCategory || !goalName || !goalTarget}>
                      {saving ? "Creating…" : "Finish Setup"}{!saving && <ArrowRight className="h-4 w-4 ml-1.5" />}
                    </Button>
                  </div>
                </StepPanel>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

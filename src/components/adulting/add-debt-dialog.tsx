"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAddDebt } from "@/hooks/use-debts";
import { useAccounts } from "@/hooks/use-accounts";
import type { DebtType } from "@/lib/types/database";

const DEBT_TYPES: { value: DebtType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "sss_loan", label: "SSS Loan" },
  { value: "pagibig_loan", label: "Pag-IBIG Loan" },
  { value: "home_loan", label: "Home Loan" },
  { value: "car_loan", label: "Car Loan" },
  { value: "salary_loan", label: "Salary Loan" },
  { value: "other", label: "Other" },
];

export function AddDebtDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<DebtType>("credit_card");
  const [lender, setLender] = useState("");
  const [balance, setBalance] = useState("");
  const [originalAmount, setOriginalAmount] = useState("");
  const [rate, setRate] = useState("");
  const [minPayment, setMinPayment] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [accountId, setAccountId] = useState<string>("none");

  const addDebt = useAddDebt();
  const { data: accounts } = useAccounts();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const balanceNum = parseFloat(balance);
    const rateNum = parseFloat(rate);
    const minPaymentNum = parseFloat(minPayment);
    if (balanceNum <= 0 || rateNum < 0 || rateNum > 300 || minPaymentNum < 0) return;
    await addDebt.mutateAsync({
      name: name.trim(),
      type,
      lender: lender.trim() || null,
      current_balance: balanceNum,
      original_amount: parseFloat(originalAmount) > 0 ? parseFloat(originalAmount) : balanceNum,
      interest_rate: rateNum / 100,
      minimum_payment: minPaymentNum,
      due_day: dueDay ? Math.min(31, Math.max(1, parseInt(dueDay))) : null,
      account_id: accountId !== "none" ? accountId : null,
    });
    setOpen(false);
    setName(""); setType("credit_card"); setLender(""); setBalance("");
    setOriginalAmount(""); setRate(""); setMinPayment(""); setDueDay(""); setAccountId("none");
  }

  const balanceNum = parseFloat(balance);
  const rateNum = parseFloat(rate);
  const isValid = name.trim() && balanceNum > 0 && rateNum >= 0 && rateNum <= 300 && parseFloat(minPayment) >= 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Debt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Debt</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Debt identity */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="BPI Credit Card" className="h-11 sm:h-9 text-sm" required maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as DebtType)}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEBT_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Lender / Bank</Label>
                <Input value={lender} onChange={(e) => setLender(e.target.value)}
                  placeholder="BPI" className="h-11 sm:h-9 text-sm" maxLength={100} />
              </div>
            </div>
          </div>

          {/* Amounts */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Balance</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Current (₱)</Label>
                <Input type="number" min="0" max="999999999" value={balance} onChange={(e) => setBalance(e.target.value)}
                  placeholder="50000" className="h-11 sm:h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Original (₱)</Label>
                <Input type="number" min="0" max="999999999" value={originalAmount} onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="Same as current" className="h-11 sm:h-9 text-sm" />
              </div>
            </div>
          </div>

          {/* Payment terms */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Payment Terms</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Interest Rate (%/yr)</Label>
                <Input type="number" min="0" max="100" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)}
                  placeholder="24" className="h-11 sm:h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Min. Payment (₱/mo)</Label>
                <Input type="number" min="0" max="999999999" value={minPayment} onChange={(e) => setMinPayment(e.target.value)}
                  placeholder="2000" className="h-11 sm:h-9 text-sm" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Due Day (1–31)</Label>
                <Input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)}
                  placeholder="25" className="h-11 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pay From Account</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue placeholder="None" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none" className="text-xs">No account linked</SelectItem>
                    {accounts?.map((a) => (
                      <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 sm:h-9" disabled={!isValid || addDebt.isPending}>
            {addDebt.isPending ? "Adding…" : "Add Debt"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

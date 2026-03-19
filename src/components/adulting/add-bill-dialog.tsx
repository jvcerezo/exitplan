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
import { useAddBill } from "@/hooks/use-bills";
import { useAccounts } from "@/hooks/use-accounts";
import type { BillCategory, BillingCycle } from "@/lib/types/database";

const CATEGORIES: { value: BillCategory; label: string }[] = [
  { value: "electricity", label: "Electricity (Meralco)" },
  { value: "water", label: "Water (Maynilad/MWC)" },
  { value: "internet", label: "Internet" },
  { value: "mobile", label: "Mobile / Load" },
  { value: "cable_tv", label: "Cable TV" },
  { value: "rent", label: "Rent" },
  { value: "association_dues", label: "Association Dues" },
  { value: "streaming", label: "Streaming (Netflix, etc.)" },
  { value: "software", label: "Software / SaaS" },
  { value: "gym", label: "Gym" },
  { value: "other", label: "Other" },
];

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

export function AddBillDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<BillCategory>("electricity");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [dueDay, setDueDay] = useState("");
  const [provider, setProvider] = useState("");
  const [accountId, setAccountId] = useState<string>("none");

  const addBill = useAddBill();
  const { data: accounts } = useAccounts();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (amountNum <= 0 || !isFinite(amountNum)) return;
    await addBill.mutateAsync({
      name: name.trim(),
      category,
      amount: amountNum,
      billing_cycle: cycle,
      due_day: dueDay ? Math.min(31, Math.max(1, parseInt(dueDay))) : null,
      provider: provider.trim() || null,
      account_id: accountId !== "none" ? accountId : null,
    });
    setOpen(false);
    setName(""); setCategory("electricity"); setAmount(""); setCycle("monthly");
    setDueDay(""); setProvider(""); setAccountId("none");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Bill</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Bill / Subscription</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Bill details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs sm:text-xs text-muted-foreground">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Netflix, Meralco…" className="h-11 sm:h-9 text-sm" required maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as BillCategory)}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <Input value={provider} onChange={(e) => setProvider(e.target.value)}
                  placeholder="PLDT, Globe…" className="h-11 sm:h-9 text-sm" maxLength={100} />
              </div>
            </div>
          </div>

          {/* Payment info */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount (₱)</Label>
                <Input type="number" min="0" max="999999999" value={amount} onChange={(e) => setAmount(e.target.value)}
                  placeholder="1500" className="h-11 sm:h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Billing Cycle</Label>
                <Select value={cycle} onValueChange={(v) => setCycle(v as BillingCycle)}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CYCLES.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <Button type="submit" className="w-full h-11 sm:h-9" disabled={!name || !amount || addBill.isPending}>
            {addBill.isPending ? "Adding…" : "Add Bill"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

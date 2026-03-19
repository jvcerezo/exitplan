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
import { useAddInsurancePolicy } from "@/hooks/use-insurance";
import { useAccounts } from "@/hooks/use-accounts";
import type { InsuranceType, PremiumFrequency } from "@/lib/types/database";

const INSURANCE_TYPES: { value: InsuranceType; label: string }[] = [
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "hmo", label: "HMO" },
  { value: "car", label: "Car Insurance" },
  { value: "property", label: "Property Insurance" },
  { value: "ctpl", label: "CTPL" },
  { value: "other", label: "Other" },
];

const FREQ_OPTIONS: { value: PremiumFrequency; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

export function AddInsuranceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<InsuranceType>("life");
  const [provider, setProvider] = useState("");
  const [policyNumber, setPolicyNumber] = useState("");
  const [premium, setPremium] = useState("");
  const [frequency, setFrequency] = useState<PremiumFrequency>("monthly");
  const [coverage, setCoverage] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [accountId, setAccountId] = useState<string>("none");

  const addPolicy = useAddInsurancePolicy();
  const { data: accounts } = useAccounts();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const premiumNum = parseFloat(premium);
    const coverageNum = coverage ? parseFloat(coverage) : null;
    if (premiumNum <= 0 || !isFinite(premiumNum)) return;
    if (coverageNum !== null && (coverageNum < 0 || !isFinite(coverageNum))) return;
    await addPolicy.mutateAsync({
      name: name.trim(),
      type,
      provider: provider.trim() || null,
      policy_number: policyNumber.trim() || null,
      premium_amount: premiumNum,
      premium_frequency: frequency,
      coverage_amount: coverageNum,
      renewal_date: renewalDate || null,
      account_id: accountId !== "none" ? accountId : null,
    });
    setOpen(false);
    setName(""); setType("life"); setProvider(""); setPolicyNumber("");
    setPremium(""); setFrequency("monthly"); setCoverage(""); setRenewalDate(""); setAccountId("none");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Policy</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Add Insurance Policy</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Policy identity */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Policy Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Sun Life VUL" className="h-11 sm:h-9 text-sm" required maxLength={100} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as InsuranceType)}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {INSURANCE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="text-xs">{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Provider</Label>
                <Input value={provider} onChange={(e) => setProvider(e.target.value)}
                  placeholder="Sun Life" className="h-11 sm:h-9 text-sm" maxLength={100} />
              </div>
            </div>
          </div>

          {/* Premium & coverage */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Premium</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Amount (₱)</Label>
                <Input type="number" min="0" max="999999999" value={premium} onChange={(e) => setPremium(e.target.value)}
                  placeholder="2000" className="h-11 sm:h-9 text-sm" required />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as PremiumFrequency)}>
                  <SelectTrigger className="h-11 sm:h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FREQ_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value} className="text-xs">{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Coverage (₱)</Label>
                <Input type="number" min="0" max="999999999" value={coverage} onChange={(e) => setCoverage(e.target.value)}
                  placeholder="1,000,000" className="h-11 sm:h-9 text-sm" />
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

          {/* Details */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Details</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Renewal Date</Label>
                <Input type="date" value={renewalDate} onChange={(e) => setRenewalDate(e.target.value)}
                  min="2000-01-01" className="h-11 sm:h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Policy Number</Label>
                <Input value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)}
                  placeholder="Optional" className="h-11 sm:h-9 text-sm" maxLength={50} />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 sm:h-9" disabled={!name || !premium || addPolicy.isPending}>
            {addPolicy.isPending ? "Adding…" : "Add Policy"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

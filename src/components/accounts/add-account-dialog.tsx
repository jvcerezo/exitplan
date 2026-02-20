"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddAccount } from "@/hooks/use-accounts";
import { ACCOUNT_TYPES, CURRENCIES, COMMON_ACCOUNTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AddAccountDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [currency, setCurrency] = useState("PHP");
  const addAccount = useAddAccount();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await addAccount.mutateAsync({
      name,
      type: type as "cash" | "bank" | "e-wallet" | "credit-card",
      currency,
      balance: parseFloat((formData.get("balance") as string) || "0"),
    });

    setOpen(false);
    setName("");
    setType("");
    setCurrency("PHP");
  }

  function handlePreset(preset: (typeof COMMON_ACCOUNTS)[number]) {
    setName(preset.name);
    setType(preset.type);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Quick presets */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Quick Add
            </p>
            <div className="flex flex-wrap gap-2">
              {COMMON_ACCOUNTS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handlePreset(p)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    name === p.name && type === p.type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. BDO Savings"
              required
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Type pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    type === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currency + Balance row */}
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Currency
              </p>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Starting Balance
              </p>
              <input
                name="balance"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max="9999999999.99"
                placeholder="0.00"
                defaultValue="0"
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addAccount.isPending || !name || !type}
          >
            {addAccount.isPending ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

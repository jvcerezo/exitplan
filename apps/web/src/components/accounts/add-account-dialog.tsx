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

interface AddAccountDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

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

  if (rest.length > 0) {
    return `${normalizedInt || "0"}.${decimalPart}`;
  }

  return normalizedInt;
}

export function AddAccountDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddAccountDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [currency, setCurrency] = useState("PHP");
  const [balance, setBalance] = useState("");
  const addAccount = useAddAccount();

  const normalizedCustomType = customType
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
  const effectiveType = isCustomType ? normalizedCustomType : type;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await addAccount.mutateAsync({
      name,
      type: effectiveType,
      currency,
      balance: parseFloat(balance) || 0,
    });

    setOpen(false);
    setName("");
    setType("");
    setCustomType("");
    setIsCustomType(false);
    setCurrency("PHP");
    setBalance("");
  }

  function handlePreset(preset: (typeof COMMON_ACCOUNTS)[number]) {
    setName(preset.name);
    setType(preset.type);
    setIsCustomType(false);
    setCustomType("");
  }

  const dialogContent = (
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
                  onClick={() => {
                    setType(t.value);
                    setIsCustomType(false);
                    setCustomType("");
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    !isCustomType && type === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {t.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomType(true);
                  setType("");
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                  isCustomType
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                )}
              >
                Custom
              </button>
            </div>
            {isCustomType && (
              <input
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g. Cooperative, Crypto Wallet"
                className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            )}
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
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formatAmount(balance)}
                onChange={(e) => setBalance(parseAmountInput(e.target.value))}
                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addAccount.isPending || !name || !effectiveType}
          >
            {addAccount.isPending ? "Adding..." : "Add Account"}
          </Button>
        </form>
      </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateAccount } from "@/hooks/use-accounts";
import { ACCOUNT_TYPES, CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types/database";

export function EditAccountDialog({
  account,
  trigger,
}: {
  account: Account;
  trigger?: React.ReactNode;
}) {
  const updateAccount = useUpdateAccount();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(account.name);
  const [type, setType] = useState(account.type);
  const [customType, setCustomType] = useState("");
  const [isCustomType, setIsCustomType] = useState(
    !ACCOUNT_TYPES.some((item) => item.value === account.type)
  );
  const [currency, setCurrency] = useState(account.currency);

  const normalizedCustomType = customType
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  const effectiveType = useMemo(() => {
    if (isCustomType) {
      return normalizedCustomType || account.type;
    }
    return type;
  }, [account.type, isCustomType, normalizedCustomType, type]);

  function resetForm() {
    setName(account.name);
    setType(account.type);
    setCurrency(account.currency);

    const isKnownType = ACCOUNT_TYPES.some((item) => item.value === account.type);
    setIsCustomType(!isKnownType);
    setCustomType(isKnownType ? "" : account.type);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateAccount.mutateAsync({
      id: account.id,
      name: name.trim(),
      type: effectiveType,
      currency,
    });

    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (value) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-primary"
            aria-label="Edit account"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Name</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. BDO Savings"
              required
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Type</p>
            <div className="flex flex-wrap gap-2">
              {ACCOUNT_TYPES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => {
                    setType(item.value);
                    setIsCustomType(false);
                    setCustomType("");
                  }}
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                    !isCustomType && type === item.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setIsCustomType(true);
                  if (!customType) {
                    setCustomType(type);
                  }
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
                onChange={(event) => setCustomType(event.target.value)}
                placeholder="e.g. Cooperative, Crypto Wallet"
                className="mt-2 w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Currency</p>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            >
              {CURRENCIES.map((currencyOption) => (
                <option key={currencyOption.code} value={currencyOption.code}>
                  {currencyOption.symbol} {currencyOption.code}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              updateAccount.isPending ||
              !name.trim() ||
              !(isCustomType ? normalizedCustomType : type)
            }
          >
            {updateAccount.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
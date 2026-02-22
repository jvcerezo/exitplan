"use client";

import Link from "next/link";
import { Archive, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateAccount } from "@/hooks/use-accounts";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Account } from "@/lib/types/database";

const ACCOUNT_QUERY_KEYS = [["accounts"]];

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

export function AccountCard({ account }: { account: Account }) {
  const updateAccount = useUpdateAccount();
  const undoDelete = useUndoDelete("accounts", ACCOUNT_QUERY_KEYS);

  return (
    <Card className={cn("group relative", account.is_archived && "opacity-60")}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/accounts/${account.id}`}
            className="min-w-0 hover:opacity-70 transition-opacity"
          >
            <CardTitle className="text-sm font-medium truncate">
              {account.name}
            </CardTitle>
            <Badge variant="secondary" className="mt-1 text-xs">
              {TYPE_LABELS[account.type] ?? account.type}
            </Badge>
          </Link>
          <div className="flex gap-0.5">
            {!account.is_archived && (
              <AddTransactionDialog
                type="expense"
                defaultAccountId={account.id}
                trigger={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-muted-foreground hover:text-primary"
                    aria-label="Quick add expense"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                }
              />
            )}
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              aria-label={account.is_archived ? "Unarchive" : "Archive"}
              onClick={() =>
                updateAccount.mutate({
                  id: account.id,
                  is_archived: !account.is_archived,
                })
              }
            >
              <Archive className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete account"
              onClick={() => undoDelete(account.id, account.name)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Link
          href={`/accounts/${account.id}`}
          className="block hover:opacity-70 transition-opacity"
        >
          <div className="text-2xl font-bold">
            {formatCurrency(account.balance, account.currency)}
          </div>
          {account.currency !== "PHP" && (
            <p className="text-xs text-muted-foreground mt-1">
              {account.currency}
            </p>
          )}
        </Link>
      </CardContent>
    </Card>
  );
}

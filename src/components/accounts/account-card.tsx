"use client";

import React from "react";
import Link from "next/link";
import { Plus, Minus, Trash2, Archive, Building2, Smartphone, Banknote, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { useArchiveAccount } from "@/hooks/use-accounts";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Account } from "@/lib/types/database";

const ACCOUNT_QUERY_KEYS = [["accounts"]];

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  bank: Building2,
  "e-wallet": Smartphone,
  cash: Banknote,
  "credit-card": CreditCard,
};

const TYPE_COLORS: Record<string, string> = {
  bank: "text-blue-500 bg-blue-500/10",
  "e-wallet": "text-violet-500 bg-violet-500/10",
  cash: "text-green-600 bg-green-600/10",
  "credit-card": "text-orange-500 bg-orange-500/10",
};

export function AccountCard({ account }: { account: Account }) {
  const archiveAccount = useArchiveAccount();
  const undoDelete = useUndoDelete("accounts", ACCOUNT_QUERY_KEYS);

  return (
    <Card className="group relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <Link
            href={`/accounts/${account.id}`}
            className="min-w-0 hover:opacity-70 transition-opacity flex items-start gap-3"
          >
            {(() => {
              const Icon = TYPE_ICONS[account.type];
              const colorClass = TYPE_COLORS[account.type] ?? "text-muted-foreground bg-muted";
              return Icon ? (
                <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              ) : null;
            })()}
            <div className="min-w-0">
              <CardTitle className="text-sm font-medium truncate">
                {account.name}
              </CardTitle>
              <Badge variant="secondary" className="mt-1 text-xs">
                {TYPE_LABELS[account.type] ?? account.type}
              </Badge>
            </div>
          </Link>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-amber-600"
              aria-label="Archive account"
              onClick={() => archiveAccount.mutate({ id: account.id, archive: true })}
              disabled={archiveAccount.isPending}
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
          className="block hover:opacity-70 transition-opacity mb-4"
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

        {/* Quick action buttons */}
        <div className="flex gap-2">
          <AddTransactionDialog
            type="income"
            defaultAccountId={account.id}
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Income
              </Button>
            }
          />
          <AddTransactionDialog
            type="expense"
            defaultAccountId={account.id}
            trigger={
              <Button
                size="sm"
                variant="outline"
                className="flex-1 h-8 text-xs"
              >
                <Minus className="h-3.5 w-3.5 mr-1" />
                Add Expense
              </Button>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

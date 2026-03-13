"use client";

import { useState } from "react";
import { useAccounts, useArchivedAccounts, useArchiveAccount } from "@/hooks/use-accounts";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { TransferDialog } from "@/components/transactions/transfer-dialog";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, Archive, ArchiveRestore, ChevronDown, ChevronRight, Loader2, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();
  const { data: archivedAccounts } = useArchivedAccounts();
  const archiveAccount = useArchiveAccount();
  const [showArchived, setShowArchived] = useState(false);

  const displayedAccounts = accounts ?? [];
  const totalBalance = displayedAccounts.reduce((sum, a) => sum + a.balance, 0);
  const archivedList = archivedAccounts ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your wallets and bank accounts
          </p>
        </div>
        <div className="flex gap-3">
          <TransferDialog />
          <div className="hidden sm:block">
            <AddAccountDialog />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card>
          <CardContent className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load accounts</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Check your Supabase schema and RLS policies for the accounts table."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : accounts?.length === 0 && archivedList.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first account to start tracking balances across wallets."
        />
      ) : (
        <>
          {/* Total balance */}
          {displayedAccounts.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total balance:{" "}
              <span className="font-semibold text-foreground">
                {formatCurrency(totalBalance)}
              </span>
            </div>
          )}

          {displayedAccounts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayedAccounts.map((account) => (
                <AccountCard key={account.id} account={account} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wallet}
              title="No active accounts"
              description="All accounts are archived. Restore one or add a new account."
            />
          )}

          {/* Archived accounts section */}
          {archivedList.length > 0 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showArchived ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Archive className="h-4 w-4" />
                Archived accounts
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                  {archivedList.length}
                </span>
              </button>

              {showArchived && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {archivedList.map((account) => (
                    <Card key={account.id} className="opacity-60">
                      <CardContent className="flex items-center justify-between py-4 px-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{account.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {TYPE_LABELS[account.type] ?? account.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatCurrency(account.balance, account.currency)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 gap-1.5 text-xs"
                          onClick={() => archiveAccount.mutate({ id: account.id, archive: false })}
                          disabled={archiveAccount.isPending}
                        >
                          <ArchiveRestore className="h-3.5 w-3.5" />
                          Restore
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import { useAccounts } from "@/hooks/use-accounts";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { TransferDialog } from "@/components/transactions/transfer-dialog";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, Loader2, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent } from "@/components/ui/card";

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();

  const displayedAccounts = accounts ?? [];
  const totalBalance = displayedAccounts.reduce((sum, a) => sum + a.balance, 0);

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
      ) : accounts?.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No accounts yet"
          description="Add your first account to start tracking balances across wallets."
        />
      ) : (
        <>
          {/* Total balance */}
          <div className="text-sm text-muted-foreground">
            Total balance:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(totalBalance)}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayedAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

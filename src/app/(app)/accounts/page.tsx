"use client";

import { useAccounts } from "@/hooks/use-accounts";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { TransferDialog } from "@/components/transactions/transfer-dialog";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Wallet } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

export default function AccountsPage() {
  const { data: accounts, isLoading } = useAccounts();

  const activeAccounts = accounts?.filter((a) => !a.is_archived) ?? [];
  const archivedAccounts = accounts?.filter((a) => a.is_archived) ?? [];
  const totalBalance = activeAccounts.reduce((sum, a) => sum + a.balance, 0);

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
          <AddAccountDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
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
            Total active balance:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(totalBalance)}
            </span>
          </div>

          {/* Active accounts */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>

          {/* Archived */}
          {archivedAccounts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Archived ({archivedAccounts.length})
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {archivedAccounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

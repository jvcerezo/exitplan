import type { QueryClient } from "@tanstack/react-query";
import type {
  Account,
  Budget,
  Goal,
  Transaction,
} from "@/lib/types/database";

function prependUniqueById<T extends { id: string }>(items: T[] | undefined, item: T) {
  const withoutExisting = (items ?? []).filter((existing) => existing.id !== item.id);
  return [item, ...withoutExisting];
}

export function addOfflineAccountToCache(queryClient: QueryClient, account: Account) {
  queryClient.setQueryData<Account[] | undefined>(["accounts"], (current) => {
    const next = prependUniqueById(current, account);
    return next.sort((left, right) => left.name.localeCompare(right.name));
  });
}

export function updateOfflineAccountBalance(
  queryClient: QueryClient,
  accountId: string,
  delta: number
) {
  queryClient.setQueryData<Account[] | undefined>(["accounts"], (current) =>
    (current ?? []).map((account) =>
      account.id === accountId
        ? { ...account, balance: Math.round((Number(account.balance) + delta) * 100) / 100 }
        : account
    )
  );
}

export function addOfflineTransactionToCache(
  queryClient: QueryClient,
  transaction: Transaction
) {
  queryClient.setQueryData<Transaction[] | undefined>(["transactions", "recent"], (current) =>
    prependUniqueById(current, transaction).sort((left, right) => right.date.localeCompare(left.date)).slice(0, 10)
  );

  const queryCache = queryClient.getQueryCache();
  const matchingQueries = queryCache.findAll({ queryKey: ["transactions", "all"] });
  for (const query of matchingQueries) {
    queryClient.setQueryData<Transaction[] | undefined>(query.queryKey, (current) =>
      prependUniqueById(current, transaction).sort((left, right) => right.date.localeCompare(left.date))
    );
  }
}

export function addOfflineGoalToCache(queryClient: QueryClient, goal: Goal) {
  queryClient.setQueryData<Goal[] | undefined>(["goals"], (current) =>
    prependUniqueById(current, goal).sort((left, right) => {
      if (left.is_completed !== right.is_completed) {
        return Number(left.is_completed) - Number(right.is_completed);
      }
      return right.created_at.localeCompare(left.created_at);
    })
  );
}

export function addOfflineBudgetToCache(queryClient: QueryClient, budget: Budget) {
  queryClient.setQueryData<Budget[] | undefined>(["budgets", budget.month], (current) =>
    prependUniqueById(current, budget).sort((left, right) => left.category.localeCompare(right.category))
  );
}

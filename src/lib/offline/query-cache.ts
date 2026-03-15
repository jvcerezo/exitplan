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

export function updateOfflineAccountInCache(
  queryClient: QueryClient,
  accountId: string,
  updates: Partial<Account>
) {
  queryClient.setQueryData<Account[] | undefined>(["accounts"], (current) =>
    (current ?? [])
      .map((account) =>
        account.id === accountId ? { ...account, ...updates } : account
      )
      .sort((left, right) => left.name.localeCompare(right.name))
  );
}

export function removeOfflineAccountFromCache(
  queryClient: QueryClient,
  accountId: string
) {
  queryClient.setQueryData<Account[] | undefined>(["accounts"], (current) =>
    (current ?? []).filter((account) => account.id !== accountId)
  );
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

export function updateOfflineTransactionInCache(
  queryClient: QueryClient,
  transactionId: string,
  updates: Partial<Transaction>
) {
  queryClient.setQueryData<Transaction[] | undefined>(["transactions", "recent"], (current) =>
    (current ?? [])
      .map((transaction) =>
        transaction.id === transactionId ? { ...transaction, ...updates } : transaction
      )
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 10)
  );

  const queryCache = queryClient.getQueryCache();
  const matchingQueries = queryCache.findAll({ queryKey: ["transactions", "all"] });
  for (const query of matchingQueries) {
    queryClient.setQueryData<Transaction[] | undefined>(query.queryKey, (current) =>
      (current ?? [])
        .map((transaction) =>
          transaction.id === transactionId ? { ...transaction, ...updates } : transaction
        )
        .sort((left, right) => right.date.localeCompare(left.date))
    );
  }
}

export function removeOfflineTransactionFromCache(
  queryClient: QueryClient,
  transactionId: string
) {
  queryClient.setQueryData<Transaction[] | undefined>(["transactions", "recent"], (current) =>
    (current ?? []).filter((transaction) => transaction.id !== transactionId)
  );

  const queryCache = queryClient.getQueryCache();
  const matchingQueries = queryCache.findAll({ queryKey: ["transactions", "all"] });
  for (const query of matchingQueries) {
    queryClient.setQueryData<Transaction[] | undefined>(query.queryKey, (current) =>
      (current ?? []).filter((transaction) => transaction.id !== transactionId)
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

export function updateOfflineGoalInCache(
  queryClient: QueryClient,
  goalId: string,
  updates: Partial<Goal>
) {
  queryClient.setQueryData<Goal[] | undefined>(["goals"], (current) =>
    (current ?? [])
      .map((goal) => (goal.id === goalId ? { ...goal, ...updates } : goal))
      .sort((left, right) => {
        if (left.is_completed !== right.is_completed) {
          return Number(left.is_completed) - Number(right.is_completed);
        }
        return right.created_at.localeCompare(left.created_at);
      })
  );
}

export function removeOfflineGoalFromCache(queryClient: QueryClient, goalId: string) {
  queryClient.setQueryData<Goal[] | undefined>(["goals"], (current) =>
    (current ?? []).filter((goal) => goal.id !== goalId)
  );
}

export function updateOfflineGoalAmount(
  queryClient: QueryClient,
  goalId: string,
  delta: number
) {
  queryClient.setQueryData<Goal[] | undefined>(["goals"], (current) =>
    (current ?? []).map((goal) =>
      goal.id === goalId
        ? {
            ...goal,
            current_amount: Math.round((Number(goal.current_amount) + delta) * 100) / 100,
          }
        : goal
    )
  );
}

export function addOfflineBudgetToCache(queryClient: QueryClient, budget: Budget) {
  queryClient.setQueryData<Budget[] | undefined>(["budgets", budget.month, budget.period ?? "monthly"], (current) =>
    prependUniqueById(current, budget).sort((left, right) => left.category.localeCompare(right.category))
  );
}

export function updateOfflineBudgetInCache(
  queryClient: QueryClient,
  budgetId: string,
  updates: Partial<Budget>
) {
  const queryCache = queryClient.getQueryCache();
  const matchingQueries = queryCache.findAll({ queryKey: ["budgets"] });
  for (const query of matchingQueries) {
    queryClient.setQueryData<Budget[] | undefined>(query.queryKey, (current) =>
      (current ?? [])
        .map((budget) => (budget.id === budgetId ? { ...budget, ...updates } : budget))
        .sort((left, right) => left.category.localeCompare(right.category))
    );
  }
}

export function removeOfflineBudgetFromCache(
  queryClient: QueryClient,
  budgetId: string
) {
  const queryCache = queryClient.getQueryCache();
  const matchingQueries = queryCache.findAll({ queryKey: ["budgets"] });
  for (const query of matchingQueries) {
    queryClient.setQueryData<Budget[] | undefined>(query.queryKey, (current) =>
      (current ?? []).filter((budget) => budget.id !== budgetId)
    );
  }
}

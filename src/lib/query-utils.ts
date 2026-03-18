import type { QueryClient } from "@tanstack/react-query";

/**
 * Invalidate financial queries that depend on transaction/account data.
 * Call this after any mutation that changes balances or transactions.
 * Uses a single batch instead of individual invalidations.
 */
export function invalidateFinancialQueries(queryClient: QueryClient) {
  // Batch all invalidations into one microtask to avoid duplicate refetches
  void Promise.resolve().then(() => {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["accounts"] });
    queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    queryClient.invalidateQueries({ queryKey: ["health-score"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
  });
}

/**
 * Invalidate only the queries directly related to a specific domain.
 */
export function invalidateDomainQueries(queryClient: QueryClient, domain: string) {
  queryClient.invalidateQueries({ queryKey: [domain] });
}

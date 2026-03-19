import { createClient } from "@/lib/supabase/client";

/**
 * Fetch the total monthly obligations from bills, debts, insurance, and contributions.
 * This gives the "committed expenses" that should be factored into safe-to-spend,
 * savings rate, emergency fund, etc.
 *
 * Returns the total monthly amount already paid (from these tools) for a given month,
 * plus the total expected amount for the full month.
 */
export async function fetchMonthlyObligations(monthStart: string, monthEnd: string) {
  const supabase = createClient();
  const currentPeriod = monthStart.slice(0, 7); // "YYYY-MM"

  const [billsResult, debtsResult, insuranceResult, contribResult] = await Promise.all([
    // Active bills — their monthly-equivalent cost
    supabase
      .from("bills")
      .select("amount, billing_cycle, last_paid_date")
      .eq("is_active", true),
    // Unpaid debts — minimum monthly payment
    supabase
      .from("debts")
      .select("minimum_payment, is_paid_off"),
    // Active insurance — premium normalized to monthly
    supabase
      .from("insurance_policies")
      .select("premium_amount, premium_frequency")
      .eq("is_active", true),
    // Contributions for this month (paid or unpaid)
    supabase
      .from("contributions")
      .select("employee_share, is_paid")
      .eq("period", currentPeriod),
  ]);

  // Bills: normalize to monthly
  const billsMonthly = (billsResult.data ?? []).reduce((sum, b) => {
    const multiplier = cycleToMonthlyMultiplier(b.billing_cycle);
    return sum + b.amount * multiplier;
  }, 0);

  // Debts: only active (not paid off)
  const debtsMonthly = (debtsResult.data ?? [])
    .filter((d) => !d.is_paid_off)
    .reduce((sum, d) => sum + d.minimum_payment, 0);

  // Insurance: normalize to monthly
  const insuranceMonthly = (insuranceResult.data ?? []).reduce((sum, p) => {
    const multiplier = cycleToMonthlyMultiplier(p.premium_frequency);
    return sum + p.premium_amount * multiplier;
  }, 0);

  // Contributions: total for the month
  const contributionsTotal = (contribResult.data ?? []).reduce(
    (sum, c) => sum + c.employee_share,
    0
  );

  // How much of contributions is already paid (to avoid double-counting with transactions)
  const contributionsPaid = (contribResult.data ?? [])
    .filter((c) => c.is_paid)
    .reduce((sum, c) => sum + c.employee_share, 0);

  return {
    billsMonthly: Math.round(billsMonthly * 100) / 100,
    debtsMonthly: Math.round(debtsMonthly * 100) / 100,
    insuranceMonthly: Math.round(insuranceMonthly * 100) / 100,
    contributionsTotal: Math.round(contributionsTotal * 100) / 100,
    contributionsPaid: Math.round(contributionsPaid * 100) / 100,
    /** Total expected monthly obligations */
    total: Math.round((billsMonthly + debtsMonthly + insuranceMonthly + contributionsTotal) * 100) / 100,
    /** Amount already paid (contributions only — bills/debts are tracked via transactions) */
    totalPaid: Math.round(contributionsPaid * 100) / 100,
  };
}

function cycleToMonthlyMultiplier(cycle: string): number {
  switch (cycle) {
    case "monthly": return 1;
    case "quarterly": return 1 / 3;
    case "semi_annual": return 1 / 6;
    case "annual": return 1 / 12;
    default: return 1;
  }
}

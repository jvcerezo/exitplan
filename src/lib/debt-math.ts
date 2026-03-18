/**
 * Debt payoff strategy calculations — Avalanche and Snowball methods.
 */

export interface DebtInput {
  id: string;
  name: string;
  balance: number;
  annualRate: number; // as a decimal, e.g. 0.24 for 24%
  minimumPayment: number;
}

export interface PayoffMonth {
  month: number;
  payments: Record<string, number>; // debtId -> payment amount
  remainingBalances: Record<string, number>;
  totalInterestPaid: number;
}

export interface PayoffResult {
  strategy: "avalanche" | "snowball";
  months: number;
  totalInterestPaid: number;
  totalPaid: number;
  payoffOrder: string[]; // debt IDs in order paid off
  schedule: PayoffMonth[];
}

function simulatePayoff(
  debts: DebtInput[],
  monthlyBudget: number,
  strategy: "avalanche" | "snowball"
): PayoffResult {
  if (debts.length === 0 || monthlyBudget <= 0) {
    return { strategy, months: 0, totalInterestPaid: 0, totalPaid: 0, payoffOrder: [], schedule: [] };
  }

  // Deep clone balances
  const balances: Record<string, number> = {};
  for (const d of debts) balances[d.id] = d.balance;

  const payoffOrder: string[] = [];
  const schedule: PayoffMonth[] = [];
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  const MAX_MONTHS = 600; // 50 years cap

  while (Object.values(balances).some((b) => b > 0.01) && month < MAX_MONTHS) {
    month++;
    const monthPayments: Record<string, number> = {};
    let monthInterest = 0;

    // Apply interest and collect minimums
    // Use compound monthly rate: (1 + annual)^(1/12) - 1 for accuracy
    let remainingBudget = monthlyBudget;
    for (const d of debts) {
      if (balances[d.id] <= 0) continue;
      const monthlyRate = d.annualRate > 0 ? Math.pow(1 + d.annualRate, 1 / 12) - 1 : 0;
      const interest = balances[d.id] * monthlyRate;
      balances[d.id] += interest;
      monthInterest += interest;

      // Pay minimum (or full balance if less)
      const minPay = Math.min(d.minimumPayment, balances[d.id]);
      balances[d.id] -= minPay;
      monthPayments[d.id] = minPay;
      remainingBudget -= minPay;
      totalPaid += minPay;
    }

    totalInterestPaid += monthInterest;

    // Apply extra to priority debt
    if (remainingBudget > 0) {
      const activeDebts = debts.filter((d) => balances[d.id] > 0.01);
      if (activeDebts.length > 0) {
        let priority: DebtInput;
        if (strategy === "avalanche") {
          priority = activeDebts.reduce((a, b) => (a.annualRate >= b.annualRate ? a : b));
        } else {
          priority = activeDebts.reduce((a, b) => (balances[a.id] <= balances[b.id] ? a : b));
        }
        const extra = Math.min(remainingBudget, balances[priority.id]);
        balances[priority.id] -= extra;
        monthPayments[priority.id] = (monthPayments[priority.id] ?? 0) + extra;
        remainingBudget -= extra;
        totalPaid += extra;
      }
    }

    // Check for newly paid-off debts
    for (const d of debts) {
      if (balances[d.id] <= 0.01 && !payoffOrder.includes(d.id)) {
        balances[d.id] = 0;
        payoffOrder.push(d.id);
      }
    }

    // Record snapshot every 6 months to keep schedule lean
    if (month % 6 === 0 || Object.values(balances).every((b) => b <= 0.01)) {
      schedule.push({
        month,
        payments: { ...monthPayments },
        remainingBalances: { ...balances },
        totalInterestPaid,
      });
    }
  }

  return {
    strategy,
    months: month,
    totalInterestPaid: Math.round(totalInterestPaid * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    payoffOrder,
    schedule,
  };
}

export function calculateAvalanche(debts: DebtInput[], monthlyBudget: number): PayoffResult {
  return simulatePayoff(debts, monthlyBudget, "avalanche");
}

export function calculateSnowball(debts: DebtInput[], monthlyBudget: number): PayoffResult {
  return simulatePayoff(debts, monthlyBudget, "snowball");
}

/** Monthly payment needed to pay off a debt in N months (PMT formula, compound monthly rate). */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = Math.pow(1 + annualRate, 1 / 12) - 1; // compound monthly rate
  if (r <= -1) return 0;
  const factor = Math.pow(1 + r, months);
  if (factor === 1) return principal / months;
  return (principal * r * factor) / (factor - 1);
}

/** Months needed to pay off a debt given a fixed monthly payment (compound monthly rate). */
export function calculatePayoffMonths(
  principal: number,
  annualRate: number,
  monthlyPayment: number
): number {
  if (monthlyPayment <= 0) return Infinity;
  if (annualRate === 0) return Math.ceil(principal / monthlyPayment);
  const r = Math.pow(1 + annualRate, 1 / 12) - 1; // compound monthly rate
  if (monthlyPayment <= principal * r) return Infinity; // payment doesn't cover interest
  return Math.ceil(-Math.log(1 - (principal * r) / monthlyPayment) / Math.log(1 + r));
}

/** Total interest paid over the life of a loan. */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  months: number
): number {
  const payment = calculateMonthlyPayment(principal, annualRate, months);
  return Math.round((payment * months - principal) * 100) / 100;
}

/**
 * Due-date utilities for bills, debts, insurance, and contributions.
 * All functions work with local dates (no timezone issues).
 */

/** Get the next due date for a bill based on its due_day and billing_cycle. */
export function getNextBillDueDate(
  dueDay: number | null,
  billingCycle: string,
  lastPaidDate: string | null,
): Date | null {
  if (!dueDay) return null;

  const today = getToday();
  const currentMonth = safeDate(today.getFullYear(), today.getMonth(), dueDay);

  // If no last_paid_date, find the next occurrence from today
  if (!lastPaidDate) {
    if (currentMonth >= today) return currentMonth;
    return addCycleMonths(currentMonth, billingCycle);
  }

  // Parse last paid date
  const [y, m, d] = lastPaidDate.split("-").map(Number);
  const lastPaid = new Date(y, m - 1, d);

  // Calculate next due after last payment based on billing cycle
  let nextDue = safeDate(lastPaid.getFullYear(), lastPaid.getMonth(), dueDay);
  nextDue = addCycleMonths(nextDue, billingCycle);

  // If somehow in the past, keep advancing
  while (nextDue < today) {
    nextDue = addCycleMonths(nextDue, billingCycle);
  }

  return nextDue;
}

/** Get the next due date for a debt payment based on its due_day. */
export function getNextDebtDueDate(dueDay: number | null): Date | null {
  if (!dueDay) return null;

  const today = getToday();
  const thisMonth = safeDate(today.getFullYear(), today.getMonth(), dueDay);
  if (thisMonth >= today) return thisMonth;
  return safeDate(today.getFullYear(), today.getMonth() + 1, dueDay);
}

/** Get the next premium due date for an insurance policy. */
export function getNextPremiumDueDate(
  renewalDate: string | null,
  premiumFrequency: string,
): Date | null {
  if (!renewalDate) return null;

  const today = getToday();
  const [y, m, d] = renewalDate.split("-").map(Number);
  let nextDue = new Date(y, m - 1, d);

  // Walk backwards to find the cycle start, then forward to find the next due
  const cycleMonths = getCycleMonths(premiumFrequency);

  // If renewal is in the future, walk back by cycle until we find the nearest past/current due
  while (nextDue > today) {
    nextDue = new Date(nextDue.getFullYear(), nextDue.getMonth() - cycleMonths, nextDue.getDate());
  }

  // Now walk forward to find the next upcoming due date
  while (nextDue < today) {
    nextDue = new Date(nextDue.getFullYear(), nextDue.getMonth() + cycleMonths, nextDue.getDate());
  }

  return nextDue;
}

/** Get the current contribution period (YYYY-MM). */
export function getCurrentContributionPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Get days until a date from today. Negative = overdue. */
export function daysUntil(date: Date): number {
  const today = getToday();
  return Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Get urgency label. */
export function getUrgencyLabel(days: number): { label: string; color: string } {
  if (days < 0) return { label: "Overdue", color: "text-red-500" };
  if (days === 0) return { label: "Due today", color: "text-amber-500" };
  if (days <= 3) return { label: `${days}d`, color: "text-amber-500" };
  if (days <= 7) return { label: `${days}d`, color: "text-muted-foreground" };
  return { label: `${days}d`, color: "text-muted-foreground" };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Build a date for `year/month` clamping `day` to the last day of that month.
 * e.g. day 31 in February → Feb 28 (or 29 in leap years).
 */
function safeDate(year: number, month: number, day: number): Date {
  const lastDay = new Date(year, month + 1, 0).getDate(); // 0th of next month = last day of this month
  return new Date(year, month, Math.min(day, lastDay));
}

function getCycleMonths(cycle: string): number {
  switch (cycle) {
    case "monthly": return 1;
    case "quarterly": return 3;
    case "semi_annual": return 6;
    case "annual": return 12;
    default: return 1;
  }
}

function addCycleMonths(date: Date, cycle: string): Date {
  const months = getCycleMonths(cycle);
  return safeDate(date.getFullYear(), date.getMonth() + months, date.getDate());
}

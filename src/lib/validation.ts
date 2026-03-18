/**
 * Input validation constants and guards.
 * Used across all forms to prevent UI-breaking inputs.
 */

// ─── Amount Limits ───────────────────────────────────────────────────────────

/** Maximum amount for any monetary input (₱999,999,999.99) */
export const MAX_AMOUNT = 999_999_999.99;

/** Maximum salary input */
export const MAX_SALARY = 9_999_999;

/** Maximum interest rate (%) */
export const MAX_INTEREST_RATE = 100;

/** Maximum loan/calculator term in years */
export const MAX_TERM_YEARS = 100;

// ─── String Limits ───────────────────────────────────────────────────────────

/** Max length for names (accounts, goals, debts, bills, policies) */
export const MAX_NAME_LENGTH = 100;

/** Max length for descriptions and notes */
export const MAX_DESCRIPTION_LENGTH = 500;

/** Max length for provider/lender names */
export const MAX_PROVIDER_LENGTH = 100;

/** Max length for short labels (categories, tags) */
export const MAX_LABEL_LENGTH = 50;

// ─── Date Limits ─────────────────────────────────────────────────────────────

/** Earliest reasonable date (Jan 1, 2000) */
export const MIN_DATE = "2000-01-01";

/** Get a max date string (10 years from now) */
export function getMaxDate(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 10);
  return d.toISOString().slice(0, 10);
}

/** Get today's date as YYYY-MM-DD */
export function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── Math Guards ─────────────────────────────────────────────────────────────

/** Clamp a number to a safe range */
export function clampAmount(value: number): number {
  if (!isFinite(value) || isNaN(value)) return 0;
  return Math.min(Math.max(value, -MAX_AMOUNT), MAX_AMOUNT);
}

/** Safe division that returns 0 instead of Infinity/NaN */
export function safeDivide(numerator: number, denominator: number, fallback = 0): number {
  if (denominator === 0 || !isFinite(denominator)) return fallback;
  const result = numerator / denominator;
  if (!isFinite(result) || isNaN(result)) return fallback;
  return result;
}

/** Safe percentage (0-100) */
export function safePercent(part: number, whole: number): number {
  return Math.min(100, Math.max(0, safeDivide(part, whole) * 100));
}

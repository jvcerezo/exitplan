/**
 * Input sanitization and validation utilities.
 * Used by hooks and server actions to validate data before hitting Supabase.
 */

import {
  MAX_AMOUNT,
  MAX_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LABEL_LENGTH,
  MAX_PROVIDER_LENGTH,
  MAX_INTEREST_RATE,
  MAX_TERM_YEARS,
  MAX_SALARY,
  clampAmount,
} from "./validation";

// ─── String sanitization ────────────────────────────────────────────────────

/** Trim and truncate a string. Returns empty string for nullish values. */
export function sanitizeString(
  value: string | null | undefined,
  maxLength: number,
): string {
  if (!value) return "";
  return value.trim().slice(0, maxLength);
}

/** Sanitize a name field (account, goal, debt, bill, policy) */
export function sanitizeName(value: string | null | undefined): string {
  return sanitizeString(value, MAX_NAME_LENGTH);
}

/** Sanitize a description/notes field */
export function sanitizeDescription(value: string | null | undefined): string {
  return sanitizeString(value, MAX_DESCRIPTION_LENGTH);
}

/** Sanitize a category or tag */
export function sanitizeLabel(value: string | null | undefined): string {
  return sanitizeString(value, MAX_LABEL_LENGTH);
}

/** Sanitize a provider/lender name */
export function sanitizeProvider(value: string | null | undefined): string {
  return sanitizeString(value, MAX_PROVIDER_LENGTH);
}

/** Sanitize an array of tags */
export function sanitizeTags(tags: string[] | null | undefined): string[] | null {
  if (!tags || tags.length === 0) return null;
  return tags
    .map((t) => sanitizeLabel(t))
    .filter((t) => t.length > 0)
    .slice(0, 20); // max 20 tags
}

// ─── Numeric sanitization ───────────────────────────────────────────────────

/** Validate and clamp a monetary amount. Throws on NaN/invalid. */
export function sanitizeAmount(value: number | string | null | undefined): number {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!Number.isFinite(num)) {
    throw new Error("Invalid amount");
  }
  return clampAmount(num);
}

/** Validate a positive monetary amount (balance, goal target, etc.) */
export function sanitizePositiveAmount(value: number | string | null | undefined): number {
  const num = sanitizeAmount(value);
  return Math.max(0, num);
}

/** Validate an interest rate (0-100) */
export function sanitizeInterestRate(value: number | string | null | undefined): number {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.min(Math.max(0, num), MAX_INTEREST_RATE);
}

/** Validate a salary amount */
export function sanitizeSalary(value: number | string | null | undefined): number {
  const num = typeof value === "string" ? parseFloat(value) : (value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.min(Math.max(0, num), MAX_SALARY);
}

/** Validate a term in years */
export function sanitizeTermYears(value: number | string | null | undefined): number {
  const num = typeof value === "string" ? parseInt(String(value), 10) : (value ?? 0);
  if (!Number.isFinite(num)) return 0;
  return Math.min(Math.max(0, num), MAX_TERM_YEARS);
}

// ─── Date sanitization ──────────────────────────────────────────────────────

/** Validate a YYYY-MM-DD date string. Returns today if invalid. */
export function sanitizeDate(value: string | null | undefined): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  // Must match YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date().toISOString().slice(0, 10);
  }
  const parsed = new Date(value + "T00:00:00Z");
  if (isNaN(parsed.getTime())) {
    return new Date().toISOString().slice(0, 10);
  }
  return value;
}

// ─── UUID sanitization ──────────────────────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Validate a UUID string. Returns null if invalid. */
export function sanitizeUUID(value: string | null | undefined): string | null {
  if (!value) return null;
  return UUID_RE.test(value) ? value : null;
}

/** Validate a required UUID. Throws if invalid. */
export function requireUUID(value: string | null | undefined, fieldName = "ID"): string {
  const id = sanitizeUUID(value);
  if (!id) throw new Error(`Invalid ${fieldName}`);
  return id;
}

// ─── Email sanitization ─────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate email format. Returns trimmed lowercase email or throws. */
export function sanitizeEmail(value: string | null | undefined): string {
  if (!value) throw new Error("Email is required");
  const email = value.trim().toLowerCase();
  if (email.length > 254) throw new Error("Email is too long");
  if (!EMAIL_RE.test(email)) throw new Error("Invalid email format");
  return email;
}

// ─── Password sanitization ──────────────────────────────────────────────────

/** Validate password strength. Returns password or throws. */
export function sanitizePassword(value: string | null | undefined): string {
  if (!value) throw new Error("Password is required");
  if (value.length < 8) throw new Error("Password must be at least 8 characters");
  if (value.length > 256) throw new Error("Password is too long");
  return value;
}

// ─── Enum validation ────────────────────────────────────────────────────────

/** Validate a value is one of the allowed options. Returns the value or throws. */
export function sanitizeEnum<T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fieldName = "value",
): T {
  if (!value || !allowed.includes(value as T)) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }
  return value as T;
}

// ─── Account types ──────────────────────────────────────────────────────────

export const ACCOUNT_TYPES = [
  "bank",
  "e-wallet",
  "cash",
  "credit-card",
  "savings",
  "investment",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

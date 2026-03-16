/**
 * Format a number as Philippine Peso currency (or other currency).
 * Example: formatCurrency(50000) => "₱50,000.00"
 */
export function formatCurrency(amount: number, currency?: string): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₱";
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const prefix = amount < 0 ? "-" : "";
  return `${prefix}${symbol}${formatted}`;
}

/**
 * Format a signed currency: positive => "+₱1,000.00", negative => "-₱500.00"
 */
export function formatSignedCurrency(amount: number, currency?: string): string {
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₱";
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${symbol}${formatted}`;
}

/**
 * Get display label for a transaction.
 */
export function getTransactionLabel(tx: {
  description?: string | null;
  category: string;
}): string {
  return tx.description || tx.category;
}

/**
 * Get display category for a transaction.
 */
export function getTransactionCategory(tx: {
  category: string;
  description?: string | null;
}): string {
  return tx.category;
}

/** Formats a raw numeric string like "10000.50" => "10,000.50" for display. */
export function formatAmount(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

/**
 * Handles a change event on a money text input.
 * Strips commas, allows only digits and a single decimal point,
 * then returns the clean numeric string to store in state.
 */
export function parseAmountInput(value: string): string {
  const stripped = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!stripped) return "";

  const [intPartRaw, ...rest] = stripped.split(".");
  const decimalPart = rest.join("");
  const normalizedInt = intPartRaw.replace(/^0+(?=\d)/, "");

  if (rest.length > 0) {
    return `${normalizedInt || "0"}.${decimalPart}`;
  }

  return normalizedInt;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CURRENCIES, NO_DECIMAL_CURRENCIES } from "@/lib/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

export function formatCurrency(amount: number, currencyCode = "PHP"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const noDecimal = NO_DECIMAL_CURRENCIES.includes(currencyCode);
  const sign = amount < 0 ? "-" : "";
  return `${sign}${symbol}${Math.abs(amount).toLocaleString("en-PH", {
    minimumFractionDigits: noDecimal ? 0 : 2,
    maximumFractionDigits: noDecimal ? 0 : 2,
  })}`;
}

/** Round to 2 decimal places to avoid floating-point drift in currency math */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatSignedCurrency(amount: number, currencyCode = "PHP"): string {
  const symbol = getCurrencySymbol(currencyCode);
  const noDecimal = NO_DECIMAL_CURRENCIES.includes(currencyCode);
  const sign = amount > 0 ? "+" : "-";
  return `${sign}${symbol}${Math.abs(amount).toLocaleString("en-PH", {
    minimumFractionDigits: noDecimal ? 0 : 2,
    maximumFractionDigits: noDecimal ? 0 : 2,
  })}`;
}

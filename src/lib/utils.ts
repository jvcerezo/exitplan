import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? "-" : "";
  return `${sign}₱${Math.abs(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Round to 2 decimal places to avoid floating-point drift in currency math */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export function formatSignedCurrency(amount: number): string {
  const sign = amount > 0 ? "+" : "-";
  return `${sign}₱${Math.abs(amount).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

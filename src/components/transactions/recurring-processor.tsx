"use client";

import { useEffect, useRef } from "react";
import { useProcessDueRecurringTransactions } from "@/hooks/use-recurring-transactions";
import { isBrowserOffline } from "@/lib/offline/utils";

/**
 * Invisible component that runs once on mount.
 * Checks for and processes any recurring transactions that are due today or overdue.
 * Place it inside the authenticated app shell.
 */
export function RecurringProcessor() {
  const processRecurring = useProcessDueRecurringTransactions();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    if (isBrowserOffline()) return;

    hasRun.current = true;
    processRecurring.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

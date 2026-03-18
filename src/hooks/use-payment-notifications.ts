"use client";

import { useEffect, useRef } from "react";
import { useUpcomingPayments } from "./use-upcoming-payments";

const NOTIF_SCHEDULED_KEY = "exitplan_notif_scheduled_date";

// Maps payment types to their automation toggle keys
const TOGGLE_KEYS: Record<string, string> = {
  bill: "exitplan_auto_bills",
  debt: "exitplan_auto_debts",
  insurance: "exitplan_auto_insurance",
  contribution: "exitplan_auto_contributions",
};

/**
 * Schedules local notifications for upcoming payments.
 * Runs once per day on app load. Notifications fire at 9:00 AM
 * for items due within 3 days. Respects per-feature automation toggles.
 */
export function usePaymentNotifications() {
  const { items, isLoading } = useUpcomingPayments(3);
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (isLoading || hasScheduled.current || items.length === 0) return;

    // Filter out items where the user disabled notifications
    const enabledItems = items.filter((item) => {
      const key = TOGGLE_KEYS[item.type];
      if (!key) return true;
      return localStorage.getItem(key) !== "0";
    });
    if (enabledItems.length === 0) return;

    // Only schedule once per day
    const today = new Date().toISOString().slice(0, 10);
    const lastScheduled = localStorage.getItem(NOTIF_SCHEDULED_KEY);
    if (lastScheduled === today) return;

    hasScheduled.current = true;
    scheduleNotifications(enabledItems);
    localStorage.setItem(NOTIF_SCHEDULED_KEY, today);
  }, [items, isLoading]);
}

async function scheduleNotifications(
  items: { id: string; title: string; amount: number; daysUntilDue: number }[]
) {
  try {
    // Dynamic import — only loads on native platforms
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    // Check/request permission
    const permResult = await LocalNotifications.checkPermissions();
    if (permResult.display !== "granted") {
      const reqResult = await LocalNotifications.requestPermissions();
      if (reqResult.display !== "granted") return;
    }

    // Cancel existing scheduled notifications to avoid duplicates
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    // Schedule notifications for items due within 3 days
    const notifications = items
      .filter((item) => item.daysUntilDue >= 0 && item.daysUntilDue <= 3)
      .slice(0, 10) // Limit to 10 notifications
      .map((item, index) => {
        const dueLabel = item.daysUntilDue === 0
          ? "due today"
          : item.daysUntilDue === 1
            ? "due tomorrow"
            : `due in ${item.daysUntilDue} days`;

        // Schedule for 9:00 AM today
        const scheduleAt = new Date();
        scheduleAt.setHours(9, 0, 0, 0);
        // If it's already past 9 AM, schedule for now + 10 seconds
        if (scheduleAt <= new Date()) {
          scheduleAt.setTime(Date.now() + 10000);
        }

        return {
          id: 1000 + index,
          title: `Payment ${dueLabel}`,
          body: `${item.title} — ${formatPeso(item.amount)}`,
          schedule: { at: scheduleAt },
          smallIcon: "ic_stat_icon_config_sample",
          iconColor: "#10B981",
        };
      });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch {
    // Silently fail on web — notifications are native-only
  }
}

function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

"use client";

import { useEffect, useRef } from "react";
import { useTransactionsCount } from "./use-transactions";

const LOG_REMINDER_SCHEDULED_KEY = "exitplan_log_reminder_scheduled_date";
const LOG_REMINDER_NOTIF_ID = 2000;

/**
 * Schedules a daily "Log Your Expenses" push notification at 7:00 PM
 * Manila time (Asia/Manila). Only fires if the user hasn't manually
 * logged any transaction for that day by the time the notification
 * triggers. Respects the `exitplan_daily_log_reminder` toggle.
 *
 * Runs once per day on app load.
 */
export function useDailyLogReminder() {
  const today = new Date().toISOString().slice(0, 10);
  const { data: todayCount, isLoading } = useTransactionsCount({
    dateFrom: today,
    dateTo: today,
  });
  const hasScheduled = useRef(false);

  useEffect(() => {
    if (isLoading || hasScheduled.current) return;

    // Check if feature is disabled
    if (localStorage.getItem("exitplan_daily_log_reminder") === "0") return;

    // Check if notifications are globally disabled
    if (localStorage.getItem("exitplan_notif_enabled") === "0") return;

    // Only schedule once per day
    const lastScheduled = localStorage.getItem(LOG_REMINDER_SCHEDULED_KEY);
    if (lastScheduled === today) return;

    hasScheduled.current = true;
    localStorage.setItem(LOG_REMINDER_SCHEDULED_KEY, today);

    // If user already logged transactions today, skip
    if (todayCount && todayCount > 0) return;

    scheduleDailyLogNotification();
  }, [todayCount, isLoading, today]);
}

async function scheduleDailyLogNotification() {
  try {
    const { LocalNotifications } = await import("@capacitor/local-notifications");

    // Check/request permission
    const permResult = await LocalNotifications.checkPermissions();
    if (permResult.display !== "granted") {
      const reqResult = await LocalNotifications.requestPermissions();
      if (reqResult.display !== "granted") return;
    }

    // Cancel any previously scheduled daily log reminder
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: LOG_REMINDER_NOTIF_ID }],
      });
    } catch {
      // Ignore if nothing to cancel
    }

    // Schedule for 7:00 PM today (device local time — Manila for PH users)
    const scheduleAt = new Date();
    scheduleAt.setHours(19, 0, 0, 0);

    // If it's already past 7 PM, don't schedule
    if (scheduleAt <= new Date()) return;

    await LocalNotifications.schedule({
      notifications: [
        {
          id: LOG_REMINDER_NOTIF_ID,
          title: "Log Your Expenses",
          body: "Don't forget to log your expenses! Track your spending to stay on top of your finances.",
          schedule: { at: scheduleAt },
          smallIcon: "ic_stat_icon_config_sample",
          iconColor: "#10B981",
        },
      ],
    });
  } catch {
    // Silently fail on web — notifications are native-only
  }
}

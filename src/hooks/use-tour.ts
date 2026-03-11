"use client";

import { useState, useCallback, useEffect } from "react";

export interface TourStep {
  /** CSS selector for the element to highlight. null = centered modal (no highlight) */
  target: string | null;
  title: string;
  description: string;
  /** Which page the element lives on — used to decide whether to navigate */
  page?: string;
  /** Preferred tooltip placement relative to the target */
  placement?: "top" | "bottom" | "left" | "right" | "center";
  /** Optional key for the screenshot mockup shown in centered modal steps */
  screenshot?:
    | "dashboard"
    | "transactions"
    | "goals"
    | "budgets"
    | "accounts"
    | "fab"
    | "search"
    | "settings"
    | "done";
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: "Welcome to ExitPlan! 🎉",
    description:
      "You're in! This quick tour shows the core actions you'll use daily so you can start tracking confidently in under a minute.",
    placement: "center",
    screenshot: "dashboard",
  },
  {
    target: null,
    title: "Dashboard",
    description:
      "Your home base. See your net worth, health score, budget alerts, goals, and spending trends — all at a glance.",
    placement: "center",
    screenshot: "dashboard",
  },
  {
    target: null,
    title: "Transactions",
    description:
      "Log every peso coming in or going out. You can add income, expenses, or transfers between accounts.",
    placement: "center",
    screenshot: "transactions",
  },
  {
    target: null,
    title: "Goals",
    description:
      "Set savings targets — emergency fund, travel, education, or anything custom. Track progress with visual progress bars.",
    placement: "center",
    screenshot: "goals",
  },
  {
    target: null,
    title: "Budgets",
    description:
      "Define monthly spending limits per category. The dashboard will alert you when you're approaching a limit.",
    placement: "center",
    screenshot: "budgets",
  },
  {
    target: null,
    title: "Accounts",
    description:
      "Manage all your cash, bank, and e-wallet accounts in one place. Balances update automatically as you log transactions.",
    placement: "center",
    screenshot: "accounts",
  },
  {
    target: null,
    title: "Quick Add",
    description:
      "Use this + button anytime to instantly add Expense or Income. It's the fastest way to keep your records updated in real time.",
    placement: "center",
    screenshot: "fab",
  },
  {
    target: null,
    title: "Search",
    description:
      "Press ⌘K (or Ctrl+K) to search transactions, accounts, and goals instantly from anywhere in the app.",
    placement: "center",
    screenshot: "search",
  },
  {
    target: null,
    title: "Settings",
    description:
      "Change your display name, primary currency, exchange rates, and app theme here.",
    placement: "center",
    screenshot: "settings",
  },
  {
    target: null,
    title: "You're all set! 🚀",
    description:
      "That's it — you're ready. Start with Quick Add, then check Dashboard insights. Replay this tour anytime from Settings on mobile or Sidebar on desktop.",
    placement: "center",
    screenshot: "done",
  },
];

const STORAGE_KEY = "exitplan_tour_completed";
const PENDING_KEY = "exitplan_tour_pending";
const REQUIRED_KEY = "exitplan_tour_required";
const FORCE_START_KEY = "exitplan_tour_force_start";

export function useTour() {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRequiredRun, setIsRequiredRun] = useState(false);

  // Auto-start if onboarding just finished
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasTourQuery = new URLSearchParams(window.location.search).get("tour") === "1";
    const isDashboard = window.location.pathname === "/dashboard";
    const pending = localStorage.getItem(PENDING_KEY);
    const required = localStorage.getItem(REQUIRED_KEY) === "1";
    const forced = sessionStorage.getItem(FORCE_START_KEY) === "1";
    const shouldStart =
      hasTourQuery ||
      pending === "1" ||
      forced ||
      (required && isDashboard);

    if (hasTourQuery) {
      sessionStorage.setItem(FORCE_START_KEY, "1");
    }

    if (shouldStart) {
      localStorage.removeItem(PENDING_KEY);
      setIsRequiredRun(required);
      setCurrentStep(0);
      setIsActive(true);
      sessionStorage.removeItem(FORCE_START_KEY);

      // Clean query after activation so refresh URLs stay tidy
      if (hasTourQuery) {
        const url = new URL(window.location.href);
        url.searchParams.delete("tour");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const start = useCallback(() => {
    setIsRequiredRun(false);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    if (isRequiredRun) return;
    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, [isRequiredRun]);

  const next = useCallback(() => {
    const isLastStep = currentStep >= TOUR_STEPS.length - 1;
    if (!isLastStep) {
      setCurrentStep((s) => s + 1);
      return;
    }

    setIsActive(false);
    localStorage.setItem(STORAGE_KEY, "1");

    if (isRequiredRun) {
      localStorage.removeItem(REQUIRED_KEY);
      setIsRequiredRun(false);
    }
  }, [currentStep, isRequiredRun]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentStep(index);
  }, []);

  /** Call this from the onboarding finish to schedule the tour on next page load */
  const scheduleTour = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(PENDING_KEY, "1");
    }
  }, []);

  return {
    isActive,
    isRequiredRun,
    currentStep,
    totalSteps: TOUR_STEPS.length,
    step: TOUR_STEPS[currentStep],
    start,
    stop,
    next,
    prev,
    goTo,
    scheduleTour,
  };
}

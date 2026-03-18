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
    | "adulting"
    | "journey"
    | "fab"
    | "search"
    | "settings"
    | "done";
}

export const TOUR_STEPS: TourStep[] = [
  {
    target: null,
    title: "Welcome to ExitPlan!",
    description:
      "Your companion for every stage of Filipino adult life. This quick tour walks you through everything you need to get started.",
    placement: "center",
    screenshot: "dashboard",
  },
  {
    target: null,
    title: "Your Adulting Journey",
    description:
      "The Journey Map is your roadmap through Filipino adulting — from getting your first IDs to retirement. Each stage has step-by-step guides and checklists you can mark as done or skip.",
    placement: "center",
    screenshot: "journey",
  },
  {
    target: null,
    title: "Financial Dashboard",
    description:
      "See your net worth, financial health score, spending trends, and budget alerts — all in one place. This is your financial overview.",
    placement: "center",
    screenshot: "dashboard",
  },
  {
    target: null,
    title: "Track Transactions",
    description:
      "Log every peso — income, expenses, and transfers between accounts. Your balances and insights update automatically.",
    placement: "center",
    screenshot: "transactions",
  },
  {
    target: null,
    title: "Goals & Budgets",
    description:
      "Set savings targets and monthly spending limits. Track your progress with visual bars and get alerts when you're near a limit.",
    placement: "center",
    screenshot: "goals",
  },
  {
    target: null,
    title: "Adulting Tools",
    description:
      "Track SSS, PhilHealth, and Pag-IBIG contributions. Compute your BIR taxes. Manage debts, bills, and insurance — built for Filipino needs.",
    placement: "center",
    screenshot: "adulting",
  },
  {
    target: null,
    title: "Quick Add",
    description:
      "Tap the + button anytime to instantly log an expense or income. It's the fastest way to keep your records up to date.",
    placement: "center",
    screenshot: "fab",
  },
  {
    target: null,
    title: "You're all set!",
    description:
      "Start by exploring your Journey Map, then try Quick Add to log your first transaction. You can replay this tour anytime from Settings.",
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
    const isDashboard = window.location.pathname === "/home";
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

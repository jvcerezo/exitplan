"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function useKeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Navigation shortcuts
      if (e.key === "g") {
        // Wait for next key
        const handleNext = (e2: KeyboardEvent) => {
          window.removeEventListener("keydown", handleNext);
          switch (e2.key) {
            case "d":
              router.push("/dashboard");
              break;
            case "t":
              router.push("/transactions");
              break;
            case "g":
              router.push("/goals");
              break;
            case "b":
              router.push("/budgets");
              break;
            case "s":
              router.push("/settings");
              break;
          }
        };
        window.addEventListener("keydown", handleNext, { once: true });
        // Auto-remove after 1s if no second key pressed
        setTimeout(() => window.removeEventListener("keydown", handleNext), 1000);
        return;
      }

      // Escape to blur focused element
      if (e.key === "Escape") {
        (document.activeElement as HTMLElement)?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}

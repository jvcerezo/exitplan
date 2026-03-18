"use client";

import { useEffect, useState, useRef } from "react";

export type ScrollDirection = "up" | "down" | "idle";

export function useScrollDirection(threshold = 10): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>("idle");
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;

        if (Math.abs(diff) > threshold) {
          setDirection(diff > 0 ? "down" : "up");
          lastScrollY.current = currentY;
        }

        if (currentY <= 0) {
          setDirection("idle");
        }

        ticking.current = false;
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowLeft, ArrowRight, Map } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { TOUR_STEPS } from "@/hooks/use-tour";
import { useTourContext } from "@/providers/tour-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TourStep } from "@/hooks/use-tour";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8; // px around the spotlight highlight

function getTargetRect(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top - PADDING,
    left: r.left - PADDING,
    width: r.width + PADDING * 2,
    height: r.height + PADDING * 2,
  };
}

interface TooltipPosition {
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  transform?: string;
}

function calcTooltipPos(
  rect: Rect | null,
  placement: TourStep["placement"],
  tooltipW: number,
  tooltipH: number,
  vw: number,
  vh: number
): TooltipPosition {
  if (!rect || placement === "center") {
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const gap = 16;
  let top: number, left: number;

  switch (placement) {
    case "right":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left + rect.width + gap;
      break;
    case "left":
      top = rect.top + rect.height / 2 - tooltipH / 2;
      left = rect.left - tooltipW - gap;
      break;
    case "bottom":
      top = rect.top + rect.height + gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
    case "top":
    default:
      top = rect.top - tooltipH - gap;
      left = rect.left + rect.width / 2 - tooltipW / 2;
      break;
  }

  // Clamp to viewport
  left = Math.max(12, Math.min(left, vw - tooltipW - 12));
  top = Math.max(12, Math.min(top, vh - tooltipH - 12));

  return { top, left };
}

// SVG clip-path spotlight mask
function SpotlightMask({ rect }: { rect: Rect | null }) {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;
  const vh = typeof window !== "undefined" ? window.innerHeight : 1080;

  if (!rect) {
    // Full dark overlay for centered steps
    return (
      <motion.div
        key="full-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9998] bg-black/60 pointer-events-none"
      />
    );
  }

  const r = 8; // border-radius of the cutout

  const path = `
    M 0 0 L ${vw} 0 L ${vw} ${vh} L 0 ${vh} Z
    M ${rect.left + r} ${rect.top}
    L ${rect.left + rect.width - r} ${rect.top}
    Q ${rect.left + rect.width} ${rect.top} ${rect.left + rect.width} ${rect.top + r}
    L ${rect.left + rect.width} ${rect.top + rect.height - r}
    Q ${rect.left + rect.width} ${rect.top + rect.height} ${rect.left + rect.width - r} ${rect.top + rect.height}
    L ${rect.left + r} ${rect.top + rect.height}
    Q ${rect.left} ${rect.top + rect.height} ${rect.left} ${rect.top + rect.height - r}
    L ${rect.left} ${rect.top + r}
    Q ${rect.left} ${rect.top} ${rect.left + r} ${rect.top}
    Z
  `.trim();

  return (
    <motion.svg
      key="spotlight-mask"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[9998] pointer-events-none"
      width={vw}
      height={vh}
      style={{ top: 0, left: 0 }}
    >
      <path d={path} fill="rgba(0,0,0,0.6)" fillRule="evenodd" />
      {/* Glowing border around the cutout */}
      <rect
        x={rect.left}
        y={rect.top}
        width={rect.width}
        height={rect.height}
        rx={r}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        opacity="0.8"
      />
    </motion.svg>
  );
}

function TargetHighlight({ rect }: { rect: Rect | null }) {
  if (!rect) return null;

  return (
    <motion.div
      key="target-highlight"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed z-[9998] pointer-events-none rounded-lg"
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        boxShadow: "0 0 0 2px hsl(var(--primary)), 0 0 0 6px hsl(var(--primary) / 0.22)",
      }}
    />
  );
}

export function TourOverlay() {
  const { isActive, isRequiredRun, currentStep, totalSteps, step, next, prev, stop } =
    useTourContext();
  const router = useRouter();
  const pathname = usePathname();
  const [rect, setRect] = useState<Rect | null>(null);
  const [vw, setVw] = useState(1200);
  const [vh, setVh] = useState(800);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ w: 320, h: 160 });
  const isMobile = vw < 768;

  // Ensure each tour step displays on the correct app screen
  useEffect(() => {
    if (!isActive || !step?.page) return;
    if (pathname !== step.page) {
      router.push(isRequiredRun ? `${step.page}?tour=1` : step.page);
    }
  }, [isActive, step?.page, pathname, router, isRequiredRun]);

  // Measure viewport
  useEffect(() => {
    function update() {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Recompute target rect whenever step changes
  const updateRect = useCallback(() => {
    if (!step?.target || step.placement === "center") {
      setRect(null);
      return;
    }

    if (step.page && pathname !== step.page) {
      setRect(null);
      return;
    }

    const r = getTargetRect(step.target);
    setRect(r);
    // If not found, scroll the element into view and retry
    if (!r) {
      const el = document.querySelector(step.target);
      if (el) {
        if (!isMobile) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        setTimeout(() => setRect(getTargetRect(step.target!)), 250);
      } else {
        setRect(null);
      }
    }
  }, [step, isMobile, pathname]);

  useEffect(() => {
    if (!isActive) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    if (!isMobile) {
      window.addEventListener("scroll", updateRect, true);
    }
    return () => {
      window.removeEventListener("resize", updateRect);
      if (!isMobile) {
        window.removeEventListener("scroll", updateRect, true);
      }
    };
  }, [isActive, updateRect, isMobile]);

  // Measure tooltip size after render
  useEffect(() => {
    if (!tooltipRef.current) return;
    const nextSize = {
      w: tooltipRef.current.offsetWidth,
      h: tooltipRef.current.offsetHeight,
    };
    setTooltipSize((prev) =>
      prev.w === nextSize.w && prev.h === nextSize.h ? prev : nextSize
    );
  }, [currentStep, isActive, vw, vh]);

  const effectivePlacement: TourStep["placement"] =
    isMobile || !rect || step?.placement === "center"
      ? "center"
      : (step?.placement ?? "center");

  const shouldCenterCard = effectivePlacement === "center";
  const isScreenShowcaseStep =
    !!step?.page && !!step?.target && step?.placement !== "center";
  const shouldDockCard = isMobile && isScreenShowcaseStep;
  const shouldAnchorWeb = !isMobile && !!step?.target && step?.placement !== "center";
  const isNonModalStep = shouldDockCard || shouldAnchorWeb;

  const tooltipPos = calcTooltipPos(
    rect,
    effectivePlacement,
    tooltipSize.w,
    tooltipSize.h,
    vw,
    vh
  );

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isActive && step && (
        <>
          {/* Backdrop / spotlight mask */}
          {!isNonModalStep && <SpotlightMask rect={rect} />}
          {shouldAnchorWeb && <TargetHighlight rect={rect} />}

          {/* Click-blocker (lets user interact with nothing behind overlay) */}
          {!isNonModalStep && (
            <div
              className="fixed inset-0 z-[9999] pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          {/* Tooltip card */}
          {shouldDockCard ? (
            <div className="fixed inset-x-0 bottom-4 z-[10000] flex justify-center px-3 pointer-events-none">
              <motion.div
                ref={tooltipRef}
                key={`tooltip-${currentStep}`}
                initial={{ opacity: 0, y: 16, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "w-full max-w-[520px] max-h-[45vh] overflow-y-auto rounded-xl border bg-card/95 backdrop-blur text-card-foreground shadow-2xl pointer-events-auto",
                  "flex flex-col gap-4 p-5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Map className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <h3 className="text-sm font-semibold leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <button
                    onClick={stop}
                    className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close tour"
                    disabled={isRequiredRun}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                <div className="flex items-center justify-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "block rounded-full transition-all duration-200",
                        i === currentStep
                          ? "h-2 w-5 bg-primary"
                          : "h-2 w-2 bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2">
                  {isRequiredRun ? (
                    <span className="text-xs text-muted-foreground/70">
                      Complete tour to continue
                    </span>
                  ) : (
                    <button
                      onClick={stop}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      Skip tour
                    </button>
                  )}

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3">
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" onClick={next} className="h-8 px-4">
                      {currentStep === totalSteps - 1 ? (
                        "Done"
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <p className="text-center text-[11px] text-muted-foreground/60 -mt-2">
                  {currentStep + 1} / {totalSteps}
                </p>
              </motion.div>
            </div>
          ) : shouldCenterCard ? (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 pointer-events-none">
              <motion.div
                ref={tooltipRef}
                key={`tooltip-${currentStep}`}
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={cn(
                  "w-full max-w-[360px] max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-2xl pointer-events-auto",
                  "flex flex-col gap-4 p-5"
                )}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Map className="h-3.5 w-3.5 text-primary" />
                    </span>
                    <h3 className="text-sm font-semibold leading-tight">
                      {step.title}
                    </h3>
                  </div>
                  <button
                    onClick={stop}
                    className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close tour"
                    disabled={isRequiredRun}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Body */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "block rounded-full transition-all duration-200",
                        i === currentStep
                          ? "h-2 w-5 bg-primary"
                          : "h-2 w-2 bg-muted-foreground/30"
                      )}
                    />
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between gap-2">
                  {isRequiredRun ? (
                    <span className="text-xs text-muted-foreground/70">
                      Complete tour to continue
                    </span>
                  ) : (
                    <button
                      onClick={stop}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                    >
                      Skip tour
                    </button>
                  )}

                  <div className="flex gap-2">
                    {currentStep > 0 && (
                      <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3">
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="sm" onClick={next} className="h-8 px-4">
                      {currentStep === totalSteps - 1 ? (
                        "Done"
                      ) : (
                        <>
                          Next
                          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Step counter */}
                <p className="text-center text-[11px] text-muted-foreground/60 -mt-2">
                  {currentStep + 1} / {totalSteps}
                </p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              ref={tooltipRef}
              key={`tooltip-${currentStep}`}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={cn(
                "fixed z-[10000] w-[min(360px,calc(100vw-24px))] max-h-[calc(100vh-24px)] overflow-y-auto rounded-xl border bg-card text-card-foreground shadow-2xl pointer-events-auto",
                "flex flex-col gap-4 p-5"
              )}
              style={{ ...tooltipPos }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Map className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <h3 className="text-sm font-semibold leading-tight">
                    {step.title}
                  </h3>
                </div>
                <button
                  onClick={stop}
                  className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close tour"
                  disabled={isRequiredRun}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5">
                {TOUR_STEPS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "block rounded-full transition-all duration-200",
                      i === currentStep
                        ? "h-2 w-5 bg-primary"
                        : "h-2 w-2 bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between gap-2">
                {isRequiredRun ? (
                  <span className="text-xs text-muted-foreground/70">
                    Complete tour to continue
                  </span>
                ) : (
                  <button
                    onClick={stop}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                  >
                    Skip tour
                  </button>
                )}

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3">
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  <Button size="sm" onClick={next} className="h-8 px-4">
                    {currentStep === totalSteps - 1 ? (
                      "Done"
                    ) : (
                      <>
                        Next
                        <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Step counter */}
              <p className="text-center text-[11px] text-muted-foreground/60 -mt-2">
                {currentStep + 1} / {totalSteps}
              </p>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

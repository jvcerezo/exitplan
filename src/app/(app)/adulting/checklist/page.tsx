"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  BookOpen,
  ArrowLeft,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChecklistProgress, useToggleChecklistItem } from "@/hooks/use-adulting-checklist";
import {
  CHECKLIST_PHASES,
  TOTAL_ITEMS,
  PRIORITY_META,
  type ChecklistItem,
  type ChecklistPhase,
} from "@/lib/adulting-checklist-data";
import { cn } from "@/lib/utils";

function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2 w-full rounded-full bg-muted overflow-hidden", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

function ItemCard({
  item,
  completed,
  onToggle,
}: {
  item: ChecklistItem;
  completed: boolean;
  onToggle: (completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_META[item.priority];

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        completed
          ? "border-border/40 bg-muted/20"
          : "border-border bg-card"
      )}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 p-3.5">
        <button
          type="button"
          onClick={() => onToggle(!completed)}
          className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors"
        >
          {completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                "text-sm font-medium leading-snug",
                completed && "line-through text-muted-foreground"
              )}
            >
              {item.title}
            </p>
            <span
              className={cn(
                "shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                priority.bg,
                priority.color
              )}
            >
              {priority.label}
            </span>
          </div>
          {!expanded && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {item.description}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border/50 pt-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Why it matters</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.why}</p>
          </div>

          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 space-y-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">How to do it</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.how}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            {item.appLink && (
              <Link href={item.appLink}>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                  <ArrowRight className="h-3 w-3" />
                  {item.appLinkLabel ?? "Open in ExitPlan"}
                </Button>
              </Link>
            )}
            <Button
              size="sm"
              variant={completed ? "outline" : "default"}
              className="h-7 text-xs"
              onClick={() => onToggle(!completed)}
            >
              {completed ? "Mark as not done" : "Mark as done"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseSection({
  phase,
  completedIds,
  onToggle,
}: {
  phase: ChecklistPhase;
  completedIds: Set<string>;
  onToggle: (itemId: string, completed: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const completedCount = phase.items.filter((i) => completedIds.has(i.id)).length;
  const total = phase.items.length;
  const pct = total > 0 ? (completedCount / total) * 100 : 0;
  const allDone = completedCount === total;

  return (
    <div className={cn("rounded-2xl border overflow-hidden", phase.borderColor)}>
      {/* Phase header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className={cn(
          "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/30",
          phase.bg
        )}
      >
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-sm", phase.bg, phase.color)}>
          {allDone ? <CheckCircle2 className="h-5 w-5" /> : phase.number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className={cn("text-sm font-semibold", phase.color)}>{phase.title}</p>
            <span className="text-xs text-muted-foreground">
              {completedCount}/{total}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{phase.subtitle}</p>
          <ProgressBar value={pct} className="mt-2 h-1.5" />
        </div>
        {collapsed ? (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="p-3 space-y-2 bg-card">
          {phase.items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              completed={completedIds.has(item.id)}
              onToggle={(c) => onToggle(item.id, c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdultingChecklistPage() {
  const { data: completedIdsArray = [], isLoading } = useChecklistProgress();
  const completedIds = useMemo(() => new Set(Array.isArray(completedIdsArray) ? completedIdsArray : []), [completedIdsArray]);
  const toggle = useToggleChecklistItem();

  const completedCount = completedIds.size;
  const overallPct = TOTAL_ITEMS > 0 ? (completedCount / TOTAL_ITEMS) * 100 : 0;

  function handleToggle(itemId: string, completed: boolean) {
    toggle.mutate({ itemId, completed });
  }

  const milestoneLabel =
    overallPct === 100
      ? "You're fully set up! 🎉"
      : overallPct >= 75
        ? "Almost there — finishing strong!"
        : overallPct >= 50
          ? "Halfway through — great progress!"
          : overallPct >= 25
            ? "Good start — keep going!"
            : "Let's get you set up properly.";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Back */}
      <Link
        href="/adulting"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Adulting Hub
      </Link>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-500/10">
          <BookOpen className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Filipino Adulting Checklist</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            A step-by-step guide to getting your life properly set up in the Philippines.
          </p>
        </div>
      </div>

      {/* Overall progress */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{milestoneLabel}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {TOTAL_ITEMS} completed
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{Math.round(overallPct)}%</p>
            <p className="text-xs text-muted-foreground">done</p>
          </div>
        </div>
        <ProgressBar value={overallPct} className="h-3" />
        {/* Priority legend */}
        <div className="flex items-center gap-3 flex-wrap pt-1">
          {Object.entries(PRIORITY_META).map(([key, meta]) => (
            <div key={key} className="flex items-center gap-1">
              <span className={cn("h-2 w-2 rounded-full", meta.bg.replace("/10", ""))} />
              <span className="text-[10px] text-muted-foreground">{meta.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 ml-auto">
            <Flag className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Click any item to expand details</span>
          </div>
        </div>
      </div>

      {/* Phase list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {CHECKLIST_PHASES.map((phase) => (
            <PhaseSection
              key={phase.id}
              phase={phase}
              completedIds={completedIds}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Bottom tip */}
      <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Remember:</span> You don&apos;t need to do everything at once. Start with Phase 1 (Government IDs) — your TIN, SSS, PhilHealth, and Pag-IBIG numbers are the foundation of your financial life in the Philippines. Everything else builds on top of those.
        </p>
      </div>
    </div>
  );
}

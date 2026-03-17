"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Banknote,
  FileText,
  Lightbulb,
  ExternalLink,
  ListChecks,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_ITEMS, PRIORITY_META, type ChecklistItem } from "@/lib/adulting-checklist-data";
import { LIFE_STAGES } from "@/lib/guide";
import { useChecklistProgress, useToggleChecklistItem } from "@/hooks/use-adulting-checklist";
import { cn } from "@/lib/utils";

export default function ChecklistItemPage({ params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = use(params);
  const item = ALL_ITEMS.find((i) => i.id === itemId);
  if (!item) notFound();

  const { data: completedIds = [] } = useChecklistProgress();
  const toggleItem = useToggleChecklistItem();
  const isCompleted = completedIds.includes(item.id);
  const priority = PRIORITY_META[item.priority];

  // Find which life stage this item belongs to
  const parentStage = LIFE_STAGES.find((s) => s.checklistItemIds.includes(itemId));
  const backHref = parentStage ? `/guide/${parentStage.slug}` : "/guide";
  const backLabel = parentStage ? parentStage.title : "Journey";

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to {backLabel}
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => toggleItem.mutate({ itemId: item.id, completed: !isCompleted })}
            className="mt-1 shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground/40" />
            )}
          </button>
          <div className="space-y-1.5">
            <h1 className={cn("text-2xl font-bold tracking-tight", isCompleted && "line-through text-muted-foreground")}>
              {item.title}
            </h1>
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full", priority.bg, priority.color)}>
              {priority.label}
            </span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
      </div>

      {/* Why this matters */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-5 pb-5">
          <p className="text-xs font-semibold text-primary mb-1.5">Why this matters</p>
          <p className="text-sm leading-relaxed">{item.why}</p>
        </CardContent>
      </Card>

      {/* Requirements */}
      {item.requirements && item.requirements.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              What to Prepare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                    {i + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Step-by-step process */}
      {item.steps && item.steps.length > 0 ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              Step-by-Step Process
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {item.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="shrink-0 mt-0.5 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      ) : (
        /* Fallback: show the "how" field if no steps array */
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-muted-foreground" />
              How to Do It
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{item.how}</p>
          </CardContent>
        </Card>
      )}

      {/* Fees & Processing Time */}
      {(item.fees || item.processingTime) && (
        <div className="grid grid-cols-2 gap-3">
          {item.fees && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Fees</p>
                </div>
                <p className="text-sm font-semibold">{item.fees}</p>
              </CardContent>
            </Card>
          )}
          {item.processingTime && (
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                </div>
                <p className="text-sm font-semibold">{item.processingTime}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Tips */}
      {item.tips && item.tips.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* App link */}
      {item.appLink && (
        <Link href={item.appLink}>
          <Card className="hover:border-primary/40 transition-colors group cursor-pointer">
            <CardContent className="pt-4 pb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{item.appLinkLabel ?? "Open Tool"}</p>
                <p className="text-xs text-muted-foreground">Track your progress in-app</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* References */}
      {item.references && item.references.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Official References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {item.references.map((ref, i) => (
                <li key={i}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    {ref.label}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Mark as done */}
      <div className="sticky bottom-4 pt-4">
        <Button
          onClick={() => toggleItem.mutate({ itemId: item.id, completed: !isCompleted })}
          className="w-full"
          size="lg"
          variant={isCompleted ? "outline" : "default"}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed — Tap to Undo
            </>
          ) : (
            <>
              <Circle className="h-4 w-4 mr-2" />
              Mark as Done
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

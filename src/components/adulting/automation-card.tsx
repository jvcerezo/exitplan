"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Zap, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AutomationCardProps {
  /** Unique key for persisting toggle state in localStorage */
  storageKey: string;
  /** Title of the automation */
  title: string;
  /** Description of what happens when enabled */
  description: string;
  /** What the automation does, shown as bullet points */
  features: string[];
  /** Whether this automation requires setup (e.g., due day must be set) */
  requiresSetup?: boolean;
  /** Message shown when setup is missing */
  setupMessage?: string;
  /** Called when the toggle state changes */
  onToggle?: (enabled: boolean) => void;
  /** Default state */
  defaultEnabled?: boolean;
}

export function AutomationCard({
  storageKey,
  title,
  description,
  features,
  requiresSetup = false,
  setupMessage,
  onToggle,
  defaultEnabled = true,
}: AutomationCardProps) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setEnabled(stored !== null ? stored === "1" : defaultEnabled);
  }, [storageKey, defaultEnabled]);

  if (enabled === null) return null;

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
    onToggle?.(next);
  }

  return (
    <Card className={cn(
      "rounded-2xl border transition-colors",
      enabled ? "border-primary/20 bg-primary/5" : "border-border/60"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn(
              "shrink-0 h-9 w-9 rounded-lg flex items-center justify-center mt-0.5",
              enabled ? "bg-primary/10" : "bg-muted"
            )}>
              <Zap className={cn("h-4 w-4", enabled ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            </div>
          </div>

          {/* Toggle button */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={requiresSetup}
            className={cn(
              "shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
              enabled
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80",
              requiresSetup && "opacity-50 cursor-not-allowed"
            )}
          >
            {enabled ? (
              <><Bell className="h-3 w-3" /> On</>
            ) : (
              <><BellOff className="h-3 w-3" /> Off</>
            )}
          </button>
        </div>

        {/* Features list */}
        {enabled && (
          <div className="mt-3 ml-12 space-y-1.5">
            {features.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        )}

        {/* Setup required message */}
        {requiresSetup && setupMessage && (
          <div className="mt-3 ml-12 flex items-start gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            <span>{setupMessage}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

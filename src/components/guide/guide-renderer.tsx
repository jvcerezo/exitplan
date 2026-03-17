"use client";

import { Info, Lightbulb, AlertTriangle, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GuideSection } from "@/lib/guide/types";

const CALLOUT_STYLES = {
  tip: {
    border: "border-l-green-500",
    bg: "bg-green-50 dark:bg-green-950/30",
    icon: Lightbulb,
    iconColor: "text-green-600 dark:text-green-400",
    label: "Tip",
  },
  warning: {
    border: "border-l-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: AlertTriangle,
    iconColor: "text-amber-600 dark:text-amber-400",
    label: "Warning",
  },
  info: {
    border: "border-l-slate-500",
    bg: "bg-slate-50 dark:bg-slate-950/30",
    icon: Info,
    iconColor: "text-slate-600 dark:text-slate-400",
    label: "Note",
  },
  "ph-law": {
    border: "border-l-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: Scale,
    iconColor: "text-blue-600 dark:text-blue-400",
    label: "Philippine Law",
  },
};

interface GuideRendererProps {
  sections: GuideSection[];
}

export function GuideRenderer({ sections }: GuideRendererProps) {
  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <section key={i} className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">{section.heading}</h2>

          <p className="text-sm leading-relaxed text-foreground/90">{section.content}</p>

          {section.items && section.items.length > 0 && (
            <ul className="space-y-2 pl-1">
              {section.items.map((item, j) => (
                <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-foreground/85">
                  <span className="shrink-0 mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}

          {section.callout && (
            <Callout type={section.callout.type} text={section.callout.text} />
          )}
        </section>
      ))}
    </div>
  );
}

function Callout({ type, text }: { type: keyof typeof CALLOUT_STYLES; text: string }) {
  const style = CALLOUT_STYLES[type];
  const Icon = style.icon;

  return (
    <div className={cn("border-l-4 rounded-r-xl px-4 py-3", style.border, style.bg)}>
      <div className="flex items-start gap-2.5">
        <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", style.iconColor)} />
        <div>
          <p className={cn("text-[10px] font-bold uppercase tracking-wider mb-1", style.iconColor)}>
            {style.label}
          </p>
          <p className="text-sm leading-relaxed text-foreground/85">{text}</p>
        </div>
      </div>
    </div>
  );
}

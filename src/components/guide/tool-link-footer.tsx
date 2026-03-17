"use client";

import Link from "next/link";
import { Wrench } from "lucide-react";
import type { ToolLink } from "@/lib/guide/types";

interface ToolLinkFooterProps {
  toolLinks: ToolLink[];
}

export function ToolLinkFooter({ toolLinks }: ToolLinkFooterProps) {
  if (toolLinks.length === 0) return null;

  const primary = toolLinks[0];

  return (
    <div className="sticky bottom-0 md:relative z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/40 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:pb-3 md:border-t-0 md:bg-transparent md:backdrop-blur-none md:px-0 md:mt-6">
      <div className="flex gap-2">
        <Link
          href={primary.href}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-3 text-sm font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
        >
          <Wrench className="h-4 w-4" />
          {primary.label}
        </Link>
        {toolLinks.length > 1 && (
          <Link
            href={toolLinks[1].href}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors min-h-[44px]"
          >
            {toolLinks[1].label}
          </Link>
        )}
      </div>
    </div>
  );
}

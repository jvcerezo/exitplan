"use client";

import { ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useScrollDirection } from "@/hooks/use-scroll-direction";
import { cn } from "@/lib/utils";

interface GuideHeaderProps {
  readTimeMinutes: number;
  stageSlug: string;
}

export function GuideHeader({ readTimeMinutes, stageSlug }: GuideHeaderProps) {
  const router = useRouter();
  const scrollDir = useScrollDirection();

  return (
    <header
      className={cn(
        "md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-12 px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40 transition-transform duration-300",
        "pt-[env(safe-area-inset-top)]",
        scrollDir === "down" ? "-translate-y-full" : "translate-y-0"
      )}
    >
      <button
        onClick={() => router.push(`/guide/${stageSlug}`)}
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {readTimeMinutes} min
      </div>
    </header>
  );
}

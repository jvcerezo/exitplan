"use client";

import { use, useCallback } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { GuideRenderer } from "@/components/guide/guide-renderer";
import { ReadingProgressBar } from "@/components/guide/reading-progress-bar";
import { GuideHeader } from "@/components/guide/guide-header";
import { ToolLinkFooter } from "@/components/guide/tool-link-footer";
import { getGuideBySlug, getAdjacentGuides } from "@/lib/guide";
import { isGuideRead, markGuideRead, markGuideUnread } from "@/hooks/use-guide-progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export default function GuideArticlePage({
  params,
}: {
  params: Promise<{ stageSlug: string; guideSlug: string }>;
}) {
  const { stageSlug, guideSlug } = use(params);
  const guide = getGuideBySlug(stageSlug, guideSlug);
  if (!guide) notFound();

  const { prev, next } = getAdjacentGuides(stageSlug, guideSlug);
  const [read, setRead] = useState(() => isGuideRead(guideSlug));

  const toggleRead = useCallback(() => {
    if (read) {
      markGuideUnread(guideSlug);
      setRead(false);
    } else {
      markGuideRead(guideSlug);
      setRead(true);
    }
  }, [read, guideSlug]);

  return (
    <>
      {/* Mobile immersive reading experience */}
      <ReadingProgressBar />
      <GuideHeader readTimeMinutes={guide.readTimeMinutes} stageSlug={stageSlug} />

      <div className="md:max-w-2xl md:mx-auto">
        {/* Desktop back link */}
        <Link
          href={`/guide/${stageSlug}`}
          className="hidden md:inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to stage
        </Link>

        {/* Title */}
        <div className="mt-2 md:mt-0 mb-8">
          <h1 className="text-2xl font-bold tracking-tight">{guide.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{guide.description}</p>
        </div>

        {/* Article content */}
        <GuideRenderer sections={guide.sections} />

        {/* Mark as read / complete */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <Button
            variant={read ? "outline" : "default"}
            className="w-full max-w-xs"
            onClick={toggleRead}
          >
            <Check className={cn("h-4 w-4 mr-2", read && "text-green-500")} />
            {read ? "Marked as Complete" : "Mark as Complete"}
          </Button>
        </div>

        {/* Navigate prev/next */}
        <div className="mt-6 mb-4 flex items-center justify-between gap-4">
          {prev ? (
            <Link
              href={`/guide/${stageSlug}/${prev.slug}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[44px]"
            >
              <ArrowLeft className="h-3 w-3" />
              <span className="line-clamp-1">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/guide/${stageSlug}/${next.slug}`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors text-right min-h-[44px]"
            >
              <span className="line-clamp-1">{next.title}</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          ) : (
            <span />
          )}
        </div>

        {/* Tool links */}
        <ToolLinkFooter toolLinks={guide.toolLinks} />
      </div>
    </>
  );
}

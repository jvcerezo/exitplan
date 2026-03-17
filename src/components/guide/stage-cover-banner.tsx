"use client";

import { cn } from "@/lib/utils";
import type { LifeStage } from "@/lib/guide/types";

const GRADIENT_FALLBACKS: Record<string, string> = {
  "unang-hakbang": "from-blue-600 via-blue-500 to-sky-400",
  pundasyon: "from-emerald-600 via-emerald-500 to-teal-400",
  tahanan: "from-violet-600 via-violet-500 to-purple-400",
  tugatog: "from-amber-600 via-amber-500 to-yellow-400",
  paghahanda: "from-rose-600 via-rose-500 to-pink-400",
  "gintong-taon": "from-yellow-600 via-yellow-500 to-orange-400",
};

interface StageCoverBannerProps {
  stage: LifeStage;
  size?: "sm" | "lg";
}

export function StageCoverBanner({ stage, size = "lg" }: StageCoverBannerProps) {
  const gradient = GRADIENT_FALLBACKS[stage.slug] ?? "from-primary to-primary/80";
  const heightClass = size === "lg" ? "h-48 sm:h-56" : "h-32 sm:h-40";

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl", heightClass)}>
      {/* Gradient fallback (always rendered) */}
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

      {/* Cover image (overlays gradient when loaded) */}
      <img
        src={stage.coverImage}
        alt={stage.coverAlt}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        onError={(e) => {
          // Hide broken image, show gradient fallback
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content overlay */}
      <div className="relative h-full flex flex-col justify-end p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stage.title}
          </h2>
          <p className="text-sm text-white/80 font-medium">{stage.subtitle}</p>
        </div>
      </div>

      {/* Photo credit */}
      <p className="absolute bottom-1.5 right-3 text-[9px] text-white/40">
        {stage.coverCredit}
      </p>
    </div>
  );
}

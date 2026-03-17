"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  Blocks,
  Home,
  TrendingUp,
  Shield,
  Sun,
  Check,
} from "lucide-react";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { LIFE_STAGES } from "@/lib/guide";
import { cn } from "@/lib/utils";
import type { LifeStage } from "@/lib/guide/types";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap, Blocks, Home, TrendingUp, Shield, Sun,
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: "easeOut" as const } },
};

// Alignment pattern — strong zigzag: left, right, left, right, left, right
const ALIGNMENTS: ("left" | "center" | "right")[] = [
  "left", "right", "left", "right", "left", "right",
];

export function JourneyMap() {
  const { stages, currentStageIndex, isLoading } = useGuideProgress();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-12 py-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[72px] w-[72px] rounded-full bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="relative w-full py-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col gap-0">
        {LIFE_STAGES.map((stage, index) => {
          const stageProgress = stages.find((s) => s.slug === stage.slug);
          const percentage = stageProgress?.percentage ?? 0;
          const isLast = index === LIFE_STAGES.length - 1;
          const align = ALIGNMENTS[index];
          const nextAlign = ALIGNMENTS[index + 1];

          return (
            <motion.div key={stage.slug} variants={nodeVariants}>
              {/* Node row */}
              <div className={cn(
                "flex",
                align === "left" && "justify-start pl-4 sm:pl-12",
                align === "center" && "justify-center",
                align === "right" && "justify-end pr-4 sm:pr-12",
              )}>
                <PathNode
                  stage={stage}
                  isCurrent={index === currentStageIndex}
                  isCompleted={percentage >= 100}
                  percentage={percentage}
                  completedCount={stageProgress?.completedChecklist ?? 0}
                  totalCount={stageProgress?.totalChecklist ?? 0}
                />
              </div>

              {/* Connector to next node */}
              {!isLast && (
                <ConnectorCurve
                  from={align}
                  to={nextAlign ?? "left"}
                  isCompleted={index < currentStageIndex}
                  isCurrent={index === currentStageIndex}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

/** Curved SVG connector between two horizontally-offset nodes */
function ConnectorCurve({
  from,
  to,
  isCompleted,
  isCurrent,
}: {
  from: "left" | "center" | "right";
  to: "left" | "center" | "right";
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  const xMap = { left: 18, center: 50, right: 82 };
  const x1 = xMap[from];
  const x2 = xMap[to];

  // S-curve control points
  const cpY1 = 18;
  const cpY2 = 32;

  return (
    <div className="w-full h-12 sm:h-14 relative">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d={`M ${x1} 0 C ${x1} ${cpY1}, ${x2} ${cpY2}, ${x2} 50`}
          strokeWidth="0.7"
          vectorEffect="non-scaling-stroke"
          strokeDasharray={isCompleted ? "none" : "6 5"}
          className={cn(
            isCompleted
              ? "stroke-primary"
              : isCurrent
                ? "stroke-primary/50"
                : "stroke-muted-foreground/20"
          )}
        />
      </svg>
    </div>
  );
}

function PathNode({
  stage,
  isCurrent,
  isCompleted,
  percentage,
  completedCount,
  totalCount,
}: {
  stage: LifeStage;
  isCurrent: boolean;
  isCompleted: boolean;
  percentage: number;
  completedCount: number;
  totalCount: number;
}) {
  const Icon = ICON_MAP[stage.icon] ?? GraduationCap;
  const nodeSize = isCurrent ? 76 : 64;
  const r = (nodeSize - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dashOff = circ - (percentage / 100) * circ;

  return (
    <Link
      href={`/guide/${stage.slug}`}
      className="flex flex-col items-center gap-2 group"
    >
      <div className="relative" style={{ width: nodeSize, height: nodeSize }}>
        {/* Progress ring */}
        <svg className="absolute inset-0 -rotate-90" width={nodeSize} height={nodeSize}>
          <circle cx={nodeSize / 2} cy={nodeSize / 2} r={r} fill="none" strokeWidth="3" className="stroke-muted/40" />
          {percentage > 0 && (
            <circle
              cx={nodeSize / 2} cy={nodeSize / 2} r={r}
              fill="none" strokeWidth="3" strokeLinecap="round"
              className={isCompleted ? "stroke-green-500" : "stroke-primary"}
              strokeDasharray={circ} strokeDashoffset={dashOff}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          )}
        </svg>

        {/* Inner circle */}
        <div className={cn(
          "absolute inset-[5px] rounded-full flex items-center justify-center transition-all",
          isCompleted
            ? "bg-green-500 text-white"
            : isCurrent
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-border text-muted-foreground group-hover:border-primary/40"
        )}>
          {isCompleted
            ? <Check className="h-5 w-5" strokeWidth={2.5} />
            : <Icon className={cn(isCurrent ? "h-6 w-6" : "h-5 w-5")} />
          }
        </div>

        {/* Pulse for current */}
        {isCurrent && (
          <div className="absolute inset-[-2px] rounded-full border-2 border-primary/30 animate-pulse" />
        )}
      </div>

      {/* Label */}
      <div className="text-center max-w-[130px]">
        <p className={cn(
          "text-[13px] font-bold leading-tight",
          isCompleted ? "text-green-600 dark:text-green-400" : isCurrent ? "text-foreground" : "text-muted-foreground"
        )}>
          {stage.title}
        </p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{stage.subtitle}</p>
        <p className={cn(
          "text-[10px] font-semibold mt-0.5",
          isCompleted ? "text-green-600 dark:text-green-400" : isCurrent ? "text-primary" : "text-muted-foreground/40"
        )}>
          {isCompleted ? "Complete!" : `${completedCount}/${totalCount}`}
        </p>
      </div>
    </Link>
  );
}

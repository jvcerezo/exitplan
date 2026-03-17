"use client";

import { motion } from "framer-motion";
import { StageNode } from "./stage-node";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { LIFE_STAGES } from "@/lib/guide";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const nodeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function JourneyMap() {
  const { stages, currentStageIndex, isLoading } = useGuideProgress();

  if (isLoading) {
    return (
      <div className="space-y-6 py-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted animate-pulse shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Vertical connecting line */}
      <div className="absolute left-8 md:left-8 top-10 bottom-10 w-px border-l-2 border-dashed border-border/60" />

      <div className="space-y-2">
        {LIFE_STAGES.map((stage, index) => {
          const stageProgress = stages.find((s) => s.slug === stage.slug);
          return (
            <motion.div key={stage.slug} variants={nodeVariants}>
              <StageNode
                stage={stage}
                index={index}
                isCurrent={index === currentStageIndex}
                percentage={stageProgress?.percentage ?? 0}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

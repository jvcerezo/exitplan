export type LifeStageSlug =
  | "unang-hakbang"
  | "pundasyon"
  | "tahanan"
  | "tugatog"
  | "paghahanda"
  | "gintong-taon";

export interface LifeStage {
  slug: LifeStageSlug;
  title: string;
  subtitle: string;
  ageRange: string;
  description: string;
  color: string;
  bg: string;
  borderColor: string;
  icon: string;
  guides: Guide[];
  checklistItemIds: string[];
}

export type GuideCategory =
  | "financial-literacy"
  | "government"
  | "career"
  | "housing"
  | "insurance"
  | "investing"
  | "family"
  | "health"
  | "retirement";

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  readTimeMinutes: number;
  toolLinks: ToolLink[];
  sections: GuideSection[];
}

export interface GuideSection {
  heading: string;
  content: string;
  callout?: {
    type: "tip" | "warning" | "info" | "ph-law";
    text: string;
  };
  items?: string[];
}

export interface ToolLink {
  href: string;
  label: string;
}

export interface NextStepCard {
  id: string;
  type: "checklist" | "tool-reminder" | "guide-suggestion";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  icon: string;
  priority: number;
}

export interface AdultingScoreResult {
  total: number;
  level: string;
  subScores: {
    label: string;
    score: number;
    detail: string;
  }[];
}

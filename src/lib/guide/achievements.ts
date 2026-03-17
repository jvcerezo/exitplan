import { CHECKLIST_PHASES } from "@/lib/adulting-checklist-data";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  condition: (completedIds: Set<string>) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-id",
    title: "First ID",
    description: "Completed your first government ID step",
    icon: "BadgeCheck",
    condition: (completed) => {
      const idItems = ["tin", "sss", "philhealth", "pagibig", "philsys", "umid", "passport", "drivers-license", "voters-id"];
      return idItems.some((id) => completed.has(id));
    },
  },
  {
    id: "all-ids",
    title: "Fully Documented",
    description: "Completed all government ID registrations",
    icon: "ShieldCheck",
    condition: (completed) => {
      const criticalIds = ["tin", "sss", "philhealth", "pagibig", "philsys"];
      return criticalIds.every((id) => completed.has(id));
    },
  },
  {
    id: "safety-net",
    title: "Safety Net",
    description: "Started building your emergency fund",
    icon: "Shield",
    condition: (completed) => completed.has("emergency-fund-3mo"),
  },
  {
    id: "tax-compliant",
    title: "Tax Compliant",
    description: "Completed all tax compliance steps",
    icon: "FileCheck",
    condition: (completed) => {
      const taxItems = CHECKLIST_PHASES.find((p) => p.id === "tax")?.items.map((i) => i.id) ?? [];
      return taxItems.length > 0 && taxItems.every((id) => completed.has(id));
    },
  },
  {
    id: "protected",
    title: "Protected",
    description: "Completed all insurance & protection steps",
    icon: "Heart",
    condition: (completed) => {
      const insuranceItems = CHECKLIST_PHASES.find((p) => p.id === "insurance")?.items.map((i) => i.id) ?? [];
      return insuranceItems.length > 0 && insuranceItems.every((id) => completed.has(id));
    },
  },
  {
    id: "first-investment",
    title: "Investor",
    description: "Started your first investment",
    icon: "TrendingUp",
    condition: (completed) => {
      const investItems = ["mp2", "uitf", "stocks-pse"];
      return investItems.some((id) => completed.has(id));
    },
  },
  {
    id: "contributions-verified",
    title: "Contributions Verified",
    description: "Verified all government contributions are current",
    icon: "CheckCircle2",
    condition: (completed) => {
      return ["sss-active", "philhealth-active", "pagibig-active"].every((id) => completed.has(id));
    },
  },
  {
    id: "estate-planned",
    title: "Legacy Planner",
    description: "Started your estate planning journey",
    icon: "Scroll",
    condition: (completed) => completed.has("beneficiaries") || completed.has("will"),
  },
  {
    id: "halfway",
    title: "Halfway There",
    description: "Completed 50% of all adulting checklist items",
    icon: "Milestone",
    condition: (completed) => {
      const totalItems = CHECKLIST_PHASES.reduce((sum, p) => sum + p.items.length, 0);
      return completed.size >= Math.ceil(totalItems / 2);
    },
  },
  {
    id: "adulting-pro",
    title: "Adulting Pro",
    description: "Completed all adulting checklist items",
    icon: "Trophy",
    condition: (completed) => {
      const totalItems = CHECKLIST_PHASES.reduce((sum, p) => sum + p.items.length, 0);
      return completed.size >= totalItems;
    },
  },
];

const UNLOCKED_KEY = "exitplan-achievements";

export function getUnlockedAchievements(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(UNLOCKED_KEY);
    return stored ? new Set(JSON.parse(stored)) : new Set();
  } catch {
    return new Set();
  }
}

export function saveUnlockedAchievements(ids: Set<string>) {
  localStorage.setItem(UNLOCKED_KEY, JSON.stringify(Array.from(ids)));
}

export function checkNewAchievements(completedChecklistIds: string[]): Achievement[] {
  const completedSet = new Set(completedChecklistIds);
  const unlocked = getUnlockedAchievements();
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlocked.has(achievement.id) && achievement.condition(completedSet)) {
      newlyUnlocked.push(achievement);
      unlocked.add(achievement.id);
    }
  }

  if (newlyUnlocked.length > 0) {
    saveUnlockedAchievements(unlocked);
  }

  return newlyUnlocked;
}

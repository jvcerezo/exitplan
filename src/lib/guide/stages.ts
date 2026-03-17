import type { LifeStage } from "./types";
import { UNANG_HAKBANG_GUIDES } from "./content/unang-hakbang";
import { PUNDASYON_GUIDES } from "./content/pundasyon";
import { TAHANAN_GUIDES } from "./content/tahanan";
import { TUGATOG_GUIDES } from "./content/tugatog";
import { PAGHAHANDA_GUIDES } from "./content/paghahanda";
import { GINTONG_TAON_GUIDES } from "./content/gintong-taon";

export const LIFE_STAGES: LifeStage[] = [
  {
    slug: "unang-hakbang",
    title: "Unang Hakbang",
    subtitle: "First Steps",
    ageRange: "18–22",
    description:
      "Your first job, first IDs, first payslip. Everything you need to start adulting in the Philippines.",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    icon: "GraduationCap",
    coverImage: "/images/stages/unang-hakbang.jpg",
    coverAlt: "Graduation caps thrown in the air against a bright sky",
    coverCredit: "Photo by Unsplash",
    guides: UNANG_HAKBANG_GUIDES,
    checklistItemIds: [
      "tin",
      "sss",
      "philhealth",
      "pagibig",
      "philsys",
      "umid",
      "passport",
      "drivers-license",
      "voters-id",
      "first-time-jobseeker",
      "savings-account",
      "understand-payslip",
    ],
  },
  {
    slug: "pundasyon",
    title: "Pundasyon",
    subtitle: "Building the Foundation",
    ageRange: "23–28",
    description:
      "Emergency fund, first investments, credit building, and freelancer taxes. Build the financial habits that last a lifetime.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    icon: "Blocks",
    coverImage: "/images/stages/pundasyon.jpg",
    coverAlt: "Financial planning workspace with calculator, charts and notebook",
    coverCredit: "Photo by Towfiqu barbhuiya on Unsplash",
    guides: PUNDASYON_GUIDES,
    checklistItemIds: [
      "digital-savings",
      "emergency-fund-3mo",
      "credit-card",
      "sss-active",
      "philhealth-active",
      "pagibig-active",
      "13th-month",
      "bir-2316",
      "substituted-filing",
      "bir-freelancer",
      "bir-deductions",
    ],
  },
  {
    slug: "tahanan",
    title: "Tahanan",
    subtitle: "Establishing a Home",
    ageRange: "29–35",
    description:
      "Marriage, homeownership, insurance, and starting a family. The decisions that shape your next decades.",
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
    borderColor: "border-violet-500/30",
    icon: "Home",
    coverImage: "/images/stages/tahanan.jpg",
    coverAlt: "Couple holding keys to their new home",
    coverCredit: "Photo by Tierra Mallorca on Unsplash",
    guides: TAHANAN_GUIDES,
    checklistItemIds: [
      "philhealth-benefits",
      "hmo",
      "life-insurance",
      "ctpl",
      "emergency-fund-6mo",
    ],
  },
  {
    slug: "tugatog",
    title: "Tugatog",
    subtitle: "Career Peak",
    ageRange: "36–45",
    description:
      "Peak earning years. Build wealth, diversify investments, and secure your children's future.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    icon: "TrendingUp",
    coverImage: "/images/stages/tugatog.jpg",
    coverAlt: "Modern glass skyscrapers reaching toward the sky, symbolizing career peak",
    coverCredit: "Photo by Sean Pollock on Unsplash",
    guides: TUGATOG_GUIDES,
    checklistItemIds: [
      "mp2",
      "uitf",
      "stocks-pse",
      "sss-voluntary",
    ],
  },
  {
    slug: "paghahanda",
    title: "Paghahanda",
    subtitle: "Preparing for the Future",
    ageRange: "46–55",
    description:
      "Retirement planning, estate planning, and managing the sandwich generation. Prepare for what's ahead.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    borderColor: "border-rose-500/30",
    icon: "Shield",
    coverImage: "/images/stages/paghahanda.jpg",
    coverAlt: "Documents and pen on a desk symbolizing planning and preparation",
    coverCredit: "Photo by Scott Graham on Unsplash",
    guides: PAGHAHANDA_GUIDES,
    checklistItemIds: [
      "beneficiaries",
      "will",
      "estate-tax",
    ],
  },
  {
    slug: "gintong-taon",
    title: "Gintong Taon",
    subtitle: "Golden Years",
    ageRange: "56+",
    description:
      "Retirement, senior citizen benefits, healthcare, and passing wealth to the next generation.",
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30",
    icon: "Sun",
    coverImage: "/images/stages/gintong-taon.jpg",
    coverAlt: "Peaceful sunrise meditation scene symbolizing golden years of rest",
    coverCredit: "Photo by Jared Rice on Unsplash",
    guides: GINTONG_TAON_GUIDES,
    checklistItemIds: [],
  },
];

export function getStageBySlug(slug: string) {
  return LIFE_STAGES.find((s) => s.slug === slug);
}

export function getGuideBySlug(stageSlug: string, guideSlug: string) {
  const stage = getStageBySlug(stageSlug);
  if (!stage) return null;
  return stage.guides.find((g) => g.slug === guideSlug) ?? null;
}

export function getAdjacentGuides(stageSlug: string, guideSlug: string) {
  const stage = getStageBySlug(stageSlug);
  if (!stage) return { prev: null, next: null };
  const idx = stage.guides.findIndex((g) => g.slug === guideSlug);
  return {
    prev: idx > 0 ? stage.guides[idx - 1] : null,
    next: idx < stage.guides.length - 1 ? stage.guides[idx + 1] : null,
  };
}

import type { Metadata } from "next";

function normalizeSiteUrl(value: string) {
  if (!value) {
    return "https://sandalan.app";
  }

  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

export const siteConfig = {
  name: "Sandalan",
  title: "Sandalan — Your Adulting Companion",
  description:
    "Track expenses, set budgets, build savings goals, and navigate adulting with confidence using Sandalan.",
  shortDescription: "Track your finances. Plan your freedom.",
  url: normalizeSiteUrl(
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "https://sandalan.app"
  ),
  locale: "en_PH",
  language: "en-PH",
  creator: "Sandalan",
  keywords: [
    "personal finance app philippines",
    "budget tracker philippines",
    "expense tracker",
    "financial freedom tracker",
    "savings goals app",
    "money management app",
    "budgeting app filipinos",
    "net worth tracker",
    "cash flow tracker",
    "goal based budgeting",
  ],
};

export function absoluteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, siteConfig.url).toString();
}

export function buildPageMetadata({
  title,
  description,
  path = "/",
  index = true,
}: {
  title: string;
  description: string;
  path?: string;
  index?: boolean;
}): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    robots: {
      index,
      follow: index,
      googleBot: {
        index,
        follow: index,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: absoluteUrl("/opengraph-image"),
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} preview image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/twitter-image")],
    },
  };
}

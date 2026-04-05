import type { Metadata } from "next";
import Script from "next/script";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";
import { LandingContent } from "@/components/landing/landing-content";

export const metadata: Metadata = buildPageMetadata({
  title: "Sandalan — Your Adulting Companion",
  description:
    "Sandalan guides you through every stage of Filipino adult life — from getting your first IDs to retirement. Track finances, manage contributions, and follow step-by-step adulting guides.",
  path: "/",
  index: true,
});

const landingStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Sandalan — Your Adulting Companion",
  url: siteConfig.url,
  description: siteConfig.description,
  isPartOf: {
    "@id": `${siteConfig.url}#website`,
  },
  about: {
    "@type": "Thing",
    name: "Filipino adulting guide, personal finance tracking, government contributions, and life stage planning",
  },
  primaryImageOfPage: absoluteUrl("/app-icon.svg"),
};

export default function LandingPage() {
  return (
    <>
      <Script
        id="landing-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingStructuredData) }}
      />
      <LandingContent />
    </>
  );
}

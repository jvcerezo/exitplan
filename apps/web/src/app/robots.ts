import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/favicon.ico", "/icon", "/apple-icon", "/manifest.json", "/app-icon.svg"],
        disallow: [
          "/dashboard",
          "/accounts",
          "/budgets",
          "/goals",
          "/transactions",
          "/settings",
          "/offline",
          "/login",
          "/signup",
          "/onboarding",
          "/auth",
          "/admin",
          "/api",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}

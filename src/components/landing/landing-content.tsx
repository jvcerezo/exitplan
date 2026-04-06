"use client";

import Link from "next/link";
import {
  Wallet,
  BarChart3,
  BookOpen,
  Building2,
  Shield,
  Map,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.jvcerezo.exitplan";

const features = [
  {
    icon: Wallet,
    title: "Track Every Peso",
    desc: "Log expenses in two taps. Auto-categories for Jollibee, Grab, Meralco, and 500+ Filipino merchants.",
  },
  {
    icon: Map,
    title: "Adulting Roadmap",
    desc: "Six life stages — from first IDs to retirement. Step-by-step checklists with real processes and current fees.",
  },
  {
    icon: Building2,
    title: "Gov't Contributions",
    desc: "SSS, PhilHealth, Pag-IBIG calculators. Know exactly what you owe and what your employer should be paying.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Monthly report cards graded A-F. See where your money goes, your savings rate, and how you compare.",
  },
  {
    icon: BookOpen,
    title: "AI Chat in Taglish",
    desc: '"Magkano gastos ko this week?" — ask anything about your finances in the language you actually speak.',
  },
  {
    icon: Shield,
    title: "Private & Offline-First",
    desc: "Works without internet. No ads, no trackers. Your data stays on your phone unless you choose to sync.",
  },
];

const screenshots = [
  { src: "/images/screenshots/store-1-home.png", alt: "Home screen" },
  { src: "/images/screenshots/store-2-dashboard.png", alt: "Dashboard" },
  { src: "/images/screenshots/store-4-guide.png", alt: "Adulting guide" },
  { src: "/images/screenshots/store-3-chat.png", alt: "AI chat" },
];

export function LandingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight"
          >
            <BrandMark className="h-9 w-9" />
            <span>
              Sandal<span className="text-primary">an</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Download
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col items-center pt-20 pb-16 text-center sm:pt-28 sm:pb-20 lg:pt-36 lg:pb-24">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Your <span className="text-primary">Adulting</span> Companion
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
            Budget tracker, expense manager, and adulting guide. From your first
            payslip to retirement.
          </p>

          {/* Store badges */}
          <div className="mt-10 flex items-center gap-3">
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-foreground px-5 text-background transition-opacity hover:opacity-90"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-current"
                aria-hidden="true"
              >
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
              </svg>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  Get it on
                </span>
                <span className="-mt-0.5 text-[17px] font-semibold">
                  Google Play
                </span>
              </div>
            </a>

            <div
              aria-label="iOS coming soon"
              className="inline-flex h-[52px] cursor-not-allowed items-center gap-3 rounded-xl border border-border/50 bg-foreground/90 px-5 text-background opacity-60"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-current"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <div className="flex flex-col text-left leading-tight">
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                  Coming soon on
                </span>
                <span className="-mt-0.5 text-[17px] font-semibold">
                  App Store
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Free download &middot; No credit card required
          </p>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────── */}
      <section className="pb-24 sm:pb-32">
        <div className="flex gap-5 overflow-x-auto px-4 pb-4 snap-x snap-mandatory sm:justify-center sm:flex-wrap sm:gap-6 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {screenshots.map((s) => (
            <div
              key={s.src}
              className="w-[260px] shrink-0 snap-center overflow-hidden rounded-2xl border border-border/50 shadow-xl sm:w-[240px] lg:w-[220px]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.src}
                alt={s.alt}
                className="w-full"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="border-t border-border/40 bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
            Everything you need to <span className="text-primary">adult</span>{" "}
            in the Philippines
          </h2>

          <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to figure out this adulting thing?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Free to use. Built by a solo Filipino developer. No ads.
            </p>
            <div className="mt-8 flex justify-center">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-[52px] items-center gap-3 rounded-xl bg-foreground px-5 text-background transition-opacity hover:opacity-90"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 fill-current"
                  aria-hidden="true"
                >
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    Get it on
                  </span>
                  <span className="-mt-0.5 text-[17px] font-semibold">
                    Google Play
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sandalan. Built in the
            Philippines.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms
            </Link>
            <a
              href="mailto:support@sandalan.com"
              className="transition-colors hover:text-foreground"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

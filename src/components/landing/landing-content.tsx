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
    desc: "Auto-categories for Jollibee, Grab, Meralco, and 500+ Filipino merchants.",
  },
  {
    icon: Map,
    title: "Adulting Roadmap",
    desc: "Six life stages with step-by-step checklists, real processes, and current fees.",
  },
  {
    icon: Building2,
    title: "Gov't Contributions",
    desc: "SSS, PhilHealth, Pag-IBIG calculators and monthly tracking.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Monthly report cards graded A-F with spending breakdown.",
  },
  {
    icon: BookOpen,
    title: "AI Chat in Taglish",
    desc: '"Magkano gastos ko this week?" — works in the language you speak.',
  },
  {
    icon: Shield,
    title: "Private & Offline",
    desc: "No ads, no trackers. Works without internet.",
  },
];

/* Reusable Google Play badge */
function PlayBadge({ size = "lg" }: { size?: "lg" | "sm" }) {
  const h = size === "lg" ? "h-[56px]" : "h-[48px]";
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex ${h} items-center gap-3 rounded-xl bg-foreground px-6 text-background transition-opacity hover:opacity-90`}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
      </svg>
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[10px] uppercase tracking-wide opacity-80">Get it on</span>
        <span className="-mt-0.5 text-lg font-semibold">Google Play</span>
      </div>
    </a>
  );
}

function IosBadge() {
  return (
    <div className="inline-flex h-[56px] cursor-not-allowed items-center gap-3 rounded-xl border border-border/40 bg-foreground/90 px-6 text-background opacity-50">
      <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </svg>
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[10px] uppercase tracking-wide opacity-80">Coming soon on</span>
        <span className="-mt-0.5 text-lg font-semibold">App Store</span>
      </div>
    </div>
  );
}

export function LandingContent() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ── Nav ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <BrandMark className="h-9 w-9" />
            <span>Sandal<span className="text-primary">an</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Download Free
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero — text left, phone right ────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 right-0 h-[600px] w-[600px] rounded-full bg-primary/8 blur-[140px]" />
          <div className="absolute top-40 -left-20 h-[400px] w-[400px] rounded-full bg-green-500/6 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 sm:py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — copy */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                Free on Google Play
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl !leading-[1.1]">
                Your{" "}
                <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
                  Adulting
                </span>{" "}
                Companion
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Budget tracker, expense manager, and step-by-step adulting guide.
                From your first payslip to retirement.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <PlayBadge />
                <IosBadge />
              </div>

              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required &middot; Premium at ₱79/mo
              </p>
            </div>

            {/* Right — phone mockup */}
            <div className="relative mx-auto w-[280px] sm:w-[320px] lg:w-[340px]">
              {/* Glow behind phone */}
              <div className="absolute inset-0 -z-10 scale-110 rounded-[3rem] bg-gradient-to-b from-primary/20 to-green-500/10 blur-3xl" />
              <div className="overflow-hidden rounded-[2.5rem] border-[8px] border-foreground/10 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/screenshots/store-1-home.png"
                  alt="Sandalan home screen"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature phones — 3 screenshots ───────────────────── */}
      <section className="border-t border-border/40 bg-[#0F1B33]">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="mb-4 text-center text-sm font-semibold uppercase tracking-widest text-white/40">
            See it in action
          </p>
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Built for how Filipinos actually manage money
          </h2>

          <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
            {[
              { src: "/images/screenshots/store-2-dashboard.png", label: "Dashboard", desc: "Net worth, spending trends, and savings rate at a glance." },
              { src: "/images/screenshots/store-4-guide.png", label: "Adulting Guide", desc: "From getting your TIN to filing BIR — step by step." },
              { src: "/images/screenshots/store-3-chat.png", label: "AI Chat", desc: "Ask about your finances in Taglish. Get real answers." },
            ].map((item) => (
              <div key={item.src} className="flex flex-col items-center text-center">
                <div className="relative w-[220px] sm:w-full sm:max-w-[260px]">
                  <div className="absolute inset-0 -z-10 scale-105 rounded-[2rem] bg-white/5 blur-2xl" />
                  <div className="overflow-hidden rounded-[2rem] border-[6px] border-white/10 shadow-2xl shadow-black/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.src} alt={item.label} className="w-full" loading="lazy" />
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-white">{item.label}</h3>
                <p className="mt-2 max-w-[260px] text-sm text-white/60">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">adult</span>{" "}
          in the Philippines
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground">
          Government IDs, SSS, PhilHealth, petsa de peligro, and all.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/50 bg-card p-7 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/6 blur-[140px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to figure out this adulting thing?
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Free to use. Built by a solo Filipino developer. No ads, no trackers.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <PlayBadge />
              <IosBadge />
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sandalan. Built in the Philippines.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            <a href="mailto:support@sandalan.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

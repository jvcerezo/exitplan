"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Calculator,
  Wallet,
  Settings,
  BookOpen,
  Wrench,
  Menu,
  Search,
  LogOut,
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "./theme-toggle";
import { signOut } from "@/app/(auth)/actions";
import { useProfile } from "@/hooks/use-profile";
import { useTourContext } from "@/providers/tour-provider";

const navItems = [
  { href: "/guide", label: "Guide", icon: BookOpen, tourId: "sidebar-guide" },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, tourId: "sidebar-transactions" },
  { href: "/budgets", label: "Budgets", icon: Calculator, tourId: "sidebar-budgets" },
  { href: "/goals", label: "Goals", icon: Target, tourId: "sidebar-goals" },
  { href: "/accounts", label: "Accounts", icon: Wallet, tourId: "sidebar-accounts" },
  { href: "/tools", label: "Tools", icon: Wrench, tourId: "sidebar-tools" },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "sidebar-settings" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const { start } = useTourContext();

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Hide header on immersive guide article pages
  const guideSegments = pathname.startsWith("/guide") ? pathname.split("/").filter(Boolean) : [];
  const isImmersiveGuide = guideSegments.length >= 3;

  return (
    <>
      {/* Mobile top header bar */}
      <header
        className={cn(
          "md:hidden fixed top-0 left-0 right-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
          isImmersiveGuide && "hidden"
        )}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted/60 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="inline-flex items-center gap-2">
            <BrandMark className="h-7 w-7" />
            <span className="text-base font-bold tracking-tight">
              Exit<span className="text-primary">Plan</span>
            </span>
          </Link>

          <button
            type="button"
            data-tour="sidebar-search"
            onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted/60 transition-colors"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Navigation drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" showCloseButton={false} className="w-72 p-0 flex flex-col gap-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>

          {/* Drawer brand header */}
          <div className="flex h-14 shrink-0 items-center px-4 border-b border-border/60">
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-2"
            >
              <BrandMark className="h-8 w-8" />
              <span className="text-base font-bold tracking-tight">
                Exit<span className="text-primary">Plan</span>
              </span>
            </Link>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Drawer footer */}
          <div
            className="shrink-0 border-t border-border/60 px-3 py-3 space-y-1"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
          >
            {profile && (
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 mb-1 hover:bg-muted transition-colors"
              >
                <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-border">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-primary">{initials}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.full_name || profile.email || "Account"}
                  </p>
                  {profile.full_name && (
                    <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                  )}
                </div>
              </Link>
            )}
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</span>
              <ThemeToggle />
            </div>
            <button
              type="button"
              onClick={() => { start(); setOpen(false); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
            >
              <Map className="h-5 w-5" />
              Take a Tour
            </button>
            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

"use client";

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
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const primaryNav = [
  { href: "/guide", label: "Guide", icon: BookOpen, tourId: "sidebar-guide" },
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight, tourId: "sidebar-transactions" },
  { href: "/budgets", label: "Budgets", icon: Calculator, tourId: "sidebar-budgets" },
];

const moreNav = [
  { href: "/goals", label: "Goals", icon: Target, tourId: "sidebar-goals" },
  { href: "/accounts", label: "Accounts", icon: Wallet, tourId: "sidebar-accounts" },
  { href: "/tools", label: "Tools", icon: Wrench, tourId: "sidebar-tools" },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "sidebar-settings" },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMoreActive = moreNav.some((item) => pathname.startsWith(item.href));

  // Hide bottom nav on immersive guide article pages (3+ path segments under /guide)
  const guideSegments = pathname.startsWith("/guide") ? pathname.split("/").filter(Boolean) : [];
  const isImmersiveGuide = guideSegments.length >= 3;
  if (isImmersiveGuide) return null;

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16 px-1">
          {primaryNav.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tourId}
                className={cn(
                  "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-all",
                  isActive
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={cn(
              "flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-medium transition-all",
              isMoreActive
                ? "bg-primary/12 text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            More
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-[env(safe-area-inset-bottom)]">
          <div className="py-2 space-y-1">
            {moreNav.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

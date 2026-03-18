"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Wallet,
  Wrench,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const bottomNavItems = [
  {
    href: "/home",
    label: "Home",
    icon: Home,
    matchPaths: ["/home"],
  },
  {
    href: "/guide",
    label: "Guide",
    icon: BookOpen,
    matchPaths: ["/guide"],
  },
  {
    href: "/dashboard",
    label: "Money",
    icon: Wallet,
    matchPaths: ["/dashboard", "/transactions", "/accounts", "/budgets", "/goals"],
  },
  {
    href: "/tools",
    label: "Tools",
    icon: Wrench,
    matchPaths: ["/tools"],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    matchPaths: ["/settings"],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  // Hide bottom nav on immersive guide article pages (3+ path segments under /guide)
  const guideSegments = pathname.startsWith("/guide") ? pathname.split("/").filter(Boolean) : [];
  const isImmersiveGuide = guideSegments.length >= 3;
  if (isImmersiveGuide) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {bottomNavItems.map((item) => {
          const isActive =
            item.href === "/home"
              ? pathname === "/home" || pathname === "/"
              : item.matchPaths.some((p) => pathname.startsWith(p));
          return (
            <Link
              key={item.href}
              href={item.href}
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
      </div>
    </nav>
  );
}

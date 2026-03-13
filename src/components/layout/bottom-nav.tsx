"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Target, Wallet, Settings, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { href: "/transactions", label: "Activity", icon: ArrowLeftRight, tourId: "sidebar-transactions" },
  { href: "/budgets", label: "Budgets", icon: Calculator, tourId: "sidebar-budgets" },
  { href: "/goals", label: "Goals", icon: Target, tourId: "sidebar-goals" },
  { href: "/accounts", label: "Accounts", icon: Wallet, tourId: "sidebar-accounts" },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "sidebar-settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
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
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ArrowLeft, Bug } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/bug-reports", label: "Bugs", icon: Bug },
  { href: "/dashboard", label: "Back", icon: ArrowLeft },
];

export function AdminBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-background/95 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around px-1">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : item.href === "/dashboard"
                ? false
                : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-12 min-w-16 flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-all",
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

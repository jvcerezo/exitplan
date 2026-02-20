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
  LogOut,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "./theme-toggle";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/budgets", label: "Budgets", icon: Calculator },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
          Exit<span className="text-primary">Plan</span>
        </h1>
      </div>

      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent("keydown", { key: "k", metaKey: true })
            );
          }}
          className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar px-3 py-2 text-sm text-sidebar-foreground/50 hover:bg-sidebar-accent transition-colors"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search...</span>
          <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border px-1.5 text-[10px]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">Theme</span>
          <ThemeToggle />
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}

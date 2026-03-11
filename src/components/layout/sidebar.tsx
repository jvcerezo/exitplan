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
  Map,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "./theme-toggle";
import { useTourContext } from "@/providers/tour-provider";
import { useProfile } from "@/hooks/use-profile";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, tourId: "sidebar-transactions" },
  { href: "/goals", label: "Goals", icon: Target, tourId: "sidebar-goals" },
  { href: "/budgets", label: "Budgets", icon: Calculator, tourId: "sidebar-budgets" },
  { href: "/accounts", label: "Accounts", icon: Wallet, tourId: "sidebar-accounts" },
  { href: "/settings", label: "Settings", icon: Settings, tourId: "sidebar-settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { start } = useTourContext();
  const { data: profile } = useProfile();

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
          data-tour="sidebar-search"
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
              data-tour={item.tourId}
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
        {/* User avatar row */}
        {profile && (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 mb-1 hover:bg-sidebar-accent transition-colors"
          >
            <div className="h-7 w-7 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 border border-sidebar-border">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[10px] font-bold text-primary">{initials}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {profile.full_name || profile.email || "Account"}
              </p>
              {profile.full_name && (
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{profile.email}</p>
              )}
            </div>
          </Link>
        )}
        <div className="flex items-center justify-between px-3 py-1">
          <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">Theme</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <Map className="h-5 w-5" />
          Take a Tour
        </button>
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

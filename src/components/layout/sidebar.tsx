"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  Calculator,
  Wallet,
  Settings,
  LogOut,
  Search,
  Map,
  Wrench,
  Landmark,
  Receipt,
  CreditCard,
  Shield,
  ReceiptText,
  Heart,
  PiggyBank,
  Home as HomeIcon,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/(auth)/actions";
import { ThemeToggle } from "./theme-toggle";
import { useTourContext } from "@/providers/tour-provider";
import { useProfile } from "@/hooks/use-profile";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  tourId?: string;
}

interface NavGroup {
  label: string | null;
  collapsible?: boolean;
  storageKey?: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: null,
    items: [
      { href: "/home", label: "Home", icon: Home, tourId: "sidebar-home" },
      { href: "/guide", label: "Guide", icon: BookOpen, tourId: "sidebar-guide" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, tourId: "sidebar-dashboard" },
      { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, tourId: "sidebar-transactions" },
      { href: "/accounts", label: "Accounts", icon: Wallet, tourId: "sidebar-accounts" },
      { href: "/budgets", label: "Budgets", icon: Calculator, tourId: "sidebar-budgets" },
      { href: "/goals", label: "Goals", icon: Target, tourId: "sidebar-goals" },
    ],
  },
  {
    label: "Tools",
    collapsible: true,
    storageKey: "sidebar-tools-collapsed",
    items: [
      { href: "/tools/contributions", label: "Contributions", icon: Landmark },
      { href: "/tools/bills", label: "Bills", icon: Receipt },
      { href: "/tools/debts", label: "Debts", icon: CreditCard },
      { href: "/tools/insurance", label: "Insurance", icon: Shield },
      { href: "/tools/taxes", label: "Taxes", icon: ReceiptText },
      { href: "/tools/calculators", label: "Calculators", icon: Calculator },
      { href: "/tools/panganay-mode", label: "Panganay Mode", icon: Heart },
      { href: "/tools/retirement-projection", label: "Retirement", icon: PiggyBank },
      { href: "/tools/rent-vs-buy", label: "Rent vs Buy", icon: HomeIcon },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { start } = useTourContext();
  const { data: profile } = useProfile();
  const [toolsCollapsed, setToolsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-tools-collapsed");
    if (stored === "true") setToolsCollapsed(true);
  }, []);

  const toggleTools = () => {
    setToolsCollapsed((prev) => {
      localStorage.setItem("sidebar-tools-collapsed", String(!prev));
      return !prev;
    });
  };

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
        <Link href="/home" className="inline-flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <h1 className="text-xl font-bold tracking-tight text-sidebar-foreground">
            Exit<span className="text-primary">Plan</span>
          </h1>
        </Link>
      </div>

      {/* Search */}
      <div className="px-3 pt-4 pb-2">
        <button
          data-tour="sidebar-search"
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
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
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {navGroups.map((group, gi) => {
          const isCollapsible = group.collapsible;
          const isCollapsed = isCollapsible && toolsCollapsed;

          return (
            <div key={gi} className={gi > 0 ? "pt-3" : ""}>
              {group.label && (
                <div className="flex items-center justify-between px-3 mb-1">
                  {isCollapsible ? (
                    <button
                      type="button"
                      onClick={toggleTools}
                      className="flex w-full items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40 hover:text-sidebar-foreground/60 transition-colors"
                    >
                      {group.label}
                      <ChevronDown
                        className={cn(
                          "h-3 w-3 transition-transform",
                          isCollapsed && "-rotate-90"
                        )}
                      />
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                      {group.label}
                    </span>
                  )}
                </div>
              )}
              {!isCollapsed &&
                group.items.map((item) => {
                  const isActive =
                    item.href === "/home"
                      ? pathname === "/home" || pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-tour={item.tourId}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
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
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <Map className="h-4 w-4" />
          Take a Tour
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}

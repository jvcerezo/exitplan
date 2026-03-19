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
import { useTranslation } from "@/lib/i18n";

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

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { start } = useTourContext();
  const { data: profile } = useProfile();

  const navGroups: NavGroup[] = [
    {
      label: null,
      items: [
        { href: "/home", label: t.nav.home, icon: Home, tourId: "sidebar-home" },
        { href: "/guide", label: t.nav.guide, icon: BookOpen, tourId: "sidebar-guide" },
      ],
    },
    {
      label: t.nav.money,
      items: [
        { href: "/dashboard", label: t.nav.dashboard, icon: LayoutDashboard, tourId: "sidebar-dashboard" },
        { href: "/transactions", label: t.nav.transactions, icon: ArrowLeftRight, tourId: "sidebar-transactions" },
        { href: "/accounts", label: t.nav.accounts, icon: Wallet, tourId: "sidebar-accounts" },
        { href: "/budgets", label: t.nav.budgets, icon: Calculator, tourId: "sidebar-budgets" },
        { href: "/goals", label: t.nav.goals, icon: Target, tourId: "sidebar-goals" },
      ],
    },
    {
      label: t.nav.tools,
      collapsible: true,
      storageKey: "sidebar-tools-collapsed",
      items: [
        { href: "/tools/contributions", label: t.nav.contributions, icon: Landmark },
        { href: "/tools/bills", label: t.nav.bills, icon: Receipt },
        { href: "/tools/debts", label: t.nav.debts, icon: CreditCard },
        { href: "/tools/insurance", label: t.nav.insurance, icon: Shield },
        { href: "/tools/taxes", label: t.nav.taxes, icon: ReceiptText },
        { href: "/tools/calculators", label: t.nav.calculators, icon: Calculator },
        { href: "/tools/panganay-mode", label: t.nav.panganayMode, icon: Heart },
        { href: "/tools/retirement-projection", label: t.nav.retirement, icon: PiggyBank },
        { href: "/tools/rent-vs-buy", label: t.nav.rentVsBuy, icon: HomeIcon },
      ],
    },
  ];
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
            Sandal<span className="text-primary">an</span>
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
          <span className="flex-1 text-left">{t.common.search}</span>
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
          <span className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">{t.nav.theme}</span>
          <ThemeToggle />
        </div>
        <button
          type="button"
          onClick={start}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <Map className="h-4 w-4" />
          {t.nav.takeTour}
        </button>
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
        >
          <Settings className="h-4 w-4" />
          {t.nav.settings}
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {t.common.signOut}
          </button>
        </form>
      </div>
    </aside>
  );
}

import Link from "next/link";
import {
  Landmark,
  ReceiptText,
  Gift,
  CreditCard,
  Shield,
  ChevronRight,
  Receipt,
  Calculator,
  PiggyBank,
  Home,
  Heart,
} from "lucide-react";

const groups = [
  {
    id: "compliance",
    label: "Compliance",
    items: [
      {
        href: "/tools/contributions",
        icon: Landmark,
        title: "Gov't Contributions",
        subtitle: "SSS · PhilHealth · Pag-IBIG",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        href: "/tools/taxes",
        icon: ReceiptText,
        title: "BIR Tax Tracker",
        subtitle: "TRAIN Law income tax",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      },
      {
        href: "/tools/thirteenth-month",
        icon: Gift,
        title: "13th Month Pay",
        subtitle: "P90,000 tax exemption calculator",
        color: "text-green-500",
        bg: "bg-green-500/10",
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        href: "/tools/debts",
        icon: CreditCard,
        title: "Debt Manager",
        subtitle: "Loans, credit cards & payoff strategies",
        color: "text-red-500",
        bg: "bg-red-500/10",
      },
      {
        href: "/tools/bills",
        icon: Receipt,
        title: "Bills & Subscriptions",
        subtitle: "Meralco, PLDT, Netflix, rent...",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
      {
        href: "/tools/insurance",
        icon: Shield,
        title: "Insurance Tracker",
        subtitle: "Policies & renewal dates",
        color: "text-teal-500",
        bg: "bg-teal-500/10",
      },
    ],
  },
  {
    id: "planning",
    label: "Planning & Calculators",
    items: [
{
        href: "/tools/retirement-projection",
        icon: PiggyBank,
        title: "Retirement Projection",
        subtitle: "SSS pension + savings gap calculator",
        color: "text-amber-500",
        bg: "bg-amber-500/10",
      },
      {
        href: "/tools/rent-vs-buy",
        icon: Home,
        title: "Rent vs Buy",
        subtitle: "Compare renting vs Pag-IBIG housing loan",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        href: "/tools/panganay-mode",
        icon: Heart,
        title: "Panganay Mode",
        subtitle: "Family support budgeting for breadwinners",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
      },
      {
        href: "/tools/calculators",
        icon: Calculator,
        title: "Financial Calculators",
        subtitle: "Loan amortization, compound interest, FIRE",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tools</h1>
        <p className="text-sm text-muted-foreground sm:text-base mt-0.5">
          Financial trackers and calculators for every stage of adulting.
        </p>
      </div>

      {/* Grouped tool list */}
      <div className="space-y-6">
        {groups.map((group) => (
          <div key={group.id}>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {group.label}
            </p>
            <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                    <item.icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tip */}
      <p className="text-xs text-muted-foreground leading-relaxed px-1">
        <span className="font-semibold text-foreground">Tip:</span> SSS, PhilHealth, and Pag-IBIG aren&apos;t just deductions — they&apos;re benefits. Pag-IBIG&apos;s MP2 savings earn 6–7% tax-free dividends.
      </p>
    </div>
  );
}

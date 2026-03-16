import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Landmark,
  ReceiptText,
  Gift,
  BookOpen,
  CreditCard,
  Shield,
  ChevronRight,
  GraduationCap,
  Receipt,
  Calculator,
} from "lucide-react";

const features = [
  {
    href: "/adulting/contributions",
    icon: Landmark,
    title: "Gov't Contributions",
    description: "Calculate and track your SSS, PhilHealth, and Pag-IBIG deductions every month.",
    badge: null,
    available: true,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    href: "/adulting/taxes",
    icon: ReceiptText,
    title: "BIR Tax Tracker",
    description: "Compute your income tax under TRAIN Law and track quarterly / annual filings.",
    badge: null,
    available: true,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    href: "/adulting/thirteenth-month",
    icon: Gift,
    title: "13th Month Pay",
    description: "Estimate your 13th month pay and understand the ₱90,000 tax exemption.",
    badge: null,
    available: true,
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    href: "/adulting/debts",
    icon: CreditCard,
    title: "Debt Manager",
    description: "Track all loans and credit cards. Avalanche vs. Snowball payoff strategies.",
    badge: null,
    available: true,
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    href: "/adulting/insurance",
    icon: Shield,
    title: "Insurance Tracker",
    description: "Monitor your life, health, HMO, car, and property policies and renewals.",
    badge: null,
    available: true,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    href: "/adulting/bills",
    icon: Receipt,
    title: "Bills & Subscriptions",
    description: "Track recurring bills — Meralco, PLDT, Netflix, rent — with due date alerts.",
    badge: null,
    available: true,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    href: "/adulting/calculators",
    icon: Calculator,
    title: "Financial Calculators",
    description: "Loan amortization, compound interest, and FIRE number calculator.",
    badge: null,
    available: true,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    href: "#",
    icon: BookOpen,
    title: "Financial Literacy",
    description: "Bite-sized PH-contextualized lessons on budgeting, investing, and adulting.",
    badge: "Soon",
    available: false,
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
  },
];

export default function AdultingPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Adulting Hub</h1>
        </div>
        <p className="text-sm text-muted-foreground sm:text-base">
          Everything a Filipino adult needs — taxes, contributions, benefits, and more.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => {
          const card = (
            <Card
              className={`rounded-2xl border border-border/60 bg-card/95 shadow-sm transition-all ${
                f.available
                  ? "hover:shadow-md hover:border-border cursor-pointer"
                  : "opacity-60 cursor-not-allowed"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${f.bg}`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    {f.badge && (
                      <Badge variant="secondary" className="text-[10px]">
                        {f.badge}
                      </Badge>
                    )}
                    {f.available && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm font-semibold mt-3">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-xs leading-relaxed">
                  {f.description}
                </CardDescription>
              </CardContent>
            </Card>
          );

          return f.available ? (
            <Link key={f.href} href={f.href} className="block">
              {card}
            </Link>
          ) : (
            <div key={f.title}>{card}</div>
          );
        })}
      </div>

      {/* PH tip */}
      <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Did you know?</span> As a Filipino employee, SSS, PhilHealth, and Pag-IBIG aren&apos;t just deductions — they&apos;re benefits. SSS provides loans, disability, and retirement pension. PhilHealth covers hospitalization. Pag-IBIG gives housing loans and MP2 savings with 6–7% tax-free dividends.
        </p>
      </div>
    </div>
  );
}

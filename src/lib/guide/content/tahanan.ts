import type { Guide } from "../types";

export const TAHANAN_GUIDES: Guide[] = [
  {
    slug: "pagibig-housing-loan",
    title: "Pag-IBIG Housing Loan Step-by-Step",
    description:
      "The most affordable path to homeownership in the Philippines. Everything you need to know about qualifying, applying, and getting approved.",
    category: "housing",
    readTimeMinutes: 7,
    toolLinks: [
      { href: "/tools/rent-vs-buy", label: "Rent vs Buy Calculator" },
      { href: "/tools/contributions", label: "Check Pag-IBIG Contributions" },
    ],
    sections: [
      {
        heading: "Why Pag-IBIG is your best option",
        content:
          "Pag-IBIG offers housing loans at 5.75% annual interest — roughly half the rate of commercial bank loans (7–10%). Maximum loan amount is P6,000,000 with a term of up to 30 years. This makes monthly amortization significantly lower than bank alternatives.",
      },
      {
        heading: "Eligibility requirements",
        content:
          "To qualify for a Pag-IBIG housing loan, you need:",
        items: [
          "At least 24 monthly Pag-IBIG contributions (not necessarily consecutive)",
          "Not over 65 years old at the time of application",
          "No outstanding Pag-IBIG housing loan",
          "Legal capacity to acquire property",
          "Adequate income to cover amortization (debt-to-income ratio assessed)",
        ],
        callout: {
          type: "tip",
          text: "Start tracking your Pag-IBIG contributions now. After 24 months, you're eligible. The Contributions Tracker shows exactly how many months you have.",
        },
      },
      {
        heading: "Required documents",
        content:
          "Prepare these before visiting the Pag-IBIG office:",
        items: [
          "Housing Loan Application Form",
          "Two valid government IDs",
          "Proof of income: payslips (3 months), ITR, Certificate of Employment",
          "Pag-IBIG loyalty card or MID number",
          "Transfer Certificate of Title (TCT) or Condominium Certificate of Title (CCT)",
          "Current real estate tax receipt and tax declaration",
          "Vicinity map and lot plan of the property",
        ],
      },
      {
        heading: "Sample computation",
        content:
          "For a P2,000,000 property with 10% down payment and a 20-year loan at 5.75%:",
        items: [
          "Loan amount: P1,800,000",
          "Monthly amortization: ~P12,636",
          "Total amount paid over 20 years: ~P3,032,640",
          "Compare with bank loan at 8%: monthly amortization ~P15,053 (P2,417 more per month)",
        ],
      },
    ],
  },
  {
    slug: "insurance-layering",
    title: "PhilHealth vs HMO vs Private Insurance",
    description:
      "The three-layer health protection system explained. Know what each one covers so you're never caught off guard by a hospital bill.",
    category: "insurance",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/tools/insurance", label: "Insurance Tracker" },
    ],
    sections: [
      {
        heading: "The three layers of protection",
        content:
          "Filipino healthcare coverage works in three layers. Each serves a different purpose — ideally, you have all three:",
        items: [
          "Layer 1 — PhilHealth (mandatory): Government insurance covering inpatient hospitalization, outpatient care, and selected procedures through case rates. Everyone should have this.",
          "Layer 2 — HMO (employer-provided or personal): Prepaid healthcare covering outpatient consultations, lab tests, ER visits, and dental. Faster service through accredited clinics and hospitals.",
          "Layer 3 — Private Health Insurance: Long-term coverage for critical illness, hospitalization gaps, and conditions HMO doesn't cover. Complements the first two layers.",
        ],
      },
      {
        heading: "What PhilHealth actually covers",
        content:
          "PhilHealth covers specific amounts per diagnosis (case rate system). It does NOT cover the full hospital bill in most cases. You pay the difference. Recent 2025 expansions increased coverage significantly for heart disease, kidney transplant, and dental care.",
        callout: {
          type: "ph-law",
          text: "Under the Universal Health Care Act (RA 11223), all Filipinos are automatically enrolled in PhilHealth. You have the right to PhilHealth coverage regardless of employment status.",
        },
      },
      {
        heading: "When to get an HMO",
        content:
          "If your employer offers an HMO, always enroll — it's usually free or heavily subsidized. For self-employed individuals, personal HMO plans start at P3,000–P8,000/year for basic coverage. An HMO is worth it if you visit doctors, get lab tests, or need emergency care more than 2–3 times per year.",
      },
      {
        heading: "Choosing the right insurance mix",
        content:
          "Your ideal coverage depends on your life stage:",
        items: [
          "Single, employed: PhilHealth + company HMO (both usually free)",
          "Self-employed: PhilHealth (mandatory) + personal HMO (P3K–P8K/year)",
          "Married with kids: PhilHealth + HMO with family plan + term life insurance",
          "Breadwinner: All three layers plus disability insurance",
        ],
      },
    ],
  },
  {
    slug: "marriage-finances",
    title: "Marriage Finances in the Philippines",
    description:
      "From wedding costs to joint budgets. A practical financial guide for Filipino couples planning to get married.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/budgets", label: "Set Up Joint Budget" },
    ],
    sections: [
      {
        heading: "The real cost of getting married in the Philippines",
        content:
          "A Filipino wedding costs anywhere from P50,000 (civil ceremony + simple reception) to P1,000,000+ (church wedding + hotel reception + entourage). The average sits around P200,000–P400,000. Before you start planning the event, plan the finances.",
        items: [
          "Civil wedding: P500–P2,000 (fees only) + reception budget",
          "Church wedding: P5,000–P30,000 (church fees, flowers, choir)",
          "Reception: P50,000–P500,000 (depends on venue and guest count)",
          "Rings, attire, photos, video: P30,000–P150,000",
          "Marriage license and requirements: ~P500–P1,500",
        ],
      },
      {
        heading: "Financial conversations to have before marriage",
        content:
          "Money is the #1 cause of marital conflict. Have these conversations before the wedding:",
        items: [
          "Full disclosure: Share all debts, savings, income, and financial obligations",
          "Family obligations: How much will each of you continue to give to parents/siblings?",
          "Joint vs separate accounts: Most Filipino couples benefit from 'yours, mine, and ours' — three accounts",
          "Financial goals: Align on priorities (house, kids, retirement, travel)",
          "Budget system: Agree on how you'll manage monthly spending together",
        ],
        callout: {
          type: "tip",
          text: "Open a joint account for shared expenses (rent, bills, groceries) while keeping individual accounts for personal spending. This reduces friction while maintaining autonomy.",
        },
      },
      {
        heading: "Legal financial implications",
        content:
          "Under Philippine law, marriage creates an Absolute Community of Property (ACP) regime by default — meaning all property acquired during the marriage is owned jointly. To opt out, you need a prenuptial agreement signed before the wedding.",
        callout: {
          type: "ph-law",
          text: "Under the Family Code of the Philippines, the default property regime is Absolute Community of Property. A prenuptial agreement (ante-nuptial contract) must be executed before the marriage ceremony.",
        },
      },
    ],
  },
  {
    slug: "education-fund",
    title: "Starting a Children's Education Fund",
    description:
      "Private school tuition rises 8–12% annually. Here's how to start saving early so education costs don't crush your finances.",
    category: "financial-literacy",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/goals", label: "Set Education Fund Goal" },
      { href: "/tools/calculators", label: "Compound Interest Calculator" },
    ],
    sections: [
      {
        heading: "The numbers are staggering",
        content:
          "Private university tuition in the Philippines ranges from P200,000–P500,000/year. With 8–12% annual increases, a child born today could face P800,000+/year by the time they enter college. Public universities are cheaper but competitive — don't count on them as your only option.",
      },
      {
        heading: "When to start",
        content:
          "The answer is always 'now.' A P3,000/month investment at 7% returns starting at your child's birth grows to approximately P1,200,000 by the time they're 18. Starting when they're 6 gives you only about P600,000 with the same contribution. Time is the biggest factor.",
        items: [
          "From birth: P3,000/month at 7% = ~P1.2M by age 18",
          "From age 6: P3,000/month at 7% = ~P600K by age 18",
          "From age 12: P3,000/month at 7% = ~P250K by age 18",
        ],
      },
      {
        heading: "Best investment vehicles for education funds",
        content:
          "Match the investment to your timeline:",
        items: [
          "18+ years away: Equity index funds, UITFs (aggressive growth)",
          "10–17 years away: Balanced funds (mix of stocks and bonds)",
          "5–9 years away: Bond funds, Pag-IBIG MP2",
          "Under 5 years: High-yield savings, time deposits (capital preservation)",
        ],
        callout: {
          type: "warning",
          text: "Avoid 'education plans' from insurance companies. They often have high fees, low returns, and inflexible terms. You're better off investing directly in UITFs or MP2.",
        },
      },
    ],
  },
];

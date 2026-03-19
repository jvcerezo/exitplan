import type { Guide } from "../types";

export const PAGHAHANDA_GUIDES: Guide[] = [
  {
    slug: "maximize-sss-pension",
    title: "Maximizing Your SSS Pension",
    description:
      "The average SSS pension is P6,000–P7,000/month — far below living costs. Here's how to optimize your contributions for a higher pension.",
    category: "retirement",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/tools/retirement-projection", label: "Retirement Projection" },
      { href: "/tools/contributions", label: "Contributions Tracker" },
    ],
    sections: [
      {
        heading: "How SSS pension is calculated",
        content:
          "Your SSS monthly pension is based on three factors: your Average Monthly Salary Credit (AMSC), the number of credited years of service (CYS), and the pension formula. The formula is: P300 + 20% of AMSC + (2% of AMSC × CYS beyond 10 years). Higher AMSC and more years of contribution mean a higher pension.",
      },
      {
        heading: "Strategies to increase your pension",
        content:
          "You can take action now to significantly boost your retirement income:",
        items: [
          "Maximize your Monthly Salary Credit: Contribute at the highest MSC bracket possible (up to P35,000)",
          "Don't have gaps: Every month without a contribution is a missed opportunity. Voluntary members can pay during unemployment",
          "Contribute for as long as possible: The minimum is 120 months (10 years), but 30+ years of contributions dramatically increases your pension",
          "Consider voluntary contributions above the mandatory: The MySSS Pension Booster takes contributions above P20,000 MSC",
        ],
        callout: {
          type: "tip",
          text: "Use the Retirement Projection tool to see how increasing your MSC or adding more years of contributions affects your estimated pension.",
        },
      },
      {
        heading: "SSS pension alone is not enough",
        content:
          "Even at the maximum pension, SSS will not cover a comfortable retirement. You need supplementary income from personal savings, investments (MP2, UITFs, stocks), rental income, or a small business. Start planning your retirement income sources now — don't wait until you're 60.",
      },
    ],
  },
  {
    slug: "sandwich-generation",
    title: "Surviving the Sandwich Generation",
    description:
      "Supporting aging parents and growing children simultaneously. A financial and emotional survival guide for Filipino breadwinners.",
    category: "family",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/tools/panganay-mode", label: "Panganay Mode" },
      { href: "/budgets", label: "Set Up Family Budget" },
    ],
    sections: [
      {
        heading: "You're not alone",
        content:
          "A rising number of Filipinos belong to the sandwich generation — supporting aging parents while also raising their own children. Philippine culture makes this uniquely intense: filial duty (utang na loob), limited social safety nets, and insufficient SSS pensions mean the financial burden falls squarely on working adults.",
      },
      {
        heading: "Setting boundaries without guilt",
        content:
          "Supporting family doesn't mean sacrificing your own financial future. You can't help others from a position of financial ruin:",
        items: [
          "Set a fixed monthly amount for family support — communicate it clearly and stick to it",
          "Protect your emergency fund and retirement savings first — these are non-negotiable",
          "Help siblings become self-sufficient rather than perpetuating dependency",
          "It's okay to say no to extended family requests that would put you in debt",
          "Use Panganay Mode in Sandalan to track family obligations separately from personal spending",
        ],
        callout: {
          type: "info",
          text: "Setting financial boundaries is not selfishness — it's sustainability. You can't give from an empty cup.",
        },
      },
      {
        heading: "Practical budgeting for sandwich generation",
        content:
          "Use the 4-bucket system adapted for your situation:",
        items: [
          "Bucket 1 — Your household: Rent, utilities, food, transport, children's needs",
          "Bucket 2 — Your protection: Emergency fund, retirement, insurance",
          "Bucket 3 — Parent support: Fixed monthly amount for parents' needs",
          "Bucket 4 — Everything else: Personal spending, wants, treats",
        ],
      },
    ],
  },
  {
    slug: "estate-planning-basics",
    title: "Estate Planning Basics for Filipinos",
    description:
      "Wills, beneficiaries, and estate tax. Protect your family from legal headaches and financial loss.",
    category: "retirement",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/guide/paghahanda", label: "View Stage Progress" },
    ],
    sections: [
      {
        heading: "Why you need an estate plan now",
        content:
          "Most Filipinos think estate planning is only for the wealthy. It's not. If you own any property, have savings, or have dependents, you need a basic estate plan. Without one, your assets get tied up in courts for years, family disputes arise, and the government takes 6% estate tax before your heirs see a peso.",
      },
      {
        heading: "The basics: will types in the Philippines",
        content:
          "Philippine law recognizes two types of wills:",
        items: [
          "Notarial will: Typed or printed, signed by you and 3 witnesses, notarized. Most common and safest option. Cost: P3,000–P8,000 with a lawyer.",
          "Holographic will: Entirely handwritten by you, dated, and signed. No witnesses or notarization needed. Free but can be contested more easily.",
        ],
        callout: {
          type: "ph-law",
          text: "The Philippines follows forced heirship (legitimes). You cannot disinherit legitimate children, your spouse, or parents from their legal share. A will distributes the 'free portion' of your estate — typically 25–50% depending on surviving heirs.",
        },
      },
      {
        heading: "Estate tax: the 6% rule",
        content:
          "The estate tax in the Philippines is a flat 6% of the net estate (total assets minus deductions like debts, funeral expenses, and the standard deduction of P5,000,000). The estate tax return must be filed within 1 year of death. Failure to file incurs 25% surcharge + 12% annual interest.",
      },
      {
        heading: "Action items you can do today",
        content:
          "Estate planning doesn't require a lawyer on day one. Start with these steps:",
        items: [
          "Update all beneficiaries: SSS (Form E-4), Pag-IBIG (MDF), bank accounts, insurance policies",
          "Create an asset inventory: List all bank accounts, investments, properties, and valuable items",
          "Organize documents: Keep titles, insurance policies, and financial records in one secure place",
          "Tell a trusted person: At minimum, one family member should know where your documents are",
          "Consider a holographic will: It's free, legally valid, and takes 30 minutes to write",
        ],
      },
    ],
  },
  {
    slug: "debt-free-before-retirement",
    title: "Paying Off All Debt Before Retirement",
    description:
      "Entering retirement with debt is dangerous. Here's how to accelerate debt payoff in your 40s and 50s.",
    category: "financial-literacy",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/debts", label: "Debt Manager" },
    ],
    sections: [
      {
        heading: "Why debt-free retirement matters",
        content:
          "Your SSS pension will likely be P6,000–P12,000/month. If you're still paying P8,000/month on a housing loan and P3,000/month on credit cards, your pension is consumed before you buy groceries. The goal: zero debt by age 60.",
      },
      {
        heading: "Debt payoff strategies",
        content:
          "Two proven approaches:",
        items: [
          "Avalanche method: Pay minimums on all debts, throw extra money at the highest-interest debt first. Mathematically optimal — saves the most on interest.",
          "Snowball method: Pay minimums on all debts, throw extra money at the smallest balance first. Psychologically motivating — you see debts disappear faster.",
          "Either method works. Pick the one you'll stick with. Consistency beats optimization.",
        ],
      },
      {
        heading: "Accelerating payoff in your 40s-50s",
        content:
          "Strategies specific to this life stage:",
        items: [
          "Redirect 13th month pay and bonuses to debt payoff",
          "If children are independent, redirect their education fund contributions to debt",
          "Consider refinancing high-interest loans (credit cards at 24% → personal loan at 12%)",
          "Use the Debt Manager tool to track balances and visualize your payoff timeline",
          "Avoid taking on new debt — no new car loans or credit cards",
        ],
        callout: {
          type: "warning",
          text: "Never borrow from your retirement savings or emergency fund to pay off debt. That trades one problem for a worse one.",
        },
      },
    ],
  },
];

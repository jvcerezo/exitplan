import type { Guide } from "../types";

export const TUGATOG_GUIDES: Guide[] = [
  {
    slug: "wealth-building",
    title: "Building Wealth in Your Peak Years",
    description:
      "Your 30s and 40s are when income is highest. Here's how to make the most of your peak earning years.",
    category: "investing",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/tools/calculators", label: "Compound Interest Calculator" },
      { href: "/tools/retirement-projection", label: "Retirement Projection" },
    ],
    sections: [
      {
        heading: "Why your peak years matter most",
        content:
          "Ages 36–45 are typically your highest-earning years. The financial decisions you make now determine whether you retire comfortably or struggle. By this stage, you should have your emergency fund, insurance, and basic investments in place. Now it's time to accelerate.",
      },
      {
        heading: "Diversification is key",
        content:
          "Don't put all your eggs in one basket. A balanced portfolio for your peak years might look like:",
        items: [
          "30% — Low risk: Pag-IBIG MP2, government bonds, money market funds",
          "40% — Medium risk: Balanced UITFs, blue-chip dividend stocks, REITs",
          "20% — Higher risk: Equity index funds, growth stocks",
          "10% — Alternative: Real estate, small business, or other income-generating assets",
        ],
      },
      {
        heading: "Financial milestones to hit",
        content:
          "By age 45, aim to have achieved these milestones:",
        items: [
          "Retirement savings: 2–4x your annual income accumulated",
          "Emergency fund: 6+ months of expenses (fully funded)",
          "Insurance: Adequate life, health, and property coverage",
          "Debt: No high-interest consumer debt remaining",
          "Children's education fund: Started and growing",
          "Estate plan: Basic will and beneficiary designations updated",
        ],
      },
    ],
  },
  {
    slug: "mid-career-review",
    title: "Mid-Career Financial Review",
    description:
      "A comprehensive checklist for your 30s and 40s. Are you on track? Here's what to evaluate.",
    category: "financial-literacy",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/retirement-projection", label: "Retirement Projection" },
      { href: "/tools/insurance", label: "Insurance Tracker" },
    ],
    sections: [
      {
        heading: "The mid-career checkpoint",
        content:
          "By your mid-30s to 40s, you should have a clear picture of your financial trajectory. This isn't about being perfect — it's about knowing where you stand and adjusting course before it's too late.",
      },
      {
        heading: "Annual financial review checklist",
        content:
          "Go through this every year:",
        items: [
          "Net worth: Calculate total assets minus total liabilities. Is it growing year over year?",
          "Emergency fund: Still fully funded at 6 months? Top up if you've used it",
          "Insurance: Coverage still adequate for your dependents? Update beneficiaries",
          "Retirement savings: On track for 2–4x annual income by age 45?",
          "Debt: Any high-interest debt remaining? Prioritize payoff",
          "Estate plan: Will and beneficiaries up to date?",
          "SSS contributions: Maximized MSC bracket? Check contribution history for gaps",
        ],
      },
      {
        heading: "Common mid-career money traps",
        content:
          "Avoid these patterns that derail peak-earner finances:",
        items: [
          "Lifestyle creep: Income rises but so does spending. Keep your 'survive' bucket fixed",
          "Over-reliance on single income: Build passive income streams (dividends, rental, MP2)",
          "Neglecting health: Medical costs compound. Annual checkups are cheaper than hospital stays",
          "Delaying retirement planning: Every year you wait costs exponentially more to catch up",
        ],
      },
    ],
  },
  {
    slug: "health-planning",
    title: "Health Planning for Your Peak Years",
    description:
      "Chronic conditions start appearing in your 30s-40s. Here's how to protect your health and your wallet.",
    category: "health",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/insurance", label: "Insurance Tracker" },
    ],
    sections: [
      {
        heading: "Prevention is cheaper than treatment",
        content:
          "The leading causes of death in the Philippines — heart disease, stroke, diabetes, cancer — are largely preventable or manageable with early detection. A P5,000 annual checkup is infinitely cheaper than a P500,000 hospital bill.",
      },
      {
        heading: "Essential annual health checkups",
        content:
          "Starting at age 35, get these done yearly:",
        items: [
          "Complete blood count (CBC) and blood chemistry (glucose, cholesterol, uric acid)",
          "Blood pressure monitoring (hypertension affects 1 in 4 Filipino adults)",
          "Chest X-ray and ECG (heart screening)",
          "Urinalysis and fecalysis",
          "Eye exam (especially if you work on screens all day)",
          "Dental cleaning and checkup",
          "Women: Pap smear and breast exam. Men: PSA test after age 40",
        ],
      },
      {
        heading: "Healthcare cost management",
        content:
          "Layer your protection to minimize out-of-pocket costs:",
        items: [
          "PhilHealth: Use Konsulta package for free outpatient primary care at accredited facilities",
          "HMO: Maximize your company HMO for consultations, labs, and prescriptions",
          "Critical illness insurance: Consider adding a rider if you have dependents",
          "Health savings: Set aside P2,000–P5,000/month specifically for health expenses",
        ],
      },
    ],
  },
];

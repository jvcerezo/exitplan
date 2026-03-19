import type { Guide } from "../types";

export const UNANG_HAKBANG_GUIDES: Guide[] = [
  {
    slug: "first-job-documents",
    title: "Preparing Documents for Your First Job",
    description:
      "The complete list of documents Filipino employers require — and how to get them fast and free with your First Time Jobseeker certificate.",
    category: "government",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/guide/unang-hakbang", label: "View Stage Progress" },
    ],
    sections: [
      {
        heading: "The standard requirements",
        content:
          "Almost every employer in the Philippines asks for the same set of documents. Having these ready before you even start applying puts you ahead of 90% of fresh graduates.",
        items: [
          "Resume/CV (updated, 1-2 pages max)",
          "PSA Birth Certificate (not the local civil registrar copy — must be PSA-issued)",
          "Transcript of Records (TOR) or diploma",
          "NBI Clearance",
          "Police Clearance or Barangay Clearance",
          "TIN (Tax Identification Number) from BIR",
          "SSS number (E-1 form or printout)",
          "PhilHealth number (PMRF or printout)",
          "Pag-IBIG MID number",
          "2x2 and 1x1 ID photos (white background, at least 4 copies each)",
          "Valid government-issued ID",
          "First Time Jobseeker Certificate from your Barangay (saves you money on fees)",
        ],
      },
      {
        heading: "Get your First Time Jobseeker Certificate first",
        content:
          "Before applying for NBI clearance, police clearance, or any other document — go to your Barangay Hall and get a First Time Jobseeker Certificate under RA 11261. This exempts you from paying fees on most employment requirements. It typically saves ₱500–₱1,500.",
        callout: {
          type: "tip",
          text: "Get the First Time Jobseeker Certificate BEFORE anything else. It makes NBI Clearance, Police Clearance, Barangay Clearance, and even your PSA Birth Certificate FREE. Valid for 1 year.",
        },
      },
      {
        heading: "NBI Clearance — step by step",
        content:
          "The NBI Clearance is the most commonly required pre-employment document. Here's how to get it:",
        items: [
          "Go to clearance.nbi.gov.ph and create an account",
          "Fill out the online application form",
          "Select your preferred NBI branch and appointment date",
          "Pay the fee online (₱155) or present your First Time Jobseeker Certificate for exemption",
          "On your appointment date, bring: valid ID, printed reference number, and First Time Jobseeker Certificate (if applicable)",
          "Biometrics capture (fingerprints and photo) takes about 10-15 minutes",
          "If no 'hit' (name match in records): clearance is released same day",
          "If there's a 'hit': you'll need to return after 7-14 business days for verification",
        ],
      },
      {
        heading: "BIR Form 1902 — for new employees",
        content:
          "When you get hired, your employer will ask you to fill out BIR Form 1902. This registers you as a new employee with the Bureau of Internal Revenue and generates your TIN if you don't already have one.",
        items: [
          "Your employer's HR department provides the form — don't go to BIR yourself",
          "Fill it out completely: personal info, employer details, and tax status",
          "Tax status: 'S' for single with no dependents, 'S1' for single with 1 dependent, 'ME' for married",
          "If you already have a TIN from a previous registration (e.g., freelancing), inform HR immediately — do NOT get a second TIN",
          "Your employer submits this to BIR within 10 days of your start date",
        ],
        callout: {
          type: "warning",
          text: "Never apply for a second TIN. If you already have one (from freelancing, OJT, or scholarship), tell your employer. Having multiple TINs is a criminal offense under the Tax Code.",
        },
      },
      {
        heading: "Pro tips for first-time applicants",
        content:
          "Save time and avoid common mistakes:",
        items: [
          "Process all documents in one week: Day 1 — Barangay (FTJC), Day 2 — NBI, Day 3 — SSS/PhilHealth/Pag-IBIG, Day 4 — PSA birth cert, Day 5 — photos",
          "Bring at least 5 photocopies of every document — employers, banks, and government offices all ask for copies",
          "Wear a collared shirt for your ID photos — some companies require this for their employee IDs",
          "Save digital copies (photos/scans) of all documents on your phone and cloud storage",
          "Create a folder (physical and digital) labeled 'Employment Documents' — you'll need these for your entire career",
        ],
      },
    ],
  },
  {
    slug: "first-payslip-decoded",
    title: "Your First Payslip, Decoded",
    description:
      "Understand every line of your payslip — where your money goes and why those deductions actually protect you.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/tools/contributions", label: "Salary & Deductions Calculator" },
      { href: "/tools/contributions", label: "Track Contributions" },
    ],
    sections: [
      {
        heading: "Why your payslip matters",
        content:
          "Your payslip is a map of your money. Every peso deducted has a purpose — from funding your future retirement pension to covering hospitalization costs. Most fresh graduates glance at the net pay and ignore the rest. That's a mistake. Understanding your payslip is the first step to taking control of your finances.",
      },
      {
        heading: "Gross pay vs. net pay",
        content:
          "Gross pay is your salary before deductions. Net pay (take-home pay) is what actually lands in your bank account. The difference? Mandatory government contributions and income tax. On a P25,000 gross salary, expect roughly P2,500–P3,000 in total deductions, leaving you with around P22,000–P22,500 net.",
        callout: {
          type: "tip",
          text: "Use the Gov't Contributions calculator to see the exact breakdown for your salary — it computes your SSS, PhilHealth, Pag-IBIG deductions, and withholding tax automatically based on current 2024 rates.",
        },
      },
      {
        heading: "SSS (Social Security System)",
        content:
          "Your SSS contribution is split between you and your employer. The employee share is 5% of your Monthly Salary Credit (MSC). This funds your retirement pension, maternity/sickness benefits, disability coverage, and salary/calamity loans. The more you contribute over your career, the higher your pension will be.",
        items: [
          "Retirement pension after 120 months (10 years) of contributions",
          "Salary loan up to 2 months' salary after 36 contributions",
          "Maternity benefit: 100% of daily salary credit for 105 days",
          "Sickness benefit: 90% of daily salary credit for up to 120 days",
        ],
      },
      {
        heading: "PhilHealth",
        content:
          "PhilHealth is your national health insurance. The premium is 5% of your basic salary, split equally between you and your employer. It covers inpatient hospitalization, outpatient consultations, and selected medicines. A single hospital stay without PhilHealth can cost P50,000–P200,000+ out of pocket.",
        callout: {
          type: "ph-law",
          text: "PhilHealth contributions are mandatory for all employed Filipinos under Republic Act No. 11223 (Universal Health Care Act).",
        },
      },
      {
        heading: "Pag-IBIG (HDMF)",
        content:
          "Pag-IBIG contributions are P200/month for most employees. Your employer matches this amount. While it seems small, Pag-IBIG opens the door to housing loans (up to P6,000,000 at 5.75% interest) and the MP2 savings program that earns 6–7% tax-free annually.",
        callout: {
          type: "tip",
          text: "After 24 months of Pag-IBIG contributions, you're eligible for housing loans. Start tracking your contributions now so you know exactly when you qualify.",
        },
      },
      {
        heading: "Withholding tax",
        content:
          "Under the TRAIN Law, you pay 0% income tax if your annual taxable income is P250,000 or below (roughly P20,833/month). Above that threshold, tax rates range from 15% to 35% on a graduated scale. Your employer withholds this tax from each paycheck and remits it to the BIR on your behalf.",
      },
      {
        heading: "What to do right now",
        content:
          "Don't just look at your payslip — verify it. Check that your SSS, PhilHealth, and Pag-IBIG deductions match the official contribution tables. Some employers make errors or, worse, deduct but fail to remit. Track your contributions monthly using Sandalan.",
        items: [
          "Open the Gov't Contributions calculator and enter your gross salary",
          "Compare the calculated deductions with your actual payslip",
          "Start logging your contributions in the Contributions Tracker",
          "Set a monthly reminder to verify your contributions are posted",
        ],
      },
    ],
  },
  {
    slug: "government-id-roadmap",
    title: "The Government ID Roadmap",
    description:
      "Which IDs to get first, what documents you need, and how to avoid the 'you need an ID to get an ID' trap.",
    category: "government",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/guide/unang-hakbang", label: "View Stage Progress" },
    ],
    sections: [
      {
        heading: "The chicken-and-egg problem",
        content:
          "Fresh graduates often face a frustrating loop: you need a valid ID to get a valid ID. Most government agencies require at least one government-issued ID for registration. If you have zero IDs, where do you even start?",
        callout: {
          type: "tip",
          text: "Start with a Postal ID (P504, requires only a birth certificate) or PhilSys National ID (free, requires birth certificate + biometrics). These are the easiest 'starter' IDs.",
        },
      },
      {
        heading: "The recommended order",
        content:
          "Based on ease of acquisition and usefulness, here's the optimal order to get your IDs:",
        items: [
          "1. PhilSys National ID — free, lifetime validity, biometric-linked, accepted everywhere once fully rolled out",
          "2. TIN (BIR) — required before employment. Your employer can process this for you via Form 1902",
          "3. SSS Number — mandatory for employment. Register online at my.sss.gov.ph",
          "4. PhilHealth — mandatory. Employer enrolls you, or self-register at PhilHealth office",
          "5. Pag-IBIG MID — mandatory. Register at Virtual Pag-IBIG or any branch",
          "6. Postal ID — backup ID, P504, available at any post office",
          "7. UMID — combines SSS/PhilHealth/Pag-IBIG into one card. Apply after 1+ SSS contribution",
          "8. Passport — most powerful ID. Apply at DFA (P950 regular, P1,200 expedited)",
        ],
      },
      {
        heading: "Documents you need for almost everything",
        content:
          "Keep certified true copies of these documents ready. You'll need them repeatedly across all government applications:",
        items: [
          "PSA Birth Certificate (order at psaserbilis.com.ph, P365)",
          "Two 1x1 and two 2x2 ID photos (white background)",
          "Proof of address (barangay certificate, utility bill, or rent contract)",
          "Any existing valid government ID (for subsequent applications)",
        ],
      },
      {
        heading: "Common pitfalls to avoid",
        content:
          "Government ID processes in the Philippines have known friction points. Here's how to navigate them:",
        items: [
          "NBI Clearance 'hits': Common Filipino surnames trigger false positives. Bring extra valid IDs and be prepared to return for verification",
          "DFA passport appointments: Slots fill up fast. Book 2–3 weeks ahead on dfa.gov.ph. Avoid fixers — it's a criminal offense",
          "Multiple TINs: Having more than one TIN is illegal (up to P1,000 fine and/or imprisonment). If your employer issues you a new TIN, inform BIR immediately to merge records",
          "SSS/PhilHealth/Pag-IBIG portals: These go down frequently. Try during off-peak hours (early morning or late evening)",
        ],
        callout: {
          type: "warning",
          text: "Never surrender your original PSA birth certificate. Government agencies only need to see the original — they should accept a photocopy for their records.",
        },
      },
      {
        heading: "Track your progress",
        content:
          "Use the Adulting Checklist in Sandalan to track which IDs you've obtained and which are still pending. Each ID is marked with a priority level — start with the 'Must Do' items and work your way down.",
      },
    ],
  },
  {
    slug: "your-first-budget",
    title: "Your First Budget (That Actually Works)",
    description:
      "Forget the 50/30/20 rule. Here's a budgeting approach designed for Filipino realities — from 'petsa de peligro' to family obligations.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/budgets", label: "Set Up Your Budget" },
      { href: "/transactions", label: "Track Expenses" },
    ],
    sections: [
      {
        heading: "Why most budgets fail for Filipinos",
        content:
          "The popular 50/30/20 rule (50% needs, 30% wants, 20% savings) was designed for Western households. It doesn't account for Filipino realities: family obligations (utang na loob), irregular income, the 'petsa de peligro' cycle, and the cultural expectation that breadwinners support extended family. Let's build a budget that actually works.",
      },
      {
        heading: "The Filipino 4-Bucket System",
        content:
          "Instead of percentages, think in four buckets that you fill in priority order every payday:",
        items: [
          "Bucket 1 — SURVIVE (fixed costs): Rent, utilities, food, transport, phone/internet. These are non-negotiable. Know this number exactly.",
          "Bucket 2 — PROTECT (savings & insurance): Emergency fund, SSS/PhilHealth/Pag-IBIG (if voluntary), insurance premiums. Pay yourself second, not last.",
          "Bucket 3 — SUPPORT (family obligations): Monthly padala to parents, sibling tuition, family emergencies. Set a fixed amount you can actually afford — don't give until you're broke.",
          "Bucket 4 — LIVE (everything else): Social, dating, hobbies, shopping, subscriptions. Whatever's left after the first three buckets.",
        ],
        callout: {
          type: "tip",
          text: "The magic is in the order. Most Filipinos do Survive → Support → Live → (nothing left for) Protect. Flip the script: Survive → Protect → Support → Live.",
        },
      },
      {
        heading: "Beating 'petsa de peligro'",
        content:
          "The 'danger payday' cycle happens when you spend freely after payday and scrape by before the next one. The fix: divide your monthly budget by 2 (for bi-monthly paydays) or 4 (for weekly budgeting). Allocate your four buckets per pay period, not per month. This way you never have a 'feast or famine' cycle.",
      },
      {
        heading: "Start tracking today",
        content:
          "You don't need a perfect budget on day one. Start by tracking every peso for 30 days — just record what you spend. After one month, you'll know exactly where your money goes. Then set realistic budget limits based on actual data, not guesses.",
        items: [
          "Log every expense in Sandalan (even P20 jeepney fares)",
          "After 30 days, review your spending by category",
          "Set budget limits in the Budgets tab based on your actual patterns",
          "Adjust monthly until you find a rhythm that works for your income",
        ],
      },
    ],
  },
  {
    slug: "understanding-deductions",
    title: "Where Does My Salary Go?",
    description:
      "A visual guide to every peso deducted from your paycheck — SSS, PhilHealth, Pag-IBIG, and taxes explained simply.",
    category: "financial-literacy",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/contributions", label: "Salary & Deductions Calculator" },
      { href: "/tools/contributions", label: "Contributions Tracker" },
    ],
    sections: [
      {
        heading: "It's not just deductions — it's your safety net",
        content:
          "Most fresh grads see salary deductions as money taken away. In reality, these deductions build your personal safety net: retirement income, health coverage, housing eligibility, and emergency loans. Think of them as forced savings managed by the government on your behalf.",
      },
      {
        heading: "Sample breakdown: P25,000 monthly salary",
        content:
          "Here's what happens to a P25,000 gross monthly salary for a regular employee:",
        items: [
          "SSS (employee share): ~P1,125 — funds your pension, loans, maternity/sickness benefits",
          "PhilHealth (employee share): ~P625 — covers hospitalization and outpatient care",
          "Pag-IBIG (employee share): P200 — housing loans and MP2 savings eligibility",
          "Withholding tax: ~P416 — income tax on earnings above P20,833/month",
          "Total deductions: ~P2,366",
          "Net take-home: ~P22,634",
        ],
        callout: {
          type: "info",
          text: "Your employer also contributes on top of your deductions: ~P2,250 for SSS, ~P625 for PhilHealth, and P200 for Pag-IBIG. Your total compensation is actually higher than your gross salary.",
        },
      },
      {
        heading: "What you get back",
        content:
          "These aren't just costs — they're benefits you can claim:",
        items: [
          "SSS: Retirement pension (after 120 months of contributions), salary loan (up to 2x monthly salary), maternity leave pay, sickness benefit",
          "PhilHealth: Hospital bill coverage through case rates, outpatient consultations, Z-benefits for cancer and other conditions",
          "Pag-IBIG: Housing loan at 5.75% (after 24 contributions), multi-purpose loan, MP2 savings at 6–7% tax-free dividends",
          "Income tax: Funds public services — roads, schools, healthcare. Under TRAIN Law, the first P250,000/year is tax-free",
        ],
      },
      {
        heading: "Verify your deductions",
        content:
          "Don't blindly trust your payslip. Use the Gov't Contributions calculator to check if your deductions are computed correctly. Then log your contributions monthly to catch any discrepancies early — some employers deduct but fail to remit to SSS/PhilHealth/Pag-IBIG.",
      },
    ],
  },
];

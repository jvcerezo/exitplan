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
  {
    slug: "buying-first-vehicle",
    title: "Buying Your First Vehicle",
    description:
      "Motorcycle or car? New or secondhand? A practical guide to vehicle ownership costs, financing, and insurance in the Philippines.",
    category: "financial-literacy",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/goals", label: "Set Vehicle Fund Goal" },
      { href: "/budgets", label: "Set Up Vehicle Budget" },
    ],
    sections: [
      {
        heading: "Motorcycle vs car: the real math",
        content:
          "Motorcycles dominate Filipino roads — sales grew 7% in 2024 to 1.68 million units. For most young professionals, a motorcycle makes more financial sense. But let's compare honestly:",
        items: [
          "Motorcycle (scooter, 125cc): ₱60,000–₱120,000 new. Monthly costs: ₱1,500–₱3,000 (gas, maintenance, insurance)",
          "Motorcycle (manual, 150cc+): ₱80,000–₱180,000 new. Monthly costs: ₱2,000–₱4,000",
          "Car (subcompact, new): ₱700,000–₱1,000,000. Monthly costs: ₱10,000–₱20,000 (amortization, gas, insurance, parking, maintenance)",
          "Car (secondhand): ₱250,000–₱500,000. Monthly costs: ₱5,000–₱12,000 (no amortization if paid cash, but higher maintenance)",
          "Rule of thumb: If your monthly take-home is under ₱40,000, a car will eat your savings alive. A motorcycle gets you mobile at 1/10th the cost",
        ],
        callout: {
          type: "tip",
          text: "65% of motorcycle sales in the Philippines are automatic scooters. For commuting, you don't need a big bike — a Honda Click or Yamaha Mio is fuel-efficient, easy to ride, and cheap to maintain.",
        },
      },
      {
        heading: "New vs secondhand",
        content:
          "Both have trade-offs. Here's what to consider:",
        items: [
          "New vehicles: Full warranty (3-5 years for cars, 1-2 years for motorcycles), predictable maintenance schedule, latest safety features. But you pay a 15-20% depreciation the moment you drive off the lot",
          "Secondhand vehicles: 30-50% cheaper, no depreciation hit. But you inherit someone else's problems. Always: check service records, do a test drive, and have a trusted mechanic inspect it before you buy",
          "Secondhand red flags: Salvaged title, flood damage (check for waterline stains under carpets), odometer rollback, no original OR/CR documents",
          "Where to buy secondhand: Facebook Marketplace, Carousell, Autodeal, Tsikot (cars); FB motorcycle groups (bikes). Avoid buying from someone who can't show you the original OR/CR",
        ],
      },
      {
        heading: "Financing: cash vs installment",
        content:
          "If you can pay cash, do it. If you must finance, know the real cost:",
        items: [
          "Bank auto loans: 5-15% interest per year, 3-5 year terms. Requires credit history and proof of income",
          "Dealer financing: Convenient but typically higher rates (8-18%). Read the fine print on early termination penalties",
          "Motorcycle financing: Casa (dealer) installments are common. Down payment: 10-30%. Monthly: ₱2,500–₱5,000 for 12-36 months",
          "Total cost of financing: A ₱800,000 car at 10% interest over 5 years = ₱1,020,000 total. You're paying ₱220,000 just for the privilege of borrowing",
          "The 20/4/10 rule: Put 20% down, finance for no more than 4 years, and total vehicle costs (payment + insurance + gas) should not exceed 10% of your gross income",
        ],
      },
      {
        heading: "Registration, insurance, and legal requirements",
        content:
          "Owning a vehicle comes with mandatory annual costs:",
        items: [
          "LTO registration: Renewed annually. Cars: ₱1,500–₱5,000. Motorcycles: ₱500–₱1,500. Check your OR/CR expiry date",
          "CTPL (Compulsory Third-Party Liability) insurance: Required by law. Cars: ₱600–₱1,800/year. Motorcycles: ₱300–₱600/year",
          "Comprehensive insurance (optional but recommended): Covers theft, fire, natural disasters, and own damage. Cars: ₱15,000–₱40,000/year depending on value",
          "Emission testing: Required for registration renewal. ₱300–₱600",
          "Driver's license: Student permit (₱535) → Non-Pro (₱585 for 5 years) or Pro (₱745 for 3 years). Motorcycle license is a separate restriction code",
          "Helmet law: Riders and passengers must wear standard helmets (ICC-certified). Fines: ₱1,500 (first offense) to ₱10,000 (third)",
        ],
        callout: {
          type: "warning",
          text: "Never buy a vehicle without verifying the OR/CR (Official Receipt and Certificate of Registration) from LTO. Stolen vehicles and fake documents are common in the secondhand market. Check at the LTO office or through their online verification system.",
        },
      },
      {
        heading: "The true cost of ownership",
        content:
          "Before buying, calculate the total annual cost — not just the purchase price:",
        items: [
          "Motorcycle: Purchase + registration + CTPL + gas + maintenance + helmet/gear = ₱15,000–₱30,000/year (excluding purchase)",
          "Car: Purchase + registration + CTPL + comprehensive insurance + gas + maintenance + parking + toll = ₱80,000–₱200,000/year (excluding purchase/amortization)",
          "Set up a 'Vehicle Fund' goal in Sandalan and auto-save for annual costs monthly so you're never caught off guard by registration or repair bills",
        ],
      },
    ],
  },
  {
    slug: "digital-safety-privacy",
    title: "Digital Safety & Protecting Your Accounts",
    description:
      "86% of Filipino youth encounter online safety issues. Secure your financial accounts, protect your data, and know your rights under the Data Privacy Act.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/guide/tahanan", label: "View Stage Progress" },
    ],
    sections: [
      {
        heading: "Your digital life is your financial life",
        content:
          "Everything is online now: GCash, Maya, online banking, SSS, PhilHealth, Pag-IBIG portals, BIR eFiling. If someone gains access to your accounts, they can drain your money, steal your identity, or take out loans in your name. 86% of Filipino youth encounter online safety issues, yet only 3% report to authorities. Prevention is everything.",
      },
      {
        heading: "Secure your financial accounts",
        content:
          "Do this today — it takes 30 minutes and could save you hundreds of thousands of pesos:",
        items: [
          "Enable 2FA (Two-Factor Authentication) on every financial account: GCash, Maya, BDO, BPI, UnionBank, Metrobank — all support this",
          "Use unique passwords for each account. 'Juan123' for everything means losing one password loses everything",
          "Use a password manager: Bitwarden (free) or 1Password (paid) generates and stores strong passwords so you don't have to remember them",
          "Set up login notifications: Most banks can text or email you when your account is accessed. Enable this immediately",
          "Check your GCash/Maya transaction history weekly — catch unauthorized transactions early",
          "Never save passwords in your browser on shared or public computers",
          "Use biometric login (fingerprint/face ID) on your banking apps — it's faster AND more secure than passwords",
        ],
        callout: {
          type: "tip",
          text: "A strong password is at least 12 characters with a mix of letters, numbers, and symbols. Better yet: use a passphrase like 'AdoboNiLola#2025!' — easy to remember, extremely hard to crack.",
        },
      },
      {
        heading: "Protecting your personal data",
        content:
          "Your personal information has value — scammers use it for identity theft, SIM swaps, and loan fraud:",
        items: [
          "Never post photos of your IDs, credit cards, or boarding passes on social media — they contain sensitive information that can be used for fraud",
          "Review your Facebook/Instagram privacy settings: Set profile to 'Friends Only,' hide your phone number, email, and birthday from public view",
          "Be careful with online forms: Only provide personal data to verified, legitimate websites. Check for HTTPS and look up the company before sharing info",
          "Shred or burn physical documents with personal info before throwing them away — dumpster diving for identity theft is real",
          "When apps request permissions (contacts, photos, location), ask: 'Does this app actually need this to function?' If not, deny it",
          "Regularly check if your email has been in a data breach at haveibeenpwned.com — if it has, change that password immediately",
        ],
      },
      {
        heading: "Your rights under the Data Privacy Act",
        content:
          "RA 10173 (Data Privacy Act of 2012) gives you powerful rights that most Filipinos don't know about:",
        items: [
          "Right to be informed: Companies must tell you what data they collect and why",
          "Right to access: You can request a copy of all personal data a company holds about you",
          "Right to correct: You can demand correction of inaccurate data",
          "Right to erasure: You can request deletion of your personal data when it's no longer needed",
          "Right to file a complaint: Report violations to the National Privacy Commission (privacy.gov.ph)",
          "Companies that mishandle your data face fines of ₱500,000–₱5,000,000 and imprisonment of 1-6 years",
        ],
        callout: {
          type: "ph-law",
          text: "Under RA 10173, you have the right to know what personal data companies collect about you, and you can demand they delete it. This includes lending apps that harvest your contacts and photos. Report violators to the NPC at privacy.gov.ph.",
        },
      },
      {
        heading: "What to do if your accounts are compromised",
        content:
          "Act within the first hour — speed matters:",
        items: [
          "Immediately change the password of the compromised account from a different, secure device",
          "Contact the bank/e-wallet's fraud department. GCash: 2882. Maya: (02) 8845-7788. BDO: (02) 8631-8000. BPI: (02) 889-10000",
          "If your SIM was swapped (phone suddenly has no signal): Call your telco immediately to block the number and issue a new SIM",
          "File a police report — this is required documentation for disputing fraudulent transactions",
          "Check all linked accounts: If your email was compromised, every account using that email is at risk",
          "Freeze your credit: Contact CIC (creditinfo.gov.ph) to flag your record if you suspect identity theft",
          "Enable additional security on all accounts and change passwords for everything that used the same password",
        ],
      },
    ],
  },
];

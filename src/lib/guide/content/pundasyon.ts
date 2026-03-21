import type { Guide } from "../types";

export const PUNDASYON_GUIDES: Guide[] = [
  {
    slug: "emergency-fund-101",
    title: "Emergency Fund 101",
    description:
      "60.7% of Filipinos can't cover a P20,000 emergency. Here's how to build your safety net — even on a tight salary.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/goals", label: "Set Emergency Fund Goal" },
    ],
    sections: [
      {
        heading: "Why you need one before anything else",
        content:
          "An emergency fund is money set aside for the unexpected: a medical bill, job loss, broken phone, or urgent family need. Without one, any surprise expense forces you into debt — credit cards at 24–36% interest, 5-6 loans from coworkers, or predatory lending apps. Building an emergency fund is the single most important financial step you can take.",
        callout: {
          type: "warning",
          text: "60.7% of Filipinos cannot cover a P20,000 emergency expense. Don't be part of that statistic.",
        },
      },
      {
        heading: "How much do you need?",
        content:
          "The standard advice is 3–6 months of essential living expenses. But start with a more achievable target:",
        items: [
          "Starter goal: P10,000–P20,000 (covers most common emergencies)",
          "Minimum target: 3 months of living expenses (single, stable job)",
          "Ideal target: 6 months of living expenses (freelancer, breadwinner, or dependents)",
          "Formula: Monthly expenses (rent + food + transport + utilities + insurance) × target months",
        ],
      },
      {
        heading: "Where to keep it",
        content:
          "Your emergency fund must be liquid (accessible within 24 hours) but not too easy to spend. Best options:",
        items: [
          "High-yield digital savings: ING (4% p.a.), CIMB (4.5%), Maya (3.5%), Tonik (4%) — no maintaining balance, PDIC-insured",
          "Separate from your spending account — open a dedicated 'EF' savings account so you don't accidentally spend it",
          "Not in investments: Stocks, UITFs, or crypto are NOT emergency funds. They can lose value when you need them most",
          "Not in time deposits: You can't withdraw without penalty before maturity",
        ],
        callout: {
          type: "tip",
          text: "Open a separate high-yield digital bank account just for your emergency fund. Name it 'DO NOT TOUCH' if that helps. The slight friction of transferring money out helps prevent impulse withdrawals.",
        },
      },
      {
        heading: "Building it on a tight salary",
        content:
          "Even on P15,000–P25,000/month, you can build an emergency fund. The key is automation and consistency, not large amounts:",
        items: [
          "P500/payday = P1,000/month = P12,000/year (a solid starter emergency fund)",
          "P1,000/payday = P2,000/month = P24,000/year (almost 2 months' expenses for a frugal lifestyle)",
          "Set up auto-transfer from your payroll bank on payday — 'pay yourself first' before you spend anything",
          "Funnel windfalls: 13th month, bonuses, tax refunds, and monetary gifts go straight to EF until it's funded",
        ],
      },
      {
        heading: "Track your runway",
        content:
          "Create an Emergency Fund goal in Sandalan. Set your target amount (monthly expenses × 3 or 6) and log every deposit. The goal tracker shows your progress and tells you how many months of coverage you have. Watching the bar fill up is genuinely motivating.",
      },
    ],
  },
  {
    slug: "investing-for-beginners",
    title: "Investing 101 for Filipinos",
    description:
      "You've got your emergency fund. Now make your money work. A beginner's guide to MP2, UITFs, and the Philippine stock market.",
    category: "investing",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/tools/calculators", label: "Compound Interest Calculator" },
      { href: "/goals", label: "Set Investment Goal" },
    ],
    sections: [
      {
        heading: "When to start investing",
        content:
          "Only invest after you have: (1) an emergency fund covering 3–6 months of expenses, (2) no high-interest debt (credit cards, lending apps), and (3) adequate insurance. Investing before these foundations are in place is like building a house on sand.",
        callout: {
          type: "warning",
          text: "Never invest your emergency fund. Investments can lose value. Your EF must be 100% liquid and safe.",
        },
      },
      {
        heading: "The investment ladder for Filipinos",
        content:
          "Start at the bottom (safest, lowest returns) and climb up as your knowledge and risk tolerance grow:",
        items: [
          "Rung 1 — Pag-IBIG MP2: 6–7% annual dividends, tax-free, government-backed. Minimum P500. Best guaranteed return in the Philippines. Start here.",
          "Rung 2 — Money Market Funds / Bond Funds: UITFs available through BDO, BPI, UnionBank. Low risk, 3–5% returns. Minimum P1,000–P10,000.",
          "Rung 3 — Balanced Funds: Mix of bonds and stocks. Moderate risk, 5–8% historical returns. Good for 3–5 year goals.",
          "Rung 4 — Equity Funds / Index Funds: Invest in the Philippine stock market without picking stocks. Higher risk, 8–12% long-term returns. Minimum 5–10 year horizon.",
          "Rung 5 — Direct Stock Market (PSE): Buy individual stocks through COL Financial, BDO Nomura, or First Metro. Requires learning and monitoring. Only with money you won't need for 10+ years.",
        ],
      },
      {
        heading: "Pag-IBIG MP2: The best-kept secret",
        content:
          "MP2 is a voluntary savings program from Pag-IBIG that has consistently delivered 6–7% annual dividends — completely tax-free. It's arguably the best guaranteed return available to any Filipino. The 5-year maturity period locks your money in, but you can withdraw dividends annually. After 5 years, you can renew or withdraw everything.",
        callout: {
          type: "tip",
          text: "You can enroll in MP2 through Virtual Pag-IBIG with just P500. Set up auto-debit and forget about it. In 5 years, you'll thank yourself.",
        },
      },
      {
        heading: "The magic of compound interest",
        content:
          "If you invest P2,000/month starting at age 23 at 7% annual returns (MP2-equivalent), you'll have approximately P2,400,000 by age 45 — you only contributed P528,000. The rest is compound interest. Starting 5 years later (at 28) with the same amount gives you only P1,500,000. Time is your biggest advantage.",
      },
      {
        heading: "Common mistakes to avoid",
        content:
          "Filipino investors frequently make these errors:",
        items: [
          "Buying VUL (Variable Universal Life) as your 'investment': VUL mixes insurance and investing, resulting in high fees and mediocre returns for both. Get term insurance + separate investments instead.",
          "Investing based on social media tips: Don't buy stocks because someone on TikTok said to. Do your own research.",
          "Panic selling during market drops: The PSE drops 10–20% regularly. If you're investing for 10+ years, downturns are buying opportunities.",
          "Not diversifying: Don't put everything in one stock or one investment type. Spread across MP2, UITFs, and equities.",
        ],
      },
    ],
  },
  {
    slug: "credit-building",
    title: "Building Your Credit Score",
    description:
      "Good credit unlocks lower interest rates on loans and credit cards. Here's how the Philippine credit system works and how to build yours.",
    category: "financial-literacy",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/debts", label: "Debt Manager" },
    ],
    sections: [
      {
        heading: "Philippine credit scores explained",
        content:
          "The Credit Information Corporation (CIC) maintains credit records for all Filipinos. Your score ranges from 300–850. Banks and lenders check this score when you apply for credit cards, personal loans, home loans, and car loans. A score above 700 is considered good for approval with favorable rates.",
      },
      {
        heading: "How to check your score",
        content:
          "You can check your CIC credit score for free twice per year using the CIC App 3.0 (available on Android and iOS). You'll need a valid government ID to register. Your report shows all credit accounts, payment history, and inquiries from lenders.",
        callout: {
          type: "ph-law",
          text: "Under Republic Act No. 9510, every Filipino has the right to access their credit information from the CIC. Lenders must report to the CIC and are required to inform you if they deny credit based on your CIC record.",
        },
      },
      {
        heading: "Building credit from scratch",
        content:
          "If you have no credit history (common for fresh graduates), here's how to build it:",
        items: [
          "Start with a secured credit card: Deposit P2,000–P10,000 as collateral and get a credit card with that limit. BPI, Security Bank, and RCBC offer these.",
          "Use it for small, regular purchases: Groceries, gas, subscriptions. Spend 10–30% of your limit.",
          "Pay the full balance every billing cycle: This costs you P0 in interest and builds a perfect payment history.",
          "After 6–12 months: Apply for a regular credit card. Your payment history from the secured card will support your application.",
        ],
      },
      {
        heading: "The golden rules of credit",
        content:
          "Credit is a powerful tool when used correctly, and a dangerous trap when misused:",
        items: [
          "Always pay the full balance — minimum payments trap you in 24–36% annual interest",
          "Never use more than 30% of your credit limit (utilization ratio affects your score)",
          "Never use credit cards for cash advances (25–30% interest + additional fees)",
          "Set up auto-pay for at least the minimum payment to avoid late fees",
          "Don't apply for multiple credit cards at once — each application creates an inquiry that temporarily lowers your score",
        ],
      },
    ],
  },
  {
    slug: "freelancer-tax-guide",
    title: "The Filipino Freelancer Tax Guide",
    description:
      "Freelancing? The BIR knows. Here's how to register, file, and potentially save money with the 8% flat tax option.",
    category: "government",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/tools/taxes", label: "BIR Tax Tracker" },
      { href: "/tools/calculators", label: "Tax Calculator" },
    ],
    sections: [
      {
        heading: "If you earn outside of employment, you must register",
        content:
          "Any income from freelancing, consulting, online selling, content creation, or side businesses requires BIR registration. The BIR has been actively cracking down on unregistered digital earners and influencers. Penalties for non-compliance include 25% surcharge, 12% annual interest, and potential criminal charges going back 3–10 years.",
        callout: {
          type: "warning",
          text: "Saying 'I didn't know' is not a defense. The BIR has filed cases against freelancers and online sellers who failed to register. Register now before you get caught.",
        },
      },
      {
        heading: "How to register as a freelancer",
        content:
          "Step-by-step BIR registration for self-employed individuals:",
        items: [
          "1. Go to your local Revenue District Office (RDO) based on your home address",
          "2. File BIR Form 1901 with: TIN, valid government ID, birth certificate, proof of business address",
          "3. Pay the P500 annual registration fee (abolished from 2025 onward) and P30 documentary stamp tax",
          "4. Register your books of accounts (you can buy blank books from bookstores)",
          "5. Get authority to print Official Receipts (OR) or use BIR's electronic invoicing system",
          "6. You're now registered. File quarterly and annual tax returns on time.",
        ],
      },
      {
        heading: "8% flat tax vs graduated rates",
        content:
          "If your annual gross receipts are P3,000,000 or below, you can choose the 8% flat income tax rate instead of the graduated rates (0–35%). The 8% rate is computed on gross receipts exceeding P250,000 (the tax-free threshold). For most freelancers earning under P3M/year, the 8% option is simpler and often cheaper.",
        items: [
          "8% flat tax: 8% × (gross receipts - P250,000). No need to track itemized expenses.",
          "Graduated rates + OSD: Net income × tax bracket rate. You can deduct 40% of gross as Optional Standard Deduction.",
          "Example: P500,000 gross receipts → 8% flat tax = P20,000. Graduated with OSD → P17,500. Compare both before choosing.",
        ],
        callout: {
          type: "tip",
          text: "You must elect your tax option at the start of the year. Once chosen, you can't switch until the next tax year. Use the Tax Calculator to compare both options for your income level.",
        },
      },
      {
        heading: "Filing deadlines (don't miss these)",
        content:
          "Self-employed individuals must file these returns on time. Late filing incurs automatic penalties:",
        items: [
          "Quarterly Income Tax (Form 1701Q): May 15, August 15, November 15",
          "Annual Income Tax (Form 1701): April 15",
          "Quarterly Percentage Tax (Form 2551Q): April 25, July 25, October 25, January 25 — only if NOT using 8% flat tax",
          "You must file even if you had zero income for the quarter",
        ],
      },
    ],
  },
  {
    slug: "side-hustle-guide",
    title: "The Filipino Side Hustle Guide",
    description:
      "65% of Gen Z Filipinos have a side job. Here's how to start one, manage the money, and avoid the common traps of gig work.",
    category: "career",
    readTimeMinutes: 6,
    toolLinks: [
      { href: "/transactions", label: "Track Side Hustle Income" },
      { href: "/goals", label: "Set Income Goal" },
    ],
    sections: [
      {
        heading: "Why a side hustle isn't optional anymore",
        content:
          "With rising commodity costs and salaries that can't keep up, 65% of Filipino Gen Zs have a part-time or full-time side job. The digital economy contributed ₱2.25 trillion (8.5% of GDP) in 2024. The opportunity is real — but so are the risks if you don't manage it properly.",
      },
      {
        heading: "Best side hustles for Filipinos in 2025",
        content:
          "These are ranked by accessibility, earning potential, and flexibility:",
        items: [
          "Virtual Assistant (VA): ₱15,000–₱60,000+/month. Low barrier to entry, high demand from international clients. Start on OnlineJobs.ph, Upwork, or Fiverr",
          "Freelance writing/copywriting: ₱5,000–₱40,000/month. If you write well in English, global clients are hiring. Build samples on Medium or a free blog",
          "Graphic design: ₱10,000–₱50,000/month. Tools: Canva (free), Figma (free). Sell services on Fiverr or local FB groups",
          "Social media management: ₱8,000–₱30,000/month. Many small PH businesses need help with Facebook/IG. Approach local shops directly",
          "Online tutoring: ₱10,000–₱25,000/month. Teach English to Korean/Japanese students through platforms like Cambly, Preply, or local tutorial centers",
          "E-commerce reselling: Start with dropshipping on Shopee/Lazada or buy-and-sell from Divisoria/Taytay. Capital needed: ₱3,000–₱10,000",
          "Content creation: YouTube, TikTok, blogging. Slow build but can become a full income stream. Filipino content creators are in demand globally",
        ],
      },
      {
        heading: "Managing side hustle money",
        content:
          "The #1 mistake: mixing side hustle income with your salary. Separate them from day one:",
        items: [
          "Open a dedicated bank account or e-wallet for side hustle income only",
          "Track all side hustle income in Sandalan as a separate category — know exactly what you're earning",
          "Set aside 30% of every payment for taxes (if you earn over ₱250,000/year, you owe BIR)",
          "Don't lifestyle-inflate — treat side hustle money as acceleration for your financial goals (EF, investments, debt payoff), not extra spending money",
          "Reinvest in your hustle: better equipment, courses, or tools that increase your earning capacity",
        ],
        callout: {
          type: "warning",
          text: "If your side hustle income exceeds ₱250,000/year, you must register with BIR and file taxes. See our Freelancer Tax Guide for the step-by-step process.",
        },
      },
      {
        heading: "The risks nobody talks about",
        content:
          "Gig work has real downsides that full-time employment covers:",
        items: [
          "No employer-paid SSS, PhilHealth, or Pag-IBIG — you must contribute voluntarily if freelancing full-time",
          "No HMO coverage — budget for your own health insurance or HMO plan",
          "Income instability — feast-or-famine cycles are normal. This is why your emergency fund must be larger (6 months minimum)",
          "Burnout: Working a day job + side hustle = 60-80 hour weeks. Set boundaries. A burnt-out freelancer earns zero",
          "Client non-payment: Stick to established platforms (Upwork, OnlineJobs.ph) that have payment protection. Avoid direct deals with strangers unless you get partial payment upfront",
          "Blurred work-life boundaries: Set a schedule and stick to it. 'Always available' is not sustainable",
        ],
      },
      {
        heading: "Going full-time freelance",
        content:
          "Before quitting your day job to freelance full-time, hit these milestones:",
        items: [
          "Side hustle income consistently matches or exceeds your salary for 6+ months",
          "Emergency fund covers 6-12 months of living expenses (longer runway because income is irregular)",
          "You're already registered with BIR and filing taxes properly",
          "You have voluntary SSS, PhilHealth, and Pag-IBIG contributions set up",
          "You have at least 2-3 regular clients (don't depend on a single income source)",
          "You have health coverage (HMO or private insurance) independent of any employer",
        ],
      },
    ],
  },
  {
    slug: "debt-management-young-adults",
    title: "Escaping the Debt Trap",
    description:
      "Credit cards, lending apps, salary loans — debt spirals fast when you're young. Here's how to take control before it controls you.",
    category: "financial-literacy",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/transactions", label: "Track Expenses" },
      { href: "/goals", label: "Set Debt Payoff Goal" },
    ],
    sections: [
      {
        heading: "How young Filipinos fall into debt",
        content:
          "It starts innocently: a credit card for 'emergencies,' a lending app for a gadget, a salary loan to cover petsa de peligro. Then the minimum payments pile up, interest compounds, and suddenly 30-40% of your salary goes to debt servicing. 44% of Filipinos fear they can't pay their bills in full. If that's you, there's a way out.",
      },
      {
        heading: "The debt inventory — face the numbers",
        content:
          "You can't fix what you don't measure. List every debt you owe:",
        items: [
          "Credit card balances: Note the interest rate (typically 24-36% per year or 2-3% per month)",
          "Lending app loans: GCash/Maya loans, Tala, Cashalo, Home Credit — check the effective interest rate, not just the 'service fee'",
          "Salary loans: SSS, Pag-IBIG, company salary loans — usually lower interest but still debt",
          "Personal loans from family or friends — no interest but carries emotional weight",
          "For each debt: write the total balance, monthly payment, interest rate, and due date",
        ],
        callout: {
          type: "tip",
          text: "Many lending apps advertise a 'small service fee' that translates to 50-100%+ annual interest. A P10,000 loan with a P1,500 'processing fee' paid over 3 months is effectively 60% annual interest. Always calculate the true cost.",
        },
      },
      {
        heading: "Two strategies to pay off debt",
        content:
          "Pick one approach and commit to it:",
        items: [
          "Avalanche method (mathematically optimal): Pay minimums on all debts, then throw every extra peso at the debt with the HIGHEST interest rate. Once that's paid off, redirect that payment to the next highest. Saves the most money on interest",
          "Snowball method (psychologically powerful): Pay minimums on all debts, then throw every extra peso at the SMALLEST balance first. The quick wins keep you motivated. Best if you've tried and failed to stick to a plan before",
          "Either method: NEVER pay just the minimum on credit cards. At 2% minimum payment on a P50,000 balance at 3%/month interest, it takes 7+ years to pay off and you'll pay P40,000+ in interest alone",
        ],
      },
      {
        heading: "Emergency moves for a debt crisis",
        content:
          "If you're already drowning — payments are late, collectors are calling — take these steps:",
        items: [
          "Stop borrowing immediately. Cut up credit cards if you have to. Delete lending apps",
          "Call your credit card company and ask for a restructuring plan. Most banks will reduce interest or extend terms if you ask before you miss payments",
          "For lending app harassment: RA 10173 (Data Privacy Act) prohibits lending apps from accessing your contacts or shaming you publicly. Report to the National Privacy Commission (privacy.gov.ph)",
          "SSS calamity/salary loans have lower rates — consider using one to consolidate higher-interest debt (but only if you stop creating new debt)",
          "Negotiate with family lenders: Be honest about your situation and propose a realistic repayment schedule",
        ],
        callout: {
          type: "ph-law",
          text: "Lending apps that harass you, contact people in your phonebook, or publicly shame you are violating the Data Privacy Act (RA 10173) and Lending Company Regulation Act (RA 9474). Report them to the National Privacy Commission and SEC.",
        },
      },
      {
        heading: "Staying debt-free after payoff",
        content:
          "Paying off debt is only half the battle. Stay out:",
        items: [
          "Build your emergency fund to prevent borrowing for unexpected expenses",
          "Use credit cards only for purchases you can pay in FULL by the due date. Never revolve a balance",
          "The 24-hour rule: Want something expensive? Wait 24 hours before buying. Most impulse urges pass",
          "Automate your savings on payday — what you don't see, you won't spend",
          "Track every peso in Sandalan. Awareness alone reduces spending by 10-15%",
        ],
      },
    ],
  },
  {
    slug: "family-financial-boundaries",
    title: "Setting Financial Boundaries with Family",
    description:
      "Pamilya muna culture is beautiful — until it drains your savings. How to support family without sacrificing your future.",
    category: "family",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/budgets", label: "Set Up Support Budget" },
      { href: "/transactions", label: "Track Family Support" },
    ],
    sections: [
      {
        heading: "The peso and the pamilya",
        content:
          "Filipino family culture is built on mutual support — 'utang na loob' and the expectation that breadwinners provide. This is beautiful when balanced. It becomes destructive when you give until you have nothing left for yourself: no savings, no emergency fund, no retirement. 44% of Filipinos cite 'providing financial help to others' as a top reason they can't meet their own financial goals. You can love your family AND protect your future.",
      },
      {
        heading: "The fixed monthly amount approach",
        content:
          "The most effective strategy: set a fixed monthly amount for family support. Not open-ended. Not 'whatever they need.' A specific number.",
        items: [
          "Calculate what you can actually afford: Total income minus (survival costs + savings + insurance) = maximum family support",
          "Be honest with your family about the number: 'I can give ₱5,000 every month, reliably, every 15th.' This is more helpful than random large amounts followed by nothing",
          "Set up an automatic transfer on payday so it's consistent and doesn't feel like a monthly negotiation",
          "Anything beyond the fixed amount should be an emergency-only exception — not a regular expansion",
        ],
        callout: {
          type: "tip",
          text: "Frame it as responsibility, not rejection: 'I'm setting this amount so I can support the family consistently for years — not just for a few months before I burn out.' Long-term reliability is more valuable than short-term generosity.",
        },
      },
      {
        heading: "How to say no without guilt",
        content:
          "Saying no to family feels impossible in Filipino culture. But saying yes to everything means saying no to your own future. Here are scripts that work:",
        items: [
          "Sibling asking for tuition: 'I can contribute ₱X per semester, but they should also apply for scholarships and part-time work. I'm happy to help with the application.'",
          "Parent asking for a large amount: 'I don't have that available right now, but I can increase my monthly support by ₱X for the next 3 months.'",
          "Relative asking for a loan: 'I have a personal rule — I don't lend money to family because it ruins relationships. But I can help you find a low-interest option.'",
          "Wedding/event contributions: 'I can contribute ₱X. I'd love to help in other ways too — maybe I can help with planning/coordination.'",
          "General: Redirect to help that isn't cash — advice, time, connections, helping them find work, teaching them financial literacy",
        ],
      },
      {
        heading: "When family members are financially irresponsible",
        content:
          "This is the hardest situation: you're being asked to fund someone else's poor decisions. Here's the uncomfortable truth:",
        items: [
          "Giving money to someone who doesn't budget is funding a pattern, not solving a problem",
          "Offer to teach them financial skills instead — help them set up a budget, understand their expenses, find better-paying work",
          "For parents nearing retirement: Sit down and map out their SSS pension, PhilHealth, Pag-IBIG. Help them understand what they'll receive vs. what they'll need",
          "For siblings: Invest in their capability (education, training, job placement) rather than their consumption",
          "It's okay to say: 'I love you AND I need to take care of my own financial security too.' Both can be true",
        ],
      },
      {
        heading: "Building a family support plan",
        content:
          "Create a sustainable system:",
        items: [
          "Budget a 'Family Support' category in Sandalan — track it separately from your personal expenses",
          "Set up a small 'family emergency fund' (₱10,000–₱20,000) for true emergencies so you don't raid your own EF",
          "Have a family meeting about finances — normalize the conversation. Many Filipino families never discuss money openly",
          "Encourage family members to register for SSS, PhilHealth, and Pag-IBIG (even as voluntary members) — this reduces their future dependency on you",
          "Remember: the best thing you can do for your family's long-term security is to be financially stable yourself. You can't pour from an empty cup",
        ],
      },
    ],
  },
  {
    slug: "mental-health-on-a-budget",
    title: "Mental Health on a Budget",
    description:
      "Depression among young Filipinos doubled since 2013. Here's where to find affordable mental health support — and why it's not 'maarte' to ask for help.",
    category: "health",
    readTimeMinutes: 5,
    toolLinks: [
      { href: "/guide/pundasyon", label: "View Stage Progress" },
    ],
    sections: [
      {
        heading: "This is an adulting essential",
        content:
          "Depression among Filipinos aged 15-24 doubled from 9.6% to 20.9% between 2013 and 2021. 60% of Filipino employees report burnout. The Philippines has only ~1,600 psychologists and ~500 psychiatrists for 110+ million people. Financial stress, job insecurity, family pressure, and the cultural taboo around 'hiya' make it worse. Mental health isn't a luxury — it's infrastructure. You can't build a career, save money, or manage relationships if your brain is running on empty.",
        callout: {
          type: "info",
          text: "RA 11036 (Philippine Mental Health Act) guarantees your right to accessible mental health services. Your employer is required to develop workplace policies that promote mental health. You can't be discriminated against for seeking treatment.",
        },
      },
      {
        heading: "Recognizing burnout and depression",
        content:
          "These aren't just 'pagod' or 'tamad.' They're signals your mental health needs attention:",
        items: [
          "Persistent exhaustion that sleep doesn't fix — you wake up tired",
          "Losing interest in things you used to enjoy (hobbies, friends, food)",
          "Difficulty concentrating at work — tasks that used to be easy feel impossible",
          "Irritability or emotional numbness — snapping at coworkers, feeling nothing",
          "Physical symptoms: headaches, stomachaches, chest tightness without medical cause",
          "Feeling like a burden to your family or that things won't get better",
          "Using alcohol, social media, or shopping as coping mechanisms more than before",
        ],
        callout: {
          type: "warning",
          text: "If you're having thoughts of self-harm or suicide, contact the National Center for Mental Health Crisis Hotline: 0917-899-8727 (USAP) or 989 (toll-free for all networks). You are not alone.",
        },
      },
      {
        heading: "Affordable therapy options in the Philippines",
        content:
          "Professional help doesn't have to cost ₱3,500 per session. Here are accessible options:",
        items: [
          "PhilHealth-accredited mental health services: The Konsulta Package covers consultations at accredited primary care facilities — check with your nearest health center",
          "Government hospitals: PGH, NCMH (National Center for Mental Health), and public hospitals offer psychiatric services on a sliding scale — as low as ₱50–₱200/session",
          "University clinics: UP PGH, UST Hospital, DLSU, Ateneo — many offer free or low-cost counseling to the public, not just students",
          "Teletherapy platforms: Empath (empath.ph), Saya (talksaya.com), BetterHelp (international) — sessions from ₱1,000–₱2,500. Convenient and stigma-free",
          "Community mental health centers: Your LGU may have community-based mental health services under RA 11036. Ask your barangay health center",
          "Employee assistance programs (EAP): Many companies provide free counseling sessions. Check with HR — many employees don't know this benefit exists",
          "NGOs: In Touch Community Services (intropsych.com), Natasha Goulbourn Foundation — offer free counseling and support groups",
        ],
      },
      {
        heading: "Daily habits that protect your mental health",
        content:
          "Professional help is ideal, but these daily practices make a real difference — especially when sessions aren't accessible:",
        items: [
          "Sleep: 7-8 hours is non-negotiable. Chronic sleep deprivation mimics depression symptoms. Set a consistent bedtime",
          "Movement: 30 minutes of any physical activity (walking, dancing, gym, basketball) releases endorphins. It's free therapy",
          "Social connection: Isolation amplifies depression. Schedule regular time with friends — even a 15-minute phone call helps",
          "Limit social media: Comparing your life to curated feeds increases anxiety. Set a daily time limit (Screen Time on iOS, Digital Wellbeing on Android)",
          "Financial stress management: A huge chunk of Filipino anxiety comes from money worries. Having a budget and tracking your finances in Sandalan reduces this uncertainty",
          "Say no to 'toxic productivity': Rest is not laziness. You don't need a side hustle on top of a side hustle. Burnout isn't a badge of honor",
        ],
      },
      {
        heading: "Talking about it in a Filipino context",
        content:
          "The biggest barrier isn't access — it's stigma. 'Hiya' culture makes many Filipinos suffer in silence. Some reframes that help:",
        items: [
          "Going to therapy is like going to a doctor for a stomachache — your brain is an organ too",
          "You don't need to be 'crazy' to see a therapist. Most clients are regular people dealing with stress, grief, or transitions",
          "Talking to a professional isn't 'maarte' or 'mayabang' — it takes more courage to ask for help than to pretend you're fine",
          "You wouldn't tell someone with diabetes to just 'pray harder.' Mental health conditions are medical, not moral failures",
          "Start with someone you trust if professional help feels too big: a friend, a mentor, a school counselor, or a priest/pastor",
        ],
      },
    ],
  },
];

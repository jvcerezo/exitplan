import type { Guide } from "../types";

export const GINTONG_TAON_GUIDES: Guide[] = [
  {
    slug: "senior-citizen-benefits",
    title: "Senior Citizen Benefits Complete Guide",
    description:
      "Every discount, exemption, and benefit available to Filipino seniors under Republic Act 9994.",
    category: "retirement",
    readTimeMinutes: 5,
    toolLinks: [],
    sections: [
      {
        heading: "Who qualifies",
        content:
          "Filipino citizens aged 60 and above are considered senior citizens under the law. To access benefits, you need a Senior Citizen ID issued by the Office for Senior Citizens Affairs (OSCA) in your city or municipality. Registration is free.",
      },
      {
        heading: "Mandatory discounts",
        content:
          "Senior citizens are entitled to a 20% discount and VAT exemption on:",
        items: [
          "Medicines, vitamins, and medical supplies in all drugstores",
          "Medical and dental services, diagnostic fees, and professional fees",
          "Public transportation (bus, jeepney, MRT, LRT, PNR)",
          "Hotels, restaurants, and recreation centers",
          "Funeral and burial services",
          "Admission to theaters, concert halls, and amusement parks",
        ],
        callout: {
          type: "ph-law",
          text: "These discounts are mandatory under Republic Act 9994 (Expanded Senior Citizens Act of 2010). Establishments that refuse to honor them can be fined P50,000 for first offense.",
        },
      },
      {
        heading: "Social pension for indigent seniors",
        content:
          "The DSWD provides a monthly social pension of P1,000 to indigent senior citizens — those without regular income, pension, or permanent source of financial support. Apply through your barangay or city social welfare office.",
      },
      {
        heading: "SSS and GSIS pension claims",
        content:
          "If you've completed the required contributions, file your retirement claim:",
        items: [
          "SSS: Optional retirement at age 60 (must stop working), mandatory at 65. Minimum 120 monthly contributions required.",
          "GSIS: For government employees. File through your agency HR or the nearest GSIS branch.",
          "Keep your records: Contribution history, employment records, and valid IDs ready for the claims process.",
        ],
      },
    ],
  },
  {
    slug: "healthcare-retirement",
    title: "Healthcare Management in Retirement",
    description:
      "Medical costs are the biggest threat to retirement savings. Here's how to manage healthcare expenses as a senior citizen.",
    category: "health",
    readTimeMinutes: 4,
    toolLinks: [
      { href: "/tools/insurance", label: "Insurance Tracker" },
    ],
    sections: [
      {
        heading: "Healthcare costs in retirement",
        content:
          "Healthcare is typically the largest expense for Filipino retirees. Out-of-pocket health spending accounts for 42.7% of total healthcare costs in the Philippines. Without proper coverage, a single hospitalization can wipe out years of savings.",
      },
      {
        heading: "Maximizing PhilHealth as a retiree",
        content:
          "As a retiree, you can maintain PhilHealth coverage:",
        items: [
          "Lifetime member: If you've contributed for 120 months, you qualify for lifetime coverage",
          "Senior citizen PhilHealth: Automatic coverage under the Universal Health Care Act",
          "Konsulta package: Free outpatient primary care at accredited health centers",
          "New 2025 benefits: Expanded coverage for heart disease, kidney transplant, dental, and emergency care",
        ],
      },
      {
        heading: "Building a healthcare fund",
        content:
          "Beyond PhilHealth, set aside dedicated funds for medical expenses not covered by insurance. A healthcare fund of P200,000–P500,000 provides a buffer for emergencies, medications, and procedures that PhilHealth doesn't fully cover.",
        callout: {
          type: "tip",
          text: "Keep your healthcare fund in a high-yield savings account (not invested). You need it liquid and accessible for emergencies.",
        },
      },
    ],
  },
  {
    slug: "passing-wealth",
    title: "Passing Wealth to the Next Generation",
    description:
      "How to transfer assets smoothly, minimize estate tax, and prevent family disputes.",
    category: "retirement",
    readTimeMinutes: 4,
    toolLinks: [],
    sections: [
      {
        heading: "Planning the transfer",
        content:
          "Wealth transfer in the Philippines is governed by the Civil Code's rules on succession. Whether you have P100,000 or P10,000,000, how you transfer it matters — both for tax efficiency and family harmony.",
      },
      {
        heading: "Strategies for smooth transfer",
        content:
          "Consider these approaches:",
        items: [
          "Write a will: Even a holographic (handwritten) will prevents intestate succession disputes",
          "Update beneficiaries: SSS, Pag-IBIG, bank accounts, insurance — review annually",
          "Consider living donations: You can donate up to P250,000/year tax-free to each child",
          "Insurance as estate tool: A life insurance payout goes directly to beneficiaries, bypassing estate settlement",
          "Organize documentation: Land titles, vehicle registration, bank records — make them easily accessible",
        ],
      },
      {
        heading: "Avoiding common pitfalls",
        content:
          "These mistakes cause the most pain for Filipino families:",
        items: [
          "No will: Assets get divided by intestate law, which may not match your wishes",
          "Verbal promises: 'I told my anak they'd get the house' has no legal weight without documentation",
          "Co-mingled property: Assets with unclear ownership create disputes. Keep titles and records clean",
          "Ignoring estate tax: The 6% estate tax must be paid before assets can be transferred. Plan for it",
        ],
        callout: {
          type: "ph-law",
          text: "Under Philippine law, legitimate children, the surviving spouse, and (in some cases) parents are compulsory heirs who cannot be disinherited from their legal share (legitime).",
        },
      },
    ],
  },
];

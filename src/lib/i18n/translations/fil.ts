import type { TranslationKeys } from "./en";

const fil: TranslationKeys = {
  // ── Brand ──
  brand: {
    name: "Sandalan",
    tagline: "Ang Kasama Mo sa Buhay-Adulto",
    title: "Sandalan — Ang Kasama Mo sa Buhay-Adulto",
    description:
      "Gagabayan ka ng Sandalan sa bawat yugto ng buhay-adulto bilang Pilipino — mula sa unang government ID hanggang sa pagreretiro. Subaybayan ang pera, i-manage ang contributions, at sundin ang step-by-step na gabay.",
    footer: "Gawa para sa Pilipino.",
  },

  // ── Common ──
  common: {
    save: "I-save",
    cancel: "Kanselahin",
    delete: "Burahin",
    edit: "I-edit",
    add: "Dagdagan",
    close: "Isara",
    back: "Bumalik",
    next: "Susunod",
    done: "Tapos na",
    loading: "Naglo-load…",
    search: "Maghanap…",
    noResults: "Walang resulta",
    viewAll: "Tingnan lahat",
    learnMore: "Alamin pa",
    getStarted: "Magsimula",
    signIn: "Mag-sign in",
    signUp: "Mag-sign up",
    signOut: "Mag-sign out",
    confirm: "Kumpirmahin",
    yes: "Oo",
    no: "Hindi",
  },

  // ── Navigation ──
  nav: {
    home: "Home",
    guide: "Gabay",
    dashboard: "Dashboard",
    transactions: "Transaksyon",
    accounts: "Mga Account",
    budgets: "Budget",
    goals: "Mga Goal",
    contributions: "Kontribusyon",
    bills: "Mga Bayarin",
    debts: "Mga Utang",
    insurance: "Insurance",
    taxes: "Buwis",
    calculators: "Calculators",
    panganayMode: "Panganay Mode",
    retirement: "Pagreretiro",
    rentVsBuy: "Upa vs Bili",
    settings: "Settings",
    money: "Pera",
    tools: "Mga Tool",
    theme: "Tema",
    takeTour: "Mag-Tour",
  },

  // ── Home page ──
  home: {
    goodMorning: "Magandang umaga",
    goodAfternoon: "Magandang hapon",
    goodEvening: "Magandang gabi",
    snapshot: "Ito ang buod mo ngayong araw.",
    currentStage: "Kasalukuyang Yugto",
    balance: "Balanse",
    income: "Kita",
    expenses: "Gastos",
    adultingGuide: "Gabay sa Pag-adulto",
    financialDashboard: "Financial Dashboard",
    completeStepsRemaining: "{percentage}% tapos na · {remaining} na hakbang pa",
    contributionsBillsMore: "Kontribusyon, bayarin, utang, insurance at iba pa",
    budgetsTrendsInsights: "Budget, trends, at spending insights",
  },

  // ── Dashboard ──
  dashboard: {
    title: "Dashboard",
    subtitle: "Ang pera mo sa isang tingin",
    overview: "Buod",
    trends: "Trends",
    totalBalance: "Kabuuang Balanse",
    monthlyIncome: "Buwanang Kita",
    monthlyExpenses: "Buwanang Gastos",
    netWorth: "Net Worth",
    healthScore: "Health Score",
    budgetAlerts: "Budget Alerts",
    spendingInsights: "Spending Insights",
    recentTransactions: "Mga Kamakailang Transaksyon",
    savingsRate: "Rate ng Ipon",
    safeToSpend: "Safe na Gastusin",
    emergencyFund: "Emergency Fund",
  },

  // ── Transactions ──
  transactions: {
    title: "Mga Transaksyon",
    addTransaction: "Magdagdag ng Transaksyon",
    income: "Kita",
    expense: "Gastos",
    transfer: "Transfer",
    amount: "Halaga",
    description: "Deskripsyon",
    category: "Kategorya",
    date: "Petsa",
    account: "Account",
    importCsv: "Mag-import ng CSV",
    export: "I-export",
    incomeAccountHint: "Kailangan ng account sa kita para malaman ng Sandalan kung saan ipapasok.",
    expenseAccountHint: "Kailangan ng account sa gastos para malaman ng Sandalan kung saan galing ang pera.",
  },

  // ── Accounts ──
  accounts: {
    title: "Mga Account",
    addAccount: "Magdagdag ng Account",
    cash: "Cash",
    bankAccount: "Bank Account",
    eWallet: "E-Wallet",
    creditCard: "Credit Card",
    totalBalance: "Kabuuang Balanse",
  },

  // ── Budgets ──
  budgets: {
    title: "Budget",
    addBudget: "Magdagdag ng Budget",
    monthly: "Buwanan",
    weekly: "Lingguhan",
    quarterly: "Quarterly",
    spent: "Nagastos",
    remaining: "Natitira",
    overBudget: "Sobra sa Budget",
    onTrack: "Tama ang Takbo",
  },

  // ── Goals ──
  goals: {
    title: "Mga Goal",
    addGoal: "Magdagdag ng Goal",
    targetAmount: "Target na Halaga",
    currentAmount: "Kasalukuyang Halaga",
    deadline: "Deadline",
    progress: "Progreso",
  },

  // ── Life stages ──
  stages: {
    unangHakbang: {
      name: "Unang Hakbang",
      subtitle: "Mga Unang Hakbang",
      description: "Kumuha ng mga ID, unang trabaho docs, payslip basics",
    },
    pundasyon: {
      name: "Pundasyon",
      subtitle: "Pagtatayo ng Pundasyon",
      description: "Ipon, budget, credit, emergency fund",
    },
    tahanan: {
      name: "Tahanan",
      subtitle: "Pagtatag ng Tahanan",
      description: "Pag-upa, pagbili ng property, family planning",
    },
    tugatog: {
      name: "Tugatog",
      subtitle: "Rurok ng Karera",
      description: "Investments, insurance, wealth building",
    },
    paghahanda: {
      name: "Paghahanda",
      subtitle: "Bago Mag-retire",
      description: "Estate planning, paghahanda sa pagreretiro",
    },
    gintongTaon: {
      name: "Gintong Taon",
      subtitle: "Gintong Taon",
      description: "Buhay-retire, legacy planning",
    },
  },

  // ── Tools ──
  tools: {
    contributions: {
      title: "Government Contributions",
      description: "Auto-generate ng buwanang SSS, PhilHealth, at Pag-IBIG entries mula sa sweldo mo. I-mark as paid para mag-record ng transaksyon — automatic ang update ng balanse.",
    },
    bills: {
      title: "Mga Bayarin at Subscriptions",
      description: "I-track ang utility bills, subscriptions, at recurring payments. Ipapaalam sa'yo bago mag-due.",
    },
    debts: {
      title: "Debt Manager",
      description: "I-track ang mga loan, credit card, at salary loan. Kasama ang Avalanche at Snowball na paraan ng pagbayad.",
    },
    insurance: {
      title: "Insurance Tracker",
      description: "I-track ang mga policy, premium, at renewal date. Hindi ka magmi-miss ng bayad.",
    },
    taxes: {
      title: "Tax Tracker",
      description: "BIR tax tracking batay sa TRAIN Law.",
    },
    calculators: {
      title: "Mga Financial Calculator",
      description: "Loan amortization, compound interest, FIRE calculator, at iba pa.",
    },
    panganayMode: {
      title: "Panganay Mode",
      description: "Budget para sa mga panganay na nagsu-suporta sa pamilya. I-track ang tulong-pamilya nang hiwalay sa personal na gastos.",
    },
    retirement: {
      title: "Retirement Projection",
      description: "SSS pension calculator at personal savings gap analysis.",
    },
    rentVsBuy: {
      title: "Upa vs Bili",
      description: "Ikumpara ang gastos sa pag-upa vs Pag-IBIG housing loan payments.",
    },
  },

  // ── Landing page ──
  landing: {
    hero: {
      badge: "Gawa para sa Pilipino",
      headline: "Ang kasama mo sa bawat yugto ng buhay-adulto bilang Pilipino",
      headlineHighlight: "bawat yugto",
      subheadline: "Mula sa unang government ID hanggang pagreretiro — step-by-step na gabay, financial tracking, at smart reminders sa isang app.",
      cta: "Simulan ang Biyahe Mo",
      ctaSecondary: "May account na ako",
    },
    nav: {
      signIn: "Mag-sign In",
      getStarted: "Magsimula",
    },
    preview: {
      journeyTitle: "Ang Adulting Journey Mo",
      journeyProgress: "0/58 nakumpleto",
      upcomingPayments: "Mga Paparating na Bayarin",
      recentTransactions: "Kamakailang Transaksyon",
    },
    stages: {
      headline: "Gabay sa bawat yugto ng buhay",
      headlineHighlight: "bawat yugto ng buhay",
      subheadline: "Bagong graduate ka man o nagpaplano na ng pagreretiro — may step-by-step na gabay, checklist, at tools ang Sandalan para sa kung nasaan ka ngayon.",
    },
    features: {
      headline: "Lahat ng kailangan mo.",
      headlineHighlight: "Wala nang iba pa.",
      subheadline: "Walang ads, walang premium upsells, walang data selling. Isang kumpletong tool na tumutulong sa mga Pilipino na kontrolin ang buong financial picture nila.",
      lifeStage: {
        title: "Mapa ng Buhay-Adulto",
        description: "Gabay sa bawat yugto ng pag-adulto — mula Unang Hakbang hanggang Gintong Taon. Bawat yugto may checklist at step-by-step na gabay na puwede mong markahan o i-skip.",
      },
      trackPeso: {
        title: "I-track ang Bawat Piso",
        description: "I-log ang kita at gastos sa lahat ng account mo. Mag-import mula sa GCash, BDO, BPI, at karamihan ng bank CSV exports. Mag-attach ng receipt photos sa kahit anong transaksyon.",
      },
      govContributions: {
        title: "Government Contributions",
        description: "Auto-generate ng buwanang SSS, PhilHealth, at Pag-IBIG entries mula sa sweldo mo. I-mark as paid para mag-record ng transaksyon — automatic ang update ng balanse.",
      },
      reminders: {
        title: "Smart Reminders",
        description: "Bayarin, utang, insurance premiums, at contributions — lahat nasa isang Upcoming Payments view. May push notifications bago mag-due.",
      },
      budgetsGoals: {
        title: "Budget at Goals",
        description: "Magtakda ng buwanang spending limits per category. Gumawa ng savings targets na may deadline. May alert kapag malapit ka nang umabot o lumampas sa budget.",
      },
      debtManager: {
        title: "Debt Manager",
        description: "I-track ang mga loan, credit card, at salary loan. Mag-record ng bayad na automatic ang update ng balanse. Kasama ang Avalanche at Snowball na paraan.",
      },
      insuranceBills: {
        title: "Insurance at Bills Tracker",
        description: "I-track ang lahat ng insurance policies at recurring bills sa isang lugar. Premium reminders at due date alerts para hindi ka malimutan.",
      },
      insights: {
        title: "Visual Insights",
        description: "Spending breakdowns, income vs expense trends, financial health score, at net worth tracking — lahat nasa isang malinis na dashboard.",
      },
      privacy: {
        title: "Pribado ang Data Mo",
        description: "Row-level security — ikaw lang ang makakakita ng data mo. I-export lahat sa JSON anumang oras. Burahin ang account mo permanently — walang tanong.",
      },
    },
    builtFor: {
      headline: "Gawa para sa reyalidad ng Pilipinong pera",
      headlineHighlight: "reyalidad ng Pilipinong pera",
      subheadline: "Karamihan ng finance apps hindi pinapansin ang Pilipinas. Ang Sandalan, hindi.",
      sss: "SSS, PhilHealth & Pag-IBIG",
      sssDesc: "Auto-generate ng buwanang contributions, i-mark as paid, at i-track ang history mo",
      import: "GCash & Bank CSV Import",
      importDesc: "Mag-import ng transaction history mula sa lahat ng major Philippine banks at e-wallets",
      guide: "Step-by-step na Gabay sa Pag-adulto",
      guideDesc: "Mula sa pagkuha ng TIN hanggang retirement planning — bawat hakbang may requirements, fees, at tips",
      reminders: "Smart na Payment Reminders",
      remindersDesc: "Push notifications para sa bayarin, contributions, utang, at insurance premiums",
    },
    howItWorks: {
      headline: "Simple ang disenyo",
      subheadline: "Piliin ang yugto mo sa buhay, i-set up ang accounts mo, at ang Sandalan na ang bahala sa iba.",
      step1: "Piliin ang yugto mo sa buhay",
      step1Desc: "Sabihin mo kung nasaan ka — bagong graduate, nagtatayo ng pundasyon, o malapit nang magretiro. Ipapakita namin ang pinaka-relevant na gabay at checklist.",
      step2: "I-set up ang finances mo",
      step2Desc: "Idagdag ang bank accounts, e-wallets, at bayarin mo. Automatic ang reminders para sa contributions, utang, at insurance kapag malapit nang mag-due.",
      step3: "Sundin ang gabay",
      step3Desc: "Gawin ang adulting checklist mo nang hakbang-hakbang. I-track ang finances mo habang ginagawa. Lahat nag-a-update sa isang malinis na dashboard.",
    },
    cta: {
      headline: "Ang adulting journey mo ay nagsisimula sa isang hakbang",
      headlineHighlight: "isang hakbang",
      description: "Sumali sa Sandalan ngayon. Piliin ang yugto mo sa buhay, at gagabayan ka namin sa lahat — IDs, finances, insurance, retirement, at higit pa.",
      button: "Simulan ang Biyahe Mo",
    },
    footer: {
      copyright: "Sandalan. Gawa para sa Pilipino.",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      signIn: "Mag-sign In",
      signUp: "Mag-sign Up",
    },
  },

  // ── Settings ──
  settings: {
    title: "Settings",
    appearance: "Hitsura",
    appearanceDesc: "I-customize kung paano ang itsura ng Sandalan sa device mo",
    language: "Wika",
    languageDesc: "Piliin ang preferred na wika mo",
    automation: "Automation",
    notifications: "Mga Notification",
    homeCustomization: "Home Customization",
    privacy: "Privacy at Data",
    exportData: "I-export ang Data Mo",
    deleteAccount: "Burahin ang Account",
    bugReport: "Mag-report ng Bug",
  },

  // ── Auth ──
  auth: {
    login: "Mag-log in",
    loginTitle: "Welcome back",
    signupTitle: "Gumawa ng account",
    email: "Email",
    password: "Password",
    forgotPassword: "Nakalimutan ang password?",
    noAccount: "Wala ka pang account?",
    hasAccount: "May account ka na?",
    consent: "Pumapayag ako na kolektahin at i-process ng Sandalan ang personal data ko ayon sa inilarawan.",
  },

  // ── Onboarding ──
  onboarding: {
    welcome: "Welcome sa Sandalan",
    description: "Ang Sandalan ang kasama mo sa bawat yugto ng buhay-adulto bilang Pilipino — mula sa unang ID hanggang sa pagreretiro.",
  },

  // ── Tour ──
  tour: {
    welcome: "Welcome sa Sandalan!",
    customizeTitle: "I-customize ang Sandalan ayon sa gusto mo",
  },

  // ── Offline ──
  offline: {
    title: "Offline ka",
    description: "Maipapakita pa rin ng Sandalan ang mga naka-cache na screen na binuksan mo na, pero may mga feature na kailangan ng internet connection.",
  },
} as const;

export default fil;

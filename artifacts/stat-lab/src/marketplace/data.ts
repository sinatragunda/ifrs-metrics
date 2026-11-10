import type { Service } from "./types";

export const MARKETPLACE_CATEGORIES = [
  "All",
  "Packages",
  "Loans",
  "Deposits",
  "Analytical",
  "Reporting",
  "Data",
  "Delivery",
] as const;

export const SORT_OPTIONS = [
  "Most Popular",
  "Highest Rated",
  "Price: Low to High",
  "Price: High to Low",
] as const;

export const CORE_SERVICE_ID = "ifrs-core-package";

export const LOANS_DEPOSITS_SERVICES: Service[] = [
  {
    id: CORE_SERVICE_ID,
    name: "IFRS Core Package",
    category: "Packages",
    description:
      "Base package for IFRS Metrics Loans & Deposits — classification engines, controlled assumptions, and schedule generation for loan and deposit portfolios.",
    icon: "Layers3",
    rating: 4.9,
    reviews: 2140,
    badge: "Core",
    cartOption: false,
    tiers: [
      {
        id: "core",
        name: "Core",
        price: 12.99,
        period: "/mo",
        features: [
          "Loan & deposit book import",
          "IFRS 9 staging workspace",
          "Amortised cost schedules",
          "Single workspace",
          "Browser-local projects",
        ],
      },
    ],
  },
  {
    id: "ecl-engine",
    name: "ECL Engine",
    category: "Loans",
    description:
      "Expected credit loss engine for staged loan portfolios with PD, LGD, and exposure overlays.",
    icon: "Activity",
    rating: 4.8,
    reviews: 1862,
    badge: "Loans",
    tiers: [
      {
        name: "Starter",
        price: 19.99,
        period: "/mo",
        features: ["Stage 1–3 views", "Simple ECL formula", "CSV export", "Up to 50k contracts"],
      },
      {
        name: "Pro",
        price: 49.99,
        period: "/mo",
        features: [
          "Forward-looking scenarios",
          "Segment overlays",
          "Audit trail snapshots",
          "Up to 500k contracts",
          "Priority support",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 149.99,
        period: "/mo",
        features: [
          "Unlimited contracts",
          "Custom staging rules",
          "API delivery",
          "Dedicated analyst hours",
          "SLA reporting",
        ],
      },
    ],
  },
  {
    id: "loan-classification",
    name: "Loan Classification",
    category: "Loans",
    description:
      "Classify loan contracts into measurement categories and map source fields to IFRS 9 disclosure lines.",
    icon: "FileSpreadsheet",
    rating: 4.7,
    reviews: 980,
    tiers: [
      {
        name: "Basic",
        price: 9.99,
        period: "/mo",
        features: ["Category mapping", "Validation checks", "Exception list"],
      },
      {
        name: "Pro",
        price: 24.99,
        period: "/mo",
        features: ["Rule library", "Remapping history", "Bulk reclass", "Review notes"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 79.99,
        period: "/mo",
        features: ["Custom rule packs", "Multi-entity books", "Approvals", "Export packs"],
      },
    ],
  },
  {
    id: "deposit-schedules",
    name: "Deposit Liability Schedules",
    category: "Deposits",
    description:
      "Build deposit liability movement schedules with interest accrual, early withdrawal, and maturity profiles.",
    icon: "Database",
    rating: 4.6,
    reviews: 742,
    badge: "Deposits",
    tiers: [
      {
        name: "Starter",
        price: 14.99,
        period: "/mo",
        features: ["Opening/interest/payment/closing", "Term deposits", "CSV export"],
      },
      {
        name: "Pro",
        price: 34.99,
        period: "/mo",
        features: [
          "Demand & notice products",
          "Penalty interest rules",
          "Portfolio roll-forward",
          "Disclosure extracts",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 99.99,
        period: "/mo",
        features: ["Multi-currency books", "Custom product rules", "API push", "Audit packs"],
      },
    ],
  },
  {
    id: "amortised-cost",
    name: "Amortised Cost Calculator",
    category: "Analytical",
    description:
      "Effective interest rate and amortised cost workings for loans and deposits with fee/cost adjustments.",
    icon: "BarChart3",
    rating: 4.8,
    reviews: 1320,
    badge: "Best Seller",
    tiers: [
      {
        name: "Starter",
        price: 11.99,
        period: "/mo",
        features: ["EIR calculator", "Fee/cost inputs", "Schedule export"],
      },
      {
        name: "Pro",
        price: 29.99,
        period: "/mo",
        features: ["Prepayment overlays", "Modification events", "Compare runs", "Notebook snapshots"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 89.99,
        period: "/mo",
        features: ["Batch portfolios", "Scenario sets", "API", "Dedicated support"],
      },
    ],
  },
  {
    id: "interest-accrual",
    name: "Interest Accrual Engine",
    category: "Analytical",
    description:
      "Daily and period interest accrual for fixed, floating, and stepped loan and deposit products.",
    icon: "Sparkles",
    rating: 4.5,
    reviews: 611,
    tiers: [
      {
        name: "Starter",
        price: 8.99,
        period: "/mo",
        features: ["Fixed rate products", "Month-end accrual", "CSV import"],
      },
      {
        name: "Pro",
        price: 22.99,
        period: "/mo",
        features: ["Floating rates", "Day-count conventions", "Accrual journals", "Exception review"],
        popular: true,
      },
    ],
  },
  {
    id: "disclosure-pack",
    name: "Disclosure Pack Reporting",
    category: "Reporting",
    description:
      "Generate IFRS 7 / IFRS 9 style disclosure tables for loans and deposits from controlled schedule outputs.",
    icon: "Table2",
    rating: 4.7,
    reviews: 884,
    tiers: [
      {
        name: "Starter",
        price: 16.99,
        period: "/mo",
        features: ["Standard tables", "Excel export", "Illustrative notes"],
      },
      {
        name: "Pro",
        price: 39.99,
        period: "/mo",
        features: ["Custom table packs", "Cross-reference IDs", "PDF/CSV", "Review comments"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 119.99,
        period: "/mo",
        features: ["Entity consolidations", "Versioned packs", "API", "SLA delivery"],
      },
    ],
  },
  {
    id: "portfolio-analytics",
    name: "Portfolio Analytics",
    category: "Analytical",
    description:
      "Segment loan and deposit books by product, stage, vintage, and rate band with traceable filters.",
    icon: "Search",
    rating: 4.4,
    reviews: 503,
    tiers: [
      {
        name: "Starter",
        price: 0,
        period: "/mo",
        features: ["Basic filters", "3 saved views", "Demo datasets"],
      },
      {
        name: "Pro",
        price: 27.99,
        period: "/mo",
        features: ["Unlimited views", "Cohort charts", "Export packs", "Shared workspaces"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 94.99,
        period: "/mo",
        features: ["Custom metrics", "Scheduled packs", "API", "Dedicated support"],
      },
    ],
  },
  {
    id: "data-mapping",
    name: "Source Data Mapping",
    category: "Data",
    description:
      "Map bank extracts and ledger dumps into IFRS Metrics loan and deposit field dictionaries.",
    icon: "Upload",
    rating: 4.6,
    reviews: 1295,
    badge: "New",
    tiers: [
      {
        name: "Starter",
        price: 7.99,
        period: "/mo",
        features: ["Column mapping", "CSV/XLSX", "Validation report"],
      },
      {
        name: "Pro",
        price: 21.99,
        period: "/mo",
        features: ["Reusable templates", "Type coercion", "Exception queues", "Audit log"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 69.99,
        period: "/mo",
        features: ["Multi-source feeds", "Scheduled imports", "API", "Custom dictionaries"],
      },
    ],
  },
  {
    id: "secure-delivery",
    name: "Secure Delivery Channel",
    category: "Delivery",
    description:
      "Package schedule outputs and disclosure packs for controlled handoff to finance and audit teams.",
    icon: "Lock",
    rating: 4.5,
    reviews: 412,
    tiers: [
      {
        name: "Starter",
        price: 5.99,
        period: "/mo",
        features: ["Encrypted ZIP export", "Checksum", "Recipient list"],
      },
      {
        name: "Pro",
        price: 18.99,
        period: "/mo",
        features: ["Signed packages", "Delivery history", "Role gates", "Retention policy"],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 59.99,
        period: "/mo",
        features: ["SFTP delivery", "API webhook", "Compliance vault", "Dedicated support"],
      },
    ],
  },
  {
    id: "support-plans",
    name: "Technical Support Plans",
    category: "Packages",
    description: "Help when loan and deposit IFRS schedules can't wait — capped hours with clear response targets.",
    icon: "MessageSquareText",
    rating: 4.8,
    reviews: 326,
    tiers: [
      {
        name: "Basic",
        price: 70,
        period: "/mo",
        features: [
          "Up to 5 support hours/week",
          "Email support, business hours",
          "Next-business-day response",
          "Knowledge base access",
        ],
      },
      {
        name: "Pro",
        price: 150,
        period: "/mo",
        features: [
          "Up to 15 support hours/week",
          "Email + chat, extended hours",
          "4-hour response for critical schedule issues",
          "Named support contact",
        ],
        popular: true,
      },
      {
        name: "Enterprise",
        price: 250,
        period: "/mo",
        features: [
          "Unlimited support hours",
          "24/7 coverage",
          "1-hour critical response",
          "Dedicated account manager",
          "Quarterly health reviews",
        ],
      },
    ],
  },
];

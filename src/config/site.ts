// =====================================================================
//  SITE / SERVICE CONFIG — single source of truth for the marketing site
// =====================================================================
//  Current phase: a done-for-you research service (flat-fee, 48-hour
//  turnaround). Package contents, pricing, steps, and contact live HERE as
//  data — not as prose scattered through components — so the future SaaS
//  phase (auth, billing, generation pipeline) can grow out of the same
//  structure without a rewrite.
//
//  ENTITY RULE (updated 2026-07-08, Articles filed 7/6/2026 — see
//  docs/permitwright-articles-of-organization-FILED-2026-07-06.pdf):
//  "PermitWright LLC" on LEGAL surfaces (footer copyright line, Terms page,
//  deliverable cover prepared-by lines); brand voice stays "PermitWright"
//  in all marketing copy (hero, sections, headers, wordmarks).
//
//  LEGAL POSITIONING (load-bearing — preserve in all copy): PermitWright
//  provides code research and document preparation ONLY. Engineering
//  judgment, design, and responsible charge remain with the licensed
//  engineer of record (California B&P Code §6735 boundary).
// =====================================================================

export const SITE = {
  name: "PermitWright",
  legalName: "PermitWright LLC",
  region: "Southern California",
  contactEmail: "uriel@permitwright.com",
  sampleRequestHref: "mailto:uriel@permitwright.com?subject=Sample%20Package%20Request",

  metaTitle: "PermitWright — High-Piled Storage Permit Research for California Engineers",
  metaDescription:
    "Jurisdiction-specific research packages for high-piled storage permits. 2025 CFC current. Flat $750, 48-hour turnaround. Engineering judgment stays with you.",

  hero: {
    eyebrow: "For California structural engineers",
    headline: "High-piled storage permit research, done before you start.",
    subhead:
      "Jurisdiction-specific research packages for California structural engineers. Every code section, submittal requirement, and worksheet prepared — so your billable hours go to the engineering, not the legwork.",
    pricingLine: "Flat $750 per project. 48-hour turnaround.",
    cta: "Request a Sample Package",
  },

  eorStatement:
    "PermitWright provides code research and document preparation only. All engineering judgment, design decisions, and responsible charge remain with the licensed engineer of record. We make your job faster — we don't practice it.",

  packageIntro: "Each package is researched fresh for your specific project and jurisdiction.",
  packageContents: [
    {
      title: "AHJ submittal checklist",
      detail:
        "exactly what your jurisdiction's fire department requires, including local amendments and plan-review preferences",
    },
    {
      title: "Applicable 2025 California Fire Code sections",
      detail: "Chapter 32 provisions triggered by your project's storage height, area, and configuration",
    },
    {
      title: "Commodity classification worksheet",
      detail: "prepared and formatted, ready for your review",
    },
    {
      title: "Storage height and area trigger analysis",
      detail: "which thresholds your project crosses and what each one requires",
    },
    {
      title: "Draft permit narrative",
      detail: "formatted to the AHJ's conventions, ready for you to adapt, finalize, and stamp",
    },
  ],
  codeCurrencyLine:
    "Current with the 2025 California Building Standards Code (effective January 1, 2026) and ASCE 7-22.",

  steps: [
    {
      title: "Send project basics.",
      detail: "Jurisdiction, storage height, commodity types, building details — a 5-minute email.",
    },
    {
      title: "Receive your package in 48 hours.",
      detail: "Complete research file, organized and formatted.",
    },
    {
      title: "You do the engineering.",
      detail: "Review, apply your judgment, adapt the narrative, and stamp.",
    },
  ],

  aboutParagraph:
    "PermitWright is run by Uriel Rojas, based in Southern California. The service grew out of firsthand experience with warehouse operations and high-piled storage permitting in SoCal jurisdictions.",

  footerLine1: "© 2026 PermitWright LLC · Southern California",
  footerLine2: "Code research current to the 2025 California Building Standards Code.",
} as const;

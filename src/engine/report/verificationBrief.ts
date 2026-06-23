// =====================================================================
//  ENGINEER VERIFICATION BRIEF
// =====================================================================
//
//  A self-contained, project-agnostic document that lists EVERYTHING a
//  licensed engineer must supply or verify to make this tool produce
//  trustworthy output: the commodity classification rules, fire-code
//  values, seismic & anchorage values/formulas, and the LA submittal
//  triggers — each with the code reference it should come from and the
//  exact data-file location to enter the answer.
//
//  It reads the live data files, so once a value is marked VERIFIED it
//  drops off the brief. Pure function: no UI, no file system here (the
//  caller passes in the loaded CodeData).
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import { APP_TITLE, CODE_BASIS, DISCLAIMER } from "@/engine/constants";

export interface BriefItem {
  label: string;
  /** Where to enter the verified answer (file › path). */
  location: string;
  /** The code citation the value should come from. */
  source: string;
  /** What the engineer needs to supply/verify. */
  need: string;
  verified: boolean;
}

export interface BriefSection {
  discipline: string;
  intro: string;
  items: BriefItem[];
}

export interface BriefDecision {
  title: string;
  detail: string;
  source: string;
}

export interface VerificationBrief {
  title: string;
  disclaimer: string;
  generatedAt: string;
  codeBasis: string[];
  decisions: BriefDecision[];
  sections: BriefSection[];
  developerTasks: string[];
  totalItems: number;
  outstandingItems: number;
}

interface Spec {
  label: string;
  location: string;
  get: (d: CodeData) => any;
  defaultNeed: string;
}

function readNode(node: any): { source: string; todo: string | null; verified: boolean } {
  const status = String(node?.status ?? "PLACEHOLDER").toUpperCase();
  return {
    source: String(node?.source ?? "— cite the governing code —"),
    todo: (node?.todo as string) ?? null,
    verified: status === "VERIFIED",
  };
}

function itemFromSpec(d: CodeData, s: Spec): BriefItem {
  const { source, todo, verified } = readNode(s.get(d));
  return { label: s.label, location: s.location, source, need: todo ?? s.defaultNeed, verified };
}

const COMMODITY_SPECS: Spec[] = [
  {
    label: "Commodity class definitions (Class I–IV, plastics groups)",
    location: "commodity-classification.yaml › classes[].description",
    get: (d) => d.commodity?.classes?.[0]?.description,
    defaultNeed: "Provide the code definition for each commodity class.",
  },
  {
    label: "Commodity classification decision-tree rules",
    location: "commodity-classification.yaml › classification_rules",
    get: (d) => d.commodity?.classification_rules,
    defaultNeed: "Author the rules mapping intake answers to a class, then set status: VERIFIED.",
  },
];

const FIRE_SPECS: Spec[] = [
  { label: "High-piled storage area threshold", location: "fire-code-requirements.yaml › applicability.high_piled_area_threshold", get: (d) => d.fireCode?.applicability?.high_piled_area_threshold, defaultNeed: "Area that triggers high-piled storage provisions." },
  { label: "High-piled storage height threshold", location: "fire-code-requirements.yaml › applicability.storage_height_threshold", get: (d) => d.fireCode?.applicability?.storage_height_threshold, defaultNeed: "Height above which storage is 'high-piled'." },
  { label: "Minimum aisle width", location: "fire-code-requirements.yaml › aisle_width.minimum", get: (d) => d.fireCode?.aisle_width?.minimum, defaultNeed: "Governing minimum aisle width." },
  { label: "Maximum pile/storage height", location: "fire-code-requirements.yaml › heights.max_pile_height", get: (d) => d.fireCode?.heights?.max_pile_height, defaultNeed: "Maximum permitted storage height." },
  { label: "Clearance to ceiling/sprinklers", location: "fire-code-requirements.yaml › heights.max_storage_to_ceiling_clearance", get: (d) => d.fireCode?.heights?.max_storage_to_ceiling_clearance, defaultNeed: "Required clearance to sprinkler deflectors/ceiling." },
  { label: "Sprinkler design density", location: "fire-code-requirements.yaml › sprinkler_design.design_density", get: (d) => d.fireCode?.sprinkler_design?.design_density, defaultNeed: "Design density for the commodity/height/system." },
  { label: "Sprinkler design area", location: "fire-code-requirements.yaml › sprinkler_design.design_area", get: (d) => d.fireCode?.sprinkler_design?.design_area, defaultNeed: "Design area of sprinkler operation." },
  { label: "In-rack sprinklers required?", location: "fire-code-requirements.yaml › sprinkler_design.in_rack_sprinklers_required", get: (d) => d.fireCode?.sprinkler_design?.in_rack_sprinklers_required, defaultNeed: "Whether in-rack sprinklers are required." },
];

const SEISMIC_SPECS: Spec[] = [
  { label: "Governing seismic formula reference", location: "seismic.yaml › seismic_force.formula_reference", get: (d) => d.seismic?.seismic_force?.formula_reference, defaultNeed: "Governing equation for the chosen design path." },
  { label: "Response modification factor (R/Rp)", location: "seismic.yaml › seismic_force.coefficients.response_modification_R", get: (d) => d.seismic?.seismic_force?.coefficients?.response_modification_R, defaultNeed: "R (or Rp) for the selected design path." },
  { label: "Overstrength factor (Ω0)", location: "seismic.yaml › seismic_force.coefficients.overstrength_omega0", get: (d) => d.seismic?.seismic_force?.coefficients?.overstrength_omega0, defaultNeed: "Overstrength factor, if applicable." },
  { label: "Seismic importance factor (Ie)", location: "seismic.yaml › seismic_force.coefficients.importance_factor_Ie", get: (d) => d.seismic?.seismic_force?.coefficients?.importance_factor_Ie, defaultNeed: "Importance factor for the Risk Category." },
  { label: "Product load reduction factor (seismic mass)", location: "seismic.yaml › seismic_weight.product_load_reduction_factor", get: (d) => d.seismic?.seismic_weight?.product_load_reduction_factor, defaultNeed: "Fraction of product load included in seismic mass." },
];

const ANCHORAGE_SPECS: Spec[] = [
  { label: "Anchor demand formula", location: "anchorage.yaml › anchor_demand.formula_reference", get: (d) => d.anchorage?.anchor_demand?.formula_reference, defaultNeed: "Equations for anchor tension/shear demand." },
  { label: "Existing slab concrete strength (f'c)", location: "anchorage.yaml › anchor_capacity.concrete_slab_properties.compressive_strength_fc", get: (d) => d.anchorage?.anchor_capacity?.concrete_slab_properties?.compressive_strength_fc, defaultNeed: "Established by record drawings or field testing — not assumed." },
  { label: "Existing slab thickness", location: "anchorage.yaml › anchor_capacity.concrete_slab_properties.slab_thickness", get: (d) => d.anchorage?.anchor_capacity?.concrete_slab_properties?.slab_thickness, defaultNeed: "Established by record/field — not assumed." },
  { label: "Existing slab reinforcement", location: "anchorage.yaml › anchor_capacity.concrete_slab_properties.reinforcement", get: (d) => d.anchorage?.anchor_capacity?.concrete_slab_properties?.reinforcement, defaultNeed: "Established by record/field — not assumed." },
  { label: "Anchor capacity method", location: "anchorage.yaml › anchor_capacity.anchor_strength.formula_reference", get: (d) => d.anchorage?.anchor_capacity?.anchor_strength?.formula_reference, defaultNeed: "ACI 318 Ch.17 method (breakout/pullout/etc.)." },
  { label: "Anchor product evaluation report (ICC-ES ESR)", location: "anchorage.yaml › anchor_capacity.anchor_strength.product_evaluation_report", get: (d) => d.anchorage?.anchor_capacity?.anchor_strength?.product_evaluation_report, defaultNeed: "ESR number and capacities for the specified anchor." },
  { label: "Governing load combinations", location: "anchorage.yaml › load_combinations.reference", get: (d) => d.anchorage?.load_combinations?.reference, defaultNeed: "Which load combinations govern the check." },
];

function jurisdictionItems(d: CodeData): BriefItem[] {
  const j = (d.jurisdictions?.["los-angeles"] ?? {}) as Record<string, any>;
  const items: BriefItem[] = [];

  const sr = readNode(j.submittal_rules);
  items.push({
    label: "Submittal trigger rules (when each document is required)",
    location: "jurisdictions/los-angeles.yaml › submittal_rules",
    source: sr.source,
    need: sr.todo ?? "Define `applies_when` triggers per document, then set status: VERIFIED.",
    verified: sr.verified,
  });

  const docs = Array.isArray(j.required_documents) ? (j.required_documents as Record<string, any>[]) : [];
  for (const doc of docs) {
    const n = readNode(doc);
    items.push({
      label: `Submittal document: ${String(doc.name ?? doc.id ?? "unnamed")}`,
      location: `jurisdictions/los-angeles.yaml › required_documents[id=${String(doc.id ?? "?")}]`,
      source: n.source,
      need: n.todo ?? "Confirm this document is required and cite the current LADBS/LAFD requirement.",
      verified: n.verified,
    });
  }
  return items;
}

function decisions(d: CodeData): BriefDecision[] {
  const path = readNode(d.seismic?.design_basis?.rack_design_path);
  const fireEdition = String(d.fireCode?.meta?.code_edition ?? d.commodity?.meta?.code_edition ?? "the adopted fire/building code");
  return [
    {
      title: "Rack seismic design path",
      detail:
        "Decide whether the rack is designed as a nonbuilding structure (ASCE 7-16 Ch.15, §15.5.3) or via component provisions (Ch.13). This choice selects the governing seismic formula and coefficients.",
      source: path.source,
    },
    {
      title: "Confirm adopted code editions",
      detail: `Confirm the editions LADBS/LAFD enforce for this work (currently labeled "${fireEdition}") and the referenced ASCE 7 and ACI 318 editions.`,
      source: "LADBS / LAFD adopted codes — VERIFY",
    },
  ];
}

export function buildVerificationBrief(data: CodeData, now: Date = new Date()): VerificationBrief {
  const sections: BriefSection[] = [
    { discipline: "Commodity classification", intro: "Fire-code commodity classification (CFC Chapter 32).", items: COMMODITY_SPECS.map((s) => itemFromSpec(data, s)) },
    {
      discipline: "Fire-code requirements",
      intro: "Triggered fire-protection requirements (CFC Chapter 32 / NFPA 13).",
      items: [
        ...FIRE_SPECS.map((s) => itemFromSpec(data, s)),
        ...(Array.isArray(data.fireCode?.other_requirements)
          ? (data.fireCode.other_requirements as Record<string, any>[]).map((o) => {
              const n = readNode(o.required);
              return {
                label: String(o.name ?? o.id ?? "Requirement"),
                location: `fire-code-requirements.yaml › other_requirements[${String(o.id ?? "?")}].required`,
                source: n.source,
                need: n.todo ?? "Determine applicability.",
                verified: n.verified,
              };
            })
          : []),
      ],
    },
    { discipline: "Seismic", intro: "Seismic demand on the rack (ASCE 7-16; ANSI/RMI MH16.1).", items: SEISMIC_SPECS.map((s) => itemFromSpec(data, s)) },
    { discipline: "Anchorage", intro: "Rack base-plate anchorage to the existing slab (ASCE 7-16 / ACI 318 Ch.17 / RMI).", items: ANCHORAGE_SPECS.map((s) => itemFromSpec(data, s)) },
    { discipline: "Los Angeles submittal (LADBS/LAFD)", intro: "Required submittal documents and the triggers for when each applies.", items: jurisdictionItems(data) },
  ];

  const allItems = sections.flatMap((s) => s.items);
  const outstandingItems = allItems.filter((i) => !i.verified).length;

  const developerTasks = [
    "After the seismic design path, formula, and coefficients are verified, a developer implements the vetted ASCE 7 equation in src/engine/calculation/seismic.ts and switches FORMULA_IMPLEMENTED on.",
    "After the anchorage method, existing-slab properties, and anchor (ICC-ES ESR) values are verified, a developer implements the vetted method in src/engine/calculation/anchorage.ts and switches METHOD_IMPLEMENTED on.",
  ];

  return {
    title: "Engineer Verification Brief",
    disclaimer: DISCLAIMER,
    generatedAt: now.toISOString(),
    codeBasis: CODE_BASIS,
    decisions: decisions(data),
    sections,
    developerTasks,
    totalItems: allItems.length,
    outstandingItems,
  };
}

/** Collapse newlines/whitespace and escape pipes so text is safe in a Markdown table cell. */
function cell(s: string): string {
  return String(s)
    .replace(/\s*\r?\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

export function renderVerificationBriefMarkdown(brief: VerificationBrief): string {
  const L: string[] = [];
  L.push(`# ${brief.title}`);
  L.push(`_for: ${APP_TITLE}_`);
  L.push("");
  L.push(
    "**Purpose.** This software helps prepare a high-piled storage / storage-rack permit package " +
      "for the City of Los Angeles (LADBS/LAFD). It deliberately contains **no code values of its own**. " +
      "This brief lists everything a California-licensed engineer must supply or verify so the tool can " +
      "produce trustworthy draft output. Please provide a value and an exact code citation for each item " +
      "below (or confirm/correct the cited reference).",
  );
  L.push("");
  L.push(`> **${brief.disclaimer}**`);
  L.push("");
  L.push(`**Generated:** ${brief.generatedAt}`);
  L.push(`**Status:** ${brief.outstandingItems} of ${brief.totalItems} items still need verification.`);
  L.push("");
  L.push("**How to use this brief**");
  L.push("1. The engineer fills in the value and confirms the code reference for each item.");
  L.push("2. We enter each answer into the named data file and set its `status:` to `VERIFIED`.");
  L.push("3. Items already verified are marked ✓ and need no action.");
  L.push("");
  L.push("**Code & standards basis (please confirm):**");
  for (const c of brief.codeBasis) L.push(`- ${c}`);
  L.push("");

  L.push("## Engineering decisions required first");
  L.push("");
  for (const d of brief.decisions) {
    L.push(`- **${d.title}.** ${d.detail}  _(Reference: ${d.source})_`);
  }
  L.push("");

  brief.sections.forEach((sec, idx) => {
    L.push(`## ${idx + 1}. ${sec.discipline}`);
    L.push(`_${sec.intro}_`);
    L.push("");
    L.push(`| ✓ | Item | What's needed | Code reference | Where it goes |`);
    L.push(`| --- | --- | --- | --- | --- |`);
    for (const it of sec.items) {
      L.push(`| ${it.verified ? "✓" : "☐"} | ${cell(it.label)} | ${cell(it.need)} | ${cell(it.source)} | \`${cell(it.location)}\` |`);
    }
    L.push("");
  });

  L.push("## After verification — developer tasks (not for the engineer)");
  L.push("");
  for (const t of brief.developerTasks) L.push(`- ${t}`);
  L.push("");

  L.push("## Engineer verification & sign-off");
  L.push("");
  L.push(
    "By completing and returning this brief, the verifying engineer confirms the values and citations " +
      "above against the governing codes for the purpose of preparing this submittal. Final calculations " +
      "and the permit package remain subject to the engineer of record's review and stamp.",
  );
  L.push("");
  L.push("Verified by: ______________________________   License (PE/SE) #: ______________");
  L.push("");
  L.push("Firm: ____________________________________   Date: ______________");
  L.push("");
  L.push("Signature / stamp:");
  L.push("");
  return L.join("\n");
}

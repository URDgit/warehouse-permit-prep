// =====================================================================
//  CLASSIFICATION ENGINE  — commodity class + triggered requirements
// =====================================================================
//
//  Pure function. Maps intake answers to a commodity class and the
//  fire-code requirements that get triggered. Because the classification
//  rules in the data file are still PLACEHOLDERs, this returns an explicit
//  "UNDETERMINED" rather than guessing a class. When an engineer fills in
//  the rules and marks them VERIFIED, this is where the real mapping runs.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";

export interface TriggeredRequirement {
  id: string;
  name: string;
  codeValue: CodeValue;
}

export interface ClassificationResult {
  commodityClass: CodeValue<string>;
  triggeredRequirements: TriggeredRequirement[];
  audit: AuditEntry[];
}

export function classifyCommodity(input: IntakeInput, data: CodeData): ClassificationResult {
  const rules = (data.commodity?.classification_rules ?? {}) as Record<string, any>;
  const rulesVerified = String(rules.status ?? "PLACEHOLDER").toUpperCase() === "VERIFIED";

  // --- Commodity class -------------------------------------------------
  // No verified rule set => UNDETERMINED. We never assign a class from a
  // guess; misclassification is a life-safety issue.
  const commodityClass: CodeValue<string> = {
    id: "commodity.class",
    label: "Commodity classification",
    value: null, // remains null/UNDETERMINED until verified rules exist
    unit: null,
    source: String(rules.source ?? "CFC 2022 Chapter 32 — VERIFY"),
    status: rulesVerified ? "VERIFIED" : "PLACEHOLDER",
    isPlaceholder: !rulesVerified,
    todo: rulesVerified
      ? null
      : String(
          rules.todo ??
            "Classification rules are not yet defined/verified. The engineer must map intake answers to a commodity class.",
        ),
  };

  const inputsUsed = {
    description: input.commodity.description,
    primaryMaterial: input.commodity.primaryMaterial,
    packaging: input.commodity.packaging,
    plasticContent: input.commodity.plasticContent,
    encapsulated: input.commodity.encapsulated,
    idlePalletsStored: input.commodity.idlePalletsStored,
  };

  const classAudit: AuditEntry = {
    step: "Commodity classification",
    description: rulesVerified
      ? "Commodity class determined from verified classification rules."
      : "Commodity class left UNDETERMINED: the classification rules in commodity-classification.yaml are placeholders. The app intentionally does not guess a class.",
    inputsUsed,
    codeValues: [commodityClass],
    assumptions: [],
    result: commodityClass.value ?? "UNDETERMINED",
    status: rulesVerified ? "ok" : "blocked_by_placeholder",
  };

  // --- Triggered fire-code requirements --------------------------------
  // We surface the relevant requirement values from the data file so the
  // engineer sees exactly what is pending. All are placeholders today.
  const fc = (data.fireCode ?? {}) as Record<string, any>;
  const triggeredRequirements: TriggeredRequirement[] = [
    {
      id: "applicability.high_piled_area_threshold",
      name: "High-piled storage area threshold",
      codeValue: toCodeValue(
        "fire_code.applicability.high_piled_area_threshold",
        "High-piled storage area threshold",
        fc.applicability?.high_piled_area_threshold,
      ),
    },
    {
      id: "aisle_width.minimum",
      name: "Minimum aisle width",
      codeValue: toCodeValue(
        "fire_code.aisle_width.minimum",
        "Minimum aisle width",
        fc.aisle_width?.minimum,
      ),
    },
    {
      id: "heights.max_pile_height",
      name: "Maximum pile/storage height",
      codeValue: toCodeValue(
        "fire_code.heights.max_pile_height",
        "Maximum pile/storage height",
        fc.heights?.max_pile_height,
      ),
    },
    {
      id: "sprinkler_design.design_density",
      name: "Sprinkler design density",
      codeValue: toCodeValue(
        "fire_code.sprinkler_design.design_density",
        "Sprinkler design density",
        fc.sprinkler_design?.design_density,
      ),
    },
    {
      id: "sprinkler_design.in_rack_sprinklers_required",
      name: "In-rack sprinklers required?",
      codeValue: toCodeValue(
        "fire_code.sprinkler_design.in_rack_sprinklers_required",
        "In-rack sprinklers required?",
        fc.sprinkler_design?.in_rack_sprinklers_required,
      ),
    },
  ];

  const reqAudit: AuditEntry = {
    step: "Triggered fire-code requirements",
    description:
      "Listed the fire-protection requirement values relevant to this storage configuration. Each is carried from fire-code-requirements.yaml with its citation; all are placeholders pending engineer verification.",
    inputsUsed: {
      highPiledAreaSqFt: input.building.highPiledAreaSqFt,
      storageHeightFt: input.rack.storageHeightFt,
      aisleWidthFt: input.rack.aisleWidthFt,
      existingSprinkler: input.building.existingSprinkler,
      sprinklerSystemType: input.sprinkler.systemType,
    },
    codeValues: triggeredRequirements.map((r) => r.codeValue),
    assumptions: [],
    result: `${triggeredRequirements.length} requirement values surfaced`,
    status: triggeredRequirements.every((r) => r.codeValue.isPlaceholder)
      ? "blocked_by_placeholder"
      : "ok",
  };

  return {
    commodityClass,
    triggeredRequirements,
    audit: [classAudit, reqAudit],
  };
}

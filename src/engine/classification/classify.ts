// =====================================================================
//  CLASSIFICATION ENGINE  — commodity class + triggered requirements
// =====================================================================
//
//  Pure function. Runs the engineer-written decision-tree rules (see
//  rules.ts) to map the intake answers to a commodity class, and surfaces
//  the fire-code requirements that get triggered.
//
//  Safety behavior is preserved end to end:
//   - If the rules are not VERIFIED, the result is UNDETERMINED.
//   - If the rules are verified but none match these inputs, the result is
//     still UNDETERMINED (the engine never guesses to "fill the gap").
//   - Bad rule data (unknown field/class, etc.) is reported, not acted on.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";
import { evaluateRules, type ClassificationRule } from "@/engine/classification/rules";

export interface TriggeredRequirement {
  id: string;
  name: string;
  codeValue: CodeValue;
}

export interface ClassificationResult {
  commodityClass: CodeValue<string>;
  /** The matched class id (machine-readable), or null if UNDETERMINED. */
  commodityClassId: string | null;
  triggeredRequirements: TriggeredRequirement[];
  /** Problems found in the classification rules data (unknown fields, etc.). */
  dataIssues: string[];
  audit: AuditEntry[];
}

export function classifyCommodity(input: IntakeInput, data: CodeData): ClassificationResult {
  const rules = (data.commodity?.classification_rules ?? {}) as Record<string, any>;
  const rulesVerified = String(rules.status ?? "PLACEHOLDER").toUpperCase() === "VERIFIED";
  const ruleList: ClassificationRule[] = Array.isArray(rules.rules) ? rules.rules : [];
  const classes = Array.isArray(data.commodity?.classes) ? (data.commodity.classes as Record<string, any>[]) : [];
  const validClassIds = classes.map((c) => String(c.id));
  const classNameById = (id: string) => String(classes.find((c) => String(c.id) === id)?.name ?? id);
  const baseSource = String(rules.source ?? "2025 California Fire Code Chapter 32 — VERIFY");

  let commodityClass: CodeValue<string>;
  let commodityClassId: string | null = null;
  let dataIssues: string[] = [];
  let classDescription: string;
  let classStatus: "ok" | "blocked_by_placeholder";

  if (rulesVerified && ruleList.length > 0) {
    const match = evaluateRules(input, ruleList, validClassIds);
    dataIssues = match.issues;
    if (match.matched && match.classId) {
      commodityClass = {
        id: "commodity.class",
        label: "Commodity classification",
        value: classNameById(match.classId),
        unit: null,
        source: String(match.source ?? baseSource),
        status: "VERIFIED",
        isPlaceholder: false,
        todo: null,
      };
      classDescription = `Commodity classified as "${classNameById(match.classId)}" by verified rule #${(match.ruleIndex ?? 0) + 1}.`;
      classStatus = "ok";
      commodityClassId = match.classId;
    } else {
      commodityClass = {
        id: "commodity.class",
        label: "Commodity classification",
        value: null,
        unit: null,
        source: baseSource,
        status: "PLACEHOLDER",
        isPlaceholder: true,
        todo: "No verified rule matched these inputs. The engineer should review the inputs and extend the classification rules to cover this case.",
      };
      classDescription =
        "Commodity class left UNDETERMINED: the verified rules did not match these inputs. The app does not guess; the engineer should extend the rules.";
      classStatus = "blocked_by_placeholder";
    }
  } else {
    commodityClass = {
      id: "commodity.class",
      label: "Commodity classification",
      value: null,
      unit: null,
      source: baseSource,
      status: "PLACEHOLDER",
      isPlaceholder: true,
      todo: String(
        rules.todo ??
          "Classification rules are not yet defined/verified. The engineer must define how intake answers map to a commodity class and set status: VERIFIED.",
      ),
    };
    classDescription =
      "Commodity class left UNDETERMINED: the classification rules in commodity-classification.yaml are not yet verified. The app intentionally does not guess a class.";
    classStatus = "blocked_by_placeholder";
  }

  // Illustrative overlay: when the real classification is undetermined but an
  // illustrative example class is provided (illustrative mode), show it clearly
  // marked. Presentational only — commodityClassId stays null, so it never drives
  // jurisdiction triggers or any other logic.
  const illusClass = (data.commodity?.illustrative_class ?? {}) as Record<string, any>;
  const illusActive =
    String(illusClass.status ?? "").toUpperCase() === "ILLUSTRATIVE" &&
    illusClass.value !== null &&
    illusClass.value !== undefined &&
    illusClass.value !== "";
  if (commodityClass.isPlaceholder && illusActive) {
    commodityClass = {
      id: "commodity.class",
      label: "Commodity classification",
      value: String(illusClass.value),
      unit: null,
      source: String(illusClass.source ?? baseSource),
      status: "PLACEHOLDER",
      isPlaceholder: true,
      illustrative: true,
      todo: null,
    };
    classDescription =
      "Commodity class shown as an ILLUSTRATIVE example only (not a verified classification). Replace it with your verified classification.";
  }

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
    description: classDescription,
    inputsUsed,
    codeValues: [commodityClass],
    assumptions: dataIssues.length > 0 ? [`Classification data issues: ${dataIssues.join(" ")}`] : [],
    result: commodityClass.value ?? "UNDETERMINED",
    status: classStatus,
  };

  // --- Triggered fire-code requirements --------------------------------
  // Surface the relevant requirement values from the data file so the
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
      codeValue: toCodeValue("fire_code.aisle_width.minimum", "Minimum aisle width", fc.aisle_width?.minimum),
    },
    {
      id: "heights.max_pile_height",
      name: "Maximum pile/storage height",
      codeValue: toCodeValue("fire_code.heights.max_pile_height", "Maximum pile/storage height", fc.heights?.max_pile_height),
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
    status: triggeredRequirements.every((r) => r.codeValue.isPlaceholder) ? "blocked_by_placeholder" : "ok",
  };

  return {
    commodityClass,
    commodityClassId,
    triggeredRequirements,
    dataIssues,
    audit: [classAudit, reqAudit],
  };
}

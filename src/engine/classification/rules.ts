// =====================================================================
//  CLASSIFICATION RULES  — commodity-specific rule evaluation
// =====================================================================
//
//  Executes the commodity-classification rules an engineer writes in
//  commodity-classification.yaml, using the shared condition machinery in
//  conditions.ts. Rules are checked in order; the FIRST whose conditions
//  all match wins. Bad rule data is reported, never acted on.
// =====================================================================

import type { IntakeInput } from "@/engine/intake/schema";
import { evaluateWhen, type FieldLookup } from "@/engine/conditions";

export interface ClassificationRule {
  when: Record<string, unknown>;
  assign_class: string;
  source?: string;
}

export interface RuleMatch {
  matched: boolean;
  classId?: string;
  source?: string;
  /** Zero-based index of the matched rule. */
  ruleIndex?: number;
  /** Data problems found while evaluating (unknown fields, bad operators, etc.). */
  issues: string[];
}

// The friendly field names a classification rule may test.
const FIELD_RESOLVERS: Record<string, (i: IntakeInput) => unknown> = {
  plastic_content: (i) => i.commodity.plasticContent,
  packaging: (i) => i.commodity.packaging,
  encapsulated: (i) => i.commodity.encapsulated,
  idle_pallets: (i) => i.commodity.idlePalletsStored,
  primary_material: (i) => i.commodity.primaryMaterial,
  storage_height_ft: (i) => i.rack.storageHeightFt,
  ceiling_height_ft: (i) => i.building.ceilingHeightFt,
  high_piled_area_sqft: (i) => i.building.highPiledAreaSqFt,
};

/** Field names available to classification rule authors (for docs/messages). */
export const RULE_FIELDS = Object.keys(FIELD_RESOLVERS);

export function evaluateRules(
  input: IntakeInput,
  rules: ClassificationRule[],
  validClassIds: string[] = [],
): RuleMatch {
  const issues: string[] = [];
  const resolve = (field: string): FieldLookup =>
    field in FIELD_RESOLVERS ? { known: true, value: FIELD_RESOLVERS[field](input) } : { known: false };

  for (let idx = 0; idx < rules.length; idx++) {
    const rule = rules[idx];
    const ruleNo = idx + 1;

    if (!rule || typeof rule !== "object" || typeof rule.when !== "object" || rule.when === null) {
      issues.push(`Rule #${ruleNo} is missing a valid 'when' block.`);
      continue;
    }
    if (!rule.assign_class) {
      issues.push(`Rule #${ruleNo} is missing 'assign_class'.`);
      continue;
    }
    if (validClassIds.length > 0 && !validClassIds.includes(rule.assign_class)) {
      issues.push(`Rule #${ruleNo} assigns unknown class "${rule.assign_class}".`);
      continue;
    }

    if (evaluateWhen(rule.when, resolve, issues) === "match") {
      return { matched: true, classId: rule.assign_class, source: rule.source, ruleIndex: idx, issues };
    }
  }

  return { matched: false, issues };
}

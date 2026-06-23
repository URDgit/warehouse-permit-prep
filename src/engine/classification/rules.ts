// =====================================================================
//  CLASSIFICATION RULES EVALUATOR  — the decision-tree machinery
// =====================================================================
//
//  Pure functions that execute the commodity-classification rules an
//  engineer writes in commodity-classification.yaml. This is *machinery
//  only*: it invents no values. It decides which (engineer-written,
//  verified) rule matches the intake answers.
//
//  A rule looks like:
//    when: { plastic_content: significant, encapsulated: true }
//    assign_class: group_a_plastics
//    source: "CFC 2022 §32xx.x"
//
//  Rules are checked in order; the FIRST whose conditions ALL match wins.
//  Supported condition forms inside `when`:
//    field: value                 -> equals (strings compared case-insensitively)
//    field: { in: [a, b] }        -> matches any value in the list
//    field: { not: value }        -> not equal
//    field: { gte: n } / lte/gt/lt -> numeric comparison
// =====================================================================

import type { IntakeInput } from "@/engine/intake/schema";

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

// The friendly field names a rule author may test, mapped to the intake value.
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

/** The field names available to rule authors (also used in error messages/docs). */
export const RULE_FIELDS = Object.keys(FIELD_RESOLVERS);

function equals(a: unknown, b: unknown): boolean {
  if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

function numCompare(
  actual: unknown,
  operand: unknown,
  op: (a: number, b: number) => boolean,
  field: string,
  issues: string[],
): boolean {
  const a = Number(actual);
  const b = Number(operand);
  if (Number.isNaN(a) || Number.isNaN(b)) {
    issues.push(`Rule field "${field}": numeric comparison needs numbers on both sides.`);
    return false;
  }
  return op(a, b);
}

/** Does a single field's condition match the actual intake value? */
function matchCondition(actual: unknown, matcher: unknown, field: string, issues: string[]): boolean {
  if (matcher === null || typeof matcher !== "object" || Array.isArray(matcher)) {
    return equals(actual, matcher);
  }
  const m = matcher as Record<string, unknown>;
  let ok = true;
  for (const op of Object.keys(m)) {
    const operand = m[op];
    switch (op) {
      case "in":
        if (!Array.isArray(operand)) {
          issues.push(`Rule field "${field}": 'in' expects a list.`);
          ok = false;
        } else {
          ok = ok && operand.some((o) => equals(actual, o));
        }
        break;
      case "not":
        ok = ok && !equals(actual, operand);
        break;
      case "gte":
        ok = ok && numCompare(actual, operand, (a, b) => a >= b, field, issues);
        break;
      case "lte":
        ok = ok && numCompare(actual, operand, (a, b) => a <= b, field, issues);
        break;
      case "gt":
        ok = ok && numCompare(actual, operand, (a, b) => a > b, field, issues);
        break;
      case "lt":
        ok = ok && numCompare(actual, operand, (a, b) => a < b, field, issues);
        break;
      default:
        issues.push(`Rule field "${field}": unknown operator "${op}".`);
        ok = false;
    }
  }
  return ok;
}

/**
 * Evaluate classification rules against the intake. Returns the first match,
 * plus any data problems found. Does not throw on bad data — it records an
 * issue and treats that rule as non-matching, so a typo can never silently
 * assign a class.
 */
export function evaluateRules(
  input: IntakeInput,
  rules: ClassificationRule[],
  validClassIds: string[] = [],
): RuleMatch {
  const issues: string[] = [];

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

    let allMatch = true;
    for (const field of Object.keys(rule.when)) {
      const resolver = FIELD_RESOLVERS[field];
      if (!resolver) {
        issues.push(`Rule #${ruleNo} references unknown field "${field}". Allowed: ${RULE_FIELDS.join(", ")}.`);
        allMatch = false;
        break;
      }
      if (!matchCondition(resolver(input), rule.when[field], field, issues)) {
        allMatch = false;
        break;
      }
    }

    if (allMatch) {
      return { matched: true, classId: rule.assign_class, source: rule.source, ruleIndex: idx, issues };
    }
  }

  return { matched: false, issues };
}

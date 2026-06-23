// =====================================================================
//  CONDITIONS  — the shared, generic rule-matching machinery
// =====================================================================
//
//  Both the commodity-classification rules and the jurisdiction submittal
//  triggers are "if these conditions match, then ..." rules. This module
//  is the one place that decides whether a `when:` block matches the
//  inputs, so the logic is written and tested once.
//
//  It invents nothing. A `when:` block evaluates to one of three results:
//    "match"          — all conditions are satisfied
//    "no-match"       — a condition is definitely not satisfied
//    "indeterminate"  — it cannot be decided (a needed input is missing /
//                       undetermined, or the rule data has a problem)
//
//  Condition forms inside a `when:` block:
//    field: value                 -> equals (strings compared case-insensitively)
//    field: { in: [a, b] }        -> matches any value in the list
//    field: { not: value }        -> not equal
//    field: { gte: n } (lte/gt/lt) -> numeric comparison
// =====================================================================

export type ConditionResult = "match" | "no-match" | "indeterminate";

/** What a field resolver reports for a requested field name. */
export interface FieldLookup {
  /** False if the field name is not recognized at all. */
  known: boolean;
  /** The value; null/undefined means "not determinable right now". */
  value?: unknown;
}

export type FieldResolver = (field: string) => FieldLookup;

function equals(a: unknown, b: unknown): boolean {
  if (typeof a === "string" && typeof b === "string") return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

function compareNumbers(actual: unknown, operand: unknown, op: (a: number, b: number) => boolean): ConditionResult {
  const a = Number(actual);
  const b = Number(operand);
  if (Number.isNaN(a) || Number.isNaN(b)) return "indeterminate";
  return op(a, b) ? "match" : "no-match";
}

/** Evaluate one field's matcher against its actual value. */
export function matchCondition(actual: unknown, matcher: unknown, field: string, issues: string[]): ConditionResult {
  if (matcher === null || typeof matcher !== "object" || Array.isArray(matcher)) {
    return equals(actual, matcher) ? "match" : "no-match";
  }
  const m = matcher as Record<string, unknown>;
  let result: ConditionResult = "match";
  for (const op of Object.keys(m)) {
    const operand = m[op];
    let c: ConditionResult;
    switch (op) {
      case "in":
        if (!Array.isArray(operand)) {
          issues.push(`Field "${field}": 'in' expects a list.`);
          c = "indeterminate";
        } else {
          c = operand.some((o) => equals(actual, o)) ? "match" : "no-match";
        }
        break;
      case "not":
        c = !equals(actual, operand) ? "match" : "no-match";
        break;
      case "gte":
        c = compareNumbers(actual, operand, (a, b) => a >= b);
        break;
      case "lte":
        c = compareNumbers(actual, operand, (a, b) => a <= b);
        break;
      case "gt":
        c = compareNumbers(actual, operand, (a, b) => a > b);
        break;
      case "lt":
        c = compareNumbers(actual, operand, (a, b) => a < b);
        break;
      default:
        issues.push(`Field "${field}": unknown operator "${op}".`);
        c = "indeterminate";
    }
    if (c === "indeterminate") return "indeterminate";
    if (c === "no-match") result = "no-match";
  }
  return result;
}

/**
 * Evaluate a whole `when:` block. All fields must match. Resolves each field
 * through the supplied resolver so different domains (commodity vs. building)
 * can expose different field names while sharing this logic.
 */
export function evaluateWhen(
  when: Record<string, unknown>,
  resolve: FieldResolver,
  issues: string[],
): ConditionResult {
  for (const field of Object.keys(when)) {
    const lookup = resolve(field);
    if (!lookup.known) {
      issues.push(`Unknown field "${field}".`);
      return "indeterminate";
    }
    if (lookup.value === null || lookup.value === undefined) {
      return "indeterminate";
    }
    const c = matchCondition(lookup.value, when[field], field, issues);
    if (c === "indeterminate") return "indeterminate";
    if (c === "no-match") return "no-match";
  }
  return "match";
}

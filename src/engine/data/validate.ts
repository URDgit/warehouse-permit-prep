// =====================================================================
//  DATA-FILE VALIDATOR
// =====================================================================
//
//  Pure function. Scans the parsed data files for STRUCTURAL mistakes a
//  human might introduce while editing them — invalid status values,
//  values marked VERIFIED but left blank, rules pointing at unknown
//  classes, triggers testing unknown fields, missing citations, etc.
//
//  It checks structure, NOT engineering correctness (that's the
//  engineer's job). Errors are things that will break or mislead the
//  engine; warnings are things worth tidying.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import { RULE_FIELDS } from "@/engine/classification/rules";
import { JURISDICTION_TRIGGER_FIELDS } from "@/engine/jurisdictions/losAngeles";

export interface ValidationIssue {
  level: "error" | "warning";
  file: string;
  path: string;
  message: string;
}

const VALID_STATUS = new Set(["PLACEHOLDER", "VERIFIED"]);
const OPERATORS = new Set(["in", "not", "gte", "lte", "gt", "lt"]);
// Keys whose contents are examples/notes, not live data — don't descend into them.
const SKIP_KEYS = new Set(["example_rules", "example_documents"]);

function isObj(v: unknown): v is Record<string, any> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/** Generic pass: every object that has a `status` is a code value to sanity-check. */
function walk(node: unknown, file: string, path: string, issues: ValidationIssue[]) {
  if (Array.isArray(node)) {
    node.forEach((el, idx) => {
      const id = isObj(el) && el.id ? String(el.id) : String(idx);
      walk(el, file, `${path}[${id}]`, issues);
    });
    return;
  }
  if (!isObj(node)) return;

  if (typeof node.status === "string") {
    const status = node.status.toUpperCase();
    if (!VALID_STATUS.has(status)) {
      issues.push({ level: "error", file, path, message: `status "${node.status}" must be PLACEHOLDER or VERIFIED.` });
    }
    const hasValueKey = "value" in node;
    const valueEmpty = node.value === null || node.value === undefined || node.value === "";
    if (status === "VERIFIED" && hasValueKey && valueEmpty) {
      issues.push({ level: "error", file, path, message: "marked VERIFIED but has no value." });
    }
    if (hasValueKey && !node.source) {
      issues.push({ level: "warning", file, path, message: "code value has no 'source' citation." });
    }
  }

  for (const [k, v] of Object.entries(node)) {
    if (SKIP_KEYS.has(k)) continue;
    if (isObj(v) || Array.isArray(v)) walk(v, file, path ? `${path}.${k}` : k, issues);
  }
}

function validateWhen(when: Record<string, unknown>, allowed: string[], file: string, path: string, issues: ValidationIssue[]) {
  for (const [field, matcher] of Object.entries(when)) {
    if (!allowed.includes(field)) {
      issues.push({ level: "error", file, path, message: `condition field "${field}" is not allowed. Allowed: ${allowed.join(", ")}.` });
    }
    if (isObj(matcher)) {
      for (const op of Object.keys(matcher)) {
        if (!OPERATORS.has(op)) issues.push({ level: "error", file, path, message: `unknown operator "${op}" on field "${field}".` });
      }
    }
  }
}

function checkClassification(commodity: any, issues: ValidationIssue[]) {
  const file = "commodity-classification.yaml";
  const classes = Array.isArray(commodity?.classes) ? commodity.classes : [];
  const ids = new Set<string>();
  classes.forEach((c: any, i: number) => {
    if (!c?.id) issues.push({ level: "error", file, path: `classes[${i}]`, message: "class is missing an 'id'." });
    else ids.add(String(c.id));
    if (!c?.name) issues.push({ level: "warning", file, path: `classes[${c?.id ?? i}]`, message: "class is missing a 'name'." });
  });

  const rules = commodity?.classification_rules;
  if (!isObj(rules)) return;
  const verified = String(rules.status ?? "").toUpperCase() === "VERIFIED";
  const list = Array.isArray(rules.rules) ? rules.rules : [];
  if (verified && list.length === 0) {
    issues.push({ level: "error", file, path: "classification_rules", message: "status is VERIFIED but no rules are defined." });
  }
  list.forEach((r: any, i: number) => {
    const p = `classification_rules.rules[${i}]`;
    if (!isObj(r?.when)) issues.push({ level: "error", file, path: p, message: "rule is missing a 'when' object." });
    else validateWhen(r.when, RULE_FIELDS, file, p, issues);
    if (!r?.assign_class) issues.push({ level: "error", file, path: p, message: "rule is missing 'assign_class'." });
    else if (ids.size > 0 && !ids.has(String(r.assign_class)))
      issues.push({ level: "error", file, path: p, message: `assign_class "${r.assign_class}" is not a known class id.` });
    if (!r?.source) issues.push({ level: "warning", file, path: p, message: "rule has no 'source' citation." });
  });
}

function checkJurisdiction(jur: any, issues: ValidationIssue[]) {
  const file = "jurisdictions/los-angeles.yaml";
  const docs = Array.isArray(jur?.required_documents) ? jur.required_documents : [];
  docs.forEach((d: any, i: number) => {
    const p = `required_documents[${d?.id ?? i}]`;
    if (!d?.id) issues.push({ level: "error", file, path: p, message: "document is missing an 'id'." });
    if (!d?.name) issues.push({ level: "warning", file, path: p, message: "document is missing a 'name'." });
    if (!d?.source) issues.push({ level: "warning", file, path: p, message: "document is missing a 'source'." });
    if (d?.applies_when !== undefined) {
      if (!isObj(d.applies_when)) issues.push({ level: "error", file, path: p, message: "'applies_when' must be an object." });
      else validateWhen(d.applies_when, JURISDICTION_TRIGGER_FIELDS, file, p, issues);
    }
  });
  const sr = jur?.submittal_rules;
  if (isObj(sr) && !VALID_STATUS.has(String(sr.status ?? "PLACEHOLDER").toUpperCase())) {
    issues.push({ level: "error", file, path: "submittal_rules", message: `status "${sr.status}" must be PLACEHOLDER or VERIFIED.` });
  }
}

export function validateCodeData(data: CodeData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  walk(data.commodity, "commodity-classification.yaml", "", issues);
  walk(data.fireCode, "fire-code-requirements.yaml", "", issues);
  walk(data.seismic, "seismic.yaml", "", issues);
  walk(data.anchorage, "anchorage.yaml", "", issues);
  walk(data.jurisdictions?.["los-angeles"], "jurisdictions/los-angeles.yaml", "", issues);
  checkClassification(data.commodity, issues);
  checkJurisdiction(data.jurisdictions?.["los-angeles"], issues);
  return issues;
}

/** Convenience: just the errors (things that will break or mislead the engine). */
export function dataErrors(data: CodeData): ValidationIssue[] {
  return validateCodeData(data).filter((i) => i.level === "error");
}

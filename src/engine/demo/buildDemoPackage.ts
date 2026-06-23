// =====================================================================
//  DEMO PACKAGE BUILDER  — a fabricated report for illustration only
// =====================================================================
//
//  Produces a fully filled-in ReviewPackage from the fake demoData, so you
//  can SHOW what a completed report looks like when pitching the tool.
//
//  Safety: the production calculation engine still refuses to compute (it
//  is never told to fabricate). The two "computed" demo numbers are built
//  HERE, in the demo module, and are labeled DEMO. The package is flagged
//  `demo: true` so the UI and PDF render a fabricated-data watermark.
// =====================================================================

import { buildReviewPackage, type ReviewPackage } from "@/engine/report/buildReviewPackage";
import { buildReadiness } from "@/engine/report/readiness";
import type { CalcResult } from "@/engine/calculation/types";
import type { AuditEntry, CodeValue } from "@/engine/provenance";
import { demoData, demoInput } from "@/engine/demo/demoData";

const DEMO_SRC = "DEMO — fabricated for demonstration, NOT a real result";

function demoCalc(
  resultId: string,
  formulaId: string,
  label: string,
  value: number,
  unit: string,
  formulaText: string,
  inputsUsed: Record<string, unknown>,
): CalcResult {
  const result: CodeValue<number> = { id: resultId, label, value, unit, source: DEMO_SRC, status: "VERIFIED", isPlaceholder: false, todo: null };
  const formula: CodeValue<string> = { id: formulaId, label: `${label} — formula`, value: formulaText, unit: null, source: DEMO_SRC, status: "VERIFIED", isPlaceholder: false, todo: null };
  const audit: AuditEntry = {
    step: label,
    description: "DEMONSTRATION ONLY — this value is fabricated to show the report format. It is not a real engineering result.",
    inputsUsed,
    codeValues: [result, formula],
    assumptions: ["Fabricated demo value — not a real calculation."],
    result: value,
    status: "ok",
  };
  return { id: resultId, label, result, formula, inputsUsed, audit };
}

export function buildDemoPackage(now: Date = new Date()): ReviewPackage {
  const pkg = buildReviewPackage(demoInput, { data: demoData, now });

  // Fabricated "computed" results (the real engine cannot/ will not compute).
  const seismic = demoCalc(
    "seismic.demand",
    "seismic.formula_reference",
    "Seismic design force on rack (demo)",
    12345,
    "lb (demo)",
    "DEMO base shear (not a real formula)",
    { Sds: demoInput.seismic.Sds, productLoadPerLevelLb: demoInput.loads.productLoadPerLevelLb },
  );
  const anchorage = demoCalc(
    "anchorage.check",
    "anchorage.demand_formula",
    "Anchorage demand/capacity check (demo)",
    0.62,
    "demand/capacity ratio (demo)",
    "DEMO anchor check (not a real method)",
    { anchored: demoInput.rack.anchored },
  );

  const swap = new Map<string, CodeValue>([
    [seismic.result.id, seismic.result],
    [seismic.formula.id, seismic.formula],
    [anchorage.result.id, anchorage.result],
    [anchorage.formula.id, anchorage.formula],
  ]);
  const codeValuesUsed = pkg.codeValuesUsed.map((cv) => swap.get(cv.id) ?? cv);
  const calculations = { seismic, anchorage };
  const auditTrail: AuditEntry[] = [...pkg.classification.audit, seismic.audit, anchorage.audit, pkg.jurisdiction.audit];
  const readiness = buildReadiness(codeValuesUsed, calculations, []);

  return {
    ...pkg,
    demo: true,
    meta: {
      ...pkg.meta,
      title: "[DEMO — FABRICATED DATA] " + pkg.meta.title,
      disclaimer:
        "DEMONSTRATION ONLY — every value, classification, and result below is FABRICATED to illustrate the report format. " +
        "Nothing here is real, code-based, verified, or usable for any purpose. " +
        pkg.meta.disclaimer,
    },
    calculations,
    codeValuesUsed,
    auditTrail,
    readiness,
    placeholderCount: codeValuesUsed.filter((cv) => cv.isPlaceholder).length,
  };
}

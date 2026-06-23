// =====================================================================
//  CALCULATION ENGINE — Seismic demand on the rack
// =====================================================================
//
//  Pure function. Computes the seismic design force on the rack.
//
//  SAFETY BEHAVIOR: if the governing formula reference or any required
//  coefficient in seismic.yaml is an unverified placeholder, this calc
//  REFUSES to output a number. It returns a placeholder result and an
//  audit entry explaining exactly what is missing — it never fabricates
//  a plausible-looking force.
//
//  When the data file is verified AND the real formula is implemented
//  here (under engineer direction), the computed branch below activates.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { allVerified, type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";
import type { CalcResult } from "@/engine/calculation/types";

export function computeSeismicDemand(input: IntakeInput, data: CodeData): CalcResult {
  const sf = (data.seismic?.seismic_force ?? {}) as Record<string, any>;
  const coeffs = (sf.coefficients ?? {}) as Record<string, any>;

  const formula = toCodeValue<string>(
    "seismic.formula_reference",
    "Governing seismic formula",
    sf.formula_reference,
    "ASCE 7-16 — VERIFY governing equation",
  );
  const R = toCodeValue<number>("seismic.R", "Response modification factor (R/Rp)", coeffs.response_modification_R);
  const Ie = toCodeValue<number>("seismic.Ie", "Seismic importance factor (Ie)", coeffs.importance_factor_Ie);
  const productLoadFactor = toCodeValue<number>(
    "seismic.product_load_reduction_factor",
    "Product load reduction factor (seismic mass)",
    data.seismic?.seismic_weight?.product_load_reduction_factor,
    "ANSI/RMI MH16.1 / ASCE 7-16 — VERIFY",
  );
  const supportingValues: CodeValue[] = [formula, R, Ie, productLoadFactor];

  const inputsUsed = {
    Sds: input.seismic.Sds ?? null,
    Sd1: input.seismic.Sd1 ?? null,
    siteClass: input.seismic.siteClass,
    seismicDesignCategory: input.seismic.seismicDesignCategory,
    riskCategory: input.seismic.riskCategory,
    storageHeightFt: input.rack.storageHeightFt,
    numberOfTiers: input.rack.numberOfTiers,
    productLoadPerLevelLb: input.loads.productLoadPerLevelLb ?? null,
    rackSelfWeightLb: input.loads.rackSelfWeightLb ?? null,
  };

  // Two independent gates, both must pass before any number is produced:
  //  1. A vetted ASCE 7 formula must be implemented here and switched on.
  //  2. Every supporting code value must be VERIFIED (not a placeholder).
  // Until an engineer does both, this stays blocked, so the app cannot
  // fabricate a force even after the data file is filled in.
  const FORMULA_IMPLEMENTED = false;
  const blocked = !FORMULA_IMPLEMENTED || !allVerified(supportingValues);

  const result: CodeValue<number> = {
    id: "seismic.demand",
    label: "Seismic design force on rack",
    value: null,
    unit: "per verified formula (e.g. lb or kips)",
    source: formula.source,
    status: "PLACEHOLDER",
    isPlaceholder: true,
    todo:
      "Cannot compute. Requires (1) the engineer to choose the rack design path and verify the formula, coefficients, and product-load reduction factor in seismic.yaml, and (2) a vetted ASCE 7 formula implemented and switched on in seismic.ts.",
  };

  const audit: AuditEntry = {
    step: "Seismic demand",
    description:
      "Seismic design force NOT computed. The governing formula, coefficients, and product-load reduction factor are unverified placeholders (and the vetted formula is not yet implemented). The app intentionally does not fabricate a value.",
    inputsUsed,
    codeValues: supportingValues,
    assumptions: [
      "Rack seismic weight comes from the stored product load (reduced by a code factor) plus rack self-weight; the reduction factor is an engineer-verified code value.",
      "The choice between nonbuilding-structure (ASCE 7-16 Ch.15) and component (Ch.13) design paths must be made by the engineer; it changes the formula.",
    ],
    result: null,
    status: blocked ? "blocked_by_placeholder" : "ok",
  };

  return { id: "seismic.demand", label: result.label, result, formula, inputsUsed, audit };
}

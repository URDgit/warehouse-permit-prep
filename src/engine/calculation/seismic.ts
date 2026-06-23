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
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";
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
  const supportingValues: CodeValue[] = [formula, R, Ie];

  const inputsUsed = {
    Sds: input.seismic.Sds ?? null,
    Sd1: input.seismic.Sd1 ?? null,
    siteClass: input.seismic.siteClass,
    seismicDesignCategory: input.seismic.seismicDesignCategory,
    riskCategory: input.seismic.riskCategory,
    storageHeightFt: input.rack.storageHeightFt,
    numberOfTiers: input.rack.numberOfTiers,
  };

  // Always "missing" today because no formula has been coded yet. Once the
  // engineer verifies the data and a vetted formula is implemented, this
  // becomes: blocked = !allVerified(supportingValues).
  const blocked = true;

  const result: CodeValue<number> = {
    id: "seismic.demand",
    label: "Seismic design force on rack",
    value: null,
    unit: "per verified formula (e.g. lb or kips)",
    source: formula.source,
    status: "PLACEHOLDER",
    isPlaceholder: true,
    todo:
      "Cannot compute. Requires (1) the engineer to choose the rack design path and verify the formula and coefficients in seismic.yaml, and (2) a vetted formula implemented in seismic.ts. Note: rack seismic weight is also required and is not yet collected on intake.",
  };

  const audit: AuditEntry = {
    step: "Seismic demand",
    description:
      "Seismic design force NOT computed. The governing formula/coefficients are unverified placeholders and the rack seismic weight is not yet collected. The app intentionally does not fabricate a value.",
    inputsUsed,
    codeValues: supportingValues,
    assumptions: [
      "Rack seismic weight (stored product + rack self-weight) is required for this calc and is not yet part of the intake form.",
      "The choice between nonbuilding-structure (ASCE 7-16 Ch.15) and component (Ch.13) design paths must be made by the engineer; it changes the formula.",
    ],
    result: null,
    status: blocked ? "blocked_by_placeholder" : "ok",
  };

  return { id: "seismic.demand", label: result.label, result, formula, inputsUsed, audit };
}

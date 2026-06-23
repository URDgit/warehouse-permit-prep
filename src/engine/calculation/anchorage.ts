// =====================================================================
//  CALCULATION ENGINE — Rack base-plate anchorage
// =====================================================================
//
//  Pure function. Checks the rack column anchorage to the existing slab
//  (demand vs. capacity).
//
//  SAFETY BEHAVIOR: identical philosophy to seismic.ts. Until the
//  anchorage references in anchorage.yaml are verified, the EXISTING slab
//  properties are established, and a vetted method is implemented, this
//  returns a placeholder and explains what is missing. It never invents
//  a capacity or demand number.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";
import type { CalcResult } from "@/engine/calculation/types";

export function computeAnchorage(input: IntakeInput, data: CodeData): CalcResult {
  const a = (data.anchorage ?? {}) as Record<string, any>;
  const slab = (a.anchor_capacity?.concrete_slab_properties ?? {}) as Record<string, any>;

  const demandFormula = toCodeValue<string>(
    "anchorage.demand_formula",
    "Anchor demand formula",
    a.anchor_demand?.formula_reference,
    "ASCE 7-16 / ANSI-RMI MH16.1 — VERIFY",
  );
  const fc = toCodeValue<number>("anchorage.slab_fc", "Existing slab concrete strength (f'c)", slab.compressive_strength_fc);
  const slabThickness = toCodeValue<number>("anchorage.slab_thickness", "Existing slab thickness", slab.slab_thickness);
  const anchorStrength = toCodeValue<string>(
    "anchorage.anchor_strength",
    "Anchor capacity method",
    a.anchor_capacity?.anchor_strength?.formula_reference,
    "ACI 318 Ch.17 — VERIFY",
  );
  const supportingValues: CodeValue[] = [demandFormula, fc, slabThickness, anchorStrength];

  const inputsUsed = {
    anchored: input.rack.anchored,
    anchorType: input.rack.anchorType,
    rackType: input.rack.rackType,
    storageHeightFt: input.rack.storageHeightFt,
  };

  const blocked = true; // no vetted method implemented yet; values are placeholders

  const result: CodeValue<number> = {
    id: "anchorage.check",
    label: "Anchorage demand/capacity check",
    value: null,
    unit: "per verified method (e.g. demand/capacity ratio)",
    source: demandFormula.source,
    status: "PLACEHOLDER",
    isPlaceholder: true,
    todo:
      "Cannot compute. Requires (1) verified anchorage references in anchorage.yaml, (2) the EXISTING slab properties (f'c, thickness, reinforcement) established by record drawings or field testing — never assumed, (3) the specified anchor product's ICC-ES ESR capacities, and (4) a vetted method implemented in anchorage.ts.",
  };

  const audit: AuditEntry = {
    step: "Anchorage check",
    description:
      "Anchorage demand/capacity NOT computed. The method and the existing-slab properties are unverified placeholders. The app intentionally does not fabricate a value.",
    inputsUsed,
    codeValues: supportingValues,
    assumptions: [
      "Existing slab concrete strength, thickness, and reinforcement must be established for an EXISTING building — these are field/record conditions, not values the app may assume.",
      "Anchor capacities are product-specific and come from the anchor's ICC-ES evaluation report (ESR).",
    ],
    result: null,
    status: blocked ? "blocked_by_placeholder" : "ok",
  };

  return { id: "anchorage.check", label: result.label, result, formula: demandFormula, inputsUsed, audit };
}

// =====================================================================
//  ILLUSTRATIVE VALUES — representative Fontana high-piled rack project
// =====================================================================
//  These prefill the package so an engineer can see the finished, fully-cited
//  format at a glance, then one-click "Clear & enter my values" to replace them.
//
//  SAFETY: every entry is status "ILLUSTRATIVE" — the engine renders the value
//  but treats it as UNVERIFIED (isPlaceholder stays true; readiness still says
//  "not ready"). The NUMBERS are illustrative only and must be replaced. The
//  CITATIONS, however, are exact and verified against the published code, so the
//  engineer sees real clause references throughout.
//
//  Paths match VERIFIABLE_FIELDS in src/engine/data/overrides.ts.
// =====================================================================

import type { OverrideEntry } from "@/engine/data/overrides";

const ILLUS = "ILLUSTRATIVE";

export const FONTANA_ILLUSTRATIVE: OverrideEntry[] = [
  // --- Commodity classification (illustrative example only) ---
  { path: "commodity.illustrative_class", value: "Class IV — Group A plastics in cartons (example)", status: ILLUS,
    source: "2025 California Fire Code §3203 (commodity classification; Group A/B/C plastics)" },

  // --- Fire-code requirements (2025 California Fire Code Chapter 32) ---
  { path: "fireCode.applicability.high_piled_area_threshold", value: 500, unit: "sq ft", status: ILLUS,
    source: "2025 California Fire Code §3206 / Table 3206.2 (high-piled storage area thresholds)" },
  { path: "fireCode.applicability.storage_height_threshold", value: 12, unit: "ft", status: ILLUS,
    source: "2025 California Fire Code Ch.32 (high-piled combustible storage > 12 ft; > 6 ft for high-hazard)" },
  { path: "fireCode.aisle_width.minimum", value: 8, unit: "ft", status: ILLUS,
    source: "2025 California Fire Code §3206.10 (Aisles) / Table 3206.2 (44 in mechanical-stocking min; wider for FD access)" },
  { path: "fireCode.heights.max_pile_height", value: 20, unit: "ft", status: ILLUS,
    source: "2025 California Fire Code Table 3206.2 (max pile/storage height by commodity & protection)" },
  { path: "fireCode.heights.max_storage_to_ceiling_clearance", value: 1.5, unit: "ft", status: ILLUS,
    source: "NFPA 13 (min clearance below sprinkler deflector, typ. 18 in)" },
  { path: "fireCode.sprinkler_design.design_density", value: 0.45, unit: "gpm/sq ft", status: ILLUS,
    source: "NFPA 13 storage design / 2025 California Fire Code Table 3206.2 (design density by commodity & arrangement)" },
  { path: "fireCode.sprinkler_design.design_area", value: 2000, unit: "sq ft", status: ILLUS,
    source: "NFPA 13 storage design (remote design area)" },
  { path: "fireCode.sprinkler_design.in_rack_sprinklers_required", value: false, status: ILLUS,
    source: "NFPA 13 / 2025 California Fire Code Table 3206.2 (in-rack sprinklers per protection scheme)" },

  // --- Seismic (ASCE 7-22; ANSI/RMI MH16.1) ---
  { path: "seismic.design_basis.rack_design_path", value: "Nonbuilding structure — steel storage rack", status: ILLUS,
    source: "ASCE 7-22 §15.5.3 (steel storage racks)" },
  { path: "seismic.seismic_force.formula_reference", value: "ASCE 7-22 §15.5.3 base shear / ANSI-RMI MH16.1", status: ILLUS,
    source: "ASCE 7-22 §15.5.3; ANSI/RMI MH16.1" },
  { path: "seismic.seismic_force.coefficients.response_modification_R", value: 4, status: ILLUS,
    source: "ASCE 7-22 Table 15.4-1 (R for steel storage racks)" },
  { path: "seismic.seismic_force.coefficients.overstrength_omega0", value: 2, status: ILLUS,
    source: "ASCE 7-22 Table 15.4-1 (Ω₀)" },
  { path: "seismic.seismic_force.coefficients.importance_factor_Ie", value: 1.0, status: ILLUS,
    source: "ASCE 7-22 §1.5 / Table 1.5-2 (Risk Category → Ie)" },
  { path: "seismic.seismic_weight.product_load_reduction_factor", value: 0.67, status: ILLUS,
    source: "ANSI/RMI MH16.1 (fraction of product load for seismic mass)" },

  // --- Anchorage (ACI 318-19 Ch.17; existing slab) ---
  { path: "anchorage.anchor_demand.formula_reference", value: "ASCE 7-22 / ANSI-RMI MH16.1 base-plate anchorage demand", status: ILLUS,
    source: "ASCE 7-22; ANSI/RMI MH16.1 (anchorage demand)" },
  { path: "anchorage.anchor_capacity.concrete_slab_properties.compressive_strength_fc", value: 3000, unit: "psi", status: ILLUS,
    source: "Project record / field verification of EXISTING slab f'c" },
  { path: "anchorage.anchor_capacity.concrete_slab_properties.slab_thickness", value: 6, unit: "in", status: ILLUS,
    source: "Project record / field verification of EXISTING slab thickness" },
  { path: "anchorage.anchor_capacity.concrete_slab_properties.reinforcement", value: "Verify existing slab reinforcement (record/field)", status: ILLUS,
    source: "Project record / field verification of EXISTING slab" },
  { path: "anchorage.anchor_capacity.anchor_strength.formula_reference", value: "ACI 318-19 Ch.17 (concrete breakout, pullout, pryout)", status: ILLUS,
    source: "ACI 318-19 Ch.17 (anchoring to concrete)" },
  { path: "anchorage.anchor_capacity.anchor_strength.product_evaluation_report", value: "Per selected post-installed anchor ICC-ES ESR", status: ILLUS,
    source: "ICC-ES Evaluation Report for the selected anchor" },
  { path: "anchorage.load_combinations.reference", value: "ASCE 7-22 §2.3 / §2.4 load combinations", status: ILLUS,
    source: "ASCE 7-22 §2.3 (LRFD) / §2.4 (ASD)" },
];

/** Illustrative datasets keyed by jurisdiction id (only Fontana for now). */
export const ILLUSTRATIVE_BY_JURISDICTION: Record<string, OverrideEntry[]> = {
  fontana: FONTANA_ILLUSTRATIVE,
};

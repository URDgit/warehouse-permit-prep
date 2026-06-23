// =====================================================================
//  DEMO DATA  — fabricated values for the DEMONSTRATION report only
// =====================================================================
//
//  This is FAKE data used purely to illustrate what a filled-in report
//  looks like (for pitching/explaining the tool). It is completely
//  separate from the real data files under data/ and is NEVER read by the
//  production path. Every citation says DEMO and units are suffixed
//  "(demo)" so nothing here can be mistaken for a real code value.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import { intakeSchema, type IntakeInput } from "@/engine/intake/schema";

const SRC = "DEMO — illustrative only, NOT a real code value";

function v(value: unknown, unit?: string) {
  return { value, status: "VERIFIED", source: SRC, ...(unit ? { unit } : {}) };
}

export const demoData: CodeData = {
  commodity: {
    classes: [
      { id: "class_III", name: "Class III (demo)" },
      { id: "class_IV", name: "Class IV (demo)" },
    ],
    classification_rules: {
      status: "VERIFIED",
      source: SRC,
      rules: [{ when: { packaging: "cartoned" }, assign_class: "class_III", source: SRC }],
    },
  },
  fireCode: {
    applicability: {
      high_piled_area_threshold: v(500, "sq ft (demo)"),
      storage_height_threshold: v(12, "ft (demo)"),
    },
    aisle_width: { minimum: v(8, "ft (demo)") },
    heights: {
      max_pile_height: v(25, "ft (demo)"),
      max_storage_to_ceiling_clearance: v(18, "in (demo)"),
    },
    sprinkler_design: {
      design_density: v(0.45, "gpm/sq ft (demo)"),
      design_area: v(2000, "sq ft (demo)"),
      in_rack_sprinklers_required: v("No (demo)"),
    },
  },
  seismic: {
    design_basis: { rack_design_path: v("Nonbuilding structure (demo)") },
    seismic_force: {
      formula_reference: v("DEMO base-shear reference (not real)"),
      coefficients: {
        response_modification_R: v(4),
        overstrength_omega0: v(2),
        importance_factor_Ie: v(1),
      },
    },
    seismic_weight: { product_load_reduction_factor: v(0.67) },
  },
  anchorage: {
    anchor_demand: { formula_reference: v("DEMO anchor-demand reference (not real)") },
    anchor_capacity: {
      concrete_slab_properties: {
        compressive_strength_fc: v(3000, "psi (demo)"),
        slab_thickness: v(6, "in (demo)"),
        reinforcement: v("None (demo)"),
      },
      anchor_strength: {
        formula_reference: v("DEMO ACI 318 method (not real)"),
        product_evaluation_report: v("ESR-0000 (demo)"),
      },
    },
    load_combinations: { reference: v("DEMO load combinations (not real)") },
  },
  jurisdictions: {
    "los-angeles": {
      meta: {
        jurisdiction_name: "City of Los Angeles (LADBS / LAFD)",
        reviewing_agencies: ["LADBS — structural / rack anchorage", "LAFD — high-piled storage"],
      },
      required_documents: [
        { id: "permit_application", name: "Permit application form(s)", source: SRC },
        { id: "site_floor_plan", name: "Site / floor plan showing rack layout", source: SRC, applies_when: { high_piled_area_sqft: { gte: 500 } } },
        { id: "structural_calcs", name: "Stamped rack structural & anchorage calculations", source: SRC },
        { id: "high_piled_storage_plan", name: "High-piled combustible storage plan", source: SRC, applies_when: { high_piled_area_sqft: { gte: 999999 } } },
      ],
      submittal_rules: { status: "VERIFIED", source: SRC },
    },
  },
};

export const demoInput: IntakeInput = intakeSchema.parse({
  project: {
    projectName: "DEMO — Example Warehouse (fabricated)",
    preparedBy: "Demonstration (fabricated)",
    preparedDate: "2026-06-22",
    jurisdiction: "los-angeles",
  },
  building: {
    address: "1 Demo Way, Los Angeles, CA",
    totalBuildingAreaSqFt: 60000,
    highPiledAreaSqFt: 15000,
    ceilingHeightFt: 32,
    existingSprinkler: true,
    sprinklerSystemType: "ESFR",
  },
  rack: { rackType: "selective", storageHeightFt: 24, numberOfTiers: 5, rackDepthConfig: "double-row", aisleWidthFt: 9, anchored: true },
  loads: { productLoadPerLevelLb: 2500, numberOfLoadedLevels: 5, rackSelfWeightLb: 1800 },
  slab: { thicknessIn: 6, compressiveStrengthPsi: 3000, reinforcement: "#4 @ 18 in o.c. (demo)" },
  commodity: { description: "Cartoned household goods (demo)", packaging: "cartoned", plasticContent: "limited" },
  sprinkler: { systemType: "ESFR" },
  seismic: { siteClass: "D", Ss: 1.5, S1: 0.6, Sds: 1.0, Sd1: 0.6, seismicDesignCategory: "D", riskCategory: "II" },
});

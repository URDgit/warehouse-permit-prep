// =====================================================================
//  OVERRIDES  — engineer-verified values layered over the curated YAML
// =====================================================================
//
//  The curated YAML files stay pristine (documentation + placeholders).
//  Verified values entered through the in-app "Verify data" editor are
//  stored separately in data/overrides.yaml and MERGED on top here, so the
//  original commented files are never mangled and edits are reversible.
//
//  Only a defined set of scalar code values is editable through the app
//  (VERIFIABLE_FIELDS). The structural logic (classification rules and
//  submittal triggers) is still edited in the YAML data files.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";

export interface OverrideEntry {
  /** Dotted path into the CodeData object, e.g. "fireCode.aisle_width.minimum". */
  path: string;
  value: unknown;
  unit?: string;
  source?: string;
  status?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface VerifiableFieldSpec {
  id: string;
  discipline: string;
  label: string;
  path: string;
  unit?: string;
  numeric?: boolean;
}

/** The scalar code values the in-app editor can set. */
export const VERIFIABLE_FIELDS: VerifiableFieldSpec[] = [
  // Fire-code requirements
  { id: "fc_area", discipline: "Fire-code requirements", label: "High-piled storage area threshold", path: "fireCode.applicability.high_piled_area_threshold", unit: "sq ft", numeric: true },
  { id: "fc_height", discipline: "Fire-code requirements", label: "High-piled storage height threshold", path: "fireCode.applicability.storage_height_threshold", unit: "ft", numeric: true },
  { id: "fc_aisle", discipline: "Fire-code requirements", label: "Minimum aisle width", path: "fireCode.aisle_width.minimum", unit: "ft", numeric: true },
  { id: "fc_pile", discipline: "Fire-code requirements", label: "Maximum pile/storage height", path: "fireCode.heights.max_pile_height", unit: "ft", numeric: true },
  { id: "fc_clear", discipline: "Fire-code requirements", label: "Clearance to ceiling/sprinklers", path: "fireCode.heights.max_storage_to_ceiling_clearance", unit: "ft", numeric: true },
  { id: "fc_density", discipline: "Fire-code requirements", label: "Sprinkler design density", path: "fireCode.sprinkler_design.design_density", unit: "gpm/sq ft", numeric: true },
  { id: "fc_designarea", discipline: "Fire-code requirements", label: "Sprinkler design area", path: "fireCode.sprinkler_design.design_area", unit: "sq ft", numeric: true },
  { id: "fc_inrack", discipline: "Fire-code requirements", label: "In-rack sprinklers required? (true/false)", path: "fireCode.sprinkler_design.in_rack_sprinklers_required" },

  // Seismic
  { id: "se_path", discipline: "Seismic", label: "Rack seismic design path", path: "seismic.design_basis.rack_design_path" },
  { id: "se_formula", discipline: "Seismic", label: "Governing seismic formula reference", path: "seismic.seismic_force.formula_reference" },
  { id: "se_R", discipline: "Seismic", label: "Response modification factor (R/Rp)", path: "seismic.seismic_force.coefficients.response_modification_R", numeric: true },
  { id: "se_omega", discipline: "Seismic", label: "Overstrength factor", path: "seismic.seismic_force.coefficients.overstrength_omega0", numeric: true },
  { id: "se_Ie", discipline: "Seismic", label: "Seismic importance factor (Ie)", path: "seismic.seismic_force.coefficients.importance_factor_Ie", numeric: true },
  { id: "se_pload", discipline: "Seismic", label: "Product load reduction factor (seismic mass)", path: "seismic.seismic_weight.product_load_reduction_factor", numeric: true },

  // Anchorage
  { id: "an_demand", discipline: "Anchorage", label: "Anchor demand formula", path: "anchorage.anchor_demand.formula_reference" },
  { id: "an_fc", discipline: "Anchorage", label: "Existing slab concrete strength (f'c)", path: "anchorage.anchor_capacity.concrete_slab_properties.compressive_strength_fc", unit: "psi", numeric: true },
  { id: "an_thick", discipline: "Anchorage", label: "Existing slab thickness", path: "anchorage.anchor_capacity.concrete_slab_properties.slab_thickness", unit: "in", numeric: true },
  { id: "an_reinf", discipline: "Anchorage", label: "Existing slab reinforcement", path: "anchorage.anchor_capacity.concrete_slab_properties.reinforcement" },
  { id: "an_method", discipline: "Anchorage", label: "Anchor capacity method", path: "anchorage.anchor_capacity.anchor_strength.formula_reference" },
  { id: "an_esr", discipline: "Anchorage", label: "Anchor product evaluation report (ICC-ES ESR)", path: "anchorage.anchor_capacity.anchor_strength.product_evaluation_report" },
  { id: "an_loads", discipline: "Anchorage", label: "Governing load combinations", path: "anchorage.load_combinations.reference" },
];

export interface VerifiableField extends Omit<VerifiableFieldSpec, "unit" | "numeric"> {
  unit: string | null;
  numeric: boolean;
  /** Current value as a string ("" if unset). */
  value: string;
  source: string;
  verified: boolean;
  todo: string | null;
}

function getNode(root: unknown, path: string): any {
  return path.split(".").reduce<any>((o, k) => (o == null ? undefined : o[k]), root);
}

/** Apply verified overrides onto a freshly-loaded CodeData object (mutates it). */
export function applyOverrides(data: CodeData, overrides: OverrideEntry[]): void {
  for (const o of overrides) {
    if (!o || typeof o.path !== "string") continue;
    const node = getNode(data, o.path);
    if (node && typeof node === "object") {
      node.value = o.value;
      node.status = o.status ?? "VERIFIED";
      if (o.source !== undefined) node.source = o.source;
      if (o.unit !== undefined) node.unit = o.unit;
      if (o.verifiedBy !== undefined) node.verifiedBy = o.verifiedBy;
      if (o.verifiedAt !== undefined) node.verifiedAt = o.verifiedAt;
    }
    // If the path no longer exists, skip it silently.
  }
}

/** Read the current state of every editable field from (already-merged) data. */
export function listVerifiableFields(data: CodeData): VerifiableField[] {
  return VERIFIABLE_FIELDS.map((spec) => {
    const node = getNode(data, spec.path) ?? {};
    const status = String(node.status ?? "PLACEHOLDER").toUpperCase();
    const hasValue = node.value !== null && node.value !== undefined && node.value !== "";
    return {
      ...spec,
      unit: (node.unit as string) ?? spec.unit ?? null,
      numeric: !!spec.numeric,
      value: hasValue ? String(node.value) : "",
      source: String(node.source ?? ""),
      verified: status === "VERIFIED" && hasValue,
      todo: (node.todo as string) ?? null,
    };
  });
}

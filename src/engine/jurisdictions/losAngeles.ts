// =====================================================================
//  JURISDICTION MODULE — City of Los Angeles (LADBS / LAFD)
// =====================================================================
//
//  Pure function. Produces the list of submittal documents for an LA
//  storage-rack / high-piled storage permit, and decides which apply using
//  engineer-written trigger rules (`applies_when`) in the data file,
//  evaluated with the shared condition machinery (conditions.ts).
//
//  Safety behavior mirrors classification:
//   - While the submittal triggers are not VERIFIED, every document is
//     shown as "verify applicability" (no document is silently dropped or
//     declared required by a guess).
//   - When triggers are verified, a document with no `applies_when` is
//     always required; one with conditions is required / not required /
//     "verify" depending on the inputs.
//
//  Shaped as a plug-in: another city = another data file + a function with
//  this same signature.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import type { ClassificationResult } from "@/engine/classification/classify";
import { evaluateWhen, type FieldLookup } from "@/engine/conditions";
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";

export type DocApplicability = "required" | "not_required" | "verify";

export interface RequiredDocument {
  id: string;
  name: string;
  applicability: DocApplicability;
  /** Plain-language explanation of the applicability decision. */
  reason: string;
  /** Carries the citation + whether this determination is verified. */
  status: CodeValue;
}

export interface ChecklistItem {
  id: string;
  name: string;
  source: string;
}

export interface JurisdictionResult {
  jurisdictionId: string;
  jurisdictionName: string;
  reviewingAgencies: string[];
  requiredDocuments: RequiredDocument[];
  /** Code-grounded list of what the drawings must show (CFC §3201.3). */
  planContent: ChecklistItem[];
  /** Structural / fire documents reviewers expect in the package. */
  structuralSubmittal: ChecklistItem[];
  /** Special inspections identified for the rack work. */
  specialInspections: ChecklistItem[];
  /** Items deferred to a post-permit submittal. */
  deferredSubmittals: ChecklistItem[];
  /** Problems found in the submittal trigger data. */
  dataIssues: string[];
  audit: AuditEntry;
}

export const JURISDICTION_ID = "los-angeles";

// Fields a submittal trigger may test (plus the special "commodity_class").
const JURISDICTION_FIELDS: Record<string, (i: IntakeInput) => unknown> = {
  high_piled_area_sqft: (i) => i.building.highPiledAreaSqFt,
  total_building_area_sqft: (i) => i.building.totalBuildingAreaSqFt,
  storage_height_ft: (i) => i.rack.storageHeightFt,
  ceiling_height_ft: (i) => i.building.ceilingHeightFt,
  aisle_width_ft: (i) => i.rack.aisleWidthFt,
  existing_sprinkler: (i) => i.building.existingSprinkler,
  sprinkler_system_type: (i) => i.sprinkler.systemType,
  anchored: (i) => i.rack.anchored,
};

/** Field names available to submittal-trigger authors (for docs/messages). */
export const JURISDICTION_TRIGGER_FIELDS = [...Object.keys(JURISDICTION_FIELDS), "commodity_class"];

export function getJurisdictionRequirements(
  input: IntakeInput,
  data: CodeData,
  jurisdictionId: string = JURISDICTION_ID,
  classification?: ClassificationResult,
): JurisdictionResult {
  const j = (data.jurisdictions?.[jurisdictionId] ?? {}) as Record<string, any>;
  const meta = (j.meta ?? {}) as Record<string, any>;
  const docs = Array.isArray(j.required_documents) ? (j.required_documents as Record<string, any>[]) : [];
  const submittal = (j.submittal_rules ?? {}) as Record<string, any>;
  const triggersVerified = String(submittal.status ?? "PLACEHOLDER").toUpperCase() === "VERIFIED";

  const issues: string[] = [];
  const resolve = (field: string): FieldLookup => {
    if (field === "commodity_class") return { known: true, value: classification?.commodityClassId ?? null };
    if (field in JURISDICTION_FIELDS) return { known: true, value: JURISDICTION_FIELDS[field](input) };
    return { known: false };
  };

  const requiredDocuments: RequiredDocument[] = docs.map((d) => {
    const id = String(d.id ?? "unknown");
    const name = String(d.name ?? "Unnamed document");
    let applicability: DocApplicability = "verify";
    let reason = "Submittal triggers are not yet verified — confirm whether this document applies.";
    let verified = false;

    if (triggersVerified) {
      const when = d.applies_when;
      if (when === undefined || when === null) {
        applicability = "required";
        reason = "Required for all submittals (no condition set).";
        verified = true;
      } else if (typeof when !== "object") {
        applicability = "verify";
        reason = "The 'applies_when' for this document is malformed.";
        issues.push(`Document "${id}" has a malformed 'applies_when'.`);
      } else {
        const res = evaluateWhen(when as Record<string, unknown>, resolve, issues);
        if (res === "match") {
          applicability = "required";
          reason = "Required: trigger conditions are met.";
          verified = true;
        } else if (res === "no-match") {
          applicability = "not_required";
          reason = "Not required: trigger conditions are not met.";
          verified = true;
        } else {
          applicability = "verify";
          reason = "Could not evaluate the trigger (an input is undetermined or a rule field is invalid).";
        }
      }
    }

    const status = toCodeValue(
      `la.doc.${id}`,
      name,
      {
        value: verified ? applicability : null,
        status: verified ? "VERIFIED" : "PLACEHOLDER",
        source: d.source,
        todo: d.todo,
      },
      "LADBS / LAFD — VERIFY",
    );

    return { id, name, applicability, reason, status };
  });

  const toChecklist = (arr: unknown): ChecklistItem[] =>
    (Array.isArray(arr) ? (arr as Record<string, any>[]) : []).map((x) => ({
      id: String(x.id ?? "item"),
      name: String(x.name ?? "Unnamed requirement"),
      source: String(x.source ?? "— VERIFY"),
    }));
  const planContent = toChecklist(j.plan_content_requirements);
  const structuralSubmittal = toChecklist(j.structural_submittal_requirements);
  const specialInspections = toChecklist(j.special_inspections);
  const deferredSubmittals = toChecklist(j.deferred_submittals);

  const audit: AuditEntry = {
    step: "Los Angeles submittal requirements",
    description: triggersVerified
      ? "Evaluated each submittal document against the verified Los Angeles trigger rules."
      : "Listed the Los Angeles submittal documents. The triggers for when each is required are not yet verified, so all are shown as 'verify applicability'.",
    inputsUsed: {
      jurisdiction: input.project.jurisdiction,
      highPiledAreaSqFt: input.building.highPiledAreaSqFt,
      storageHeightFt: input.rack.storageHeightFt,
      commodityClass: classification?.commodityClassId ?? "UNDETERMINED",
    },
    codeValues: requiredDocuments.map((d) => d.status),
    assumptions: issues.length
      ? [`Submittal trigger data issues: ${issues.join(" ")}`]
      : triggersVerified
        ? []
        : ["Submittal triggers are placeholders; all documents are listed as potentially required."],
    result: `${requiredDocuments.length} documents evaluated`,
    status: requiredDocuments.some((d) => d.status.isPlaceholder) ? "blocked_by_placeholder" : "ok",
  };

  return {
    jurisdictionId,
    jurisdictionName: String(meta.jurisdiction_name ?? jurisdictionId),
    reviewingAgencies: Array.isArray(meta.reviewing_agencies) ? meta.reviewing_agencies.map(String) : [],
    requiredDocuments,
    planContent,
    structuralSubmittal,
    specialInspections,
    deferredSubmittals,
    dataIssues: issues,
    audit,
  };
}

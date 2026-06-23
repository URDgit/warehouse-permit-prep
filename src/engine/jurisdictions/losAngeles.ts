// =====================================================================
//  JURISDICTION MODULE — City of Los Angeles (LADBS / LAFD)
// =====================================================================
//
//  Pure function. Produces the list of submittal documents required for
//  an LA storage-rack / high-piled storage permit, read from the
//  jurisdiction data file. Shaped as a plug-in: other cities can be added
//  later by providing their own data file + a function with this same
//  signature, without touching the rest of the engine.
// =====================================================================

import type { CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { type AuditEntry, type CodeValue, toCodeValue } from "@/engine/provenance";

export interface RequiredDocument {
  id: string;
  name: string;
  /** Carries the citation + whether this requirement is verified. */
  status: CodeValue;
}

export interface JurisdictionResult {
  jurisdictionId: string;
  jurisdictionName: string;
  reviewingAgencies: string[];
  requiredDocuments: RequiredDocument[];
  audit: AuditEntry;
}

export const JURISDICTION_ID = "los-angeles";

export function getLosAngelesRequirements(input: IntakeInput, data: CodeData): JurisdictionResult {
  const j = (data.jurisdictions?.[JURISDICTION_ID] ?? {}) as Record<string, any>;
  const meta = (j.meta ?? {}) as Record<string, any>;
  const docs = Array.isArray(j.required_documents) ? (j.required_documents as Record<string, any>[]) : [];

  const requiredDocuments: RequiredDocument[] = docs.map((d) => ({
    id: String(d.id ?? "unknown"),
    name: String(d.name ?? "Unnamed document"),
    // Document entries carry status/source/todo (but no `value`); treat the
    // requirement itself as a placeholder until its applicability is verified.
    status: toCodeValue(
      `la.doc.${d.id}`,
      String(d.name ?? "Unnamed document"),
      { value: d.name, status: d.status, source: d.source, todo: d.todo },
      "LADBS / LAFD — VERIFY",
    ),
  }));

  const audit: AuditEntry = {
    step: "Los Angeles submittal requirements",
    description:
      "Listed the submittal documents from the Los Angeles jurisdiction data file. The triggers for when each is required are not yet defined, so all are shown as potentially required pending verification.",
    inputsUsed: {
      jurisdiction: input.project.jurisdiction,
      highPiledAreaSqFt: input.building.highPiledAreaSqFt,
      storageHeightFt: input.rack.storageHeightFt,
    },
    codeValues: requiredDocuments.map((d) => d.status),
    assumptions: [
      "Submittal triggers (area/height/commodity thresholds) are placeholders; all documents are listed as potentially required.",
    ],
    result: `${requiredDocuments.length} potential submittal documents`,
    status: "blocked_by_placeholder",
  };

  return {
    jurisdictionId: JURISDICTION_ID,
    jurisdictionName: String(meta.jurisdiction_name ?? "City of Los Angeles (LADBS / LAFD)"),
    reviewingAgencies: Array.isArray(meta.reviewing_agencies) ? meta.reviewing_agencies.map(String) : [],
    requiredDocuments,
    audit,
  };
}

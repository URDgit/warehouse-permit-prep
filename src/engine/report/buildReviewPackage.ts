// =====================================================================
//  REPORT ASSEMBLER — builds the full ReviewPackage
// =====================================================================
//
//  Orchestrates the engine: classification -> calculations -> jurisdiction,
//  then gathers EVERY input, assumption, code value (with citation), and
//  result into one structured object, plus a complete audit trail. The UI
//  and the Markdown exporter both render this same object.
//
//  Pure with respect to its inputs: pass `data` to inject test data, and
//  `now` to make the timestamp deterministic. If `data` is omitted it
//  loads the YAML files from disk (server/Node only).
// =====================================================================

import { loadCodeData, type CodeData } from "@/engine/data/loadData";
import type { IntakeInput } from "@/engine/intake/schema";
import { classifyCommodity, type ClassificationResult } from "@/engine/classification/classify";
import { computeSeismicDemand } from "@/engine/calculation/seismic";
import { computeAnchorage } from "@/engine/calculation/anchorage";
import type { CalcResult } from "@/engine/calculation/types";
import { getLosAngelesRequirements, type JurisdictionResult } from "@/engine/jurisdictions/losAngeles";
import { type AuditEntry, type CodeValue } from "@/engine/provenance";
import { buildReadiness, type Readiness } from "@/engine/report/readiness";
import { validateCodeData, type ValidationIssue } from "@/engine/data/validate";
import { loadFirmProfile, type FirmProfile } from "@/engine/firm";
import { APP_TITLE, CODE_BASIS, DISCLAIMER } from "@/engine/constants";

export interface ReviewPackage {
  meta: {
    title: string;
    projectName: string;
    preparedBy: string;
    preparedDate: string;
    jurisdiction: string;
    generatedAt: string;
    disclaimer: string;
    codeBasis: string[];
    firm: FirmProfile;
  };
  inputs: IntakeInput;
  classification: ClassificationResult;
  calculations: {
    seismic: CalcResult;
    anchorage: CalcResult;
  };
  jurisdiction: JurisdictionResult;
  /** Plain-language checklist of what still needs a licensed engineer. */
  readiness: Readiness;
  /** Structural problems found in the data files (errors + warnings). */
  dataIntegrity: ValidationIssue[];
  /** Every code value used anywhere, de-duplicated, with citations. */
  codeValuesUsed: CodeValue[];
  /** Every assumption surfaced anywhere in the engine. */
  assumptions: string[];
  /** The full ordered audit trail. */
  auditTrail: AuditEntry[];
  /** How many of the used code values are still unverified placeholders. */
  placeholderCount: number;
  /** True ONLY for the fabricated demonstration package — never for a real report. */
  demo?: boolean;
}

export interface BuildOptions {
  data?: CodeData;
  now?: Date;
  firm?: FirmProfile;
}

export function buildReviewPackage(input: IntakeInput, options: BuildOptions = {}): ReviewPackage {
  const data = options.data ?? loadCodeData();
  const now = options.now ?? new Date();
  const firm = options.firm ?? loadFirmProfile();

  const classification = classifyCommodity(input, data);
  const seismic = computeSeismicDemand(input, data);
  const anchorage = computeAnchorage(input, data);
  const jurisdiction = getLosAngelesRequirements(input, data, classification);

  const auditTrail: AuditEntry[] = [
    ...classification.audit,
    seismic.audit,
    anchorage.audit,
    jurisdiction.audit,
  ];

  // Gather all code values referenced anywhere, de-duplicated by id.
  const allCodeValues: CodeValue[] = [
    classification.commodityClass,
    ...classification.triggeredRequirements.map((r) => r.codeValue),
    seismic.result,
    seismic.formula,
    anchorage.result,
    anchorage.formula,
    ...jurisdiction.requiredDocuments.map((d) => d.status),
    ...auditTrail.flatMap((a) => a.codeValues),
  ];
  const seen = new Set<string>();
  const codeValuesUsed: CodeValue[] = [];
  for (const cv of allCodeValues) {
    if (seen.has(cv.id)) continue;
    seen.add(cv.id);
    codeValuesUsed.push(cv);
  }

  const assumptions = Array.from(new Set(auditTrail.flatMap((a) => a.assumptions)));
  const placeholderCount = codeValuesUsed.filter((cv) => cv.isPlaceholder).length;
  const allDataIssues = [...classification.dataIssues, ...jurisdiction.dataIssues];
  const readiness = buildReadiness(codeValuesUsed, { seismic, anchorage }, allDataIssues);
  const dataIntegrity = validateCodeData(data);

  return {
    meta: {
      title: APP_TITLE,
      projectName: input.project.projectName,
      preparedBy: input.project.preparedBy,
      preparedDate: input.project.preparedDate,
      jurisdiction: jurisdiction.jurisdictionName,
      generatedAt: now.toISOString(),
      disclaimer: DISCLAIMER,
      codeBasis: CODE_BASIS,
      firm,
    },
    inputs: input,
    classification,
    calculations: { seismic, anchorage },
    jurisdiction,
    readiness,
    dataIntegrity,
    codeValuesUsed,
    assumptions,
    auditTrail,
    placeholderCount,
  };
}

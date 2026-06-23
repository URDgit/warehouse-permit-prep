// =====================================================================
//  SUBMITTAL COVER  — transmittal + document checklist
// =====================================================================
//
//  A one-page cover/transmittal that goes on top of the permit package:
//  firm letterhead, project info, the reviewing agencies, and a checklist
//  of the documents in the submittal (from the jurisdiction module), plus
//  the engineer-of-record seal block. Pure — derived entirely from a
//  ReviewPackage, no file system or browser dependencies.
// =====================================================================

import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { FirmProfile } from "@/engine/firm";

export interface SubmittalCoverDoc {
  name: string;
  applicability: string;
}

export interface SubmittalCover {
  firm: FirmProfile;
  projectName: string;
  projectAddress: string;
  jurisdiction: string;
  reviewingAgencies: string[];
  preparedBy: string;
  preparedDate: string;
  documents: SubmittalCoverDoc[];
  disclaimer: string;
  demo: boolean;
}

export function buildSubmittalCover(pkg: ReviewPackage): SubmittalCover {
  // List documents that are part of the package (drop ones the triggers ruled out).
  const documents = pkg.jurisdiction.requiredDocuments
    .filter((d) => d.applicability !== "not_required")
    .map((d) => ({ name: d.name, applicability: d.applicability }));

  return {
    firm: pkg.meta.firm,
    projectName: pkg.meta.projectName,
    projectAddress: pkg.inputs.building.address,
    jurisdiction: pkg.meta.jurisdiction,
    reviewingAgencies: pkg.jurisdiction.reviewingAgencies,
    preparedBy: pkg.meta.preparedBy,
    preparedDate: pkg.meta.preparedDate,
    documents,
    disclaimer: pkg.meta.disclaimer,
    demo: !!pkg.demo,
  };
}

export function renderSubmittalCoverMarkdown(c: SubmittalCover): string {
  const L: string[] = [];
  if (c.firm.firmName) L.push(`**${c.firm.firmName}**`);
  if (c.firm.firmAddress) L.push(c.firm.firmAddress);
  if (c.firm.firmContact) L.push(c.firm.firmContact);
  L.push("");
  L.push(`# Permit Submittal — Transmittal & Document Checklist`);
  L.push("");
  L.push(`> **${c.disclaimer}**`);
  L.push("");
  if (c.reviewingAgencies.length) L.push(`**To:** ${c.reviewingAgencies.join("; ")}`);
  L.push(`**Project:** ${c.projectName}`);
  L.push(`**Address:** ${c.projectAddress}`);
  L.push(`**Jurisdiction:** ${c.jurisdiction}`);
  L.push(`**Prepared by:** ${c.preparedBy}  |  **Date:** ${c.preparedDate}`);
  L.push("");
  L.push("We are submitting the following for the high-piled combustible storage / storage-rack permit review for the project above.");
  L.push("");
  L.push(`## Documents included in this submittal`);
  L.push("");
  if (!c.documents.length) L.push("_No documents identified — verify jurisdiction requirements._");
  for (const d of c.documents) L.push(`- [ ] ${d.name}${d.applicability === "verify" ? " _(verify applicability)_" : ""}`);
  L.push("");
  L.push(`## Engineer of record`);
  L.push(`- Engineer of record: ${c.firm.engineerName || "________________________"}`);
  L.push(`- License: ${[c.firm.licenseType, c.firm.licenseNumber].filter(Boolean).join(" ") || "________________________"}`);
  L.push(`- Signature: ______________________________    Date: ______________`);
  L.push(`- Seal / stamp:`);
  L.push("");
  return L.join("\n");
}

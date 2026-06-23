// =====================================================================
//  SUBMITTAL FORMS  — Statement of Special Inspections & Deferred Submittals
// =====================================================================
//
//  Engineer-prepared forms derived from a ReviewPackage (firm + project +
//  the jurisdiction's code-grounded item lists). Pure — no file system or
//  browser dependencies. The tool produces a clearly-labeled DRAFT; confirm
//  whether the AHJ requires its own official form.
// =====================================================================

import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { FirmProfile } from "@/engine/firm";

export interface SubmittalForm {
  title: string;
  intro: string;
  firm: FirmProfile;
  projectName: string;
  projectAddress: string;
  jurisdiction: string;
  generatedAt: string;
  items: { name: string; source: string }[];
  disclaimer: string;
  demo: boolean;
}

function base(pkg: ReviewPackage): Omit<SubmittalForm, "title" | "intro" | "items"> {
  return {
    firm: pkg.meta.firm,
    projectName: pkg.meta.projectName,
    projectAddress: pkg.inputs.building.address,
    jurisdiction: pkg.meta.jurisdiction,
    generatedAt: pkg.meta.generatedAt,
    disclaimer: pkg.meta.disclaimer,
    demo: !!pkg.demo,
  };
}

export function specialInspectionForm(pkg: ReviewPackage): SubmittalForm {
  return {
    ...base(pkg),
    title: "Statement of Special Inspections",
    intro:
      "The following special inspections are identified for the storage-rack work on this project. Confirm whether the authority having jurisdiction requires its own special-inspection form.",
    items: pkg.jurisdiction.specialInspections.map((i) => ({ name: i.name, source: i.source })),
  };
}

export function deferredSubmittalForm(pkg: ReviewPackage): SubmittalForm {
  return {
    ...base(pkg),
    title: "Deferred Submittals",
    intro:
      "The following items are deferred submittals and will be submitted to the building / fire department for review and approval before installation.",
    items: pkg.jurisdiction.deferredSubmittals.map((i) => ({ name: i.name, source: i.source })),
  };
}

export function renderSubmittalFormMarkdown(f: SubmittalForm): string {
  const L: string[] = [];
  if (f.firm.firmName) L.push(`**${f.firm.firmName}**`);
  if (f.firm.firmAddress) L.push(f.firm.firmAddress);
  if (f.firm.firmContact) L.push(f.firm.firmContact);
  L.push("");
  L.push(`# ${f.title}`);
  L.push("");
  L.push(`> **${f.disclaimer}**`);
  L.push("");
  L.push(`**Project:** ${f.projectName}`);
  L.push(`**Address:** ${f.projectAddress}`);
  L.push(`**Jurisdiction:** ${f.jurisdiction}`);
  L.push(`**Date:** ${f.generatedAt}`);
  L.push("");
  L.push(f.intro);
  L.push("");
  if (!f.items.length) L.push("_No items identified — verify requirements._");
  for (const it of f.items) L.push(`- [ ] ${it.name} _(${it.source})_`);
  L.push("");
  L.push(`---`);
  L.push(`Engineer of record: ${f.firm.engineerName || "________________________"}  ·  License: ${[f.firm.licenseType, f.firm.licenseNumber].filter(Boolean).join(" ") || "____________"}`);
  L.push(`Signature: ______________________________   Date: ______________`);
  L.push("");
  return L.join("\n");
}

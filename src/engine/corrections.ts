// =====================================================================
//  PLAN-CHECK CORRECTIONS  — track AHJ comments & responses
// =====================================================================
//
//  The plan-check correction/resubmittal loop is the biggest rework sink
//  in permitting. This logs each correction comment the AHJ issues and the
//  engineer's response, and assembles a "Correction Response Letter" to
//  submit with the resubmittal. Pure types + a Markdown renderer — no file
//  system or browser dependencies.
// =====================================================================

export type CorrectionStatus = "open" | "addressed";

export interface Correction {
  id: string;
  /** The reviewer's comment number, e.g. "1" or "S-3". */
  number: string;
  /** Issuing agency, e.g. Building & Safety or Fire. */
  agency: string;
  /** Code section the reviewer cited (optional). */
  codeRef: string;
  /** The reviewer's correction text. */
  comment: string;
  /** The engineer's response. */
  response: string;
  status: CorrectionStatus;
}

export interface CorrectionLetterData {
  firmName: string;
  firmAddress: string;
  firmContact: string;
  engineerName: string;
  licenseType: string;
  licenseNumber: string;
  projectName: string;
  projectAddress: string;
  jurisdiction: string;
  /** Plan-check round number. */
  revision: number;
  generatedAt: string;
  items: Correction[];
  disclaimer: string;
}

export function renderCorrectionLetterMarkdown(d: CorrectionLetterData): string {
  const L: string[] = [];
  if (d.firmName) L.push(`**${d.firmName}**`);
  if (d.firmAddress) L.push(d.firmAddress);
  if (d.firmContact) L.push(d.firmContact);
  L.push("");
  L.push(`# Plan Check Correction Responses`);
  L.push("");
  L.push(`**Project:** ${d.projectName}`);
  L.push(`**Address:** ${d.projectAddress}`);
  L.push(`**Jurisdiction:** ${d.jurisdiction}`);
  L.push(`**Plan check round:** ${d.revision}`);
  L.push(`**Date:** ${d.generatedAt}`);
  L.push("");
  L.push("The following responses address the plan check corrections issued for the project above.");
  L.push("");
  if (!d.items.length) L.push("_No corrections logged._");
  d.items.forEach((it, idx) => {
    L.push(`## ${idx + 1}. Comment ${it.number || idx + 1}${it.agency ? ` (${it.agency})` : ""} — ${it.status === "addressed" ? "addressed" : "open"}`);
    if (it.codeRef) L.push(`_Code reference: ${it.codeRef}_`);
    L.push(`**Reviewer comment:** ${it.comment || "—"}`);
    L.push(`**Response:** ${it.response || "—"}`);
    L.push("");
  });
  L.push(`---`);
  L.push(`Engineer of record: ${d.engineerName || "________________________"}  ·  License: ${[d.licenseType, d.licenseNumber].filter(Boolean).join(" ") || "____________"}`);
  L.push(`Signature: ______________________________   Date: ______________`);
  L.push("");
  if (d.disclaimer) L.push(`_${d.disclaimer}_`);
  L.push("");
  return L.join("\n");
}

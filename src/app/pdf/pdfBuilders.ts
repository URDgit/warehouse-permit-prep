// =====================================================================
//  PDF BUILDERS  — client-side PDF generation (jsPDF + autotable)
// =====================================================================
//
//  Builds the report and the engineer-verification-brief PDFs from the
//  same structured data the on-screen views use, so they can't disagree.
//  jsPDF is dynamically imported inside the builders so it is only loaded
//  when the user actually downloads (keeps the initial page light) and is
//  never pulled into the server bundle.
// =====================================================================

import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { VerificationBrief } from "@/engine/report/verificationBrief";
import { inputRows } from "@/engine/report/inputRows";
import { buildSubmittalCover } from "@/engine/report/submittalCover";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Doc = any;
type AutoTable = any;

const M = 40; // page margin (pt)
const INK: [number, number, number] = [28, 34, 48];
const MUTED: [number, number, number] = [91, 100, 112];
const SHORT_DISCLAIMER =
  "DRAFT — not an engineered or approved document. Requires review and stamp by a California-licensed professional engineer.";

interface Ctx {
  doc: Doc;
  y: number;
  pageW: number;
  pageH: number;
}

/** jsPDF's standard fonts are WinAnsi; swap characters they cannot render. */
function pdfSafe(s: unknown): string {
  return String(s).replace(/Ω/g, "Omega").replace(/✓/g, "[x]").replace(/☐/g, "[ ]");
}

async function createCtx(): Promise<{ ctx: Ctx; autoTable: AutoTable }> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  return {
    ctx: { doc, y: M, pageW: doc.internal.pageSize.getWidth(), pageH: doc.internal.pageSize.getHeight() },
    autoTable,
  };
}

function ensure(ctx: Ctx, h: number) {
  if (ctx.y + h > ctx.pageH - M - 24) {
    ctx.doc.addPage();
    ctx.y = M;
  }
}

function title(ctx: Ctx, text: string) {
  ensure(ctx, 28);
  ctx.doc.setFont("helvetica", "bold").setFontSize(16).setTextColor(...INK);
  ctx.doc.text(pdfSafe(text), M, ctx.y);
  ctx.y += 24;
}

function heading(ctx: Ctx, text: string) {
  ensure(ctx, 26);
  ctx.y += 4;
  ctx.doc.setFont("helvetica", "bold").setFontSize(12.5).setTextColor(...INK);
  ctx.doc.text(pdfSafe(text), M, ctx.y);
  ctx.y += 16;
}

interface ParaOpts {
  bold?: boolean;
  size?: number;
  color?: [number, number, number];
}
function paragraph(ctx: Ctx, text: string, opts: ParaOpts = {}) {
  const size = opts.size ?? 9.5;
  ctx.doc.setFont("helvetica", opts.bold ? "bold" : "normal").setFontSize(size).setTextColor(...(opts.color ?? INK));
  const lines: string[] = ctx.doc.splitTextToSize(pdfSafe(text), ctx.pageW - 2 * M);
  for (const ln of lines) {
    ensure(ctx, size + 3);
    ctx.doc.text(ln, M, ctx.y);
    ctx.y += size + 3;
  }
  ctx.y += 3;
}

function disclaimerBox(ctx: Ctx, text: string) {
  ctx.doc.setFont("helvetica", "bold").setFontSize(8.5);
  const lines: string[] = ctx.doc.splitTextToSize(pdfSafe(text), ctx.pageW - 2 * M - 16);
  const boxH = lines.length * 11 + 16;
  ensure(ctx, boxH);
  ctx.doc.setFillColor(253, 236, 234).setDrawColor(209, 67, 67).setLineWidth(1.2);
  ctx.doc.roundedRect(M, ctx.y, ctx.pageW - 2 * M, boxH, 4, 4, "FD");
  ctx.doc.setTextColor(138, 28, 28);
  let ty = ctx.y + 12;
  for (const ln of lines) {
    ctx.doc.text(ln, M + 8, ty);
    ty += 11;
  }
  ctx.y += boxH + 10;
}

function table(ctx: Ctx, autoTable: AutoTable, head: string[], body: unknown[][], columnStyles?: Record<number, any>) {
  ensure(ctx, 44);
  autoTable(ctx.doc, {
    head: [head.map(pdfSafe)],
    body: body.map((row) => row.map(pdfSafe)),
    startY: ctx.y,
    margin: { left: M, right: M, bottom: 44 },
    styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak", textColor: INK, lineColor: [216, 221, 229], lineWidth: 0.5 },
    headStyles: { fillColor: [241, 243, 246], textColor: [40, 40, 40], fontStyle: "bold" },
    columnStyles,
  });
  ctx.y = (ctx.doc as any).lastAutoTable.finalY + 14;
}

function footer(ctx: Ctx) {
  const n = ctx.doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    ctx.doc.setPage(i);
    ctx.doc.setFont("helvetica", "normal").setFontSize(7).setTextColor(120, 128, 138);
    const lines: string[] = ctx.doc.splitTextToSize(SHORT_DISCLAIMER, ctx.pageW - 2 * M - 70);
    ctx.doc.text(lines, M, ctx.pageH - 26);
    ctx.doc.text(`Page ${i} of ${n}`, ctx.pageW - M, ctx.pageH - 26, { align: "right" });
  }
}

/** Diagonal "DEMO — FABRICATED" watermark on every page (demo report only). */
function demoWatermark(ctx: Ctx) {
  const n = ctx.doc.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    ctx.doc.setPage(i);
    ctx.doc.setFont("helvetica", "bold").setFontSize(58).setTextColor(232, 196, 196);
    ctx.doc.text("DEMO — FABRICATED", ctx.pageW / 2, ctx.pageH / 2, { align: "center", angle: 35 });
  }
}

function applicabilityLabel(a: string): string {
  if (a === "required") return "Required";
  if (a === "not_required") return "Not required";
  return "Verify applicability";
}

function cvText(cv: { isPlaceholder: boolean; value: unknown; unit: string | null }): string {
  if (cv.isPlaceholder) return "— needs engineer —";
  return `${String(cv.value)}${cv.unit ? ` ${cv.unit}` : ""}`;
}

// ---------------------------------------------------------------------
//  Report PDF
// ---------------------------------------------------------------------
export async function buildReviewPackagePdf(pkg: ReviewPackage): Promise<Doc> {
  const { ctx, autoTable } = await createCtx();
  const m = pkg.meta;
  const f = m.firm;

  if (f.firmName || f.firmAddress || f.firmContact) {
    if (f.firmName) paragraph(ctx, f.firmName, { bold: true, size: 12 });
    if (f.firmAddress) paragraph(ctx, f.firmAddress, { size: 9, color: MUTED });
    if (f.firmContact) paragraph(ctx, f.firmContact, { size: 9, color: MUTED });
    ctx.y += 4;
  }
  title(ctx, m.title);
  paragraph(ctx, `Project: ${m.projectName}`, { bold: true });
  paragraph(
    ctx,
    `Prepared by: ${m.preparedBy}    Date: ${m.preparedDate}\nJurisdiction: ${m.jurisdiction}    Generated: ${m.generatedAt}`,
    { size: 9, color: MUTED },
  );
  disclaimerBox(ctx, m.disclaimer);

  const r = pkg.readiness;
  heading(ctx, "Readiness — what still needs a licensed engineer");
  paragraph(
    ctx,
    `${r.isSubmittalReady ? "All code values verified." : "NOT ready for engineer submittal."} ${r.verifiedCount}/${r.totalCodeValues} verified; ${r.placeholderCount} outstanding.`,
    { bold: true },
  );
  if (r.blockedCalcs.length) paragraph(ctx, `Calculations not computed: ${r.blockedCalcs.join(", ")}.`, { size: 9, color: MUTED });
  if (r.dataIssues.length) paragraph(ctx, `Rule data issues: ${r.dataIssues.join(" ")}`, { size: 9, color: MUTED });
  if (r.outstanding.length) {
    table(
      ctx,
      autoTable,
      ["Area", "Item", "What's needed", "Source"],
      r.outstanding.map((it) => [it.area, it.label, it.need, it.source]),
      { 0: { cellWidth: 90 }, 3: { cellWidth: 120 } },
    );
  }

  heading(ctx, "1. Inputs provided");
  table(ctx, autoTable, ["Input", "Value"], inputRows(pkg.inputs), { 0: { cellWidth: 210 } });

  heading(ctx, "2. Commodity classification");
  const cc = pkg.classification.commodityClass;
  paragraph(ctx, `Result: ${cc.isPlaceholder ? "UNDETERMINED (placeholder)" : String(cc.value)}   |   Source: ${cc.source}`);
  table(
    ctx,
    autoTable,
    ["Requirement", "Value", "Status", "Source"],
    pkg.classification.triggeredRequirements.map((t) => [t.name, cvText(t.codeValue), t.codeValue.status, t.codeValue.source]),
  );

  heading(ctx, "3. Calculations");
  for (const calc of [pkg.calculations.seismic, pkg.calculations.anchorage]) {
    paragraph(ctx, `${calc.label}: ${cvText(calc.result)}`, { bold: true });
    paragraph(ctx, `Formula: ${cvText(calc.formula)} (${calc.formula.source})`, { size: 9, color: MUTED });
    if (calc.result.todo) paragraph(ctx, `Why not computed: ${calc.result.todo}`, { size: 9, color: MUTED });
  }

  heading(ctx, `4. ${pkg.jurisdiction.jurisdictionName} — submittal documents`);
  table(
    ctx,
    autoTable,
    ["Document", "Applicability", "Why", "Source"],
    pkg.jurisdiction.requiredDocuments.map((d) => [d.name, applicabilityLabel(d.applicability), d.reason, d.status.source]),
  );

  heading(ctx, "5. All code values used (with citations)");
  table(
    ctx,
    autoTable,
    ["Value", "Result", "Status", "Source"],
    pkg.codeValuesUsed.map((cv) => [cv.label, cvText(cv), cv.status, cv.source]),
  );

  heading(ctx, "6. Assumptions");
  if (!pkg.assumptions.length) paragraph(ctx, "None recorded.", { color: MUTED });
  for (const a of pkg.assumptions) paragraph(ctx, `• ${a}`, { size: 9 });

  heading(ctx, "7. Audit trail");
  for (const a of pkg.auditTrail) {
    paragraph(ctx, `${a.step} — ${a.status === "ok" ? "OK" : "BLOCKED BY PLACEHOLDER"}`, { bold: true, size: 9.5 });
    paragraph(ctx, a.description, { size: 9 });
    paragraph(ctx, `Code values / rules: ${a.codeValues.map((c) => `${c.label} (${c.source})`).join("; ") || "none"}`, {
      size: 8,
      color: MUTED,
    });
  }

  heading(ctx, "Engineer of record — review & seal");
  paragraph(ctx, "This package is a draft until signed and sealed by the engineer of record below.", { size: 9, color: MUTED });
  paragraph(ctx, `Engineer of record: ${f.engineerName || "________________________"}`);
  paragraph(ctx, `License: ${[f.licenseType, f.licenseNumber].filter(Boolean).join(" ") || "________________________"}`);
  ctx.y += 6;
  paragraph(ctx, "Signature: ______________________________      Date: ______________");
  ctx.y += 8;
  ensure(ctx, 84);
  ctx.doc.setDrawColor(...INK).setLineWidth(0.8);
  ctx.doc.rect(M, ctx.y, 160, 72);
  ctx.doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
  ctx.doc.text("Seal / stamp", M + 8, ctx.y + 14);
  ctx.y += 84;
  if (f.standardNotes) paragraph(ctx, `Firm notes: ${f.standardNotes}`, { size: 9, color: MUTED });

  if (pkg.demo) demoWatermark(ctx);
  footer(ctx);
  return ctx.doc;
}

// ---------------------------------------------------------------------
//  Engineer Verification Brief PDF
// ---------------------------------------------------------------------
export async function buildVerificationBriefPdf(brief: VerificationBrief): Promise<Doc> {
  const { ctx, autoTable } = await createCtx();

  title(ctx, brief.title);
  paragraph(
    ctx,
    "This software helps prepare an LA storage-rack / high-piled storage permit package. It contains no code values of its own. The items below are what a California-licensed engineer must supply or verify — please provide a value and an exact code citation for each (or confirm/correct the cited reference).",
  );
  disclaimerBox(ctx, brief.disclaimer);
  paragraph(ctx, `Generated: ${brief.generatedAt}`, { size: 9, color: MUTED });
  paragraph(ctx, `Status: ${brief.outstandingItems} of ${brief.totalItems} items still need verification.`, { bold: true });

  heading(ctx, "Engineering decisions required first");
  for (const d of brief.decisions) paragraph(ctx, `• ${d.title}: ${d.detail}  (Reference: ${d.source})`, { size: 9 });

  brief.sections.forEach((sec, idx) => {
    heading(ctx, `${idx + 1}. ${sec.discipline}`);
    table(
      ctx,
      autoTable,
      ["", "Item", "What's needed", "Code reference", "Where it goes"],
      sec.items.map((it) => [it.verified ? "[x]" : "[ ]", it.label, it.need, it.source, it.location]),
      { 0: { cellWidth: 22, halign: "center" }, 1: { cellWidth: 110 }, 4: { cellWidth: 120 } },
    );
  });

  heading(ctx, "After verification — developer tasks (not for the engineer)");
  for (const t of brief.developerTasks) paragraph(ctx, `• ${t}`, { size: 9 });

  heading(ctx, "Engineer verification & sign-off");
  paragraph(
    ctx,
    "By completing and returning this brief, the verifying engineer confirms the values and citations above against the governing codes for the purpose of preparing this submittal. Final calculations and the permit package remain subject to the engineer of record's review and stamp.",
    { size: 9 },
  );
  ctx.y += 8;
  paragraph(ctx, "Verified by: ______________________________     License (PE/SE) #: ______________");
  paragraph(ctx, "Firm: ____________________________________     Date: ______________");
  paragraph(ctx, "Signature / stamp:");

  footer(ctx);
  return ctx.doc;
}

// ---------------------------------------------------------------------
//  Submittal cover / transmittal PDF
// ---------------------------------------------------------------------
export async function buildSubmittalCoverPdf(pkg: ReviewPackage): Promise<Doc> {
  const c = buildSubmittalCover(pkg);
  const { ctx } = await createCtx();

  if (c.firm.firmName || c.firm.firmAddress || c.firm.firmContact) {
    if (c.firm.firmName) paragraph(ctx, c.firm.firmName, { bold: true, size: 12 });
    if (c.firm.firmAddress) paragraph(ctx, c.firm.firmAddress, { size: 9, color: MUTED });
    if (c.firm.firmContact) paragraph(ctx, c.firm.firmContact, { size: 9, color: MUTED });
    ctx.y += 4;
  }
  title(ctx, "Permit Submittal — Transmittal & Document Checklist");
  disclaimerBox(ctx, c.disclaimer);

  if (c.reviewingAgencies.length) paragraph(ctx, `To: ${c.reviewingAgencies.join("; ")}`, { bold: true });
  paragraph(ctx, `Project: ${c.projectName}`, { bold: true });
  paragraph(ctx, `Address: ${c.projectAddress}`, { size: 9, color: MUTED });
  paragraph(ctx, `Jurisdiction: ${c.jurisdiction}`, { size: 9, color: MUTED });
  paragraph(ctx, `Prepared by: ${c.preparedBy}      Date: ${c.preparedDate}`, { size: 9, color: MUTED });
  ctx.y += 4;
  paragraph(ctx, "We are submitting the following for the high-piled combustible storage / storage-rack permit review for the project above.");

  heading(ctx, "Documents included in this submittal");
  if (!c.documents.length) paragraph(ctx, "No documents identified — verify jurisdiction requirements.", { color: MUTED });
  for (const d of c.documents) {
    paragraph(ctx, `[  ]  ${d.name}${d.applicability === "verify" ? "  (verify applicability)" : ""}`);
  }

  heading(ctx, "Engineer of record");
  paragraph(ctx, `Engineer of record: ${c.firm.engineerName || "________________________"}`);
  paragraph(ctx, `License: ${[c.firm.licenseType, c.firm.licenseNumber].filter(Boolean).join(" ") || "________________________"}`);
  ctx.y += 6;
  paragraph(ctx, "Signature: ______________________________      Date: ______________");
  ctx.y += 8;
  ensure(ctx, 84);
  ctx.doc.setDrawColor(...INK).setLineWidth(0.8);
  ctx.doc.rect(M, ctx.y, 160, 72);
  ctx.doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(...MUTED);
  ctx.doc.text("Seal / stamp", M + 8, ctx.y + 14);
  ctx.y += 84;

  if (c.demo) demoWatermark(ctx);
  footer(ctx);
  return ctx.doc;
}

export async function downloadSubmittalCoverPdf(pkg: ReviewPackage): Promise<void> {
  const doc = await buildSubmittalCoverPdf(pkg);
  doc.save(`${safeFileName(pkg.meta.projectName)}_Submittal_Cover.pdf`);
}

function safeFileName(s: string): string {
  return s.replace(/[^\w.-]+/g, "_") || "review-package";
}

export async function downloadReviewPackagePdf(pkg: ReviewPackage): Promise<void> {
  const doc = await buildReviewPackagePdf(pkg);
  doc.save(`${safeFileName(pkg.meta.projectName)}_DRAFT.pdf`);
}

export async function downloadVerificationBriefPdf(brief: VerificationBrief): Promise<void> {
  const doc = await buildVerificationBriefPdf(brief);
  doc.save("Engineer_Verification_Brief.pdf");
}

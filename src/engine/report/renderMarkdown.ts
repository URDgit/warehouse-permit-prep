// =====================================================================
//  MARKDOWN RENDERER — turns a ReviewPackage into a plain-text report
// =====================================================================
//
//  Pure function with no file-system or browser dependencies, so it runs
//  anywhere (server, browser download button, or tests). The on-screen
//  HTML report and this Markdown export render the SAME ReviewPackage, so
//  they can never disagree.
// =====================================================================

import type { ReviewPackage } from "@/engine/report/buildReviewPackage";
import type { CodeValue } from "@/engine/provenance";

function fmtValue(cv: CodeValue): string {
  if (cv.isPlaceholder) return "PLACEHOLDER — needs engineer";
  const unit = cv.unit ? ` ${cv.unit}` : "";
  return `${String(cv.value)}${unit}`;
}

export function renderMarkdown(pkg: ReviewPackage): string {
  const L: string[] = [];
  const m = pkg.meta;

  L.push(`# ${m.title}`);
  L.push("");
  L.push(`> **${m.disclaimer}**`);
  L.push("");
  L.push(`**Project:** ${m.projectName}`);
  L.push(`**Prepared by:** ${m.preparedBy}  |  **Date:** ${m.preparedDate}`);
  L.push(`**Jurisdiction:** ${m.jurisdiction}`);
  L.push(`**Generated:** ${m.generatedAt}`);
  L.push("");
  L.push(
    `**Status:** ${pkg.placeholderCount} of ${pkg.codeValuesUsed.length} code values are unverified PLACEHOLDERS requiring engineer input.`,
  );
  L.push("");
  L.push(`**Code basis (subject to verification):**`);
  for (const c of m.codeBasis) L.push(`- ${c}`);
  L.push("");

  // --- Readiness checklist -------------------------------------------
  const r = pkg.readiness;
  L.push(`## Readiness — what still needs a licensed engineer`);
  L.push("");
  L.push(
    `**${r.isSubmittalReady ? "All code values verified." : "NOT ready for engineer submittal."}** ` +
      `${r.verifiedCount}/${r.totalCodeValues} code values verified; ${r.placeholderCount} outstanding.`,
  );
  if (r.blockedCalcs.length) L.push(`Calculations not computed: ${r.blockedCalcs.join(", ")}.`);
  if (r.dataIssues.length) L.push(`Rule data issues: ${r.dataIssues.join(" ")}`);
  L.push("");
  for (const g of r.byArea) {
    L.push(`### ${g.area} (${g.items.length})`);
    L.push(`| Item | What's needed | Source |`);
    L.push(`| --- | --- | --- |`);
    for (const it of g.items) L.push(`| ${it.label} | ${it.need} | ${it.source} |`);
    L.push("");
  }

  // --- Inputs ---------------------------------------------------------
  L.push(`## 1. Inputs provided`);
  const i = pkg.inputs;
  const inputRows: [string, unknown][] = [
    ["Building address", i.building.address],
    ["Construction type", i.building.constructionType || "(not provided)"],
    ["Total building area (sq ft)", i.building.totalBuildingAreaSqFt],
    ["High-piled storage area (sq ft)", i.building.highPiledAreaSqFt],
    ["Ceiling height (ft)", i.building.ceilingHeightFt],
    ["Existing sprinkler system?", i.building.existingSprinkler ? "Yes" : "No"],
    ["Sprinkler system type", i.sprinkler.systemType],
    ["In-rack sprinklers?", i.sprinkler.inRackSprinklers ? "Yes" : "No"],
    ["Rack type", i.rack.rackType],
    ["Storage height (ft)", i.rack.storageHeightFt],
    ["Number of tiers", i.rack.numberOfTiers],
    ["Rack depth configuration", i.rack.rackDepthConfig],
    ["Aisle width (ft)", i.rack.aisleWidthFt],
    ["Anchored to slab?", i.rack.anchored ? "Yes" : "No"],
    ["Anchor type", i.rack.anchorType || "(not provided)"],
    ["Product load per level (lb)", i.loads.productLoadPerLevelLb ?? "(not provided)"],
    ["Number of loaded levels", i.loads.numberOfLoadedLevels ?? "(not provided)"],
    ["Rack self-weight (lb)", i.loads.rackSelfWeightLb ?? "(not provided)"],
    ["Commodity description", i.commodity.description],
    ["Primary material", i.commodity.primaryMaterial || "(not provided)"],
    ["Packaging", i.commodity.packaging],
    ["Plastic content", i.commodity.plasticContent],
    ["Encapsulated?", i.commodity.encapsulated ? "Yes" : "No"],
    ["Idle pallets stored?", i.commodity.idlePalletsStored ? "Yes" : "No"],
    ["Site class", i.seismic.siteClass],
    ["Ss", i.seismic.Ss ?? "(not provided)"],
    ["S1", i.seismic.S1 ?? "(not provided)"],
    ["Sds", i.seismic.Sds ?? "(not provided)"],
    ["Sd1", i.seismic.Sd1 ?? "(not provided)"],
    ["Seismic design category", i.seismic.seismicDesignCategory],
    ["Risk category", i.seismic.riskCategory],
  ];
  L.push("");
  L.push(`| Input | Value |`);
  L.push(`| --- | --- |`);
  for (const [k, v] of inputRows) L.push(`| ${k} | ${String(v)} |`);
  L.push("");

  // --- Classification -------------------------------------------------
  L.push(`## 2. Commodity classification`);
  const cc = pkg.classification.commodityClass;
  L.push("");
  L.push(`**Result:** ${cc.isPlaceholder ? "UNDETERMINED (PLACEHOLDER — needs engineer)" : String(cc.value)}`);
  L.push(`**Source:** ${cc.source}`);
  if (cc.todo) L.push(`**TODO:** ${cc.todo}`);
  if (pkg.classification.dataIssues.length > 0) L.push(`**Rule data issues:** ${pkg.classification.dataIssues.join(" ")}`);
  L.push("");
  L.push(`### Triggered fire-code requirements`);
  L.push("");
  L.push(`| Requirement | Value | Source |`);
  L.push(`| --- | --- | --- |`);
  for (const r of pkg.classification.triggeredRequirements) {
    L.push(`| ${r.name} | ${fmtValue(r.codeValue)} | ${r.codeValue.source} |`);
  }
  L.push("");

  // --- Calculations ---------------------------------------------------
  L.push(`## 3. Calculations`);
  for (const calc of [pkg.calculations.seismic, pkg.calculations.anchorage]) {
    L.push("");
    L.push(`### ${calc.label}`);
    L.push(`**Result:** ${fmtValue(calc.result)}`);
    L.push(`**Formula reference:** ${fmtValue(calc.formula)} (${calc.formula.source})`);
    if (calc.result.todo) L.push(`**Why blocked:** ${calc.result.todo}`);
    L.push(`**Inputs used:** ${JSON.stringify(calc.inputsUsed)}`);
    if (calc.audit.assumptions.length) {
      L.push(`**Assumptions:**`);
      for (const a of calc.audit.assumptions) L.push(`- ${a}`);
    }
  }
  L.push("");

  // --- Jurisdiction ---------------------------------------------------
  L.push(`## 4. ${pkg.jurisdiction.jurisdictionName} — submittal documents`);
  L.push("");
  for (const agency of pkg.jurisdiction.reviewingAgencies) L.push(`- _Reviewing agency:_ ${agency}`);
  L.push("");
  L.push(`| Document | Status | Source |`);
  L.push(`| --- | --- | --- |`);
  for (const d of pkg.jurisdiction.requiredDocuments) {
    L.push(`| ${d.name} | ${d.status.isPlaceholder ? "Verify applicability" : "Required"} | ${d.status.source} |`);
  }
  L.push("");

  // --- Code values used ----------------------------------------------
  L.push(`## 5. All code values used (with citations)`);
  L.push("");
  L.push(`| Value | Result | Status | Source |`);
  L.push(`| --- | --- | --- | --- |`);
  for (const cv of pkg.codeValuesUsed) {
    L.push(`| ${cv.label} | ${fmtValue(cv)} | ${cv.status} | ${cv.source} |`);
  }
  L.push("");

  // --- Assumptions ----------------------------------------------------
  L.push(`## 6. Assumptions`);
  L.push("");
  if (pkg.assumptions.length === 0) L.push(`_None recorded._`);
  for (const a of pkg.assumptions) L.push(`- ${a}`);
  L.push("");

  // --- Audit trail ----------------------------------------------------
  L.push(`## 7. Audit trail`);
  for (const a of pkg.auditTrail) {
    L.push("");
    L.push(`### ${a.step} — ${a.status === "ok" ? "OK" : "BLOCKED BY PLACEHOLDER"}`);
    L.push(a.description);
    L.push(`- **Inputs used:** ${JSON.stringify(a.inputsUsed)}`);
    L.push(`- **Code values / rules:** ${a.codeValues.map((c) => `${c.label} (${c.source})`).join("; ") || "none"}`);
    L.push(`- **Result:** ${JSON.stringify(a.result)}`);
  }
  L.push("");
  L.push(`---`);
  L.push(`_${m.disclaimer}_`);
  L.push("");

  return L.join("\n");
}

// =====================================================================
//  READINESS  — "what still needs a licensed engineer?"
// =====================================================================
//
//  Pure function. Scans every code value the report used and produces a
//  plain-language checklist of what is still an unverified PLACEHOLDER,
//  grouped by discipline, plus an overall "ready / not ready" verdict.
//
//  This invents nothing — it only summarizes the provenance flags that
//  the engine already attached to each value.
// =====================================================================

import type { CodeValue } from "@/engine/provenance";
import type { CalcResult } from "@/engine/calculation/types";

export interface ReadinessItem {
  area: string;
  label: string;
  source: string;
  /** Short statement of what is needed to resolve this item. */
  need: string;
}

export interface ReadinessGroup {
  area: string;
  items: ReadinessItem[];
}

export interface Readiness {
  totalCodeValues: number;
  verifiedCount: number;
  placeholderCount: number;
  /** True only when nothing is outstanding: no placeholders, no blocked calcs, no data issues. */
  isSubmittalReady: boolean;
  /** Labels of calculations that could not be computed. */
  blockedCalcs: string[];
  /** Problems found in the classification rules data. */
  dataIssues: string[];
  /** Flat list of outstanding items, ordered by discipline then label. */
  outstanding: ReadinessItem[];
  /** Outstanding items grouped by discipline, in display order. */
  byArea: ReadinessGroup[];
}

const AREA_ORDER = [
  "Commodity classification",
  "Fire-code requirements",
  "Seismic",
  "Anchorage",
  "Submittal documents",
  "Other",
];

function areaForId(id: string): string {
  if (id.startsWith("commodity")) return "Commodity classification";
  if (id.startsWith("fire_code")) return "Fire-code requirements";
  if (id.startsWith("seismic")) return "Seismic";
  if (id.startsWith("anchorage")) return "Anchorage";
  if (id.startsWith("la.doc")) return "Submittal documents";
  return "Other";
}

export function buildReadiness(
  codeValuesUsed: CodeValue[],
  calculations: { seismic: CalcResult; anchorage: CalcResult },
  dataIssues: string[],
): Readiness {
  const placeholders = codeValuesUsed.filter((cv) => cv.isPlaceholder);

  const outstanding: ReadinessItem[] = placeholders.map((cv) => ({
    area: areaForId(cv.id),
    label: cv.label,
    source: cv.source,
    need: cv.todo ?? "Verify the value and its citation, then set status: VERIFIED.",
  }));

  outstanding.sort((a, b) => {
    const ai = AREA_ORDER.indexOf(a.area);
    const bi = AREA_ORDER.indexOf(b.area);
    if (ai !== bi) return ai - bi;
    return a.label.localeCompare(b.label);
  });

  const byArea: ReadinessGroup[] = AREA_ORDER.map((area) => ({
    area,
    items: outstanding.filter((it) => it.area === area),
  })).filter((g) => g.items.length > 0);

  const blockedCalcs: string[] = [];
  if (calculations.seismic.audit.status !== "ok") blockedCalcs.push(calculations.seismic.label);
  if (calculations.anchorage.audit.status !== "ok") blockedCalcs.push(calculations.anchorage.label);

  const placeholderCount = placeholders.length;
  const verifiedCount = codeValuesUsed.length - placeholderCount;
  const isSubmittalReady = placeholderCount === 0 && dataIssues.length === 0 && blockedCalcs.length === 0;

  return {
    totalCodeValues: codeValuesUsed.length,
    verifiedCount,
    placeholderCount,
    isSubmittalReady,
    blockedCalcs,
    dataIssues,
    outstanding,
    byArea,
  };
}

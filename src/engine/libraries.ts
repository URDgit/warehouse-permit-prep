// =====================================================================
//  LIBRARIES  — the firm's reusable pick-lists
// =====================================================================
//
//  Lets a firm save things they reuse across projects so they don't
//  re-type them every job: anchor products (with their ICC-ES ESR) and
//  commodity presets (a saved commodity description + classification
//  inputs). Stored on disk (data/libraries.json), like the firm profile.
//
//  These are the firm's own inputs — not code values. The tool just
//  remembers them.
// =====================================================================

import fs from "node:fs";
import path from "node:path";

export interface AnchorProduct {
  id: string;
  name: string;
  manufacturer: string;
  esr: string;
  notes: string;
}

export interface CommodityPreset {
  id: string;
  label: string;
  description: string;
  primaryMaterial: string;
  packaging: string;
  plasticContent: string;
  encapsulated: boolean;
  idlePalletsStored: boolean;
}

export interface Libraries {
  anchors: AnchorProduct[];
  commodities: CommodityPreset[];
}

export const EMPTY_LIBRARIES: Libraries = { anchors: [], commodities: [] };

export function loadLibraries(dataDir: string = path.join(process.cwd(), "data")): Libraries {
  const file = path.join(dataDir, "libraries.json");
  if (!fs.existsSync(file)) return { anchors: [], commodities: [] };
  try {
    const obj = JSON.parse(fs.readFileSync(file, "utf8")) as Partial<Libraries>;
    return {
      anchors: Array.isArray(obj.anchors) ? obj.anchors : [],
      commodities: Array.isArray(obj.commodities) ? obj.commodities : [],
    };
  } catch {
    return { anchors: [], commodities: [] };
  }
}

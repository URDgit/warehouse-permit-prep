// =====================================================================
//  INPUT ROWS  — the single definition of how intake inputs are listed
// =====================================================================
//
//  The on-screen report, the Markdown export, and the PDF export all show
//  the same "inputs provided" table. Defining the rows once here keeps
//  them from drifting apart when a field is added or renamed.
// =====================================================================

import type { IntakeInput } from "@/engine/intake/schema";

function yn(b: boolean): string {
  return b ? "Yes" : "No";
}
function orNA(v: unknown): string {
  return v === undefined || v === null || v === "" ? "(not provided)" : String(v);
}

export function inputRows(i: IntakeInput): Array<[string, string]> {
  return [
    ["Building address", i.building.address],
    ["Construction type", orNA(i.building.constructionType)],
    ["Total building area (sq ft)", String(i.building.totalBuildingAreaSqFt)],
    ["High-piled storage area (sq ft)", String(i.building.highPiledAreaSqFt)],
    ["Ceiling height (ft)", String(i.building.ceilingHeightFt)],
    ["Existing sprinkler system?", yn(i.building.existingSprinkler)],
    ["Sprinkler system type", i.sprinkler.systemType],
    ["In-rack sprinklers?", yn(i.sprinkler.inRackSprinklers)],
    ["Rack type", i.rack.rackType],
    ["Storage height (ft)", String(i.rack.storageHeightFt)],
    ["Number of tiers", String(i.rack.numberOfTiers)],
    ["Rack depth configuration", i.rack.rackDepthConfig],
    ["Aisle width (ft)", String(i.rack.aisleWidthFt)],
    ["Anchored to slab?", yn(i.rack.anchored)],
    ["Anchor type", orNA(i.rack.anchorType)],
    ["Product load per level (lb)", orNA(i.loads.productLoadPerLevelLb)],
    ["Number of loaded levels", orNA(i.loads.numberOfLoadedLevels)],
    ["Rack self-weight (lb)", orNA(i.loads.rackSelfWeightLb)],
    ["Slab thickness (in)", orNA(i.slab.thicknessIn)],
    ["Slab concrete strength f'c (psi)", orNA(i.slab.compressiveStrengthPsi)],
    ["Slab reinforcement", orNA(i.slab.reinforcement)],
    ["Commodity description", i.commodity.description],
    ["Primary material", orNA(i.commodity.primaryMaterial)],
    ["Packaging", i.commodity.packaging],
    ["Plastic content", i.commodity.plasticContent],
    ["Encapsulated?", yn(i.commodity.encapsulated)],
    ["Idle pallets stored?", yn(i.commodity.idlePalletsStored)],
    ["Site class", i.seismic.siteClass],
    ["Ss", orNA(i.seismic.Ss)],
    ["S1", orNA(i.seismic.S1)],
    ["Sds", orNA(i.seismic.Sds)],
    ["Sd1", orNA(i.seismic.Sd1)],
    ["Seismic design category", i.seismic.seismicDesignCategory],
    ["Risk category", i.seismic.riskCategory],
  ];
}

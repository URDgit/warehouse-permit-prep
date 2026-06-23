// =====================================================================
//  JURISDICTION REGISTRY
// =====================================================================
//
//  The list of jurisdictions the app supports. Each must have a matching
//  data file at data/jurisdictions/<id>.yaml whose meta.jurisdiction_id
//  equals the id here. To add a jurisdiction: add a data file (copy an
//  existing one and fill it in with a licensed engineer), then add an
//  entry here.
//
//  The code values (fire-code, seismic, anchorage) are statewide / national
//  and shared across jurisdictions; only the submittal documents, plan
//  checklist, forms, and triggers are per-jurisdiction (in the data file).
// =====================================================================

export const JURISDICTIONS = [
  { id: "ca-statewide", name: "California — statewide default (confirm local AHJ)" },
  { id: "los-angeles", name: "City of Los Angeles (LADBS / LAFD)" },
  { id: "la-county", name: "County of Los Angeles (Public Works B&S / LA County Fire)" },
  { id: "long-beach", name: "City of Long Beach (LBDS / LBFD)" },
  { id: "ontario", name: "City of Ontario" },
  { id: "fontana", name: "City of Fontana" },
  { id: "rialto", name: "City of Rialto" },
  { id: "moreno-valley", name: "City of Moreno Valley" },
  { id: "perris", name: "City of Perris" },
  { id: "riverside-county", name: "County of Riverside (unincorporated)" },
  { id: "san-bernardino-county", name: "County of San Bernardino (unincorporated)" },
  { id: "stockton", name: "City of Stockton" },
] as const;

export const JURISDICTION_IDS = JURISDICTIONS.map((j) => j.id) as unknown as readonly [string, ...string[]];

export function jurisdictionName(id: string): string {
  return JURISDICTIONS.find((j) => j.id === id)?.name ?? id;
}

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
  { id: "los-angeles", name: "City of Los Angeles (LADBS / LAFD)" },
  { id: "la-county", name: "County of Los Angeles (Public Works B&S / LA County Fire)" },
  { id: "long-beach", name: "City of Long Beach (LBDS / LBFD)" },
] as const;

export const JURISDICTION_IDS = JURISDICTIONS.map((j) => j.id) as unknown as readonly [string, ...string[]];

export function jurisdictionName(id: string): string {
  return JURISDICTIONS.find((j) => j.id === id)?.name ?? id;
}

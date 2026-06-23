// =====================================================================
//  Jurisdiction generator
// =====================================================================
//  Single source of truth for the California jurisdictions the app offers.
//  Writes a thin data/jurisdictions/<id>.yaml for each (they inherit the
//  statewide checklists from ca-statewide.yaml) and regenerates the
//  registry. The "rich" jurisdictions below keep their hand-written files.
//
//  Run:  node scripts/gen-jurisdictions.mjs
//
//  Every value in a generated file is a PLACEHOLDER to confirm with a
//  licensed engineer / the local AHJ — no code values are invented.
// =====================================================================

import { writeFileSync } from "node:fs";
import { join } from "node:path";

// These have hand-written files (don't overwrite); still listed for the registry.
const RICH = new Set(["ca-statewide", "los-angeles", "la-county", "long-beach"]);

const GROUPS = [
  {
    group: "Statewide",
    items: [{ id: "ca-statewide", name: "California — statewide default (confirm local AHJ)" }],
  },
  {
    group: "Los Angeles area",
    items: [
      { id: "los-angeles", name: "City of Los Angeles (LADBS / LAFD)" },
      { id: "la-county", name: "County of Los Angeles (Public Works B&S / LA County Fire)" },
      { id: "long-beach", name: "City of Long Beach (LBDS / LBFD)" },
      { id: "santa-fe-springs", name: "City of Santa Fe Springs" },
      { id: "vernon", name: "City of Vernon" },
      { id: "city-of-industry", name: "City of Industry" },
      { id: "commerce", name: "City of Commerce" },
      { id: "carson", name: "City of Carson" },
      { id: "compton", name: "City of Compton" },
      { id: "gardena", name: "City of Gardena" },
      { id: "torrance", name: "City of Torrance" },
      { id: "cerritos", name: "City of Cerritos" },
      { id: "la-mirada", name: "City of La Mirada" },
      { id: "pico-rivera", name: "City of Pico Rivera" },
      { id: "montebello", name: "City of Montebello" },
      { id: "paramount", name: "City of Paramount" },
      { id: "south-gate", name: "City of South Gate" },
      { id: "pomona", name: "City of Pomona" },
      { id: "irwindale", name: "City of Irwindale" },
      { id: "azusa", name: "City of Azusa" },
      { id: "baldwin-park", name: "City of Baldwin Park" },
      { id: "el-monte", name: "City of El Monte" },
      { id: "santa-clarita", name: "City of Santa Clarita" },
      { id: "palmdale", name: "City of Palmdale" },
      { id: "lancaster", name: "City of Lancaster" },
    ],
  },
  {
    group: "Inland Empire — San Bernardino County",
    items: [
      { id: "san-bernardino-county", name: "County of San Bernardino (unincorporated)" },
      { id: "ontario", name: "City of Ontario" },
      { id: "fontana", name: "City of Fontana" },
      { id: "rialto", name: "City of Rialto" },
      { id: "san-bernardino", name: "City of San Bernardino" },
      { id: "rancho-cucamonga", name: "City of Rancho Cucamonga" },
      { id: "chino", name: "City of Chino" },
      { id: "chino-hills", name: "City of Chino Hills" },
      { id: "montclair", name: "City of Montclair" },
      { id: "upland", name: "City of Upland" },
      { id: "colton", name: "City of Colton" },
      { id: "redlands", name: "City of Redlands" },
      { id: "yucaipa", name: "City of Yucaipa" },
      { id: "highland", name: "City of Highland" },
      { id: "victorville", name: "City of Victorville" },
      { id: "hesperia", name: "City of Hesperia" },
      { id: "apple-valley", name: "Town of Apple Valley" },
      { id: "adelanto", name: "City of Adelanto" },
      { id: "barstow", name: "City of Barstow" },
    ],
  },
  {
    group: "Inland Empire — Riverside County",
    items: [
      { id: "riverside-county", name: "County of Riverside (unincorporated)" },
      { id: "moreno-valley", name: "City of Moreno Valley" },
      { id: "perris", name: "City of Perris" },
      { id: "riverside", name: "City of Riverside" },
      { id: "corona", name: "City of Corona" },
      { id: "jurupa-valley", name: "City of Jurupa Valley" },
      { id: "eastvale", name: "City of Eastvale" },
      { id: "menifee", name: "City of Menifee" },
      { id: "murrieta", name: "City of Murrieta" },
      { id: "temecula", name: "City of Temecula" },
      { id: "lake-elsinore", name: "City of Lake Elsinore" },
      { id: "hemet", name: "City of Hemet" },
      { id: "beaumont", name: "City of Beaumont" },
      { id: "banning", name: "City of Banning" },
      { id: "norco", name: "City of Norco" },
      { id: "coachella", name: "City of Coachella" },
      { id: "indio", name: "City of Indio" },
    ],
  },
  {
    group: "Orange County",
    items: [
      { id: "orange-county", name: "County of Orange (unincorporated)" },
      { id: "anaheim", name: "City of Anaheim" },
      { id: "santa-ana", name: "City of Santa Ana" },
      { id: "brea", name: "City of Brea" },
      { id: "fullerton", name: "City of Fullerton" },
      { id: "buena-park", name: "City of Buena Park" },
      { id: "garden-grove", name: "City of Garden Grove" },
      { id: "orange", name: "City of Orange" },
      { id: "tustin", name: "City of Tustin" },
      { id: "irvine", name: "City of Irvine" },
    ],
  },
  {
    group: "Central Valley & Sacramento",
    items: [
      { id: "stockton", name: "City of Stockton" },
      { id: "tracy", name: "City of Tracy" },
      { id: "lathrop", name: "City of Lathrop" },
      { id: "manteca", name: "City of Manteca" },
      { id: "modesto", name: "City of Modesto" },
      { id: "turlock", name: "City of Turlock" },
      { id: "patterson", name: "City of Patterson" },
      { id: "ceres", name: "City of Ceres" },
      { id: "visalia", name: "City of Visalia" },
      { id: "tulare", name: "City of Tulare" },
      { id: "fresno", name: "City of Fresno" },
      { id: "clovis", name: "City of Clovis" },
      { id: "bakersfield", name: "City of Bakersfield" },
      { id: "shafter", name: "City of Shafter" },
      { id: "sacramento", name: "City of Sacramento" },
      { id: "west-sacramento", name: "City of West Sacramento" },
      { id: "elk-grove", name: "City of Elk Grove" },
      { id: "roseville", name: "City of Roseville" },
      { id: "rancho-cordova", name: "City of Rancho Cordova" },
      { id: "woodland", name: "City of Woodland" },
      { id: "vacaville", name: "City of Vacaville" },
      { id: "fairfield", name: "City of Fairfield" },
      { id: "san-joaquin-county", name: "County of San Joaquin (unincorporated)" },
      { id: "stanislaus-county", name: "County of Stanislaus (unincorporated)" },
      { id: "kern-county", name: "County of Kern (unincorporated)" },
      { id: "fresno-county", name: "County of Fresno (unincorporated)" },
      { id: "tulare-county", name: "County of Tulare (unincorporated)" },
      { id: "sacramento-county", name: "County of Sacramento (unincorporated)" },
    ],
  },
  {
    group: "Bay Area",
    items: [
      { id: "oakland", name: "City of Oakland" },
      { id: "hayward", name: "City of Hayward" },
      { id: "fremont", name: "City of Fremont" },
      { id: "union-city", name: "City of Union City" },
      { id: "newark", name: "City of Newark" },
      { id: "san-leandro", name: "City of San Leandro" },
      { id: "richmond", name: "City of Richmond" },
      { id: "livermore", name: "City of Livermore" },
      { id: "pleasanton", name: "City of Pleasanton" },
      { id: "san-jose", name: "City of San Jose" },
      { id: "milpitas", name: "City of Milpitas" },
      { id: "gilroy", name: "City of Gilroy" },
      { id: "benicia", name: "City of Benicia" },
      { id: "vallejo", name: "City of Vallejo" },
      { id: "alameda-county", name: "County of Alameda (unincorporated)" },
      { id: "contra-costa-county", name: "County of Contra Costa (unincorporated)" },
      { id: "santa-clara-county", name: "County of Santa Clara (unincorporated)" },
      { id: "solano-county", name: "County of Solano (unincorporated)" },
    ],
  },
  {
    group: "San Diego area",
    items: [
      { id: "san-diego", name: "City of San Diego" },
      { id: "chula-vista", name: "City of Chula Vista" },
      { id: "national-city", name: "City of National City" },
      { id: "vista", name: "City of Vista" },
      { id: "escondido", name: "City of Escondido" },
      { id: "san-marcos", name: "City of San Marcos" },
      { id: "oceanside", name: "City of Oceanside" },
      { id: "el-cajon", name: "City of El Cajon" },
      { id: "carlsbad", name: "City of Carlsbad" },
      { id: "san-diego-county", name: "County of San Diego (unincorporated)" },
    ],
  },
];

function thin(name, id) {
  return `# ${name} — thin jurisdiction profile. Inherits the statewide submittal
# checklists from ca-statewide.yaml. Confirm the local AHJ's specific forms
# and any local amendments per project.
meta:
  jurisdiction_id: "${id}"
  jurisdiction_name: "${name}"
  status: PLACEHOLDER
  source: "${name} building department + fire AHJ — VERIFY current submittal requirements"
  reviewing_agencies:
    - "${name} — Building & Safety (structural / rack anchorage) — VERIFY"
    - "Fire authority having jurisdiction (high-piled storage) — VERIFY"
`;
}

const dataDir = join(process.cwd(), "data", "jurisdictions");
const flat = [];
const seen = new Set();
for (const g of GROUPS) {
  for (const it of g.items) {
    if (seen.has(it.id)) throw new Error(`duplicate id: ${it.id}`);
    seen.add(it.id);
    flat.push({ ...it, group: g.group });
    if (!RICH.has(it.id)) writeFileSync(join(dataDir, `${it.id}.yaml`), thin(it.name, it.id), "utf8");
  }
}

const registry = `// =====================================================================
//  JURISDICTION REGISTRY  —  AUTO-GENERATED
// =====================================================================
//  Generated by scripts/gen-jurisdictions.mjs. To add/edit jurisdictions,
//  edit that script's list and re-run \`node scripts/gen-jurisdictions.mjs\`.
//  Each entry has a matching data/jurisdictions/<id>.yaml. The statewide
//  default + inheritance means most files are thin; code values (fire /
//  seismic / anchorage) are statewide/national and shared.
// =====================================================================

export const JURISDICTIONS = [
${flat.map((j) => `  { id: ${JSON.stringify(j.id)}, name: ${JSON.stringify(j.name)}, group: ${JSON.stringify(j.group)} },`).join("\n")}
] as const;

export const JURISDICTION_IDS = JURISDICTIONS.map((j) => j.id) as unknown as readonly [string, ...string[]];

export function jurisdictionName(id: string): string {
  return JURISDICTIONS.find((j) => j.id === id)?.name ?? id;
}
`;
writeFileSync(join(process.cwd(), "src", "engine", "jurisdictions", "registry.ts"), registry, "utf8");

console.log(`Wrote ${flat.length} jurisdictions (${flat.length - RICH.size} thin files + ${RICH.size} rich kept).`);

import { intakeSchema, type IntakeInput } from "@/engine/intake/schema";

/** A valid, representative intake object for tests (defaults fill the rest). */
export function makeInput(): IntakeInput {
  return intakeSchema.parse({
    project: {
      projectName: "Test Project",
      preparedBy: "Tester",
      preparedDate: "2026-01-01",
      jurisdiction: "los-angeles",
    },
    building: {
      address: "1 Test St, Los Angeles, CA",
      totalBuildingAreaSqFt: 40000,
      highPiledAreaSqFt: 10000,
      ceilingHeightFt: 30,
      existingSprinkler: true,
      sprinklerSystemType: "ESFR",
    },
    rack: {
      rackType: "selective",
      storageHeightFt: 24,
      numberOfTiers: 5,
      rackDepthConfig: "double-row",
      aisleWidthFt: 8,
      anchored: true,
    },
    loads: {
      productLoadPerLevelLb: 2000,
      rackSelfWeightLb: 500,
    },
    slab: {
      thicknessIn: 6,
      compressiveStrengthPsi: 3000,
    },
    commodity: {
      description: "Cartoned goods",
      packaging: "cartoned",
      plasticContent: "limited",
    },
    sprinkler: { systemType: "ESFR" },
    seismic: {
      siteClass: "D",
      Sds: 1.0,
      Sd1: 0.6,
      seismicDesignCategory: "D",
      riskCategory: "II",
    },
  });
}

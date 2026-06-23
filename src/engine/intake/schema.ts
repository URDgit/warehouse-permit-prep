// =====================================================================
//  INTAKE SCHEMA  — the structured questionnaire + input validation
// =====================================================================
//
//  This Zod schema is the single source of truth for WHAT inputs the app
//  collects and the basic sanity rules they must satisfy (e.g. a height
//  must be a positive number). It deliberately does NOT encode any code
//  thresholds — judging inputs against code values is the job of the
//  classification and calculation engines, using the data files.
//
//  `IntakeInput` (inferred from this schema) is the typed object that
//  flows through the rest of the engine.
// =====================================================================

import { z } from "zod";

const positive = (label: string) => z.number({ invalid_type_error: `${label} must be a number` }).positive(`${label} must be greater than 0`);
const nonNegative = (label: string) => z.number({ invalid_type_error: `${label} must be a number` }).nonnegative(`${label} cannot be negative`);

export const intakeSchema = z.object({
  project: z.object({
    projectName: z.string().min(1, "Project name is required"),
    preparedBy: z.string().min(1, "Preparer name is required"),
    preparedDate: z.string().min(1, "Date is required"),
    jurisdiction: z.literal("los-angeles"),
  }),

  building: z.object({
    address: z.string().min(1, "Building address is required"),
    constructionType: z.string().default(""),
    totalBuildingAreaSqFt: positive("Total building area"),
    highPiledAreaSqFt: nonNegative("High-piled storage area"),
    ceilingHeightFt: positive("Ceiling height"),
    existingSprinkler: z.boolean(),
    sprinklerSystemType: z
      .enum(["ESFR", "CMSA", "control-mode", "none", "unknown"])
      .default("unknown"),
  }),

  rack: z.object({
    rackType: z
      .enum(["selective", "drive-in", "push-back", "cantilever", "other", "unknown"])
      .default("unknown"),
    storageHeightFt: positive("Storage height"),
    numberOfTiers: z.number().int().positive("Number of tiers must be a positive whole number"),
    rackDepthConfig: z
      .enum(["single-row", "double-row", "multi-row", "unknown"])
      .default("unknown"),
    aisleWidthFt: positive("Aisle width"),
    anchored: z.boolean(),
    anchorType: z.string().default(""),
  }),

  commodity: z.object({
    description: z.string().min(1, "Commodity description is required"),
    primaryMaterial: z.string().default(""),
    packaging: z
      .enum(["none", "cartoned", "exposed", "palletized", "unknown"])
      .default("unknown"),
    plasticContent: z.enum(["none", "limited", "significant", "unknown"]).default("unknown"),
    encapsulated: z.boolean().default(false),
    idlePalletsStored: z.boolean().default(false),
  }),

  sprinkler: z.object({
    systemType: z.enum(["ESFR", "CMSA", "control-mode", "none", "unknown"]).default("unknown"),
    designDensityGpmPerSqFt: z.number().nonnegative().optional(),
    kFactor: z.number().positive().optional(),
    inRackSprinklers: z.boolean().default(false),
  }),

  seismic: z.object({
    siteClass: z.enum(["A", "B", "C", "D", "E", "F", "unknown"]).default("unknown"),
    Ss: z.number().nonnegative().optional(),
    S1: z.number().nonnegative().optional(),
    Sds: z.number().nonnegative().optional(),
    Sd1: z.number().nonnegative().optional(),
    seismicDesignCategory: z.enum(["A", "B", "C", "D", "E", "F", "unknown"]).default("unknown"),
    riskCategory: z.enum(["I", "II", "III", "IV", "unknown"]).default("unknown"),
  }),
});

/** The validated, typed intake object used throughout the engine. */
export type IntakeInput = z.infer<typeof intakeSchema>;

/** The raw (pre-validation) form shape, with defaults not yet applied. */
export type IntakeInputDraft = z.input<typeof intakeSchema>;

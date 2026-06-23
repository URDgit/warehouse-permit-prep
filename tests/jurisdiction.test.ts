import { describe, it, expect } from "vitest";
import type { CodeData } from "@/engine/data/loadData";
import { loadCodeData } from "@/engine/data/loadData";
import type { ClassificationResult } from "@/engine/classification/classify";
import { getJurisdictionRequirements } from "@/engine/jurisdictions/losAngeles";
import { makeInput } from "./helpers";

// makeInput(): highPiledAreaSqFt = 10000, storageHeightFt = 24
const input = makeInput();

function dataWith(docs: unknown[], triggersStatus = "VERIFIED"): CodeData {
  return {
    commodity: {},
    fireCode: {},
    seismic: {},
    anchorage: {},
    jurisdictions: {
      "los-angeles": {
        meta: { jurisdiction_name: "City of Los Angeles (LADBS / LAFD)" },
        required_documents: docs,
        submittal_rules: { status: triggersStatus },
      },
    },
  };
}

function classifiedAs(classId: string | null): ClassificationResult {
  return { commodityClassId: classId } as unknown as ClassificationResult;
}

describe("submittal triggers", () => {
  it("lists every document as 'verify applicability' while triggers are not verified", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S" }], "PLACEHOLDER");
    const r = getJurisdictionRequirements(input, data, "los-angeles");
    expect(r.requiredDocuments).toHaveLength(1);
    expect(r.requiredDocuments[0].applicability).toBe("verify");
    expect(r.requiredDocuments[0].status.isPlaceholder).toBe(true);
  });

  it("treats a verified document with no condition as always required", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S" }]);
    const r = getJurisdictionRequirements(input, data, "los-angeles");
    expect(r.requiredDocuments[0].applicability).toBe("required");
    expect(r.requiredDocuments[0].status.isPlaceholder).toBe(false);
  });

  it("evaluates a numeric trigger to required / not required", () => {
    const required = getJurisdictionRequirements(
      input,
      dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { high_piled_area_sqft: { gte: 8000 } } }]),
      "los-angeles",
    );
    expect(required.requiredDocuments[0].applicability).toBe("required");

    const notRequired = getJurisdictionRequirements(
      input,
      dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { high_piled_area_sqft: { gte: 12000 } } }]),
      "los-angeles",
    );
    expect(notRequired.requiredDocuments[0].applicability).toBe("not_required");
  });

  it("returns 'verify' for a commodity_class trigger when the class is undetermined", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { commodity_class: "class_III" } }]);
    const undet = getJurisdictionRequirements(input, data, "los-angeles", classifiedAs(null));
    expect(undet.requiredDocuments[0].applicability).toBe("verify");

    const known = getJurisdictionRequirements(input, data, "los-angeles", classifiedAs("class_III"));
    expect(known.requiredDocuments[0].applicability).toBe("required");
  });

  it("reports an unknown trigger field as a data issue and does not act on it", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { not_a_field: 1 } }]);
    const r = getJurisdictionRequirements(input, data, "los-angeles");
    expect(r.requiredDocuments[0].applicability).toBe("verify");
    expect(r.dataIssues.join(" ")).toMatch(/unknown field/i);
  });
});

describe("multi-jurisdiction", () => {
  const data = loadCodeData();

  it("loads multiple jurisdictions from data/jurisdictions and resolves each by id", () => {
    const la = getJurisdictionRequirements(input, data, "los-angeles");
    const county = getJurisdictionRequirements(input, data, "la-county");
    expect(la.jurisdictionName).toMatch(/City of Los Angeles/);
    expect(county.jurisdictionName).toMatch(/County of Los Angeles/);
    expect(county.requiredDocuments.length).toBeGreaterThan(0);
    expect(county.planContent.length).toBeGreaterThan(0);
  });

  it("a thin city profile inherits the statewide checklists + its own agencies", () => {
    const ontario = getJurisdictionRequirements(input, data, "ontario");
    expect(ontario.jurisdictionName).toMatch(/Ontario/);
    // ontario.yaml defines no lists — these come from ca-statewide:
    expect(ontario.planContent.length).toBeGreaterThan(0);
    expect(ontario.structuralSubmittal.length).toBeGreaterThan(0);
    expect(ontario.requiredDocuments.length).toBeGreaterThan(0);
    expect(ontario.reviewingAgencies.some((a) => /Ontario/.test(a))).toBe(true);
  });
});

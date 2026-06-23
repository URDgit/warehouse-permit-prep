import { describe, it, expect } from "vitest";
import type { CodeData } from "@/engine/data/loadData";
import type { ClassificationResult } from "@/engine/classification/classify";
import { getLosAngelesRequirements } from "@/engine/jurisdictions/losAngeles";
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

describe("LA submittal triggers", () => {
  it("lists every document as 'verify applicability' while triggers are not verified", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S" }], "PLACEHOLDER");
    const r = getLosAngelesRequirements(input, data);
    expect(r.requiredDocuments).toHaveLength(1);
    expect(r.requiredDocuments[0].applicability).toBe("verify");
    expect(r.requiredDocuments[0].status.isPlaceholder).toBe(true);
  });

  it("treats a verified document with no condition as always required", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S" }]);
    const r = getLosAngelesRequirements(input, data);
    expect(r.requiredDocuments[0].applicability).toBe("required");
    expect(r.requiredDocuments[0].status.isPlaceholder).toBe(false);
  });

  it("evaluates a numeric trigger to required / not required", () => {
    const required = getLosAngelesRequirements(
      input,
      dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { high_piled_area_sqft: { gte: 8000 } } }]),
    );
    expect(required.requiredDocuments[0].applicability).toBe("required");

    const notRequired = getLosAngelesRequirements(
      input,
      dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { high_piled_area_sqft: { gte: 12000 } } }]),
    );
    expect(notRequired.requiredDocuments[0].applicability).toBe("not_required");
  });

  it("returns 'verify' for a commodity_class trigger when the class is undetermined", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { commodity_class: "class_III" } }]);
    const undet = getLosAngelesRequirements(input, data, classifiedAs(null));
    expect(undet.requiredDocuments[0].applicability).toBe("verify");

    const known = getLosAngelesRequirements(input, data, classifiedAs("class_III"));
    expect(known.requiredDocuments[0].applicability).toBe("required");
  });

  it("reports an unknown trigger field as a data issue and does not act on it", () => {
    const data = dataWith([{ id: "a", name: "Doc A", source: "S", applies_when: { not_a_field: 1 } }]);
    const r = getLosAngelesRequirements(input, data);
    expect(r.requiredDocuments[0].applicability).toBe("verify");
    expect(r.dataIssues.join(" ")).toMatch(/unknown field/i);
  });
});

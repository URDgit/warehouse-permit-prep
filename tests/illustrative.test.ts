import { describe, it, expect } from "vitest";
import { loadCodeData } from "@/engine/data/loadData";
import { applyOverrides } from "@/engine/data/overrides";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { intakeSchema } from "@/engine/intake/schema";
import { FONTANA_ILLUSTRATIVE } from "@/engine/illustrative/fontana";
import { makeInput } from "./helpers";

function fontanaInput() {
  const base = makeInput();
  return intakeSchema.parse({ ...base, project: { ...base.project, jurisdiction: "fontana" } });
}

describe("Fontana illustrative values", () => {
  const data = loadCodeData();
  applyOverrides(data, FONTANA_ILLUSTRATIVE);
  const pkg = buildReviewPackage(fontanaInput(), { data });

  it("renders illustrative values but keeps every one UNVERIFIED (safety gate)", () => {
    const illus = pkg.codeValuesUsed.filter((cv) => cv.illustrative);
    expect(illus.length).toBeGreaterThan(10);
    for (const cv of illus) {
      expect(cv.value).not.toBeNull(); // it renders a value...
      expect(cv.isPlaceholder).toBe(true); // ...but is still a placeholder for the engine
      expect(cv.status).toBe("PLACEHOLDER");
    }
  });

  it("uses exact code citations, not 'VERIFY' pointers", () => {
    const aisle = pkg.codeValuesUsed.find((cv) => /aisle/i.test(cv.label));
    expect(aisle?.value).toBe(8);
    expect(aisle?.source).toMatch(/3206\.10/);
    const r = pkg.codeValuesUsed.find((cv) => /response modification/i.test(cv.label));
    expect(r?.source).toMatch(/Table 15\.4-1/);
  });

  it("shows an illustrative commodity classification, but it never drives logic", () => {
    expect(pkg.classification.commodityClass.illustrative).toBe(true);
    expect(String(pkg.classification.commodityClass.value)).toMatch(/Class IV/);
    expect(pkg.classification.commodityClass.isPlaceholder).toBe(true);
    expect(pkg.classification.commodityClassId).toBeNull(); // presentational only
  });

  it("the package as a whole is still NOT verified (placeholders remain)", () => {
    expect(pkg.placeholderCount).toBeGreaterThan(0);
  });

  it("a plain (non-illustrative) Fontana package has no illustrative values", () => {
    const plain = buildReviewPackage(fontanaInput());
    expect(plain.codeValuesUsed.some((cv) => cv.illustrative)).toBe(false);
  });
});

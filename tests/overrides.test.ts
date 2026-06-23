import { describe, it, expect } from "vitest";
import { loadCodeData } from "@/engine/data/loadData";
import { applyOverrides, listVerifiableFields } from "@/engine/data/overrides";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { makeInput } from "./helpers";

describe("engineer-verified overrides", () => {
  it("applyOverrides sets value, source, and status on the target node", () => {
    const data = loadCodeData();
    applyOverrides(data, [
      { path: "fireCode.aisle_width.minimum", value: 8, unit: "feet", source: "CFC 2022 Table X", status: "VERIFIED" },
    ]);
    const node = (data.fireCode as any).aisle_width.minimum;
    expect(node.value).toBe(8);
    expect(node.status).toBe("VERIFIED");
    expect(node.source).toBe("CFC 2022 Table X");
  });

  it("ignores overrides whose path does not exist", () => {
    const data = loadCodeData();
    expect(() => applyOverrides(data, [{ path: "fireCode.nope.gone", value: 1 }])).not.toThrow();
  });

  it("listVerifiableFields reflects an applied override as verified", () => {
    const data = loadCodeData();
    applyOverrides(data, [{ path: "seismic.seismic_force.coefficients.importance_factor_Ie", value: 1.5, source: "ASCE 7-16 §1.5", status: "VERIFIED" }]);
    const field = listVerifiableFields(data).find((f) => f.path.endsWith("importance_factor_Ie"));
    expect(field?.verified).toBe(true);
    expect(field?.value).toBe("1.5");
    expect(field?.source).toMatch(/ASCE/);
  });

  it("a verified override flows end-to-end into the report (no longer a placeholder)", () => {
    const data = loadCodeData();
    applyOverrides(data, [{ path: "fireCode.aisle_width.minimum", value: 8, unit: "feet", source: "CFC 2022 Table X", status: "VERIFIED" }]);
    const pkg = buildReviewPackage(makeInput(), { data });
    const aisle = pkg.codeValuesUsed.find((cv) => cv.id === "fire_code.aisle_width.minimum");
    expect(aisle?.isPlaceholder).toBe(false);
    expect(aisle?.value).toBe(8);
  });
});

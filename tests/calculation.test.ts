import { describe, it, expect } from "vitest";
import { loadCodeData } from "@/engine/data/loadData";
import { computeSeismicDemand } from "@/engine/calculation/seismic";
import { computeAnchorage } from "@/engine/calculation/anchorage";
import { makeInput } from "./helpers";

describe("calculation engine — safety invariant: never fabricate a number", () => {
  const data = loadCodeData();
  const input = makeInput();

  it("seismic: outputs NO number while the formula/coefficients are placeholders", () => {
    const r = computeSeismicDemand(input, data);
    expect(r.result.value).toBeNull();
    expect(r.result.isPlaceholder).toBe(true);
    expect(r.audit.status).toBe("blocked_by_placeholder");
    expect(r.formula.source).toMatch(/ASCE/i);
    // Even though real seismic inputs were supplied, no number is invented:
    expect(r.inputsUsed).toHaveProperty("Sds", 1.0);
  });

  it("anchorage: outputs NO number while the method/slab properties are placeholders", () => {
    const r = computeAnchorage(input, data);
    expect(r.result.value).toBeNull();
    expect(r.result.isPlaceholder).toBe(true);
    expect(r.audit.status).toBe("blocked_by_placeholder");
  });

  it("records inputs used and assumptions, for auditability", () => {
    const r = computeSeismicDemand(input, data);
    expect(Object.keys(r.inputsUsed).length).toBeGreaterThan(0);
    expect(r.audit.assumptions.length).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from "vitest";
import { loadCodeData } from "@/engine/data/loadData";
import { classifyCommodity } from "@/engine/classification/classify";
import { makeInput } from "./helpers";

describe("classification engine", () => {
  const data = loadCodeData();
  const input = makeInput();

  it("does NOT guess a commodity class while the rules are placeholders", () => {
    const r = classifyCommodity(input, data);
    expect(r.commodityClass.value).toBeNull(); // UNDETERMINED, never fabricated
    expect(r.commodityClass.isPlaceholder).toBe(true);
    expect(r.commodityClass.source.length).toBeGreaterThan(0);
  });

  it("marks the classification audit step as blocked by placeholder", () => {
    const r = classifyCommodity(input, data);
    const step = r.audit.find((a) => a.step === "Commodity classification");
    expect(step).toBeDefined();
    expect(step?.status).toBe("blocked_by_placeholder");
    expect(step?.inputsUsed).toHaveProperty("plasticContent");
  });

  it("surfaces triggered fire-code requirements, each with a citation", () => {
    const r = classifyCommodity(input, data);
    expect(r.triggeredRequirements.length).toBeGreaterThan(0);
    for (const req of r.triggeredRequirements) {
      expect(req.codeValue.source.length).toBeGreaterThan(0);
      expect(req.codeValue.isPlaceholder).toBe(true); // all placeholders today
    }
  });

  it("is a pure function of its inputs (same inputs -> identical output)", () => {
    expect(classifyCommodity(input, data)).toEqual(classifyCommodity(input, data));
  });
});

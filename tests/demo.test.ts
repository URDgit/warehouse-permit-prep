import { describe, it, expect } from "vitest";
import { buildDemoPackage } from "@/engine/demo/buildDemoPackage";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { makeInput } from "./helpers";

describe("demo mode", () => {
  const pkg = buildDemoPackage(new Date("2026-06-22T00:00:00Z"));

  it("is flagged as demo and labeled fabricated", () => {
    expect(pkg.demo).toBe(true);
    expect(pkg.meta.title).toMatch(/DEMO/);
    expect(pkg.meta.disclaimer).toMatch(/DEMONSTRATION/i);
  });

  it("shows a fully filled-in, 'ready' report (for illustration)", () => {
    expect(pkg.classification.commodityClass.value).toMatch(/demo/i);
    expect(pkg.calculations.seismic.result.isPlaceholder).toBe(false);
    expect(typeof pkg.calculations.seismic.result.value).toBe("number");
    expect(pkg.readiness.placeholderCount).toBe(0);
    expect(pkg.readiness.isSubmittalReady).toBe(true);
  });

  it("labels EVERY code value's citation as DEMO (impossible to mistake for real)", () => {
    expect(pkg.codeValuesUsed.length).toBeGreaterThan(0);
    for (const cv of pkg.codeValuesUsed) {
      expect(cv.source).toMatch(/demo/i);
    }
  });

  it("does not affect the real production report (still all placeholders)", () => {
    const real = buildReviewPackage(makeInput(), { now: new Date("2026-06-22T00:00:00Z") });
    expect(real.demo).toBeFalsy();
    expect(real.readiness.placeholderCount).toBeGreaterThan(0);
    expect(real.calculations.seismic.result.isPlaceholder).toBe(true);
  });
});

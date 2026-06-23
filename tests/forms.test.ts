import { describe, it, expect } from "vitest";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { specialInspectionForm, deferredSubmittalForm, renderSubmittalFormMarkdown } from "@/engine/report/forms";
import { makeInput } from "./helpers";

describe("submittal forms", () => {
  const pkg = buildReviewPackage(makeInput());

  it("captures the existing-slab inputs (research-driven completeness)", () => {
    expect(pkg.inputs.slab.thicknessIn).toBe(6);
    expect(pkg.inputs.slab.compressiveStrengthPsi).toBe(3000);
  });

  it("special inspection form lists code-grounded items", () => {
    const f = specialInspectionForm(pkg);
    expect(f.title).toMatch(/Special Inspections/);
    expect(f.items.length).toBeGreaterThan(0);
    expect(f.items.every((i) => i.source.length > 0)).toBe(true);
  });

  it("deferred submittal form lists items", () => {
    const f = deferredSubmittalForm(pkg);
    expect(f.title).toMatch(/Deferred Submittals/);
    expect(f.items.length).toBeGreaterThan(0);
  });

  it("renders a markdown form with a checklist + seal block", () => {
    const md = renderSubmittalFormMarkdown(specialInspectionForm(pkg));
    expect(md).toMatch(/Statement of Special Inspections/);
    expect(md).toMatch(/Engineer of record/);
    expect(md).toMatch(/- \[ \]/);
  });
});

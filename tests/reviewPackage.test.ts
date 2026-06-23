import { describe, it, expect } from "vitest";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { renderMarkdown } from "@/engine/report/renderMarkdown";
import { makeInput } from "./helpers";

describe("review package assembly", () => {
  const pkg = buildReviewPackage(makeInput(), { now: new Date("2026-01-01T00:00:00Z") });

  it("echoes the inputs and counts unresolved placeholders", () => {
    expect(pkg.inputs.project.projectName).toBe("Test Project");
    expect(pkg.placeholderCount).toBeGreaterThan(0);
    expect(pkg.codeValuesUsed.length).toBeGreaterThanOrEqual(pkg.placeholderCount);
  });

  it("includes the licensed-engineer disclaimer", () => {
    expect(pkg.meta.disclaimer).toMatch(/licensed/i);
  });

  it("builds a complete audit trail", () => {
    expect(pkg.auditTrail.length).toBeGreaterThan(0);
    for (const a of pkg.auditTrail) {
      expect(a.step.length).toBeGreaterThan(0);
      expect(["ok", "blocked_by_placeholder"]).toContain(a.status);
    }
  });

  it("markdown export carries the DRAFT disclaimer and audit trail", () => {
    const md = renderMarkdown(pkg);
    expect(md).toMatch(/DRAFT/);
    expect(md).toMatch(/Audit trail/);
  });

  it("builds an actionable readiness checklist of outstanding placeholders", () => {
    const r = pkg.readiness;
    expect(r.isSubmittalReady).toBe(false);
    expect(r.placeholderCount).toBe(pkg.placeholderCount);
    expect(r.verifiedCount + r.placeholderCount).toBe(r.totalCodeValues);
    expect(r.outstanding.length).toBe(r.placeholderCount);
    expect(r.byArea.length).toBeGreaterThan(0);
    // every outstanding item is actionable: discipline + citation + what's needed
    for (const item of r.outstanding) {
      expect(item.area.length).toBeGreaterThan(0);
      expect(item.source.length).toBeGreaterThan(0);
      expect(item.need.length).toBeGreaterThan(0);
    }
    // both calculations are currently blocked
    expect(r.blockedCalcs.length).toBe(2);
  });

  it("surfaces the readiness checklist in the markdown export", () => {
    const md = renderMarkdown(pkg);
    expect(md).toMatch(/Readiness/);
    expect(md).toMatch(/NOT ready for engineer submittal/);
  });
});

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
});

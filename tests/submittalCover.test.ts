import { describe, it, expect } from "vitest";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { buildSubmittalCover, renderSubmittalCoverMarkdown } from "@/engine/report/submittalCover";
import { EMPTY_FIRM } from "@/engine/firm";
import { makeInput } from "./helpers";

describe("submittal cover", () => {
  const firm = { ...EMPTY_FIRM, firmName: "Acme Engineering", engineerName: "J. Doe", licenseType: "PE", licenseNumber: "12345" };
  const pkg = buildReviewPackage(makeInput(), { firm });
  const cover = buildSubmittalCover(pkg);

  it("carries firm + project info and lists the submittal documents", () => {
    expect(cover.firm.firmName).toBe("Acme Engineering");
    expect(cover.projectName).toBe(pkg.meta.projectName);
    expect(cover.projectAddress).toBe(pkg.inputs.building.address);
    expect(cover.documents.length).toBeGreaterThan(0);
  });

  it("excludes documents the triggers ruled out (not_required)", () => {
    expect(cover.documents.every((d) => d.applicability !== "not_required")).toBe(true);
  });

  it("includes the code-grounded submittal checklist (plan content + structural docs)", () => {
    expect(cover.planContent.length).toBeGreaterThan(0);
    expect(cover.structuralSubmittal.length).toBeGreaterThan(0);
    expect(cover.planContent.every((i) => i.source.length > 0)).toBe(true);
  });

  it("renders a transmittal markdown with checklists and the seal block", () => {
    const md = renderSubmittalCoverMarkdown(cover);
    expect(md).toMatch(/Transmittal/);
    expect(md).toMatch(/Documents included/);
    expect(md).toMatch(/What the plans must show/);
    expect(md).toMatch(/Structural \/ fire documents/);
    expect(md).toMatch(/Engineer of record/);
    expect(md).toMatch(/- \[ \]/); // at least one checklist item
  });
});

import { describe, it, expect } from "vitest";
import type { CodeData } from "@/engine/data/loadData";
import { loadCodeData } from "@/engine/data/loadData";
import { buildVerificationBrief, renderVerificationBriefMarkdown } from "@/engine/report/verificationBrief";

describe("engineer verification brief", () => {
  const data = loadCodeData();
  const brief = buildVerificationBrief(data, new Date("2026-01-01T00:00:00Z"));

  it("lists every item as outstanding while the data files are all placeholders", () => {
    expect(brief.totalItems).toBeGreaterThan(0);
    expect(brief.outstandingItems).toBe(brief.totalItems);
    expect(brief.sections.length).toBe(5);
    expect(brief.decisions.length).toBeGreaterThan(0);
    expect(brief.developerTasks.length).toBe(2);
  });

  it("every item is actionable: label, location, code reference, and a need", () => {
    for (const section of brief.sections) {
      for (const item of section.items) {
        expect(item.label.length).toBeGreaterThan(0);
        expect(item.location.length).toBeGreaterThan(0);
        expect(item.source.length).toBeGreaterThan(0);
        expect(item.need.length).toBeGreaterThan(0);
      }
    }
  });

  it("marks an item verified once its data node is VERIFIED, lowering the outstanding count", () => {
    const partial: CodeData = {
      commodity: {},
      fireCode: { aisle_width: { minimum: { value: 8, status: "VERIFIED", source: "CFC 2022 Table X", unit: "feet" } } },
      seismic: {},
      anchorage: {},
      jurisdictions: { "los-angeles": {} },
    };
    const b = buildVerificationBrief(partial);
    const aisle = b.sections.flatMap((s) => s.items).find((i) => i.label === "Minimum aisle width");
    expect(aisle?.verified).toBe(true);
    expect(b.outstandingItems).toBeLessThan(b.totalItems);
  });

  it("renders a self-contained markdown document with disclaimer and sign-off", () => {
    const md = renderVerificationBriefMarkdown(brief);
    expect(md).toMatch(/Engineer Verification Brief/);
    expect(md).toMatch(/licensed/i);
    expect(md).toMatch(/License \(PE\/SE\)/);
    expect(md).toMatch(/Where it goes/); // the data-file location column
    expect(md).toMatch(/seismic\.yaml/); // a concrete location is cited
  });
});

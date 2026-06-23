import { describe, it, expect } from "vitest";
import type { CodeData } from "@/engine/data/loadData";
import { validateCodeData } from "@/engine/data/validate";

function data(partial: Partial<CodeData>): CodeData {
  return { commodity: {}, fireCode: {}, seismic: {}, anchorage: {}, jurisdictions: { "los-angeles": {} }, ...partial };
}
const errs = (d: CodeData) => validateCodeData(d).filter((i) => i.level === "error");

describe("data validator", () => {
  it("flags an invalid status value", () => {
    const d = data({ fireCode: { aisle_width: { minimum: { value: 8, status: "DONE", source: "x" } } } });
    expect(errs(d).some((i) => /must be PLACEHOLDER or VERIFIED/.test(i.message))).toBe(true);
  });

  it("flags a value marked VERIFIED but left blank", () => {
    const d = data({ fireCode: { aisle_width: { minimum: { value: null, status: "VERIFIED", source: "x" } } } });
    expect(errs(d).some((i) => /no value/.test(i.message))).toBe(true);
  });

  it("flags a classification rule pointing at an unknown class", () => {
    const commodity = {
      classes: [{ id: "class_III", name: "Class III" }],
      classification_rules: { status: "VERIFIED", rules: [{ when: { packaging: "cartoned" }, assign_class: "nope" }] },
    };
    expect(errs(data({ commodity })).some((i) => /not a known class id/.test(i.message))).toBe(true);
  });

  it("flags a rule testing an unknown field", () => {
    const commodity = {
      classes: [{ id: "class_III", name: "Class III" }],
      classification_rules: { status: "VERIFIED", rules: [{ when: { not_a_field: 1 }, assign_class: "class_III" }] },
    };
    expect(errs(data({ commodity })).some((i) => /not allowed/.test(i.message))).toBe(true);
  });

  it("flags a submittal trigger testing an unknown field", () => {
    const jur = {
      required_documents: [{ id: "a", name: "A", source: "S", applies_when: { bogus: 1 } }],
      submittal_rules: { status: "VERIFIED" },
    };
    expect(errs(data({ jurisdictions: { "los-angeles": jur } })).some((i) => /not allowed/.test(i.message))).toBe(true);
  });

  it("accepts well-formed verified data without errors", () => {
    const commodity = {
      classes: [{ id: "class_III", name: "Class III" }],
      classification_rules: { status: "VERIFIED", source: "X", rules: [{ when: { packaging: "cartoned" }, assign_class: "class_III", source: "X" }] },
    };
    const jur = {
      required_documents: [{ id: "a", name: "A", source: "S", applies_when: { high_piled_area_sqft: { gte: 500 } } }],
      submittal_rules: { status: "VERIFIED" },
    };
    expect(errs(data({ commodity, jurisdictions: { "los-angeles": jur } }))).toHaveLength(0);
  });
});

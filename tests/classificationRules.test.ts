import { describe, it, expect } from "vitest";
import type { CodeData } from "@/engine/data/loadData";
import { evaluateRules, type ClassificationRule } from "@/engine/classification/rules";
import { classifyCommodity } from "@/engine/classification/classify";
import { makeInput } from "./helpers";

const VALID = ["class_III", "group_a_plastics"];

/** A CodeData stub with engineer-VERIFIED rules, for testing the machinery. */
function dataWith(rules: ClassificationRule[], status = "VERIFIED"): CodeData {
  return {
    commodity: {
      classes: [
        { id: "class_III", name: "Class III" },
        { id: "group_a_plastics", name: "Group A Plastics" },
      ],
      classification_rules: { status, source: "TEST §1", rules },
    },
    fireCode: {},
    seismic: {},
    anchorage: {},
    jurisdictions: {},
  };
}

describe("rules evaluator (pure machinery)", () => {
  // makeInput(): packaging=cartoned, plastic_content=limited, encapsulated=false, storage_height_ft=24
  const input = makeInput();

  it("matches an equals + 'in' condition", () => {
    const m = evaluateRules(
      input,
      [{ when: { packaging: "cartoned", plastic_content: { in: ["none", "limited"] } }, assign_class: "class_III" }],
      VALID,
    );
    expect(m.matched).toBe(true);
    expect(m.classId).toBe("class_III");
    expect(m.issues).toHaveLength(0);
  });

  it("honors 'not' and numeric comparisons", () => {
    expect(evaluateRules(input, [{ when: { plastic_content: { not: "limited" } }, assign_class: "class_III" }], VALID).matched).toBe(false);
    expect(evaluateRules(input, [{ when: { storage_height_ft: { gte: 12 } }, assign_class: "class_III" }], VALID).matched).toBe(true);
    expect(evaluateRules(input, [{ when: { storage_height_ft: { lt: 12 } }, assign_class: "class_III" }], VALID).matched).toBe(false);
  });

  it("uses the FIRST matching rule (order matters)", () => {
    const m = evaluateRules(
      input,
      [
        { when: { packaging: "cartoned" }, assign_class: "class_III" },
        { when: { packaging: "cartoned" }, assign_class: "group_a_plastics" },
      ],
      VALID,
    );
    expect(m.classId).toBe("class_III");
    expect(m.ruleIndex).toBe(0);
  });

  it("reports unknown fields/classes as data issues instead of acting on them", () => {
    const badField = evaluateRules(input, [{ when: { not_a_field: "x" }, assign_class: "class_III" }], VALID);
    expect(badField.matched).toBe(false);
    expect(badField.issues.join(" ")).toMatch(/unknown field/i);

    const badClass = evaluateRules(input, [{ when: { packaging: "cartoned" }, assign_class: "made_up_class" }], VALID);
    expect(badClass.matched).toBe(false);
    expect(badClass.issues.join(" ")).toMatch(/unknown class/i);
  });
});

describe("classifyCommodity with verified rules", () => {
  const input = makeInput();

  it("assigns the class and cites the rule's source when a verified rule matches", () => {
    const data = dataWith([
      { when: { packaging: "cartoned", plastic_content: { in: ["none", "limited"] } }, assign_class: "class_III", source: "2025 California Fire Code §X" },
    ]);
    const r = classifyCommodity(input, data);
    expect(r.commodityClass.value).toBe("Class III");
    expect(r.commodityClass.isPlaceholder).toBe(false);
    expect(r.commodityClass.source).toBe("2025 California Fire Code §X");
    expect(r.audit[0].status).toBe("ok");
  });

  it("stays UNDETERMINED (never guesses) when verified rules do not match", () => {
    const data = dataWith([{ when: { plastic_content: "significant" }, assign_class: "group_a_plastics" }]);
    const r = classifyCommodity(input, data);
    expect(r.commodityClass.value).toBeNull();
    expect(r.commodityClass.isPlaceholder).toBe(true);
    expect(r.commodityClass.todo).toMatch(/no verified rule matched/i);
  });

  it("ignores rules entirely while status is not VERIFIED", () => {
    const data = dataWith(
      [{ when: { packaging: "cartoned" }, assign_class: "class_III" }],
      "PLACEHOLDER",
    );
    const r = classifyCommodity(input, data);
    expect(r.commodityClass.value).toBeNull();
    expect(r.commodityClass.isPlaceholder).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { loadCodeData } from "@/engine/data/loadData";
import { validateCodeData } from "@/engine/data/validate";

// This doubles as the `npm run check-data` command: it loads the REAL data
// files and fails if they contain any structural errors.
describe("data file integrity (real files)", () => {
  it("has no structural ERRORS in the shipped data files", () => {
    const errors = validateCodeData(loadCodeData()).filter((i) => i.level === "error");
    if (errors.length) {
      console.error("\nData file errors:\n" + errors.map((e) => `  ${e.file} › ${e.path}: ${e.message}`).join("\n"));
    }
    expect(errors).toHaveLength(0);
  });
});

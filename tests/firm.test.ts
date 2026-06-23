import { describe, it, expect } from "vitest";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { EMPTY_FIRM, loadFirmProfile } from "@/engine/firm";
import { makeInput } from "./helpers";

describe("firm profile", () => {
  it("defaults to empty when no firm-profile.json exists", () => {
    expect(loadFirmProfile().firmName).toBe("");
  });

  it("appears on the report meta (letterhead + seal block) when provided", () => {
    const firm = { ...EMPTY_FIRM, firmName: "Acme Engineering", engineerName: "J. Doe", licenseType: "PE", licenseNumber: "12345" };
    const pkg = buildReviewPackage(makeInput(), { firm });
    expect(pkg.meta.firm.firmName).toBe("Acme Engineering");
    expect(pkg.meta.firm.engineerName).toBe("J. Doe");
    expect(pkg.meta.firm.licenseNumber).toBe("12345");
  });
});

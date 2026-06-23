import { describe, it, expect } from "vitest";
import { renderCorrectionLetterMarkdown, type CorrectionLetterData } from "@/engine/corrections";

describe("plan-check correction letter", () => {
  const d: CorrectionLetterData = {
    firmName: "Acme Engineering",
    firmAddress: "",
    firmContact: "",
    engineerName: "J. Doe",
    licenseType: "PE",
    licenseNumber: "12345",
    projectName: "Test Rack Project",
    projectAddress: "1 Test St",
    jurisdiction: "City of Los Angeles (LADBS / LAFD)",
    revision: 2,
    generatedAt: "2026-06-23",
    items: [
      { id: "a", number: "1", agency: "LADBS", codeRef: "ASCE 7 §15.5", comment: "Provide seismic base shear.", response: "Added on sheet S-2.", status: "addressed" },
      { id: "b", number: "2", agency: "LAFD", codeRef: "", comment: "Show flue spaces.", response: "", status: "open" },
    ],
    disclaimer: "Review and seal before submittal.",
  };
  const md = renderCorrectionLetterMarkdown(d);

  it("includes project, round, comments and responses", () => {
    expect(md).toMatch(/Plan Check Correction Responses/);
    expect(md).toMatch(/Test Rack Project/);
    expect(md).toMatch(/Plan check round:\*\* 2/);
    expect(md).toMatch(/Provide seismic base shear/);
    expect(md).toMatch(/Added on sheet S-2/);
  });

  it("marks each comment open/addressed with its agency", () => {
    expect(md).toMatch(/Comment 1 \(LADBS\) — addressed/);
    expect(md).toMatch(/Comment 2 \(LAFD\) — open/);
  });
});

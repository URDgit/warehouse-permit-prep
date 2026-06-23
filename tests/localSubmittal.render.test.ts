import { describe, it, expect } from "vitest";
import { intakeSchema } from "@/engine/intake/schema";
import { buildReviewPackage } from "@/engine/report/buildReviewPackage";
import { renderMarkdown } from "@/engine/report/renderMarkdown";
import { buildSubmittalCover, renderSubmittalCoverMarkdown } from "@/engine/report/submittalCover";
import { makeInput } from "./helpers";

// A deepened city (Ontario) carries a local_submittal block in its data file;
// it must surface in both the report and the submittal cover, with its source URL.
function ontarioInput() {
  const base = makeInput();
  return intakeSchema.parse({ ...base, project: { ...base.project, jurisdiction: "ontario" } });
}

describe("deepened jurisdiction local specifics render end to end", () => {
  const pkg = buildReviewPackage(ontarioInput());

  it("report markdown includes the local specifics section + the AHJ portal link", () => {
    const md = renderMarkdown(pkg);
    expect(md).toMatch(/Local jurisdiction specifics/);
    expect(md).toMatch(/aca-prod\.accela\.com\/ONT/);
  });

  it("submittal cover includes the local specifics", () => {
    const cover = renderSubmittalCoverMarkdown(buildSubmittalCover(pkg));
    expect(cover).toMatch(/Local jurisdiction specifics/);
    expect(cover).toMatch(/Fire Prevention Bureau/);
  });
});
